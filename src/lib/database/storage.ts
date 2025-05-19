/**
 * DataStorage class for Nestor Health
 * Provides storage and retrieval of health data with cloud sync capabilities
 */

import { DataStore, STORES } from './db';
import { Device, BiometricData, Assessment, BiometricType } from './schema';

// Define interfaces that extend the schema interfaces to satisfy DataStore constraints
interface DeviceWithId extends Device {
  id: string;
}

/**
 * DataStorage provides methods to access and manipulate data in the local database
 * with awareness of sync state for cloud synchronization
 */
export class DataStorage {
  private deviceStore: DataStore<DeviceWithId>;
  private biometricStore: DataStore<BiometricData>;
  private assessmentStore: DataStore<Assessment>;
  
  constructor() {
    this.deviceStore = new DataStore<DeviceWithId>(STORES.DEVICES);
    this.biometricStore = new DataStore<BiometricData>(STORES.BIOMETRIC_DATA);
    this.assessmentStore = new DataStore<Assessment>(STORES.ASSESSMENTS);
  }
  
  /**
   * Get health metrics that have been modified since a specific time
   * @param lastSyncTime The time of the last sync operation
   */
  async getModifiedHealthMetrics(lastSyncTime: Date | null): Promise<BiometricData[]> {
    const allMetrics = await this.biometricStore.getAllItems();
    
    // If no sync time provided, return all metrics
    if (!lastSyncTime) {
      return allMetrics;
    }
    
    // Filter metrics that haven't been synced or were updated after the last sync
    return allMetrics.filter(metric => {
      if (!metric.is_synced) return true;
      
      const metricTime = new Date(metric.created_at);
      return metricTime > lastSyncTime;
    });
  }
  
  /**
   * Get a device by its ID
   * @param deviceId The ID of the device to retrieve
   */
  async getDevice(deviceId: string): Promise<DeviceWithId | null> {
    // In our schema, device_id is the unique identifier, but our DataStore expects 'id'
    // For simplicity in this implementation, we'll assume device_id is stored as 'id'
    return this.deviceStore.getItem(deviceId);
  }
  
  /**
   * Get all registered devices
   */
  async getAllDevices(): Promise<DeviceWithId[]> {
    return this.deviceStore.getAllItems();
  }
  
  /**
   * Get assessments that have been modified since a specific time
   * @param lastSyncTime The time of the last sync operation
   */
  async getModifiedAssessments(lastSyncTime: Date | null): Promise<Assessment[]> {
    const allAssessments = await this.assessmentStore.getAllItems();
    
    // If no sync time provided, return all assessments
    if (!lastSyncTime) {
      return allAssessments;
    }
    
    // Filter assessments that haven't been synced or were updated after the last sync
    return allAssessments.filter(assessment => {
      if (!assessment.is_synced) return true;
      
      const assessmentTime = new Date(assessment.updated_at);
      return assessmentTime > lastSyncTime;
    });
  }
} 