import FHIRAdapter, { FHIRObservation } from './FHIRAdapter';
import { v4 as uuidv4 } from 'uuid';

/**
 * Types of data that can be accessed in Apple Health
 */
export enum AppleHealthDataType {
  HEART_RATE = 'HKQuantityTypeIdentifierHeartRate',
  STEPS = 'HKQuantityTypeIdentifierStepCount',
  BLOOD_OXYGEN = 'HKQuantityTypeIdentifierOxygenSaturation',
  BODY_TEMPERATURE = 'HKQuantityTypeIdentifierBodyTemperature',
  RESPIRATORY_RATE = 'HKQuantityTypeIdentifierRespiratoryRate',
  SLEEP_ANALYSIS = 'HKCategoryTypeIdentifierSleepAnalysis',
  BLOOD_PRESSURE_SYSTOLIC = 'HKQuantityTypeIdentifierBloodPressureSystolic',
  BLOOD_PRESSURE_DIASTOLIC = 'HKQuantityTypeIdentifierBloodPressureDiastolic',
  WEIGHT = 'HKQuantityTypeIdentifierBodyMass',
  HEIGHT = 'HKQuantityTypeIdentifierHeight'
}

/**
 * Mapping between Apple Health units and FHIR units
 */
const UNIT_MAPPING = {
  'count/min': '/min',  // Heart rate
  'count': 'steps',     // Steps
  '%': '%',             // Blood oxygen
  'degC': 'Cel',        // Temperature in Celsius
  'degF': '[degF]',     // Temperature in Fahrenheit
  'mmHg': 'mm[Hg]',     // Blood pressure
  'kg': 'kg',           // Weight
  'cm': 'cm',           // Height
  'min': 'min'          // Duration
};

/**
 * Interface for Apple Health data
 */
export interface AppleHealthRecord {
  id: string;
  type: AppleHealthDataType;
  value: number;
  unit: string;
  startDate: string;
  endDate: string;
  sourceApp?: string;
  sourceDevice?: string;
  metadata?: Record<string, any>;
}

/**
 * Interface for Apple Health sleep data which has a special format
 */
export interface AppleHealthSleepRecord extends Omit<AppleHealthRecord, 'value'> {
  type: AppleHealthDataType.SLEEP_ANALYSIS;
  value: 0 | 1 | 2 | 3 | 4 | 5; // 0=in bed, 1=asleep, 2=deep, 3=REM, 4=core, 5=awake
}

/**
 * Apple Health Adapter for converting Apple Health data to FHIR
 */
export class AppleHealthAdapter {
  private static instance: AppleHealthAdapter;
  private fhirAdapter: typeof FHIRAdapter;
  
  private constructor() {
    this.fhirAdapter = FHIRAdapter;
  }
  
  static getInstance(): AppleHealthAdapter {
    if (!AppleHealthAdapter.instance) {
      AppleHealthAdapter.instance = new AppleHealthAdapter();
    }
    return AppleHealthAdapter.instance;
  }
  
  /**
   * Convert Apple Health records to FHIR observations
   */
  convertToFHIR(records: AppleHealthRecord[], userId: string): FHIRObservation[] {
    return records.map(record => {
      switch (record.type) {
        case AppleHealthDataType.HEART_RATE:
          return this.fhirAdapter.createHeartRateObservation(
            record.value,
            userId,
            record.sourceDevice,
            new Date(record.startDate)
          );
          
        case AppleHealthDataType.BLOOD_OXYGEN:
          return this.fhirAdapter.createSpO2Observation(
            record.value * 100, // Convert decimal to percentage
            userId,
            record.sourceDevice,
            new Date(record.startDate)
          );
          
        case AppleHealthDataType.BODY_TEMPERATURE:
          return this.fhirAdapter.createTemperatureObservation(
            record.value,
            record.unit === 'degF' ? 'F' : 'C',
            userId,
            record.sourceDevice,
            new Date(record.startDate)
          );
          
        case AppleHealthDataType.STEPS:
          return this.fhirAdapter.createStepsObservation(
            record.value,
            userId,
            record.sourceDevice,
            new Date(record.startDate)
          );
          
        // Additional Apple Health specific converters can be added here
          
        default:
          console.warn(`Unsupported Apple Health data type: ${record.type}`);
          return null;
      }
    }).filter(obs => obs !== null) as FHIRObservation[];
  }
  
  /**
   * Convert Apple Health sleep records to FHIR observations
   * This is handled separately because sleep data in Apple Health has a special format
   */
  convertSleepToFHIR(sleepRecords: AppleHealthSleepRecord[], userId: string): FHIRObservation[] {
    // Group sleep records by day
    const sleepByDay = this.groupSleepRecordsByDay(sleepRecords);
    
    return Object.entries(sleepByDay).map(([date, records]) => {
      // Calculate total sleep duration in minutes
      let totalSleepMinutes = 0;
      
      records.forEach(record => {
        // Only count actual sleep states (1, 2, 3, 4)
        if (record.value >= 1 && record.value <= 4) {
          const start = new Date(record.startDate).getTime();
          const end = new Date(record.endDate).getTime();
          const durationMinutes = (end - start) / (1000 * 60);
          totalSleepMinutes += durationMinutes;
        }
      });
      
      // Create a sleep duration observation
      return this.fhirAdapter.createSleepObservation(
        totalSleepMinutes,
        userId,
        records[0].sourceDevice,
        new Date(date)
      );
    });
  }
  
