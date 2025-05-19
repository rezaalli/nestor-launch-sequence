/**
 * CloudSyncService.ts
 * Optimized cloud synchronization service for Nestor Health app
 * Phase 4 implementation with improved performance, reliability and offline support
 */

import { DataStorage } from '@/lib/database/storage';
import { Device } from '@/lib/database/schema';
import { Platform } from '@/utils/platform';
import { networkStatus } from '@/utils/networkUtils';

// Interfaces for sync operations
export interface SyncOptions {
  forceSync?: boolean;
  syncDirection?: 'push' | 'pull' | 'bidirectional';
  deviceId?: string;
  dataTypes?: DataType[];
  compressionEnabled?: boolean;
  encryptionEnabled?: boolean;
  priorityLevel?: 'high' | 'normal' | 'low';
  conflictResolution?: 'localWins' | 'serverWins' | 'newerWins' | 'manual';
}

export type DataType = 'healthMetrics' | 'deviceData' | 'userPreferences' | 'assessments' | 'mlModels';

export interface SyncResult {
  success: boolean;
  syncedItemCount: number;
  timestamp: Date;
  dataTypes: DataType[];
  errors?: SyncError[];
  warnings?: string[];
  deviceId?: string;
  syncDirection: 'push' | 'pull' | 'bidirectional';
  duration: number;
  dataSizeBytes?: number;
}

export interface SyncError {
  code: string;
  message: string;
  dataType?: DataType;
  itemId?: string;
  recoverable: boolean;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date | null;
  pendingChanges: number;
  syncInProgress: boolean;
  currentOperation?: string;
  progress?: number;
}

/**
 * CloudSyncService provides optimized data synchronization between local storage and cloud
 * Implements intelligent sync algorithms with offline support, conflict resolution,
 * and efficient data transfer
 */
export class CloudSyncService {
  private static instance: CloudSyncService;
  private storage: DataStorage;
  private syncQueue: Map<string, {data: any, priority: number, timestamp: Date}> = new Map();
  private isSyncing: boolean = false;
  private lastSyncTime: Date | null = null;
  private syncInterval: number | null = null;
  private pendingChangesCount: number = 0;
  private currentProgress: number = 0;
  private currentOperation: string = '';
  
  // Default sync options
  private defaultOptions: SyncOptions = {
    forceSync: false,
    syncDirection: 'bidirectional',
    compressionEnabled: true,
    encryptionEnabled: true,
    priorityLevel: 'normal',
    conflictResolution: 'newerWins'
  };

  private constructor() {
    this.storage = new DataStorage();
    this.loadSyncState();
    
    // Monitor network changes to automatically sync when connection is restored
    window.addEventListener('online', this.handleNetworkChange.bind(this));
  }

