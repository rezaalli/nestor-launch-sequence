/**
 * Sync Service
 * Handles synchronization between Nestor devices and the app
 */

import { BluetoothDeviceService } from './bluetooth/deviceService';
import { 
  DeviceRepository, 
  BiometricRepository,
  RepositoryManager 
} from '@/lib/database/repositories';
import { BiometricType } from '@/lib/database/schema';

// Commands for device communication
enum DeviceCommand {
  GET_DATA = 0x01,
  CLEAR_DATA = 0x02,
  SET_TIME = 0x03,
  GET_STATUS = 0x04,
}

// Sync result
export interface SyncResult {
  success: boolean;
  deviceId: string;
  dataPoints: number;
  batteryLevel: number;
  errors?: string[];
}

export class SyncService {
  constructor(
    private bleService: BluetoothDeviceService,
    private repositories: RepositoryManager
  ) {}
  
  /**
   * Sync data from a specific device
   */
  async syncFromDevice(deviceId: string): Promise<SyncResult> {
    try {
      // Connect to the device
      const connected = await this.bleService.connectToDevice(deviceId);
      
      if (!connected) {
        return {
          success: false,
          deviceId,
          dataPoints: 0,
          batteryLevel: 0,
          errors: ['Failed to connect to device']
        };
      }
      
      // Read battery level
      const batteryLevel = await this.bleService.readBatteryLevel() || 0;
      
      // Get data from device
      const rawData = await this.fetchDataFromDevice();
      
      if (!rawData) {
        return {
          success: false,
          deviceId,
          dataPoints: 0,
          batteryLevel,
          errors: ['Failed to fetch data from device']
        };
      }
      
      // Process and store the data
      const processedData = await this.processDeviceData(rawData, deviceId);
      
      // Clear data from device after successful processing
      if (processedData.length > 0) {
        await this.clearDeviceData();
      }
      
      // Disconnect from device
      await this.bleService.disconnect();
      
      // Update device last sync time
      await this.repositories.device.updateLastSync(deviceId);
      
      return {
        success: true,
        deviceId,
        dataPoints: processedData.length,
        batteryLevel
      };
    } catch (error) {
      console.error('Error syncing from device:', error);
      
      // Ensure device is disconnected on error
      await this.bleService.disconnect();
      
      return {
        success: false,
        deviceId,
        dataPoints: 0,
        batteryLevel: 0,
        errors: [(error as Error).message]
      };
    }
  }
  
  /**
   * Fetch raw data from the device
   */
  private async fetchDataFromDevice(): Promise<ArrayBuffer | null> {
    try {
      // Send command to get data
      const commandSent = await this.bleService.writeCommand(DeviceCommand.GET_DATA);
      
      if (!commandSent) {
        throw new Error('Failed to send GET_DATA command');
      }
      
      // Read data from device
      const data = await this.bleService.readData();
      return data;
    } catch (error) {
      console.error('Error fetching data from device:', error);
      return null;
    }
  }
  
  /**
   * Process raw data from the device into biometric data points
   */
  private async processDeviceData(
    rawData: ArrayBuffer,
    deviceId: string
  ): Promise<Array<{
    type: BiometricType;
    value: number;
    timestamp: string;
  }>> {
    // Get device from repository
    const device = await this.repositories.device.getDeviceById(deviceId);
    
    if (!device) {
      throw new Error(`Device not found: ${deviceId}`);
    }
    
    // For the purpose of this implementation, we'll use a default userId
    // In a real application, you would associate devices with users in your schema
    const userId = 'default_user_id';
    
    try {
      // Create a DataView to read the data
      const dataView = new DataView(rawData);
      const dataPoints: Array<{
        type: BiometricType;
        value: number;
        timestamp: string;
      }> = [];
      
      // Parse data format
      // This would need to be adjusted based on the specific format of your device's data
      let offset = 0;
      
      // Read the number of data points
      const numDataPoints = dataView.getUint16(offset, true); // little-endian
      offset += 2;
      
      for (let i = 0; i < numDataPoints; i++) {
        // Read data type (1 byte)
        const typeValue = dataView.getUint8(offset);
        offset += 1;
        
        // Read timestamp (4 bytes - Unix timestamp)
        const timestamp = dataView.getUint32(offset, true); // little-endian
        offset += 4;
        
        // Read value (4 bytes - float)
        const value = dataView.getFloat32(offset, true); // little-endian
        offset += 4;
        
        // Convert typeValue to BiometricType
        let type: BiometricType;
        switch (typeValue) {
          case 0x01:
            type = BiometricType.HEART_RATE;
            break;
          case 0x02:
            type = BiometricType.HRV;
            break;
          case 0x03:
            type = BiometricType.TEMPERATURE;
            break;
          case 0x04:
            type = BiometricType.SPO2;
            break;
          case 0x05:
            type = BiometricType.RESPIRATORY_RATE;
            break;
          case 0x06:
            type = BiometricType.MOVEMENT;
            break;
          default:
            console.warn(`Unknown data type: ${typeValue}`);
            continue; // Skip this data point
        }
        
        // Convert Unix timestamp to ISO string
        const timestampStr = new Date(timestamp * 1000).toISOString();
        
        // Add to data points
        dataPoints.push({
          type,
          value,
          timestamp: timestampStr
        });
      }
      
      // Store data points in repository
      if (dataPoints.length > 0) {
        const formattedDataPoints = dataPoints.map(dp => ({
          device_id: deviceId,
          user_id: userId,  // Using the default userId
          timestamp: dp.timestamp,
          data_type: dp.type,
          value: dp.value,
          metadata: {}
        }));
        
        await this.repositories.biometric.saveBatchBiometricData(formattedDataPoints);
      }
      
      return dataPoints;
    } catch (error) {
      console.error('Error processing device data:', error);
      throw error;
    }
  }
  
  /**
   * Clear data from the device
   */
  private async clearDeviceData(): Promise<boolean> {
    try {
      // Send command to clear data
      return await this.bleService.writeCommand(DeviceCommand.CLEAR_DATA);
    } catch (error) {
      console.error('Error clearing device data:', error);
      return false;
    }
  }
  
  /**
   * Set device time to match the phone's time
   */
  async setDeviceTime(): Promise<boolean> {
    try {
      // Create a buffer with the current time as a Unix timestamp
      const now = Math.floor(Date.now() / 1000);
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      view.setUint32(0, now, true); // little-endian
      
      // Send command to set time
      return await this.bleService.writeCommand(DeviceCommand.SET_TIME, buffer);
    } catch (error) {
      console.error('Error setting device time:', error);
      return false;
    }
  }
  
  /**
   * Sync all active devices
   */
  async syncAllDevices(): Promise<SyncResult[]> {
    try {
      // Get all devices
      const devices = await this.repositories.device.getAllDevices();
      
      // Results array
      const results: SyncResult[] = [];
      
      // Sync each device sequentially
      for (const device of devices) {
        const result = await this.syncFromDevice(device.device_id);
        results.push(result);
      }
      
      return results;
    } catch (error) {
      console.error('Error syncing all devices:', error);
      return [];
    }
  }
  
  /**
   * Get the last sync time for a device
   */
  async getLastSyncTime(deviceId: string): Promise<string | null> {
    try {
      const device = await this.repositories.device.getDeviceById(deviceId);
      return device?.last_sync || null;
    } catch (error) {
      console.error('Error getting last sync time:', error);
      return null;
    }
  }
} 