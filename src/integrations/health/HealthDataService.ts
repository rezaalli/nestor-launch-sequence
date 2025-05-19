import AppleHealthAdapter from './AppleHealthAdapter';
import GoogleFitAdapter from './GoogleFitAdapter';
import EHRAdapter from './EHRAdapter';
import FHIRAdapter, { FHIRObservation } from './FHIRAdapter';
import { supabase } from '@/integrations/supabase/client';

/**
 * Health Data Platform types
 */
export enum HealthPlatform {
  APPLE_HEALTH = 'apple_health',
  GOOGLE_FIT = 'google_fit',
  EHR = 'ehr',
  NESTOR = 'nestor'
}

/**
 * Health Data Type
 */
export enum HealthDataType {
  HEART_RATE = 'heartRate',
  BLOOD_OXYGEN = 'spO2',
  TEMPERATURE = 'temperature',
  STEPS = 'steps',
  SLEEP = 'sleep',
  BLOOD_PRESSURE = 'bloodPressure',
  WEIGHT = 'weight',
  HEIGHT = 'height',
  ACTIVITY = 'activity'
}

/**
 * Health Data Source Configuration
 */
export interface HealthDataSourceConfig {
  platform: HealthPlatform;
  enabled: boolean;
  lastSyncDate?: Date;
  settings?: Record<string, any>;
}

/**
 * Main health data service that coordinates data between 
 * different health platforms using FHIR as interchange format
 */
export class HealthDataService {
  private static instance: HealthDataService;
  
  private appleHealthAdapter: typeof AppleHealthAdapter;
  private googleFitAdapter: typeof GoogleFitAdapter;
  private ehrAdapter: typeof EHRAdapter;
  private fhirAdapter: typeof FHIRAdapter;
  
  private dataSources: Map<HealthPlatform, HealthDataSourceConfig> = new Map();
  
  private constructor() {
    this.appleHealthAdapter = AppleHealthAdapter;
    this.googleFitAdapter = GoogleFitAdapter;
    this.ehrAdapter = EHRAdapter;
    this.fhirAdapter = FHIRAdapter;
    
    // Initialize with default configuration
    this.dataSources.set(HealthPlatform.NESTOR, {
      platform: HealthPlatform.NESTOR,
      enabled: true
    });
  }
  
  static getInstance(): HealthDataService {
    if (!HealthDataService.instance) {
      HealthDataService.instance = new HealthDataService();
    }
    return HealthDataService.instance;
  }
  
  /**
   * Configure health data sources for a user
   */
  async configure(userId: string): Promise<void> {
    try {
      // Fetch user's health data source configurations from database
      const { data, error } = await supabase
        .from('health_data_sources')
        .select('*')
        .eq('user_id', userId);
        
      if (error) {
        throw error;
      }
      
      // Reset data sources to defaults
      this.dataSources.clear();
      this.dataSources.set(HealthPlatform.NESTOR, {
        platform: HealthPlatform.NESTOR,
        enabled: true
      });
      
      if (data) {
        // Add configured data sources
        data.forEach(source => {
          this.dataSources.set(source.platform, {
            platform: source.platform,
            enabled: source.enabled,
            lastSyncDate: source.last_sync_date ? new Date(source.last_sync_date) : undefined,
            settings: source.settings
          });
        });
      }
      
      // Configure EHR adapter if enabled
      const ehrConfig = this.dataSources.get(HealthPlatform.EHR);
      if (ehrConfig?.enabled && ehrConfig.settings) {
        this.ehrAdapter.configure(ehrConfig.settings);
      }
      
      console.log('Health data sources configured:', Array.from(this.dataSources.entries()));
    } catch (error) {
      console.error('Error configuring health data sources:', error);
      throw error;
    }
  }
  
  /**
   * Check if a platform is available on this device
   */
  async isPlatformAvailable(platform: HealthPlatform): Promise<boolean> {
    switch (platform) {
      case HealthPlatform.APPLE_HEALTH:
        return this.appleHealthAdapter.isAvailable();
        
      case HealthPlatform.GOOGLE_FIT:
        return this.googleFitAdapter.isAvailable();
        
      case HealthPlatform.EHR:
        return this.ehrAdapter.isConfigured();
        
      case HealthPlatform.NESTOR:
        return true;
        
      default:
        return false;
    }
  }
  
