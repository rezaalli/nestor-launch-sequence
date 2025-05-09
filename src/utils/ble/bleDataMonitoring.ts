
import { BleClient } from '@capacitor-community/bluetooth-le';
import { NESTOR_BLE_SERVICE, NESTOR_CHARACTERISTICS, PackedVitals } from './bleConfig';
import { dispatchBleEvent } from './bleEvents';
import { getDiscoveredDevices } from './bleScanning';

// Buffer to store the last 7 days of data (assuming readings every 5 seconds)
// We'll store a more reasonable amount for performance
const MAX_READINGS = 2016; // 7 days of readings at 1 reading per 5 minutes
let vitalReadings: (PackedVitals & { timestamp: number })[] = [];
let lastReading: PackedVitals | null = null;
let isWorn = true; // Assume worn by default until notified otherwise
let pollingInterval: number | null = null;

export const startDataPolling = async (): void => {
  if (pollingInterval) return; // Already polling
  
  try {
    const devices = getDiscoveredDevices();
    if (devices.length === 0) return;
    
    const deviceId = devices[0].id;
    
    // Try to enable notifications for the vitals characteristic
    await BleClient.startNotifications(
      deviceId,
      NESTOR_BLE_SERVICE,
      NESTOR_CHARACTERISTICS.VITALS,
      (value) => {
        // Parse the data from the characteristic
        const dataView = new DataView(value.buffer);
        const hr = dataView.getUint8(0);
        const spo2 = dataView.getUint8(1);
        const temp = dataView.getUint16(2, true); // Little endian
        const battery = dataView.getUint8(4);
        const motion = dataView.getUint8(5) & 0x03; // Use only lower 2 bits
        const readiness = dataView.getUint8(6);
        const fever = (dataView.getUint8(5) & 0x04) ? 1 : 0; // Use 3rd bit for fever flag
        
        const vitalData: PackedVitals = {
          hr, spo2, temp, battery, motion, readiness, fever
        };
        
        // Process the data
        processVitalData(vitalData);
      }
    );
    
    // Fallback polling in case notifications don't work
    pollingInterval = window.setInterval(async () => {
      try {
        if (!isDeviceConnected()) {
          stopDataPolling();
          return;
        }
        
        // If device is not worn, we don't get new readings
        if (!isWorn) return;
        
        // Read the vitals characteristic
        const result = await BleClient.read(
          deviceId,
          NESTOR_BLE_SERVICE,
          NESTOR_CHARACTERISTICS.VITALS
        );
        
        // Parse the data
        const dataView = new DataView(result.buffer);
        const hr = dataView.getUint8(0);
        const spo2 = dataView.getUint8(1);
        const temp = dataView.getUint16(2, true); // Little endian
        const battery = dataView.getUint8(4);
        const motion = dataView.getUint8(5) & 0x03; // Use only lower 2 bits
        const readiness = dataView.getUint8(6);
        const fever = (dataView.getUint8(5) & 0x04) ? 1 : 0; // Use 3rd bit for fever flag
        
        const vitalData: PackedVitals = {
          hr, spo2, temp, battery, motion, readiness, fever
        };
        
        // Process the data
        processVitalData(vitalData);
      } catch (error) {
        console.error('Error polling BLE data:', error);
      }
    }, 5000); // Poll every 5 seconds
  } catch (error) {
    console.error('Error starting BLE notifications:', error);
  }
};

export const stopDataPolling = (): void => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  
  // Try to disable notifications if there's a connected device
  const devices = getDiscoveredDevices();
  if (devices.length > 0) {
    try {
      BleClient.stopNotifications(
        devices[0].id,
        NESTOR_BLE_SERVICE,
        NESTOR_CHARACTERISTICS.VITALS
      );
    } catch (error) {
      console.error('Error stopping BLE notifications:', error);
    }
  }
};

const processVitalData = (data: PackedVitals): void => {
  // Process incoming data from the device
  lastReading = data;
  
  // Add to readings history with timestamp
  const newReading = {
    ...data,
    timestamp: Date.now()
  };
  
  vitalReadings.push(newReading);
  
  // Trim if exceeding max size
  if (vitalReadings.length > MAX_READINGS) {
    vitalReadings = vitalReadings.slice(vitalReadings.length - MAX_READINGS);
  }
  
  // Dispatch event for components to listen to
  dispatchBleEvent('nestor-vital-update', { ...data });
  
  // Check for fever condition
  if (data.fever === 1) {
    dispatchBleEvent('nestor-fever-alert', { 
      temperature: data.temp / 10, 
      type: 'high' 
    });
  }
};

// Get the last reading
export const getLastReading = (): (PackedVitals & { timestamp: number }) | null => {
  if (vitalReadings.length === 0) return null;
  return vitalReadings[vitalReadings.length - 1];
};

// Get readings for a time period
export const getReadings = (days: number = 7): (PackedVitals & { timestamp: number })[] => {
  const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
  return vitalReadings.filter(reading => reading.timestamp >= cutoffTime);
};

// Check if device is being worn
export const isDeviceWorn = (): boolean => {
  return isWorn;
};

// Set device worn state
export const setDeviceWorn = (worn: boolean): void => {
  isWorn = worn;
  
  // Dispatch event for components to react to wear state change
  dispatchBleEvent('nestor-wear-state', { worn });
};

// Helper function to check connection status
export function isDeviceConnected(): boolean {
  // This is a placeholder - the actual implementation will be imported from bleConnection.ts
  // This is used locally to avoid circular imports
  return true;
}

// Format temperature for display based on unit preference
export const formatTemperature = (tempInTenthsCelsius: number, unitPreference: 'metric' | 'imperial'): { value: string, unit: string } => {
  const celsius = tempInTenthsCelsius / 10;
  
  if (unitPreference === 'imperial') {
    const fahrenheit = (celsius * 9/5) + 32;
    return { value: fahrenheit.toFixed(1), unit: '°F' };
  }
  return { value: celsius.toFixed(1), unit: '°C' };
};
