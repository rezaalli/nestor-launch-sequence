import { BleClient } from '@capacitor-community/bluetooth-le';
import { NESTOR_BLE_SERVICE, NESTOR_CHARACTERISTICS } from './bleConfig';
import { dispatchBleEvent } from './bleEvents';
import { startDataPolling, stopDataPolling } from './bleDataMonitoring';
import { getDiscoveredDevices } from './bleScanning';

// Connection state variables
let isConnected = false;
let deviceName = 'Nestor Device';
let reconnectionAttempts = 0;
const MAX_RECONNECTION_ATTEMPTS = 5;
let connectionErrorMessage = '';
let lastErrorTimestamp = 0;

// Check if Web Bluetooth is available
export const isBleAvailable = (): boolean => {
  try {
    // Changed to synchronous return since BleClient.initialize() should be called 
    // separately during actual connection attempts
    return !!BleClient;
  } catch (error) {
    console.error('Bluetooth not available:', error);
    return false;
  }
};

// Request Bluetooth permissions
export const requestBlePermissions = async (): Promise<boolean> => {
  try {
    await BleClient.initialize();
    return true;
  } catch (error) {
    console.error('Failed to get Bluetooth permissions:', error);
    return false;
  }
};

// Connect to a specific device by ID
export const connectToDeviceById = async (deviceId: string): Promise<boolean> => {
  try {
    console.log(`Connecting to device ${deviceId}...`);
    
    // Dispatch event to notify connection attempt
    dispatchBleEvent('nestor-connecting', { deviceId });
    
    // Find device in discovered devices list
    const device = getDiscoveredDevices().find(d => d.id === deviceId);
    if (!device) {
      throw new Error('Device not found');
    }
    
    // Initialize Bluetooth
    await BleClient.initialize();
    
    // Connect to the device
    await BleClient.connect(deviceId, (deviceId) => {
      console.log(`Disconnected from device ${deviceId}`);
      isConnected = false;
      dispatchBleEvent('nestor-disconnected');
    });
    
    isConnected = true;
    deviceName = device.name;
    reconnectionAttempts = 0;
    
    // Start data polling
    startDataPolling();
    
    // Dispatch connected event
    dispatchBleEvent('nestor-connected', { deviceId, deviceName });
    return true;
  } catch (error) {
    console.error(`Failed to connect to device ${deviceId}:`, error);
    connectionErrorMessage = String(error);
    lastErrorTimestamp = Date.now();
    dispatchBleEvent('nestor-connection-error', { 
      deviceId, 
      error: connectionErrorMessage
    });
    return false;
  }
};

// Connect to device (legacy function for backward compatibility)
export const connectToDevice = async (): Promise<boolean> => {
  try {
    console.log('Connecting to BLE device...');
    
    // If we have discovered devices, try connecting to the first one
    const discoveredDevices = getDiscoveredDevices();
    if (discoveredDevices.length > 0) {
      return connectToDeviceById(discoveredDevices[0].id);
    }
    
    // Try to scan for devices if none are discovered
    await BleClient.initialize();
    return false; // Couldn't find a device to connect to
  } catch (error) {
    console.error('Failed to connect to device:', error);
    isConnected = false;
    return false;
  }
};

export const disconnectFromDevice = async (): Promise<void> => {
  try {
    console.log('Disconnecting from BLE device...');
    const discoveredDevices = getDiscoveredDevices();
    
    if (discoveredDevices.length > 0 && isConnected) {
      await BleClient.disconnect(discoveredDevices[0].id);
    }
    
    isConnected = false;
    // Clear any polling intervals
    stopDataPolling();
    
    // Dispatch disconnected event
    dispatchBleEvent('nestor-disconnected');
  } catch (error) {
    console.error('Error during disconnection:', error);
  }
};

// Check if device is connected
export const isDeviceConnected = (): boolean => {
  return isConnected;
};

// Set device name
export const setDeviceName = (name: string): void => {
  deviceName = name;
  dispatchBleEvent('nestor-device-renamed', { name });
};

// Get device name
export const getDeviceName = (): string => {
  return deviceName;
};

// Get last connection error
export const getLastConnectionError = (): { message: string, timestamp: number } => {
  return {
    message: connectionErrorMessage,
    timestamp: lastErrorTimestamp
  };
};

// Create a trigger for flash log upload on reconnection
export const handleReconnection = (): void => {
  // Increment reconnection attempts
  reconnectionAttempts++;
  
  // If too many reconnection attempts, stop trying
  if (reconnectionAttempts > MAX_RECONNECTION_ATTEMPTS) {
    dispatchBleEvent('nestor-reconnection-failed', {
      attempts: reconnectionAttempts,
      message: 'Maximum reconnection attempts reached'
    });
    return;
  }
  
  // When device reconnects, check if there's flash log data available
  dispatchBleEvent('nestor-flash-data-available');
};