  /**
   * Group sleep records by day for aggregation
   */
  private groupSleepRecordsByDay(sleepRecords: AppleHealthSleepRecord[]): Record<string, AppleHealthSleepRecord[]> {
    const grouped: Record<string, AppleHealthSleepRecord[]> = {};
    
    sleepRecords.forEach(record => {
      // Use the date part only as the key
      const date = new Date(record.startDate).toISOString().split('T')[0];
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      
      grouped[date].push(record);
    });
    
    return grouped;
  }
  
  /**
   * Check if Apple Health is available on this device
   */
  async isAvailable(): Promise<boolean> {
    // In a real implementation, this would check if the Health app is available
    // using a native bridge like React Native Health
    return true;
  }
  
  /**
   * Request permissions to access Apple Health data
   */
  async requestPermissions(dataTypes: AppleHealthDataType[]): Promise<boolean> {
    try {
      // In a real implementation, this would use the React Native Health
      // or similar bridge to request permissions from the user
      
      console.log(`Requesting permissions for: ${dataTypes.join(', ')}`);
      
      // Simulate a successful permission request
      return true;
    } catch (error) {
      console.error('Error requesting Apple Health permissions:', error);
      return false;
    }
  }
  
  /**
   * Query Apple Health for data
   */
  async queryData(
    dataType: AppleHealthDataType, 
    startDate: Date, 
    endDate: Date = new Date()
  ): Promise<AppleHealthRecord[]> {
    try {
      // In a real implementation, this would use the React Native Health
      // or similar bridge to query data from HealthKit
      
      console.log(`Querying ${dataType} from ${startDate.toISOString()} to ${endDate.toISOString()}`);
      
      // Return simulated data for now
      return this.getSimulatedData(dataType, startDate, endDate);
    } catch (error) {
      console.error(`Error querying Apple Health for ${dataType}:`, error);
      return [];
    }
  }
  
  /**
   * Generate simulated data for testing
   */
  private getSimulatedData(
    dataType: AppleHealthDataType, 
    startDate: Date, 
    endDate: Date
  ): AppleHealthRecord[] {
    const records: AppleHealthRecord[] = [];
    const currentDate = new Date(startDate);
    
    // Define sample ranges and units for each data type
    const dataTypeConfig: Record<AppleHealthDataType, { min: number; max: number; unit: string }> = {
      [AppleHealthDataType.HEART_RATE]: { min: 60, max: 100, unit: 'count/min' },
      [AppleHealthDataType.STEPS]: { min: 0, max: 2000, unit: 'count' },
      [AppleHealthDataType.BLOOD_OXYGEN]: { min: 0.95, max: 0.99, unit: '%' },
      [AppleHealthDataType.BODY_TEMPERATURE]: { min: 36.1, max: 37.2, unit: 'degC' },
      [AppleHealthDataType.RESPIRATORY_RATE]: { min: 12, max: 20, unit: 'count/min' },
      [AppleHealthDataType.SLEEP_ANALYSIS]: { min: 0, max: 5, unit: '' },
      [AppleHealthDataType.BLOOD_PRESSURE_SYSTOLIC]: { min: 110, max: 140, unit: 'mmHg' },
      [AppleHealthDataType.BLOOD_PRESSURE_DIASTOLIC]: { min: 70, max: 90, unit: 'mmHg' },
      [AppleHealthDataType.WEIGHT]: { min: 70, max: 80, unit: 'kg' },
      [AppleHealthDataType.HEIGHT]: { min: 165, max: 185, unit: 'cm' }
    };
    
    const config = dataTypeConfig[dataType];
    
    // Generate a record every hour for continuous data types
    // or once a day for discrete data types
    const isHourly = [
      AppleHealthDataType.HEART_RATE,
      AppleHealthDataType.RESPIRATORY_RATE,
      AppleHealthDataType.BLOOD_OXYGEN
    ].includes(dataType);
    
    while (currentDate <= endDate) {
      const recordDate = new Date(currentDate);
      
      // Generate a random value within the appropriate range
      const value = Math.random() * (config.max - config.min) + config.min;
      
      records.push({
        id: uuidv4(),
        type: dataType,
        value: dataType === AppleHealthDataType.STEPS ? Math.floor(value) : Number(value.toFixed(2)),
        unit: config.unit,
        startDate: recordDate.toISOString(),
        endDate: new Date(recordDate.getTime() + 60000).toISOString(), // End 1 minute later
        sourceApp: 'com.apple.health',
        sourceDevice: 'Apple Watch',
        metadata: {}
      });
      
      // Increment by 1 hour for hourly data or 1 day for daily data
      if (isHourly) {
        currentDate.setHours(currentDate.getHours() + 1);
      } else {
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }
    
    return records;
  }
}

export default AppleHealthAdapter.getInstance(); 