  /**
   * Enable a health data source
   */
  async enableDataSource(platform: HealthPlatform, settings?: Record<string, any>): Promise<boolean> {
    try {
      const isAvailable = await this.isPlatformAvailable(platform);
      
      if (!isAvailable) {
        throw new Error(`Platform ${platform} is not available on this device`);
      }
      
      // Update the data source configuration
      const existingConfig = this.dataSources.get(platform) || {
        platform,
        enabled: false
      };
      
      const updatedConfig = {
        ...existingConfig,
        enabled: true,
        settings: settings || existingConfig.settings
      };
      
      this.dataSources.set(platform, updatedConfig);
      
      // Configure platform-specific adapters
      if (platform === HealthPlatform.EHR && settings) {
        this.ehrAdapter.configure(settings);
      }
      
      return true;
    } catch (error) {
      console.error(`Error enabling ${platform}:`, error);
      return false;
    }
  }
  
  /**
   * Disable a health data source
   */
  async disableDataSource(platform: HealthPlatform): Promise<boolean> {
    try {
      const existingConfig = this.dataSources.get(platform);
      
      if (!existingConfig) {
        return true; // Already doesn't exist
      }
      
      const updatedConfig = {
        ...existingConfig,
        enabled: false
      };
      
      this.dataSources.set(platform, updatedConfig);
      
      return true;
    } catch (error) {
      console.error(`Error disabling ${platform}:`, error);
      return false;
    }
  }
  
  /**
   * Save data source configurations to the database
   */
  async saveDataSourceConfigs(userId: string): Promise<boolean> {
    try {
      const configs = Array.from(this.dataSources.values())
        .filter(config => config.platform !== HealthPlatform.NESTOR) // Don't store Nestor config
        .map(config => ({
          user_id: userId,
          platform: config.platform,
          enabled: config.enabled,
          last_sync_date: config.lastSyncDate?.toISOString(),
          settings: config.settings
        }));
      
      // Upsert data source configurations
      const { error } = await supabase
        .from('health_data_sources')
        .upsert(configs);
        
      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error('Error saving data source configurations:', error);
      return false;
    }
  }
  