  public static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService();
    }
    return CloudSyncService.instance;
  }

  /**
   * Get current sync status
   */
  public getSyncStatus(): SyncStatus {
    return {
      isOnline: networkStatus.isOnline(),
      lastSyncTime: this.lastSyncTime,
      pendingChanges: this.pendingChangesCount,
      syncInProgress: this.isSyncing,
      currentOperation: this.currentOperation,
      progress: this.currentProgress
    };
  }

  /**
   * Start automatic background sync
   * @param intervalMinutes Interval between syncs in minutes
   */
  public startAutoSync(intervalMinutes: number = 60): void {
    // Clear existing interval if any
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
    }
    
    // Convert minutes to milliseconds
    const intervalMs = intervalMinutes * 60 * 1000;
    
    // Set up new interval
    this.syncInterval = window.setInterval(async () => {
      // Only sync if we're online and not already syncing
      if (networkStatus.isOnline() && !this.isSyncing) {
        await this.synchronize();
      }
    }, intervalMs);
    
    console.log(`Auto-sync enabled with ${intervalMinutes} minute interval`);
  }

  /**
   * Stop automatic background sync
   */
  public stopAutoSync(): void {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync disabled');
    }
  }

  /**
   * Synchronize data with cloud
   * @param options Sync options
   */
  public async synchronize(options: SyncOptions = {}): Promise<SyncResult> {
    // Merge with default options
    const mergedOptions: SyncOptions = { ...this.defaultOptions, ...options };
    
    // Don't start a new sync if one is already in progress, unless forced
    if (this.isSyncing && !mergedOptions.forceSync) {
      console.log('Sync already in progress. Use forceSync option to override.');
      return {
        success: false,
        syncedItemCount: 0,
        timestamp: new Date(),
        dataTypes: [],
        errors: [{ code: 'SYNC_IN_PROGRESS', message: 'Sync already in progress', recoverable: true }],
        syncDirection: mergedOptions.syncDirection || 'bidirectional',
        duration: 0
      };
    }
    
    // Check network connectivity
    if (!networkStatus.isOnline()) {
      console.log('Cannot sync: Device is offline');
      this.addToSyncQueue(mergedOptions, 'all');
      return {
        success: false,
        syncedItemCount: 0,
        timestamp: new Date(),
        dataTypes: [],
        errors: [{ code: 'OFFLINE', message: 'Device is offline', recoverable: true }],
        syncDirection: mergedOptions.syncDirection || 'bidirectional',
        duration: 0
      };
    }
    
    // Initialize sync metrics
    const startTime = Date.now();
    this.isSyncing = true;
    this.currentProgress = 0;
    this.updateSyncStatus('Preparing sync operation');
    
    try {
      // Determine which data types to sync
      const dataTypesToSync = mergedOptions.dataTypes || ['healthMetrics', 'deviceData', 'userPreferences', 'assessments', 'mlModels'];
      
      // Track sync results
      let totalItemCount = 0;
      const errors: SyncError[] = [];
      const warnings: string[] = [];
      let totalDataSize = 0;
      
      // Process each data type
      for (let i = 0; i < dataTypesToSync.length; i++) {
        const dataType = dataTypesToSync[i];
        this.currentProgress = (i / dataTypesToSync.length) * 100;
        this.updateSyncStatus(`Syncing ${dataType}`);
        
        try {
          // Perform sync for this data type
          const result = await this.syncDataType(dataType, mergedOptions);
          
          // Update metrics
          totalItemCount += result.itemCount;
          totalDataSize += result.dataSizeBytes || 0;
          
          if (result.warnings.length > 0) {
            warnings.push(...result.warnings);
          }
        } catch (error) {
          console.error(`Error syncing ${dataType}:`, error);
          errors.push({
            code: 'SYNC_ERROR',
            message: error instanceof Error ? error.message : 'Unknown error',
            dataType: dataType,
            recoverable: true
          });
        }
      }
      
      // Update last sync time
      this.lastSyncTime = new Date();
      this.pendingChangesCount = 0;
      this.currentProgress = 100;
      this.saveSyncState();
      
      // Prepare result
      const syncDuration = Date.now() - startTime;
      const result: SyncResult = {
        success: errors.length === 0,
        syncedItemCount: totalItemCount,
        timestamp: new Date(),
        dataTypes: dataTypesToSync,
        errors: errors.length > 0 ? errors : undefined,
        warnings: warnings.length > 0 ? warnings : undefined,
        deviceId: mergedOptions.deviceId,
        syncDirection: mergedOptions.syncDirection || 'bidirectional',
        duration: syncDuration,
        dataSizeBytes: totalDataSize
      };
      
      console.log(`Sync completed in ${syncDuration}ms`, result);
      return result;
    } catch (error) {
      console.error('Sync operation failed:', error);
      return {
        success: false,
        syncedItemCount: 0,
        timestamp: new Date(),
        dataTypes: [],
        errors: [{ 
          code: 'UNKNOWN_ERROR', 
          message: error instanceof Error ? error.message : 'Unknown error', 
          recoverable: false 
        }],
        syncDirection: mergedOptions.syncDirection || 'bidirectional',
        duration: Date.now() - startTime
      };
    } finally {
      this.isSyncing = false;
      this.updateSyncStatus('');
    }
  }

  /**
   * Sync a specific data type
   * @param dataType The type of data to sync
   * @param options Sync options
   */
  private async syncDataType(dataType: DataType, options: SyncOptions): Promise<{
    itemCount: number,
    dataSizeBytes?: number,
    warnings: string[]
  }> {
    const warnings: string[] = [];
    
    // Implementation specific to each data type
    switch (dataType) {
      case 'healthMetrics':
        return await this.syncHealthMetrics(options);
      
      case 'deviceData':
        return await this.syncDeviceData(options);
      
      case 'userPreferences':
        return await this.syncUserPreferences(options);
      
      case 'assessments':
        return await this.syncAssessments(options);
      
      case 'mlModels':
        return await this.syncMLModels(options);
      
      default:
        warnings.push(`Unknown data type: ${dataType}`);
        return { itemCount: 0, warnings };
    }
  }

  /**
   * Sync health metrics data
   */
  private async syncHealthMetrics(options: SyncOptions): Promise<{
    itemCount: number,
    dataSizeBytes?: number,
    warnings: string[]
  }> {
    const warnings: string[] = [];
    
    // Get locally modified health metrics since last sync
    const localChanges = await this.storage.getModifiedHealthMetrics(this.lastSyncTime);
    
    // Prepare data for sync
    const dataPackage = options.compressionEnabled 
      ? this.compressData(localChanges) 
      : localChanges;
    
    // Calculate data size
    const dataSizeBytes = new Blob([JSON.stringify(dataPackage)]).size;
    
    if (options.syncDirection === 'push' || options.syncDirection === 'bidirectional') {
      // Push changes to cloud
      // In a real implementation, this would call an API
      console.log(`[MOCK] Pushing ${localChanges.length} health metrics to cloud`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    if (options.syncDirection === 'pull' || options.syncDirection === 'bidirectional') {
      // Pull changes from cloud
      console.log(`[MOCK] Pulling health metrics from cloud`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real implementation, we would process and save server changes
    }
    
    return {
      itemCount: localChanges.length,
      dataSizeBytes,
      warnings
    };
  }

  /**
   * Sync device data
   */
  private async syncDeviceData(options: SyncOptions): Promise<{
    itemCount: number,
    dataSizeBytes?: number,
    warnings: string[]
  }> {
    const warnings: string[] = [];
    
    // Get devices to sync
    let devices: Device[];
    if (options.deviceId) {
      const device = await this.storage.getDevice(options.deviceId);
      devices = device ? [device] : [];
    } else {
      devices = await this.storage.getAllDevices();
    }
    
    // Prepare data
    const dataPackage = options.compressionEnabled 
      ? this.compressData(devices) 
      : devices;
    
    const dataSizeBytes = new Blob([JSON.stringify(dataPackage)]).size;
    
    if (options.syncDirection === 'push' || options.syncDirection === 'bidirectional') {
      // Push device data to cloud
      console.log(`[MOCK] Pushing ${devices.length} devices to cloud`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    if (options.syncDirection === 'pull' || options.syncDirection === 'bidirectional') {
      // Pull device data from cloud
      console.log(`[MOCK] Pulling device data from cloud`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    return {
      itemCount: devices.length,
      dataSizeBytes,
      warnings
    };
  }

  /**
   * Sync user preferences
   */
  private async syncUserPreferences(options: SyncOptions): Promise<{
    itemCount: number,
    dataSizeBytes?: number,
    warnings: string[]
  }> {
    const warnings: string[] = [];
    
    // Simulated preferences sync
    console.log(`[MOCK] Syncing user preferences`);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      itemCount: 1,
      dataSizeBytes: 1024, // Simulated size
      warnings
    };
  }

  /**
   * Sync daily assessments
   */
  private async syncAssessments(options: SyncOptions): Promise<{
    itemCount: number,
    dataSizeBytes?: number,
    warnings: string[]
  }> {
    const warnings: string[] = [];
    
    // Get locally modified assessments
    const localChanges = await this.storage.getModifiedAssessments(this.lastSyncTime);
    
    // Prepare data
    const dataPackage = options.compressionEnabled 
      ? this.compressData(localChanges) 
      : localChanges;
    
    const dataSizeBytes = new Blob([JSON.stringify(dataPackage)]).size;
    
    if (options.syncDirection === 'push' || options.syncDirection === 'bidirectional') {
      // Push assessments to cloud
      console.log(`[MOCK] Pushing ${localChanges.length} assessments to cloud`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    if (options.syncDirection === 'pull' || options.syncDirection === 'bidirectional') {
      // Pull assessments from cloud
      console.log(`[MOCK] Pulling assessments from cloud`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    return {
      itemCount: localChanges.length,
      dataSizeBytes,
      warnings
    };
  }

  /**
   * Sync ML models
   */
  private async syncMLModels(options: SyncOptions): Promise<{
    itemCount: number,
    dataSizeBytes?: number,
    warnings: string[]
  }> {
    const warnings: string[] = [];
    
    // This is mostly a download operation to get the latest models
    if (options.syncDirection === 'pull' || options.syncDirection === 'bidirectional') {
      console.log(`[MOCK] Pulling ML models from cloud`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real implementation, we would download and save the models
    }
    
    return {
      itemCount: 3, // Simulated count of ML models
      dataSizeBytes: 15 * 1024 * 1024, // Simulated size (15 MB)
      warnings
    };
  }

  /**
   * Compress data for efficient transfer
   * @param data Data to compress
   */
  private compressData(data: any): any {
    // In a real implementation, this would use a compression algorithm
    // For now, we'll just return the original data
    console.log('[MOCK] Compressing data for transfer');
    return data;
  }

  /**
   * Add an item to the sync queue for later processing
   * @param options Sync options
   * @param dataId Identifier for the data
   */
  private addToSyncQueue(options: SyncOptions, dataId: string): void {
    const priority = options.priorityLevel === 'high' ? 1 : 
                     options.priorityLevel === 'low' ? 3 : 2;
    
    this.syncQueue.set(dataId, {
      data: options,
      priority,
      timestamp: new Date()
    });
    
    this.pendingChangesCount = this.syncQueue.size;
    console.log(`Added item to sync queue. Queue size: ${this.syncQueue.size}`);
  }

  /**
   * Process the sync queue when connection is available
   */
  private async processSyncQueue(): Promise<void> {
    if (!networkStatus.isOnline() || this.isSyncing || this.syncQueue.size === 0) {
      return;
    }
    
    console.log(`Processing sync queue. Items: ${this.syncQueue.size}`);
    
    // Sort queue by priority
    const sortedQueue = Array.from(this.syncQueue.entries())
      .sort((a, b) => a[1].priority - b[1].priority);
    
    // Process queue
    for (const [id, item] of sortedQueue) {
      try {
        await this.synchronize(item.data as SyncOptions);
        this.syncQueue.delete(id);
      } catch (error) {
        console.error(`Error processing queue item ${id}:`, error);
      }
    }
    
    this.pendingChangesCount = this.syncQueue.size;
  }

  /**
   * Handle network status changes
   */
  private async handleNetworkChange(): Promise<void> {
    if (networkStatus.isOnline()) {
      console.log('Network connection restored. Processing sync queue.');
      await this.processSyncQueue();
    } else {
      console.log('Network connection lost.');
    }
  }

  /**
   * Update the current sync status
   */
  private updateSyncStatus(operation: string): void {
    this.currentOperation = operation;
    // In a real app, we might emit an event here that UI components could listen to
  }

  /**
   * Save sync state to persistent storage
   */
  private saveSyncState(): void {
    try {
      const state = {
        lastSyncTime: this.lastSyncTime ? this.lastSyncTime.toISOString() : null,
        pendingChangesCount: this.pendingChangesCount
      };
      
      localStorage.setItem('nestorSyncState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving sync state:', error);
    }
  }

  /**
   * Load sync state from persistent storage
   */
  private loadSyncState(): void {
    try {
      const stateJson = localStorage.getItem('nestorSyncState');
      
      if (stateJson) {
        const state = JSON.parse(stateJson);
        this.lastSyncTime = state.lastSyncTime ? new Date(state.lastSyncTime) : null;
        this.pendingChangesCount = state.pendingChangesCount || 0;
      }
    } catch (error) {
      console.error('Error loading sync state:', error);
    }
  }
}

// Export a singleton instance
export const cloudSync = CloudSyncService.getInstance(); 