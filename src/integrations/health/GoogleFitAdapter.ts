import FHIRAdapter, { FHIRObservation } from './FHIRAdapter';
import { v4 as uuidv4 } from 'uuid';

/**
 * Google Fit data types mapping to their dataType names
 * See: https://developers.google.com/fit/datatypes
 */
export enum GoogleFitDataType {
  HEART_RATE = 'com.google.heart_rate.bpm',
  STEPS = 'com.google.step_count.delta',
  BLOOD_OXYGEN = 'com.google.oxygen_saturation',
  BODY_TEMPERATURE = 'com.google.body.temperature',
  SLEEP = 'com.google.sleep.segment',
  WEIGHT = 'com.google.weight',
  HEIGHT = 'com.google.height',
  BLOOD_PRESSURE = 'com.google.blood_pressure',
  BLOOD_GLUCOSE = 'com.google.blood_glucose',
  ACTIVITY = 'com.google.activity.segment'
}

/**
 * Interface for Google Fit data points
 */
export interface GoogleFitDataPoint {
  dataTypeName: string;
  startTimeNanos: string;
  endTimeNanos: string;
  value: {
    fpVal?: number;
    intVal?: number;
    mapVal?: Array<{ key: string; value: { fpVal?: number; intVal?: number } }>;
  }[];
  originDataSourceId?: string;
}

/**
 * Interface for Google Fit Session (used for activities like sleep)
 */
export interface GoogleFitSession {
  id: string;
  name: string;
  description?: string;
  startTimeMillis: string;
  endTimeMillis: string;
  activityType?: number;
  application?: {
    packageName: string;
    version: string;
  };
}

/**
 * Google Fit Adapter for converting Google Fit data to FHIR
 */
export class GoogleFitAdapter {
  private static instance: GoogleFitAdapter;
  private fhirAdapter: typeof FHIRAdapter;
  
  private constructor() {
    this.fhirAdapter = FHIRAdapter;
  }
  
  static getInstance(): GoogleFitAdapter {
    if (!GoogleFitAdapter.instance) {
      GoogleFitAdapter.instance = new GoogleFitAdapter();
    }
    return GoogleFitAdapter.instance;
  }
  
  /**
   * Convert Google Fit data points to FHIR observations
   */
  convertToFHIR(dataPoints: GoogleFitDataPoint[], userId: string): FHIRObservation[] {
    return dataPoints.map(dataPoint => {
      const startTime = new Date(parseInt(dataPoint.startTimeNanos) / 1000000);
      
      switch (dataPoint.dataTypeName) {
        case GoogleFitDataType.HEART_RATE:
          const heartRate = dataPoint.value[0]?.fpVal || dataPoint.value[0]?.intVal;
          if (heartRate) {
            return this.fhirAdapter.createHeartRateObservation(
              heartRate,
              userId,
              dataPoint.originDataSourceId,
              startTime
            );
          }
          break;
          
        case GoogleFitDataType.BLOOD_OXYGEN:
          const spO2 = dataPoint.value[0]?.fpVal;
          if (spO2) {
            return this.fhirAdapter.createSpO2Observation(
              spO2 * 100, // Convert decimal to percentage
              userId,
              dataPoint.originDataSourceId,
              startTime
            );
          }
          break;
          
        case GoogleFitDataType.BODY_TEMPERATURE:
          const temperature = dataPoint.value[0]?.fpVal;
          if (temperature) {
            return this.fhirAdapter.createTemperatureObservation(
              temperature,
              'C', // Google Fit always uses Celsius
              userId,
              dataPoint.originDataSourceId,
              startTime
            );
          }
          break;
          
        case GoogleFitDataType.STEPS:
          const steps = dataPoint.value[0]?.intVal;
          if (steps) {
            return this.fhirAdapter.createStepsObservation(
              steps,
              userId,
              dataPoint.originDataSourceId,
              startTime
            );
          }
          break;
          
        default:
          console.warn(`Unsupported Google Fit data type: ${dataPoint.dataTypeName}`);
          return null;
      }
      
      return null;
    }).filter(obs => obs !== null) as FHIRObservation[];
  }
  