  /**
   * Request permissions for a health platform
   */
  async requestPermissions(platform: HealthPlatform, dataTypes: HealthDataType[]): Promise<boolean> {
    try {
      switch (platform) {
        case HealthPlatform.APPLE_HEALTH:
          // Map Nestor data types to Apple Health data types
          const appleHealthDataTypes = dataTypes.map(type => {
            switch (type) {
              case HealthDataType.HEART_RATE:
                return AppleHealthAdapter.AppleHealthDataType.HEART_RATE;
              case HealthDataType.BLOOD_OXYGEN:
                return AppleHealthAdapter.AppleHealthDataType.BLOOD_OXYGEN;
              case HealthDataType.TEMPERATURE:
                return AppleHealthAdapter.AppleHealthDataType.BODY_TEMPERATURE;
              case HealthDataType.STEPS:
                return AppleHealthAdapter.AppleHealthDataType.STEPS;
              case HealthDataType.SLEEP:
                return AppleHealthAdapter.AppleHealthDataType.SLEEP_ANALYSIS;
              default:
                throw new Error(`Unsupported data type for Apple Health: ${type}`);
            }
          });
          
          return await this.appleHealthAdapter.requestPermissions(appleHealthDataTypes);
          
        case HealthPlatform.GOOGLE_FIT:
          // Map Nestor data types to Google Fit data types
          const googleFitDataTypes = dataTypes.map(type => {
            switch (type) {
              case HealthDataType.HEART_RATE:
                return GoogleFitAdapter.GoogleFitDataType.HEART_RATE;
              case HealthDataType.BLOOD_OXYGEN:
                return GoogleFitAdapter.GoogleFitDataType.BLOOD_OXYGEN;
              case HealthDataType.TEMPERATURE:
                return GoogleFitAdapter.GoogleFitDataType.BODY_TEMPERATURE;
              case HealthDataType.STEPS:
                return GoogleFitAdapter.GoogleFitDataType.STEPS;
              case HealthDataType.SLEEP:
                return GoogleFitAdapter.GoogleFitDataType.SLEEP;
              default:
                throw new Error(`Unsupported data type for Google Fit: ${type}`);
            }
          });
          
          return await this.googleFitAdapter.requestPermissions(googleFitDataTypes);
          
        case HealthPlatform.EHR:
          // EHR permissions are handled during configuration
          return this.ehrAdapter.isConfigured();
          
        case HealthPlatform.NESTOR:
          // Nestor always has access to its own data
          return true;
          
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error requesting permissions for ${platform}:`, error);
      return false;
    }
  }
  
  /**
   * Import health data from a platform
   */
  async importData(
    platform: HealthPlatform, 
    dataTypes: HealthDataType[], 
    userId: string,
    startDate: Date,
    endDate: Date = new Date()
  ): Promise<any[]> {
    try {
      const config = this.dataSources.get(platform);
      
      if (!config || !config.enabled) {
        throw new Error(`Platform ${platform} is not enabled`);
      }
      
      let observations: FHIRObservation[] = [];
      
      switch (platform) {
        case HealthPlatform.APPLE_HEALTH:
          // Import from Apple Health
          for (const dataType of dataTypes) {
            let appleHealthRecords = [];
            
            switch (dataType) {
              case HealthDataType.HEART_RATE:
                appleHealthRecords = await this.appleHealthAdapter.queryData(
                  AppleHealthAdapter.AppleHealthDataType.HEART_RATE,
                  startDate,
                  endDate
                );
                break;
              
              case HealthDataType.BLOOD_OXYGEN:
                appleHealthRecords = await this.appleHealthAdapter.queryData(
                  AppleHealthAdapter.AppleHealthDataType.BLOOD_OXYGEN,
                  startDate,
                  endDate
                );
                break;
              
              case HealthDataType.TEMPERATURE:
                appleHealthRecords = await this.appleHealthAdapter.queryData(
                  AppleHealthAdapter.AppleHealthDataType.BODY_TEMPERATURE,
                  startDate,
                  endDate
                );
                break;
              
              case HealthDataType.STEPS:
                appleHealthRecords = await this.appleHealthAdapter.queryData(
                  AppleHealthAdapter.AppleHealthDataType.STEPS,
                  startDate,
                  endDate
                );
                break;
              
              case HealthDataType.SLEEP:
                // Sleep is handled differently in Apple Health
                const sleepRecords = await this.appleHealthAdapter.queryData(
                  AppleHealthAdapter.AppleHealthDataType.SLEEP_ANALYSIS,
                  startDate,
                  endDate
                ) as AppleHealthAdapter.AppleHealthSleepRecord[];
                
                const sleepObservations = this.appleHealthAdapter.convertSleepToFHIR(sleepRecords, userId);
                observations = [...observations, ...sleepObservations];
                continue;
            }
            
            const dataObservations = this.appleHealthAdapter.convertToFHIR(appleHealthRecords, userId);
            observations = [...observations, ...dataObservations];
          }
          break;
          
        case HealthPlatform.GOOGLE_FIT:
          // Import from Google Fit
          for (const dataType of dataTypes) {
            let googleFitDataPoints = [];
            
            switch (dataType) {
              case HealthDataType.HEART_RATE:
                googleFitDataPoints = await this.googleFitAdapter.queryDataPoints(
                  GoogleFitAdapter.GoogleFitDataType.HEART_RATE,
                  startDate,
                  endDate
                );
                break;
              
              case HealthDataType.BLOOD_OXYGEN:
                googleFitDataPoints = await this.googleFitAdapter.queryDataPoints(
                  GoogleFitAdapter.GoogleFitDataType.BLOOD_OXYGEN,
                  startDate,
                  endDate
                );
                break;
              
              case HealthDataType.TEMPERATURE:
                googleFitDataPoints = await this.googleFitAdapter.queryDataPoints(
                  GoogleFitAdapter.GoogleFitDataType.BODY_TEMPERATURE,
                  startDate,
                  endDate
                );
                break;
              
              case HealthDataType.STEPS:
                googleFitDataPoints = await this.googleFitAdapter.queryDataPoints(
                  GoogleFitAdapter.GoogleFitDataType.STEPS,
                  startDate,
                  endDate
                );
                break;
              
              case HealthDataType.SLEEP:
                // Sleep is handled differently in Google Fit
                const sleepSessions = await this.googleFitAdapter.querySleepSessions(
                  startDate,
                  endDate
                );
                
                const sleepObservations = this.googleFitAdapter.convertSleepToFHIR(sleepSessions, userId);
                observations = [...observations, ...sleepObservations];
                continue;
            }
            
            const dataObservations = this.googleFitAdapter.convertToFHIR(googleFitDataPoints, userId);
            observations = [...observations, ...dataObservations];
          }
          break;
          
        case HealthPlatform.EHR:
          // Import from EHR system
          // Map health data types to FHIR categories
          const categories = dataTypes.map(type => {
            switch (type) {
              case HealthDataType.HEART_RATE:
              case HealthDataType.BLOOD_OXYGEN:
              case HealthDataType.TEMPERATURE:
                return 'vital-signs';
              case HealthDataType.SLEEP:
                return 'sleep';
              case HealthDataType.ACTIVITY:
                return 'activity';
              default:
                return undefined;
            }
          }).filter(Boolean);
          
          // Fetch observations by category
          for (const category of categories) {
            const ehrObservations = await this.ehrAdapter.fetchObservations(
              userId,
              category,
              startDate,
              endDate
            );
            
            observations = [...observations, ...ehrObservations];
          }
          break;
      }
      
      // Convert FHIR observations to Nestor format
      const nestorData = this.fhirAdapter.importObservationsFromFHIR(observations);
      
      // Update last sync date
      if (config) {
        config.lastSyncDate = new Date();
        this.dataSources.set(platform, config);
      }
      
      return nestorData;
    } catch (error) {
      console.error(`Error importing data from ${platform}:`, error);
      throw error;
    }
  }
  
  /**
   * Export health data to a platform
   */
  async exportData(
    platform: HealthPlatform,
    data: any[],
    userId: string
  ): Promise<boolean> {
    try {
      const config = this.dataSources.get(platform);
      
      if (!config || !config.enabled) {
        throw new Error(`Platform ${platform} is not enabled`);
      }
      
      // Convert data to FHIR format
      const observations = this.fhirAdapter.exportObservationsToFHIR(
        data.map(item => ({
          ...item,
          userId // Ensure userId is set
        }))
      );
      
      switch (platform) {
        case HealthPlatform.EHR:
          // Export to EHR system
          return await this.ehrAdapter.pushObservations(observations);
          
        case HealthPlatform.APPLE_HEALTH:
        case HealthPlatform.GOOGLE_FIT:
          // These platforms don't support direct writing in our implementation
          throw new Error(`Writing to ${platform} is not supported yet`);
          
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error exporting data to ${platform}:`, error);
      return false;
    }
  }
  
  /**
   * Get available data sources for the current device
   */
  async getAvailableDataSources(): Promise<HealthPlatform[]> {
    const available: HealthPlatform[] = [HealthPlatform.NESTOR];
    
    // Check Apple Health
    if (await this.isPlatformAvailable(HealthPlatform.APPLE_HEALTH)) {
      available.push(HealthPlatform.APPLE_HEALTH);
    }
    
    // Check Google Fit
    if (await this.isPlatformAvailable(HealthPlatform.GOOGLE_FIT)) {
      available.push(HealthPlatform.GOOGLE_FIT);
    }
    
    // Check EHR
    if (await this.isPlatformAvailable(HealthPlatform.EHR)) {
      available.push(HealthPlatform.EHR);
    }
    
    return available;
  }
  
  /**
   * Get configured data sources
   */
  getConfiguredDataSources(): HealthDataSourceConfig[] {
    return Array.from(this.dataSources.values());
  }
}

export default HealthDataService.getInstance(); 