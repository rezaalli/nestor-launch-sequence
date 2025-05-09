
import { BleClient, ScanResult, RequestBleDeviceOptions } from '@capacitor-community/bluetooth-le';
import { NESTOR_BLE_SERVICE } from './bleConfig';
import { dispatchBleEvent } from './bleEvents';

// Store discovered devices
let discoveredDevices: { id: string, name: string, rssi: number, lastSeen: number }[] = [];
let isScanningDevices = false;

// Scan for nearby BLE devices
export const scanForDevices = async (options: { timeout?: number, allowDuplicates?: boolean } = {}): Promise<boolean> => {
  if (isScanningDevices) return false;
  
  try {
    console.log('Starting BLE scan...');
    isScanningDevices = true;
    discoveredDevices = [];
    
    // Dispatch event to notify scan started
    dispatchBleEvent('nestor-scan-started');
    
    // Initialize Bluetooth
    await BleClient.initialize();
    
    // Set up scan options
    const scanOptions: RequestBleDeviceOptions = {
      services: [NESTOR_BLE_SERVICE],
      optionalServices: [],
      name: 'Nestor',
      namePrefix: 'Nestor',
      allowDuplicates: options.allowDuplicates || false,
    };
    
    // Start scanning with a callback for found devices
    await BleClient.requestDevice(scanOptions)
      .then(device => {
        // Add the discovered device
        const newDevice = {
          id: device.deviceId,
          name: device.name || `Nestor Device (${device.deviceId.substring(0, 8)})`,
          rssi: device.rssi || -70,
          lastSeen: Date.now()
        };
        
        discoveredDevices.push(newDevice);
        
        // Dispatch event with discovered device
        dispatchBleEvent('nestor-devices-discovered', { devices: discoveredDevices });
      })
      .catch(error => {
        console.error('Error during scan:', error);
        throw error;
      });
    
    // Scan completion
    isScanningDevices = false;
    dispatchBleEvent('nestor-scan-complete', { deviceCount: discoveredDevices.length });
    
    return true;
  } catch (error) {
    console.error('Scan failed:', error);
    isScanningDevices = false;
    dispatchBleEvent('nestor-scan-error', { error: 'Failed to scan for devices' });
    return false;
  }
};

// Get discovered devices
export const getDiscoveredDevices = () => {
  return [...discoveredDevices];
};

// Is currently scanning
export const isScanning = (): boolean => {
  return isScanningDevices;
};

// Get the signal strength description based on RSSI value
export const getSignalStrengthFromRssi = (rssi: number): 'weak' | 'medium' | 'strong' => {
  if (rssi >= -70) return 'strong';
  if (rssi >= -85) return 'medium';
  return 'weak';
};
