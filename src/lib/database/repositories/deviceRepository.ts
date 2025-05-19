/**
 * Device Repository
 * Handles operations related to Nestor devices
 */

import { v4 as uuidv4 } from 'uuid';
import { DataStore, STORES } from '../db';
import { Device } from '../schema';

// Type adapter to match the Device schema with DataStore requirements
type DeviceWithId = Device & { id: string };

export class DeviceRepository {
  private store: DataStore<DeviceWithId>;
  
  constructor() {
    this.store = new DataStore<DeviceWithId>(STORES.DEVICES);
  }
  
  /**
   * Register a new Nestor device
   */
  async registerDevice(deviceData: Omit<Device, 'device_id' | 'created_at' | 'updated_at'>): Promise<Device> {
    const now = new Date().toISOString();
    const deviceId = uuidv4();
    
    const device: DeviceWithId = {
      device_id: deviceId,
      id: deviceId,  // Add id field to match DataStore requirements
      ...deviceData,
      created_at: now,
      updated_at: now
    };
    
    const savedDevice = await this.store.saveItem(device);
    // Convert back to Device type (without the extra id field)
    const { id, ...deviceWithoutId } = savedDevice;
    return deviceWithoutId;
  }
  
  /**
   * Get all registered devices
   */
  async getAllDevices(): Promise<Device[]> {
    const devicesWithId = await this.store.getAllItems();
    // Convert back to Device type
    return devicesWithId.map(({ id, ...deviceWithoutId }) => deviceWithoutId);
  }
  
  /**
   * Get a specific device by ID
   */
  async getDeviceById(deviceId: string): Promise<Device | null> {
    const deviceWithId = await this.store.getItem(deviceId);
    if (!deviceWithId) return null;
    
    // Convert back to Device type
    const { id, ...deviceWithoutId } = deviceWithId;
    return deviceWithoutId;
  }
  
  /**
   * Get the currently active device
   */
  async getActiveDevice(): Promise<Device | null> {
    const devicesWithId = await this.store.query(device => device.is_active === true);
    if (devicesWithId.length === 0) return null;
    
    // Convert back to Device type
    const { id, ...deviceWithoutId } = devicesWithId[0];
    return deviceWithoutId;
  }
  
  /**
   * Set a device as the active device
   * This will deactivate all other devices
   */
  async setActiveDevice(deviceId: string): Promise<boolean> {
    try {
      // Get all devices
      const devices = await this.getAllDevices();
      
      // Update each device's active status
      await Promise.all(
        devices.map(device => {
          const isActive = device.device_id === deviceId;
          return this.store.updateItem(device.device_id, {
            is_active: isActive,
            updated_at: new Date().toISOString()
          });
        })
      );
      
      return true;
    } catch (error) {
      console.error('Error setting active device:', error);
      return false;
    }
  }
  
  /**
   * Update device information
   */
  async updateDevice(deviceId: string, updates: Partial<Omit<Device, 'device_id' | 'created_at'>>): Promise<Device | null> {
    const updatedDeviceWithId = await this.store.updateItem(deviceId, {
      ...updates,
      updated_at: new Date().toISOString()
    });
    
    if (!updatedDeviceWithId) return null;
    
    // Convert back to Device type
    const { id, ...deviceWithoutId } = updatedDeviceWithId;
    return deviceWithoutId;
  }
  
  /**
   * Update device battery level
   */
  async updateBatteryLevel(deviceId: string, batteryLevel: number): Promise<Device | null> {
    const updatedDeviceWithId = await this.store.updateItem(deviceId, {
      battery_level: batteryLevel,
      updated_at: new Date().toISOString()
    });
    
    if (!updatedDeviceWithId) return null;
    
    // Convert back to Device type
    const { id, ...deviceWithoutId } = updatedDeviceWithId;
    return deviceWithoutId;
  }
  
  /**
   * Update device last sync time
   */
  async updateLastSync(deviceId: string): Promise<Device | null> {
    const updatedDeviceWithId = await this.store.updateItem(deviceId, {
      last_sync: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    
    if (!updatedDeviceWithId) return null;
    
    // Convert back to Device type
    const { id, ...deviceWithoutId } = updatedDeviceWithId;
    return deviceWithoutId;
  }
  
  /**
   * Remove a device
   */
  async removeDevice(deviceId: string): Promise<boolean> {
    // First check if device is active
    const device = await this.getDeviceById(deviceId);
    
    if (device?.is_active) {
      // Find another device to make active
      const devices = await this.getAllDevices();
      const otherDevices = devices.filter(d => d.device_id !== deviceId);
      
      if (otherDevices.length > 0) {
        // Set another device as active
        await this.setActiveDevice(otherDevices[0].device_id);
      }
    }
    
    return this.store.deleteItem(deviceId);
  }
  
  /**
   * Get devices that have been updated since a specific time
   */
  async getDevicesUpdatedSince(timestamp: string): Promise<Device[]> {
    const devicesWithId = await this.store.query(device => 
      new Date(device.updated_at) > new Date(timestamp)
    );
    
    // Convert back to Device type
    return devicesWithId.map(({ id, ...deviceWithoutId }) => deviceWithoutId);
  }
} 