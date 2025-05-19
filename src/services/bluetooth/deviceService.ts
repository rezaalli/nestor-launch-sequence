/**
 * Bluetooth Device Service
 * Handles communication with Nestor devices via Bluetooth LE using Capacitor
 */

import { BleClient, ScanResult, BleDevice } from '@capacitor-community/bluetooth-le';
import { Device } from '@/lib/database/schema';
import { DeviceRepository } from '@/lib/database/repositories';

// Service UUIDs for Nestor devices
const NESTOR_SERVICE_UUID = '00001530-1212-efde-1523-785feabcd123';
const BATTERY_SERVICE_UUID = '0000180F-0000-1000-8000-00805f9b34fb';

// Characteristic UUIDs
const BATTERY_CHARACTERISTIC_UUID = '00002A19-0000-1000-8000-00805f9b34fb';
const FIRMWARE_CHARACTERISTIC_UUID = '00002A26-0000-1000-8000-00805f9b34fb';
const DATA_CHARACTERISTIC_UUID = '00001531-1212-efde-1523-785feabcd123';
const CONTROL_CHARACTERISTIC_UUID = '00001532-1212-efde-1523-785feabcd123';

export interface NestorDeviceInfo {
  deviceId: string;
  name: string;
  rssi: number;
  batteryLevel?: number;
  firmwareVersion?: string;
}

export class BluetoothDeviceService {
  private isInitialized = false;
  private connectedDevice: BleDevice | null = null;
  
  constructor(private deviceRepo: DeviceRepository) {}
  
  /**
   * Initialize Bluetooth
   */
  async initialize(): Promise<boolean> {
    try {
      await BleClient.initialize();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
      return false;
    }
  }
  