  /**
   * Convert Google Fit sleep sessions to FHIR observations
   */
  convertSleepToFHIR(sleepSessions: GoogleFitSession[], userId: string): FHIRObservation[] {
    // Group sleep sessions by day
    const sleepByDay = this.groupSleepSessionsByDay(sleepSessions);
    
    return Object.entries(sleepByDay).map(([date, sessions]) => {
      // Calculate total sleep duration in minutes
      let totalSleepMinutes = 0;
      
      sessions.forEach(session => {
        const start = parseInt(session.startTimeMillis);
        const end = parseInt(session.endTimeMillis);
        const durationMinutes = (end - start) / (1000 * 60);
        totalSleepMinutes += durationMinutes;
      });
      
      // Create a sleep duration observation
      return this.fhirAdapter.createSleepObservation(
        totalSleepMinutes,
        userId,
        undefined, // No device ID available
        new Date(date)
      );
    });
  }
  
  /**
   * Group sleep sessions by day for aggregation
   */
  private groupSleepSessionsByDay(sleepSessions: GoogleFitSession[]): Record<string, GoogleFitSession[]> {
    const grouped: Record<string, GoogleFitSession[]> = {};
    
    sleepSessions.forEach(session => {
      // Use the date part only as the key
      const date = new Date(parseInt(session.startTimeMillis)).toISOString().split('T')[0];
      
      if (!grouped[date]) {
        grouped[date] = [];
      }
      
      grouped[date].push(session);
    });
    
    return grouped;
  }
  
  /**
   * Check if Google Fit is available on this device
   */
  async isAvailable(): Promise<boolean> {
    // In a real implementation, this would check if Google Fit is available
    // using the Google Fit API
    return true;
  }
  
  /**
   * Request permissions to access Google Fit data
   */
  async requestPermissions(dataTypes: GoogleFitDataType[]): Promise<boolean> {
    try {
      // In a real implementation, this would use the Google Fit API
      // to request permissions from the user
      
      console.log(`Requesting permissions for: ${dataTypes.join(', ')}`);
      
      // Simulate a successful permission request
      return true;
    } catch (error) {
      console.error('Error requesting Google Fit permissions:', error);
      return false;
    }
  }
  
  /**
   * Query Google Fit for data points
   */
  async queryDataPoints(
    dataType: GoogleFitDataType,
    startTime: Date,
    endTime: Date = new Date()
  ): Promise<GoogleFitDataPoint[]> {
    try {
      // In a real implementation, this would use the Google Fit API
      // to query data points
      
      console.log(`Querying ${dataType} from ${startTime.toISOString()} to ${endTime.toISOString()}`);
      
      // Return simulated data for now
      return this.getSimulatedDataPoints(dataType, startTime, endTime);
    } catch (error) {
      console.error(`Error querying Google Fit for ${dataType}:`, error);
      return [];
    }
  }
  
  /**
   * Query Google Fit for sleep sessions
   */
  async querySleepSessions(
    startTime: Date,
    endTime: Date = new Date()
  ): Promise<GoogleFitSession[]> {
    try {
      // In a real implementation, this would use the Google Fit API
      // to query sleep sessions
      
      console.log(`Querying sleep sessions from ${startTime.toISOString()} to ${endTime.toISOString()}`);
      
      // Return simulated data for now
      return this.getSimulatedSleepSessions(startTime, endTime);
    } catch (error) {
      console.error('Error querying Google Fit for sleep sessions:', error);
      return [];
    }
  }
  
