/**
 * Biometric Repository
 * Handles operations related to biometric data
 */

import { v4 as uuidv4 } from 'uuid';
import { DataStore, STORES } from '../db';
import { BiometricData, BiometricType } from '../schema';

// Type adapter to match the BiometricData schema with DataStore requirements
type BiometricDataWithId = BiometricData & { id: string };

export class BiometricRepository {
  private store: DataStore<BiometricDataWithId>;
  
  constructor() {
    this.store = new DataStore<BiometricDataWithId>(STORES.BIOMETRIC_DATA);
  }
  
  /**
   * Save biometric data
   */
  async saveBiometricData(data: Omit<BiometricData, 'id' | 'created_at' | 'is_synced'>): Promise<BiometricData> {
    const now = new Date().toISOString();
    const id = uuidv4();
    
    const biometricData: BiometricDataWithId = {
      id,
      ...data,
      created_at: now,
      is_synced: false
    };
    
    const savedData = await this.store.saveItem(biometricData);
    return savedData;
  }
  
  /**
   * Save batch of biometric data
   */
  async saveBatchBiometricData(dataPoints: Omit<BiometricData, 'id' | 'created_at' | 'is_synced'>[]): Promise<BiometricData[]> {
    const now = new Date().toISOString();
    
    const formattedDataPoints = dataPoints.map(data => {
      const id = uuidv4();
      return {
        id,
        ...data,
        created_at: now,
        is_synced: false
      };
    });
    
    const savedData = await this.store.saveItems(formattedDataPoints);
    return savedData;
  }
  
  /**
   * Get biometric data for a specific user and date
   */
  async getDataForUserAndDate(userId: string, date: string): Promise<BiometricData[]> {
    // Create date range for the specified date (from 00:00:00 to 23:59:59)
    const startTime = new Date(`${date}T00:00:00.000Z`).toISOString();
    const endTime = new Date(`${date}T23:59:59.999Z`).toISOString();
    
    return this.getDataInTimeRange(userId, startTime, endTime);
  }
  
  /**
   * Get biometric data for a specific time range
   */
  async getDataInTimeRange(userId: string, startTime: string, endTime: string): Promise<BiometricData[]> {
    const data = await this.store.query(item => 
      item.user_id === userId &&
      item.timestamp >= startTime &&
      item.timestamp <= endTime
    );
    
    return data;
  }
  
  /**
   * Get biometric data by type for a specific time range
   */
  async getDataByTypeInTimeRange(
    userId: string, 
    dataType: BiometricType, 
    startTime: string, 
    endTime: string
  ): Promise<BiometricData[]> {
    const data = await this.store.query(item => 
      item.user_id === userId &&
      item.data_type === dataType &&
      item.timestamp >= startTime &&
      item.timestamp <= endTime
    );
    
    return data;
  }
  
  /**
   * Get latest biometric data point of a specific type
   */
  async getLatestDataByType(userId: string, dataType: BiometricType): Promise<BiometricData | null> {
    const data = await this.store.query(item => 
      item.user_id === userId &&
      item.data_type === dataType
    );
    
    if (data.length === 0) return null;
    
    // Sort by timestamp in descending order and get the first item
    return data.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];
  }
  
  /**
   * Get all unsynced biometric data
   */
  async getUnsyncedData(): Promise<BiometricData[]> {
    return this.store.query(item => item.is_synced === false);
  }
  
  /**
   * Mark biometric data as synced
   */
  async markAsSynced(ids: string[]): Promise<boolean> {
    try {
      await Promise.all(
        ids.map(id => this.store.updateItem(id, { is_synced: true }))
      );
      return true;
    } catch (error) {
      console.error('Error marking data as synced:', error);
      return false;
    }
  }
  
  /**
   * Delete biometric data for a specific user and time range
   */
  async deleteDataInTimeRange(userId: string, startTime: string, endTime: string): Promise<boolean> {
    try {
      const data = await this.getDataInTimeRange(userId, startTime, endTime);
      
      await Promise.all(
        data.map(item => this.store.deleteItem(item.id))
      );
      
      return true;
    } catch (error) {
      console.error('Error deleting biometric data:', error);
      return false;
    }
  }
  
  /**
   * Get summary statistics for a specific data type and time range
   */
  async getStatistics(
    userId: string, 
    dataType: BiometricType, 
    startTime: string, 
    endTime: string
  ): Promise<{
    min: number;
    max: number;
    avg: number;
    count: number;
  } | null> {
    const data = await this.getDataByTypeInTimeRange(userId, dataType, startTime, endTime);
    
    if (data.length === 0) return null;
    
    const values = data.map(item => item.value);
    
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      count: values.length
    };
  }
} 