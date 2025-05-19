/**
 * ML Model Synchronization Utilities
 * Phase 4 implementation: Tools for model synchronization between cloud and device
 */

import { cloudSync } from '@/lib/cloud/sync/CloudSyncService';
import { MLManager } from '@/lib/ml/core/MLManager';
import { networkStatus } from '@/utils/networkUtils';
import { Platform } from '@/utils/platform';

// Model sync options
export interface ModelSyncOptions {
  forceUpdate?: boolean;
  checkVersionOnly?: boolean;
  platforms?: ('ios' | 'android' | 'web')[];
  priorityModels?: string[];
  excludedModels?: string[];
}

// Model sync result
export interface ModelSyncResult {
  success: boolean;
  modelsChecked: string[];
  modelsUpdated: string[];
  updateTime: Date;
  errors?: Error[];
  modelSizes?: Record<string, number>;
  totalDownloadSize?: number;
}

/**
 * Class to handle ML model synchronization with the cloud
 */
export class MLModelSynchronizer {
  private static instance: MLModelSynchronizer;
  private mlManager: MLManager;
  private lastSyncTime: Date | null = null;
  private modelRegistry: Record<string, {
    version: string;
    lastUpdated: Date;
    size: number;
    status: 'up-to-date' | 'needs-update' | 'not-downloaded' | 'error';
  }> = {};
  
  // Private constructor for singleton pattern
  private constructor() {
    this.mlManager = MLManager.getInstance();
    this.loadState();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): MLModelSynchronizer {
    if (!MLModelSynchronizer.instance) {
      MLModelSynchronizer.instance = new MLModelSynchronizer();
    }
    return MLModelSynchronizer.instance;
  }
  
  /**
   * Check if model updates are available
   */
  public async checkForUpdates(options: ModelSyncOptions = {}): Promise<{
    updatesAvailable: boolean;
    modelCount: number;
    updateSize: number;
  }> {
    try {
      // Check if we're online
      if (!networkStatus.isOnline()) {
        return { updatesAvailable: false, modelCount: 0, updateSize: 0 };
      }
      
      // Determine which models to check based on platform
      const currentPlatform = Platform.getCurrentPlatform();
      const validPlatforms = options.platforms || [currentPlatform];
      
      if (!validPlatforms.includes(currentPlatform as any)) {
        console.log(`Current platform ${currentPlatform} not in target platforms, skipping update check`);
        return { updatesAvailable: false, modelCount: 0, updateSize: 0 };
      }
      
      // Simulate update check by contacting the model registry on the server
      // In a real implementation, this would make an API call to get model metadata
      
      // Simulate response from server
      const serverResponse = this.simulateServerModelRegistry();
      
      // Filter models based on options
      const applicableModels = Object.entries(serverResponse)
        .filter(([modelName]) => {
          if (options.excludedModels?.includes(modelName)) return false;
          return true;
        })
        .map(([modelName, metadata]) => ({ modelName, metadata }));
      
      // Check which models need updates
      const modelsNeedingUpdate = applicableModels.filter(({ modelName, metadata }) => {
        const localModel = this.modelRegistry[modelName];
        
        // If not in local registry or has newer version, it needs update
        if (!localModel) return true;
        
        // Compare versions and timestamps
        const serverTimestamp = new Date(metadata.lastUpdated).getTime();
        const localTimestamp = localModel.lastUpdated.getTime();
        
        return metadata.version !== localModel.version || serverTimestamp > localTimestamp;
      });
      
      // Calculate total update size
      const totalUpdateSize = modelsNeedingUpdate.reduce((sum, { metadata }) => sum + metadata.size, 0);
      
      return {
        updatesAvailable: modelsNeedingUpdate.length > 0,
        modelCount: modelsNeedingUpdate.length,
        updateSize: totalUpdateSize
      };
    } catch (error) {
      console.error('Error checking for model updates:', error);
      return { updatesAvailable: false, modelCount: 0, updateSize: 0 };
    }
  }
  