  /**
   * Generate simulated data points for testing
   */
  private getSimulatedDataPoints(
    dataType: GoogleFitDataType,
    startTime: Date,
    endTime: Date
  ): GoogleFitDataPoint[] {
    const dataPoints: GoogleFitDataPoint[] = [];
    const currentTime = new Date(startTime);
    
    // Define sample ranges for each data type
    const dataTypeConfig: Record<GoogleFitDataType, { min: number; max: number; isInteger?: boolean }> = {
      [GoogleFitDataType.HEART_RATE]: { min: 60, max: 100 },
      [GoogleFitDataType.STEPS]: { min: 0, max: 2000, isInteger: true },
      [GoogleFitDataType.BLOOD_OXYGEN]: { min: 0.95, max: 0.99 },
      [GoogleFitDataType.BODY_TEMPERATURE]: { min: 36.1, max: 37.2 },
      [GoogleFitDataType.SLEEP]: { min: 0, max: 0 }, // Not used for direct data points
      [GoogleFitDataType.WEIGHT]: { min: 70, max: 80 },
      [GoogleFitDataType.HEIGHT]: { min: 165, max: 185 },
      [GoogleFitDataType.BLOOD_PRESSURE]: { min: 110, max: 140 }, // Systolic
      [GoogleFitDataType.BLOOD_GLUCOSE]: { min: 80, max: 120 },
      [GoogleFitDataType.ACTIVITY]: { min: 0, max: 0 } // Not used for direct data points
    };
    
    const config = dataTypeConfig[dataType];
    
    // Generate a data point every hour for continuous data types
    // or once a day for discrete data types
    const isHourly = [
      GoogleFitDataType.HEART_RATE,
      GoogleFitDataType.BLOOD_OXYGEN,
      GoogleFitDataType.BODY_TEMPERATURE
    ].includes(dataType);
    
    while (currentTime <= endTime) {
      const recordTime = new Date(currentTime);
      
      // Generate a random value within the appropriate range
      const value = Math.random() * (config.max - config.min) + config.min;
      const finalValue = config.isInteger ? Math.floor(value) : Number(value.toFixed(2));
      
      dataPoints.push({
        dataTypeName: dataType,
        startTimeNanos: (recordTime.getTime() * 1000000).toString(),
        endTimeNanos: ((recordTime.getTime() + 60000) * 1000000).toString(), // End 1 minute later
        value: [{
          ...(config.isInteger ? { intVal: finalValue } : { fpVal: finalValue })
        }],
        originDataSourceId: 'derived:com.google.android.gms:from_device'
      });
      
      // Increment by 1 hour for hourly data or 1 day for daily data
      if (isHourly) {
        currentTime.setHours(currentTime.getHours() + 1);
      } else {
        currentTime.setDate(currentTime.getDate() + 1);
      }
    }
    
    return dataPoints;
  }
  
  /**
   * Generate simulated sleep sessions for testing
   */
  private getSimulatedSleepSessions(startTime: Date, endTime: Date): GoogleFitSession[] {
    const sessions: GoogleFitSession[] = [];
    const currentDate = new Date(startTime);
    currentDate.setHours(0, 0, 0, 0); // Start at midnight
    
    while (currentDate <= endTime) {
      const sessionDate = new Date(currentDate);
      
      // Create a sleep session from 23:00 to 07:00 the next day
      const sleepStart = new Date(sessionDate);
      sleepStart.setHours(23, 0, 0, 0);
      
      const sleepEnd = new Date(sessionDate);
      sleepEnd.setDate(sleepEnd.getDate() + 1);
      sleepEnd.setHours(7, 0, 0, 0);
      
      sessions.push({
        id: uuidv4(),
        name: 'Night sleep',
        description: 'Sleep session tracked by app',
        startTimeMillis: sleepStart.getTime().toString(),
        endTimeMillis: sleepEnd.getTime().toString(),
        activityType: 72, // Sleep activity type in Google Fit
        application: {
          packageName: 'com.google.android.apps.fitness',
          version: '1.0'
        }
      });
      
      // Move to the next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return sessions;
  }
}

export default GoogleFitAdapter.getInstance(); 