  /**
   * Scan for Nestor devices
   */
  async scanForDevices(timeoutMs: number = 5000): Promise<NestorDeviceInfo[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      const devices: NestorDeviceInfo[] = [];
      
      await BleClient.requestLEScan(
        {
          services: [NESTOR_SERVICE_UUID],
          namePrefix: 'Nestor'
        },
        (result) => {
          // Process scan result
          const deviceInfo: NestorDeviceInfo = {
            deviceId: result.device.deviceId,
            name: result.device.name || `Nestor-${result.device.deviceId.substring(0, 5)}`,
            rssi: result.rssi,
          };
          
          // Add to devices array if not already present
          if (!devices.some(d => d.deviceId === deviceInfo.deviceId)) {
            devices.push(deviceInfo);
          }
        }
      );
      
      // Stop scan after timeout
      setTimeout(async () => {
        await BleClient.stopLEScan();
      }, timeoutMs);
      
      return devices;
    } catch (error) {
      console.error('Error scanning for devices:', error);
      return [];
    }
  }
  
  /**
   * Connect to a device
   */
  async connectToDevice(deviceId: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      // Disconnect from any previously connected device
      if (this.connectedDevice) {
        await BleClient.disconnect(this.connectedDevice.deviceId);
        this.connectedDevice = null;
      }
      
      // Get device from repository
      const storedDevice = await this.deviceRepo.getDeviceById(deviceId);
      if (!storedDevice) {
        throw new Error(`Device not found: ${deviceId}`);
      }
      
      // Connect to the device
      await BleClient.connect(storedDevice.mac_address);
      
      // Store reference to connected device
      this.connectedDevice = { deviceId: storedDevice.mac_address };
      
      // Update device last sync time
      await this.deviceRepo.updateLastSync(deviceId);
      
      // Read battery level after connection
      const batteryLevel = await this.readBatteryLevel();
      if (batteryLevel !== null) {
        await this.deviceRepo.updateBatteryLevel(deviceId, batteryLevel);
      }
      
      return true;
    } catch (error) {
      console.error('Error connecting to device:', error);
      return false;
    }
  }
  
  /**
   * Disconnect from current device
   */
  async disconnect(): Promise<boolean> {
    if (!this.connectedDevice) {
      return true;
    }
    
    try {
      await BleClient.disconnect(this.connectedDevice.deviceId);
      this.connectedDevice = null;
      return true;
    } catch (error) {
      console.error('Error disconnecting from device:', error);
      return false;
    }
  }
  
  /**
   * Read battery level from connected device
   */
  async readBatteryLevel(): Promise<number | null> {
    if (!this.connectedDevice) {
      return null;
    }
    
    try {
      const result = await BleClient.read(
        this.connectedDevice.deviceId,
        BATTERY_SERVICE_UUID,
        BATTERY_CHARACTERISTIC_UUID
      );
      
      // Battery level is a single byte value (0-100)
      const batteryLevel = new DataView(result.buffer).getUint8(0);
      return batteryLevel;
    } catch (error) {
      console.error('Error reading battery level:', error);
      return null;
    }
  }
  
  /**
   * Read firmware version from connected device
   */
  async readFirmwareVersion(): Promise<string | null> {
    if (!this.connectedDevice) {
      return null;
    }
    
    try {
      const result = await BleClient.read(
        this.connectedDevice.deviceId,
        NESTOR_SERVICE_UUID,
        FIRMWARE_CHARACTERISTIC_UUID
      );
      
      // Convert the array buffer to a string
      const decoder = new TextDecoder('utf-8');
      const firmwareVersion = decoder.decode(result.buffer);
      return firmwareVersion;
    } catch (error) {
      console.error('Error reading firmware version:', error);
      return null;
    }
  }
  
  /**
   * Read data from connected device
   */
  async readData(): Promise<ArrayBuffer | null> {
    if (!this.connectedDevice) {
      return null;
    }
    
    try {
      const result = await BleClient.read(
        this.connectedDevice.deviceId,
        NESTOR_SERVICE_UUID,
        DATA_CHARACTERISTIC_UUID
      );
      
      return result.buffer;
    } catch (error) {
      console.error('Error reading data from device:', error);
      return null;
    }
  }
  
  /**
   * Write command to connected device
   */
  async writeCommand(command: number, data?: ArrayBuffer): Promise<boolean> {
    if (!this.connectedDevice) {
      return false;
    }
    
    try {
      // Create command buffer
      const commandBuffer = new ArrayBuffer(data ? data.byteLength + 1 : 1);
      const commandView = new DataView(commandBuffer);
      
      // Set command byte
      commandView.setUint8(0, command);
      
      // Copy data if provided
      if (data) {
        const dataView = new Uint8Array(data);
        const commandArray = new Uint8Array(commandBuffer);
        commandArray.set(dataView, 1);
      }
      
      // Write to device - creating a DataView from the buffer
      await BleClient.write(
        this.connectedDevice.deviceId,
        NESTOR_SERVICE_UUID,
        CONTROL_CHARACTERISTIC_UUID,
        new DataView(commandBuffer)
      );
      
      return true;
    } catch (error) {
      console.error('Error writing command to device:', error);
      return false;
    }
  }
  
  /**
   * Register a Nestor device
   */
  async registerNestorDevice(
    deviceInfo: ScanResult,
    watchName: string
  ): Promise<Device | null> {
    try {
      // Connect to the device to get more info
      await BleClient.connect(deviceInfo.device.deviceId);
      
      // Read battery level and firmware version
      const batteryLevelResult = await BleClient.read(
        deviceInfo.device.deviceId,
        BATTERY_SERVICE_UUID,
        BATTERY_CHARACTERISTIC_UUID
      );
      
      const firmwareVersionResult = await BleClient.read(
        deviceInfo.device.deviceId,
        NESTOR_SERVICE_UUID,
        FIRMWARE_CHARACTERISTIC_UUID
      );
      
      // Parse results
      const batteryLevel = new DataView(batteryLevelResult.buffer).getUint8(0);
      const decoder = new TextDecoder('utf-8');
      const firmwareVersion = decoder.decode(firmwareVersionResult.buffer);
      
      // Disconnect after getting info
      await BleClient.disconnect(deviceInfo.device.deviceId);
      
      // Register device in repository
      const device = await this.deviceRepo.registerDevice({
        device_name: deviceInfo.device.name || `Nestor-${deviceInfo.device.deviceId.substring(0, 5)}`,
        device_type: 'Nestor Wearable',
        firmware_version: firmwareVersion,
        last_sync: new Date().toISOString(),
        battery_level: batteryLevel,
        is_active: false, // Not active by default
        associated_watch: watchName,
        mac_address: deviceInfo.device.deviceId
      });
      
      return device;
    } catch (error) {
      console.error('Error registering Nestor device:', error);
      return null;
    }
  }
  
  /**
   * Check if a device is Nestor device
   */
  isNestorDevice(scanResult: ScanResult): boolean {
    // Check if device name contains "Nestor"
    if (scanResult.device.name?.includes('Nestor')) {
      return true;
    }
    
    // Check if device advertises Nestor service by checking raw advertisement data
    // This depends on the specific format of your device's advertisements
    // A more robust implementation would parse the raw advertisement data looking for the service UUID
    
    return false;
  }
} 