  /**
   * Synchronize ML models with the cloud
   */
  public async synchronizeModels(options: ModelSyncOptions = {}): Promise<ModelSyncResult> {
    try {
      console.log('Starting ML model synchronization');
      
      // Check if we're online
      if (!networkStatus.isOnline()) {
        throw new Error('Cannot synchronize models while offline');
      }
      
      // Get current platform
      const currentPlatform = Platform.getCurrentPlatform();
      
      // Start tracking progress
      const startTime = Date.now();
      const modelsChecked: string[] = [];
      const modelsUpdated: string[] = [];
      const errors: Error[] = [];
      const modelSizes: Record<string, number> = {};
      
      // Simulate obtaining server model registry
      const serverModelRegistry = this.simulateServerModelRegistry();
      
      // Determine which models to sync
      let modelsToSync = Object.keys(serverModelRegistry);
      
      // Apply filtering based on options
      if (options.excludedModels?.length) {
        modelsToSync = modelsToSync.filter(modelName => !options.excludedModels?.includes(modelName));
      }
      
      if (options.priorityModels?.length) {
        // Move priority models to the front of the queue
        modelsToSync.sort((a, b) => {
          const aIsPriority = options.priorityModels?.includes(a) || false;
          const bIsPriority = options.priorityModels?.includes(b) || false;
          if (aIsPriority && !bIsPriority) return -1;
          if (!aIsPriority && bIsPriority) return 1;
          return 0;
        });
      }
      
      // Process each model
      for (const modelName of modelsToSync) {
        try {
          const serverModelInfo = serverModelRegistry[modelName];
          const localModelInfo = this.modelRegistry[modelName];
          
          modelsChecked.push(modelName);
          modelSizes[modelName] = serverModelInfo.size;
          
          // Check if model needs update
          const needsUpdate = options.forceUpdate || 
            !localModelInfo || 
            serverModelInfo.version !== localModelInfo.version ||
            new Date(serverModelInfo.lastUpdated).getTime() > localModelInfo.lastUpdated.getTime();
          
          if (needsUpdate && !options.checkVersionOnly) {
            console.log(`Updating model: ${modelName} (from ${localModelInfo?.version || 'none'} to ${serverModelInfo.version})`);
            
            // In a real implementation, this would download the model file
            // and update the local registry
            
            // Simulate download with a delay proportional to model size
            await new Promise(resolve => setTimeout(resolve, Math.min(serverModelInfo.size / 1024, 2000)));
            
            // Update local registry entry
            this.modelRegistry[modelName] = {
              version: serverModelInfo.version,
              lastUpdated: new Date(serverModelInfo.lastUpdated),
              size: serverModelInfo.size,
              status: 'up-to-date'
            };
            
            modelsUpdated.push(modelName);
          } else if (needsUpdate) {
            console.log(`Model ${modelName} needs update but checkVersionOnly is set`);
          } else {
            console.log(`Model ${modelName} is already up to date (v${serverModelInfo.version})`);
          }
        } catch (error) {
          console.error(`Error syncing model ${modelName}:`, error);
          errors.push(error instanceof Error ? error : new Error(`Unknown error syncing ${modelName}`));
          
          // Update status if the model exists locally
          if (this.modelRegistry[modelName]) {
            this.modelRegistry[modelName].status = 'error';
          }
        }
      }
      
      // Update last sync time
      this.lastSyncTime = new Date();
      this.saveState();
      
      const totalDownloadSize = modelsUpdated.reduce((sum, modelName) => sum + (modelSizes[modelName] || 0), 0);
      
      const result: ModelSyncResult = {
        success: errors.length === 0,
        modelsChecked,
        modelsUpdated,
        updateTime: this.lastSyncTime,
        errors: errors.length > 0 ? errors : undefined,
        modelSizes,
        totalDownloadSize
      };
      
      console.log(`ML model sync completed in ${Date.now() - startTime}ms`, result);
      return result;
    } catch (error) {
      console.error('Error during model synchronization:', error);
      return {
        success: false,
        modelsChecked: [],
        modelsUpdated: [],
        updateTime: new Date(),
        errors: [error instanceof Error ? error : new Error('Unknown error during model sync')]
      };
    }
  }
  
  /**
   * Get model sync status
   */
  public getModelSyncStatus(): {
    lastSyncTime: Date | null;
    modelCount: number;
    updatedCount: number;
    errorCount: number;
    syncInProgress: boolean;
    totalSize: number;
  } {
    const updatedCount = Object.values(this.modelRegistry).filter(m => m.status === 'up-to-date').length;
    const errorCount = Object.values(this.modelRegistry).filter(m => m.status === 'error').length;
    const totalSize = Object.values(this.modelRegistry).reduce((sum, m) => sum + m.size, 0);
    
    return {
      lastSyncTime: this.lastSyncTime,
      modelCount: Object.keys(this.modelRegistry).length,
      updatedCount,
      errorCount,
      syncInProgress: false, // In a real implementation, this would track async operations
      totalSize
    };
  }
  
  /**
   * Load saved state from storage
   */
  private loadState(): void {
    try {
      const savedState = localStorage.getItem('mlModelSyncState');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        this.lastSyncTime = parsed.lastSyncTime ? new Date(parsed.lastSyncTime) : null;
        
        // Convert date strings to Date objects
        this.modelRegistry = {};
        if (parsed.modelRegistry) {
          Object.entries(parsed.modelRegistry).forEach(([key, value]: [string, any]) => {
            this.modelRegistry[key] = {
              ...value,
              lastUpdated: new Date(value.lastUpdated)
            };
          });
        }
      }
    } catch (error) {
      console.error('Error loading ML model sync state:', error);
    }
  }
  
  /**
   * Save current state to storage
   */
  private saveState(): void {
    try {
      const state = {
        lastSyncTime: this.lastSyncTime ? this.lastSyncTime.toISOString() : null,
        modelRegistry: this.modelRegistry
      };
      
      localStorage.setItem('mlModelSyncState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving ML model sync state:', error);
    }
  }
  
  /**
   * Simulate fetching model registry from server
   * In a real implementation, this would make an API call
   */
  private simulateServerModelRegistry(): Record<string, {
    version: string;
    lastUpdated: string;
    size: number;
    platform: string;
    url: string;
  }> {
    return {
      'health-insights': {
        version: '2.1.0',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
        size: 5 * 1024 * 1024, // 5 MB
        platform: 'cross-platform',
        url: 'https://models.nestorhealth.com/ml/health-insights-2.1.0.zip'
      },
      'sleep-quality': {
        version: '1.5.2',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
        size: 3.2 * 1024 * 1024, // 3.2 MB
        platform: 'cross-platform',
        url: 'https://models.nestorhealth.com/ml/sleep-quality-1.5.2.zip'
      },
      'activity-recognition': {
        version: '2.0.0',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
        size: 7.5 * 1024 * 1024, // 7.5 MB
        platform: 'cross-platform',
        url: 'https://models.nestorhealth.com/ml/activity-recognition-2.0.0.zip'
      },
      'stress-prediction': {
        version: '1.3.1',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days ago
        size: 2.8 * 1024 * 1024, // 2.8 MB
        platform: 'cross-platform',
        url: 'https://models.nestorhealth.com/ml/stress-prediction-1.3.1.zip'
      },
      'ios-heartrate-analysis': {
        version: '2.2.0',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
        size: 8.1 * 1024 * 1024, // 8.1 MB
        platform: 'ios',
        url: 'https://models.nestorhealth.com/ml/ios-heartrate-analysis-2.2.0.zip'
      },
      'android-activity-tracker': {
        version: '1.7.0',
        lastUpdated: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(), // 5 days ago
        size: 4.3 * 1024 * 1024, // 4.3 MB
        platform: 'android',
        url: 'https://models.nestorhealth.com/ml/android-activity-tracker-1.7.0.zip'
      }
    };
  }
}

// Export singleton instance
export const mlModelSync = MLModelSynchronizer.getInstance();

/**
 * Trigger a coordinated sync of ML models and application data
 */
export async function syncAllData(options: {
  forceSync?: boolean;
  syncModels?: boolean;
  syncUserData?: boolean;
  showNotification?: boolean;
}): Promise<{
  success: boolean;
  dataSynced: boolean;
  modelsSynced: boolean;
  totalSize: number;
}> {
  const results = {
    success: true,
    dataSynced: false,
    modelsSynced: false,
    totalSize: 0
  };
  
  // First check if we're online
  if (!networkStatus.isOnline()) {
    console.log('Cannot sync while offline');
    return { ...results, success: false };
  }
  
  try {
    // Sync application data first if requested
    if (options.syncUserData !== false) {
      const syncResult = await cloudSync.synchronize({
        forceSync: options.forceSync,
        priorityLevel: 'high'
      });
      
      results.dataSynced = syncResult.success;
      results.totalSize += syncResult.dataSizeBytes || 0;
      results.success = results.success && syncResult.success;
    }
    
    // Then sync ML models if requested
    if (options.syncModels !== false) {
      const modelSyncResult = await mlModelSync.synchronizeModels({
        forceUpdate: options.forceSync,
        platforms: [Platform.getCurrentPlatform() as 'ios' | 'android' | 'web']
      });
      
      results.modelsSynced = modelSyncResult.success;
      results.totalSize += modelSyncResult.totalDownloadSize || 0;
      results.success = results.success && modelSyncResult.success;
    }
    
    return results;
  } catch (error) {
    console.error('Error during coordinated sync:', error);
    return {
      success: false,
      dataSynced: false,
      modelsSynced: false,
      totalSize: 0
    };
  }
} 