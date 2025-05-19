/**
 * Sensor Data Service
 * Handles collection and processing of sensor data for activity detection
 */

import { EventEmitter } from '@/lib/utils/eventEmitter';

export interface SensorData {
  accelerometer?: { x: number; y: number; z: number };
  heartRate?: number;
  steps?: number;
  gps?: { latitude: number; longitude: number; speed: number };
  timestamp: number;
}

export interface DetectedActivity {
  type: string;
  confidence: number;
  startTime: number;
  duration: number;
  distance?: number;
  heartRateAvg?: number;
  heartRateMax?: number;
}

// Activity detection thresholds
const ACTIVITY_THRESHOLDS = {
  run: {
    minHeartRate: 120,
    minAcceleration: 10,
    stepFrequency: 160 // steps per minute
  },
  cycle: {
    minHeartRate: 110,
    maxHeartRate: 150,
    gpsSpeedRange: [10, 30] // km/h
  },
  strength: {
    heartRatePattern: "interval",
    accelerationPattern: "repetitive"
  },
  walk: {
    minHeartRate: 70,
    maxHeartRate: 110,
    stepFrequency: 90 // steps per minute
  },
  swim: {
    minHeartRate: 100,
    maxHeartRate: 160,
    accelerationPattern: "rhythmic"
  }
};

export class SensorDataService extends EventEmitter {
  private static instance: SensorDataService;
  private isInitialized = false;
  private isTracking = false;
  private sensorBuffer: SensorData[] = [];
  private currentActivity: DetectedActivity | null = null;
  private bufferSize = 60; // 1 minute of data at 1Hz
  private detectionInterval: ReturnType<typeof setInterval> | null = null;
  private mockMode = false;

  // Mock data for testing
  private mockActivityTypes = ['run', 'cycle', 'strength', 'walk', 'swim'];
  private mockActivityIndex = 0;

  constructor() {
    super();
    if (SensorDataService.instance) {
      return SensorDataService.instance;
    }
    SensorDataService.instance = this;
  }

  /**
   * Initialize the sensor service
   */
  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      // Check if we're in development mode or mock mode
      if (process.env.NODE_ENV === 'development' || !this.areSensorsAvailable()) {
        console.log('SensorDataService: Using mock data');
        this.mockMode = true;
        this.isInitialized = true;
        return true;
      }

      // Initialize sensor access
      await this.requestSensorPermissions();
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize SensorDataService:', error);
      return false;
    }
  }

  /**
   * Check if device sensors are available
   */
  areSensorsAvailable(): boolean {
    // Check if we're running in a browser that supports the Web Sensors API
    return (
      typeof window !== 'undefined' &&
      ('DeviceMotionEvent' in window || 'Accelerometer' in window)
    );
  }

  /**
   * Request permissions to access sensors
   */
  async requestSensorPermissions(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      // For iOS 13+, permission is required for DeviceMotionEvent
      if (
        typeof DeviceMotionEvent !== 'undefined' &&
        typeof (DeviceMotionEvent as any).requestPermission === 'function'
      ) {
        const permission = await (DeviceMotionEvent as any).requestPermission();
        return permission === 'granted';
      }

      // For other browsers, assume permission granted if the API exists
      return this.areSensorsAvailable();
    } catch (error) {
      console.error('Error requesting sensor permissions:', error);
      return false;
    }
  }

  /**
   * Start tracking sensor data
   */
  async startTracking(): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isTracking) return true;

    try {
      this.isTracking = true;
      this.sensorBuffer = [];
      
      if (this.mockMode) {
        // Use mock data generation for testing
        this.startMockDataGeneration();
      } else {
        // Set up real sensor data collection
        this.startRealSensorCollection();
      }

      // Start activity detection
      this.detectionInterval = setInterval(() => {
        this.detectActivity();
      }, 5000); // Check for activity every 5 seconds

      return true;
    } catch (error) {
      console.error('Error starting sensor tracking:', error);
      this.isTracking = false;
      return false;
    }
  }

  /**
   * Stop tracking sensor data
   */
  stopTracking(): boolean {
    if (!this.isTracking) return true;

    try {
      this.isTracking = false;
      
      if (this.detectionInterval) {
        clearInterval(this.detectionInterval);
        this.detectionInterval = null;
      }

      if (this.mockMode) {
        // Clear mock data interval
        this.stopMockDataGeneration();
      } else {
        // Remove real sensor event listeners
        this.stopRealSensorCollection();
      }

      // Reset current activity
      if (this.currentActivity) {
        // Emit activity completed event with final data
        this.emit('activity-completed', {
          ...this.currentActivity,
          duration: Date.now() - this.currentActivity.startTime
        });
        this.currentActivity = null;
      }

      return true;
    } catch (error) {
      console.error('Error stopping sensor tracking:', error);
      return false;
    }
  }

  /**
   * Get the latest sensor data
   */
  getLatestData(): SensorData | null {
    if (this.sensorBuffer.length === 0) return null;
    return this.sensorBuffer[this.sensorBuffer.length - 1];
  }

  /**
   * Get currently detected activity (if any)
   */
  getCurrentActivity(): DetectedActivity | null {
    return this.currentActivity;
  }

  /**
   * Start mock data generation for testing
   */
  private startMockDataGeneration(): void {
    const mockDataInterval = setInterval(() => {
      if (!this.isTracking) {
        clearInterval(mockDataInterval);
        return;
      }

      // Generate mock sensor data
      const mockData: SensorData = {
        accelerometer: {
          x: Math.random() * 2 - 1,
          y: Math.random() * 2 - 1,
          z: Math.random() * 2 - 1
        },
        heartRate: Math.floor(Math.random() * 60) + 60, // 60-120 bpm
        steps: Math.floor(Math.random() * 5), // 0-5 steps per second
        gps: {
          latitude: 37.7749 + (Math.random() * 0.01 - 0.005),
          longitude: -122.4194 + (Math.random() * 0.01 - 0.005),
          speed: Math.random() * 10 // 0-10 km/h
        },
        timestamp: Date.now()
      };

      // Add to buffer
      this.addSensorData(mockData);

      // Every 10 seconds, switch mock activity for testing
      if (mockData.timestamp % 10000 < 1000) {
        this.mockActivityIndex = (this.mockActivityIndex + 1) % this.mockActivityTypes.length;
      }

      // Adjust mock data based on current mock activity
      this.adjustMockDataForActivity(mockData);

    }, 1000); // Generate data every second
  }

  /**
   * Adjust mock data based on current mock activity
   */
  private adjustMockDataForActivity(data: SensorData): void {
    const currentMockActivity = this.mockActivityTypes[this.mockActivityIndex];
    
    switch (currentMockActivity) {
      case 'run':
        data.heartRate = Math.floor(Math.random() * 30) + 130; // 130-160 bpm
        data.steps = Math.floor(Math.random() * 3) + 2; // 2-5 steps per second
        data.gps!.speed = Math.random() * 5 + 8; // 8-13 km/h
        break;
      case 'cycle':
        data.heartRate = Math.floor(Math.random() * 30) + 120; // 120-150 bpm
        data.steps = 0; // No steps while cycling
        data.gps!.speed = Math.random() * 10 + 15; // 15-25 km/h
        break;
      case 'strength':
        data.heartRate = Math.floor(Math.random() * 40) + 100; // 100-140 bpm with more variation
        data.steps = 0; // Minimal steps
        data.gps!.speed = 0; // Stationary
        break;
      case 'walk':
        data.heartRate = Math.floor(Math.random() * 20) + 80; // 80-100 bpm
        data.steps = Math.floor(Math.random() * 2) + 1; // 1-3 steps per second
        data.gps!.speed = Math.random() * 3 + 2; // 2-5 km/h
        break;
      case 'swim':
        data.heartRate = Math.floor(Math.random() * 30) + 120; // 120-150 bpm
        data.steps = 0; // No step counting while swimming
        data.gps!.speed = Math.random() * 2 + 1; // 1-3 km/h
        break;
    }
  }

  /**
   * Stop mock data generation
   */
  private stopMockDataGeneration(): void {
    // The interval is cleared in the interval callback when isTracking is false
  }

  /**
   * Start real sensor data collection
   */
  private startRealSensorCollection(): void {
    // Implement real sensor data collection with Web APIs
    // This would be device-specific and utilize the Sensor APIs
    // Example implementation would be added here
  }

  /**
   * Stop real sensor data collection
   */
  private stopRealSensorCollection(): void {
    // Remove real sensor event listeners
    // This would be device-specific
    // Example implementation would be added here
  }

  /**
   * Add sensor data to buffer
   */
  private addSensorData(data: SensorData): void {
    this.sensorBuffer.push(data);
    
    // Keep buffer at maximum size
    if (this.sensorBuffer.length > this.bufferSize) {
      this.sensorBuffer.shift();
    }

    // Emit data update event
    this.emit('data-update', data);
  }

  /**
   * Detect activity from sensor data
   */
  private detectActivity(): void {
    if (this.sensorBuffer.length < 5) return; // Need at least 5 data points

    try {
      // For mock mode, use the current mock activity
      if (this.mockMode) {
        const mockActivity = this.mockActivityTypes[this.mockActivityIndex];
        const startedNewActivity = !this.currentActivity || this.currentActivity.type !== mockActivity;
        
        if (startedNewActivity) {
          // If there was a previous activity, emit activity completed
          if (this.currentActivity) {
            this.emit('activity-completed', {
              ...this.currentActivity,
              duration: Date.now() - this.currentActivity.startTime
            });
          }
          
          // Start new activity
          this.currentActivity = {
            type: mockActivity,
            confidence: 0.85,
            startTime: Date.now(),
            duration: 0,
            distance: 0,
            heartRateAvg: this.sensorBuffer[this.sensorBuffer.length - 1].heartRate
          };
          
          // Emit activity detected event
          this.emit('activity-detected', this.currentActivity);
        } else {
          // Update existing activity
          if (this.currentActivity) {
            // Calculate duration
            this.currentActivity.duration = Date.now() - this.currentActivity.startTime;
            
            // Calculate distance from GPS data
            if (this.sensorBuffer.length >= 2 && this.currentActivity.type !== 'strength') {
              const oldDistance = this.currentActivity.distance || 0;
              const increment = this.calculateDistanceIncrement();
              this.currentActivity.distance = oldDistance + increment;
            }
            
            // Calculate heart rate averages
            this.currentActivity.heartRateAvg = this.calculateHeartRateAverage();
            
            // Emit activity updated event
            this.emit('activity-updated', this.currentActivity);
          }
        }
        
        return;
      }

      // For real mode, implement activity detection algorithm
      const detectedType = this.detectActivityType();
      
      if (detectedType) {
        const startedNewActivity = !this.currentActivity || this.currentActivity.type !== detectedType;
        
        if (startedNewActivity) {
          // If there was a previous activity, emit activity completed
          if (this.currentActivity) {
            this.emit('activity-completed', {
              ...this.currentActivity,
              duration: Date.now() - this.currentActivity.startTime
            });
          }
          
          // Start new activity
          this.currentActivity = {
            type: detectedType,
            confidence: 0.7, // Default confidence
            startTime: Date.now(),
            duration: 0
          };
          
          // Emit activity detected event
          this.emit('activity-detected', this.currentActivity);
        } else {
          // Update existing activity
          if (this.currentActivity) {
            // Calculate duration
            this.currentActivity.duration = Date.now() - this.currentActivity.startTime;
            
            // Calculate other metrics
            // Implementation would vary based on activity type
            
            // Emit activity updated event
            this.emit('activity-updated', this.currentActivity);
          }
        }
      } else if (this.currentActivity) {
        // Check if activity has ended
        const hasEnded = this.hasActivityEnded();
        
        if (hasEnded) {
          // Emit activity completed event
          this.emit('activity-completed', {
            ...this.currentActivity,
            duration: Date.now() - this.currentActivity.startTime
          });
          
          this.currentActivity = null;
        }
      }
    } catch (error) {
      console.error('Error detecting activity:', error);
    }
  }

  /**
   * Detect activity type from sensor data
   */
  private detectActivityType(): string | null {
    if (this.sensorBuffer.length < 5) return null;
    
    // Implement actual activity detection algorithm here
    // This is a simplified placeholder
    
    const recentData = this.sensorBuffer.slice(-5);
    
    // Check for running
    if (this.detectRunning(recentData)) {
      return 'run';
    }
    
    // Check for cycling
    if (this.detectCycling(recentData)) {
      return 'cycle';
    }
    
    // Check for strength training
    if (this.detectStrengthTraining(recentData)) {
      return 'strength';
    }
    
    // Check for walking
    if (this.detectWalking(recentData)) {
      return 'walk';
    }
    
    // Check for swimming
    if (this.detectSwimming(recentData)) {
      return 'swim';
    }
    
    return null;
  }

  /**
   * Check if the current activity has ended
   */
  private hasActivityEnded(): boolean {
    // Implement logic to determine if activity has ended
    // For simplicity, this is just a placeholder
    return false;
  }

  /**
   * Calculate distance increment from recent GPS data
   */
  private calculateDistanceIncrement(): number {
    // In a real implementation, this would calculate distance 
    // between GPS points using the Haversine formula
    
    // For mock data, just return a reasonable increment
    const lastData = this.sensorBuffer[this.sensorBuffer.length - 1];
    if (!lastData.gps?.speed) return 0;
    
    // Convert km/h to km per second and multiply by time interval (1 second)
    return lastData.gps.speed / 3600;
  }

  /**
   * Calculate average heart rate from recent data
   */
  private calculateHeartRateAverage(): number {
    const recentData = this.sensorBuffer.slice(-10); // Last 10 seconds
    const validHeartRates = recentData
      .map(data => data.heartRate)
      .filter((hr): hr is number => hr !== undefined);
    
    if (validHeartRates.length === 0) return 0;
    
    const sum = validHeartRates.reduce((acc, hr) => acc + hr, 0);
    return Math.round(sum / validHeartRates.length);
  }

  /**
   * Activity type detection methods
   */
  private detectRunning(data: SensorData[]): boolean {
    // Check for high heart rate, step frequency and speed
    const avgHeartRate = this.getAverageHeartRate(data);
    const stepFrequency = this.getStepFrequency(data);
    const avgSpeed = this.getAverageSpeed(data);
    
    return (
      avgHeartRate > ACTIVITY_THRESHOLDS.run.minHeartRate &&
      stepFrequency > ACTIVITY_THRESHOLDS.run.stepFrequency * 0.8 &&
      avgSpeed > 5 // km/h
    );
  }

  private detectCycling(data: SensorData[]): boolean {
    // Check for moderate-high heart rate, low step frequency, high speed
    const avgHeartRate = this.getAverageHeartRate(data);
    const stepFrequency = this.getStepFrequency(data);
    const avgSpeed = this.getAverageSpeed(data);
    
    return (
      avgHeartRate > ACTIVITY_THRESHOLDS.cycle.minHeartRate &&
      avgHeartRate < ACTIVITY_THRESHOLDS.cycle.maxHeartRate &&
      stepFrequency < 20 && // Very few steps when cycling
      avgSpeed > 8 // km/h
    );
  }

  private detectStrengthTraining(data: SensorData[]): boolean {
    // Check for variable heart rate, low/no steps, stationary position
    const avgHeartRate = this.getAverageHeartRate(data);
    const heartRateVariability = this.getHeartRateVariability(data);
    const avgSpeed = this.getAverageSpeed(data);
    
    return (
      avgHeartRate > 90 &&
      heartRateVariability > 5 && // HR varies during strength training
      avgSpeed < 2 // Mostly stationary
    );
  }

  private detectWalking(data: SensorData[]): boolean {
    // Check for moderate heart rate, moderate step frequency, low speed
    const avgHeartRate = this.getAverageHeartRate(data);
    const stepFrequency = this.getStepFrequency(data);
    const avgSpeed = this.getAverageSpeed(data);
    
    return (
      avgHeartRate > ACTIVITY_THRESHOLDS.walk.minHeartRate &&
      avgHeartRate < ACTIVITY_THRESHOLDS.walk.maxHeartRate &&
      stepFrequency > ACTIVITY_THRESHOLDS.walk.stepFrequency * 0.8 &&
      avgSpeed > 2 && avgSpeed < 7 // km/h
    );
  }

  private detectSwimming(data: SensorData[]): boolean {
    // Check for high heart rate, rhythmic acceleration, no steps
    const avgHeartRate = this.getAverageHeartRate(data);
    const hasRhythmicAcceleration = this.hasRhythmicAcceleration(data);
    const stepFrequency = this.getStepFrequency(data);
    
    return (
      avgHeartRate > ACTIVITY_THRESHOLDS.swim.minHeartRate &&
      avgHeartRate < ACTIVITY_THRESHOLDS.swim.maxHeartRate &&
      hasRhythmicAcceleration &&
      stepFrequency < 10 // Very few steps when swimming
    );
  }

  /**
   * Sensor data analysis helper methods
   */
  private getAverageHeartRate(data: SensorData[]): number {
    const validHeartRates = data
      .map(d => d.heartRate)
      .filter((hr): hr is number => hr !== undefined);
    
    if (validHeartRates.length === 0) return 0;
    
    const sum = validHeartRates.reduce((acc, hr) => acc + hr, 0);
    return sum / validHeartRates.length;
  }

  private getHeartRateVariability(data: SensorData[]): number {
    const validHeartRates = data
      .map(d => d.heartRate)
      .filter((hr): hr is number => hr !== undefined);
    
    if (validHeartRates.length < 2) return 0;
    
    // Calculate standard deviation as a measure of variability
    const avg = this.getAverageHeartRate(data);
    const squaredDiffs = validHeartRates.map(hr => Math.pow(hr - avg, 2));
    const avgSquaredDiff = squaredDiffs.reduce((acc, val) => acc + val, 0) / squaredDiffs.length;
    return Math.sqrt(avgSquaredDiff);
  }

  private getStepFrequency(data: SensorData[]): number {
    // Calculate steps per minute
    const totalSteps = data
      .map(d => d.steps || 0)
      .reduce((acc, steps) => acc + steps, 0);
    
    // Convert to steps per minute (assuming data period is in seconds)
    return (totalSteps / data.length) * 60;
  }

  private getAverageSpeed(data: SensorData[]): number {
    const validSpeeds = data
      .map(d => d.gps?.speed)
      .filter((speed): speed is number => speed !== undefined);
    
    if (validSpeeds.length === 0) return 0;
    
    const sum = validSpeeds.reduce((acc, speed) => acc + speed, 0);
    return sum / validSpeeds.length;
  }

  private hasRhythmicAcceleration(data: SensorData[]): boolean {
    // A simplified check for rhythmic acceleration patterns
    // In a real implementation, this would use signal processing techniques
    
    if (data.length < 4) return false;
    
    // Check for acceleration data
    const validAccelData = data.filter(d => d.accelerometer !== undefined);
    if (validAccelData.length < 4) return false;
    
    // Simple check for patterns in acceleration magnitude
    const magnitudes = validAccelData.map(d => {
      const accel = d.accelerometer!;
      return Math.sqrt(accel.x * accel.x + accel.y * accel.y + accel.z * accel.z);
    });
    
    // Check for alternating patterns in magnitude
    // This is simplified - real implementation would use FFT or other signal processing
    let alternating = 0;
    for (let i = 1; i < magnitudes.length; i++) {
      if ((magnitudes[i] > magnitudes[i-1] && (i % 2 === 1)) || 
          (magnitudes[i] < magnitudes[i-1] && (i % 2 === 0))) {
        alternating++;
      }
    }
    
    return alternating >= (magnitudes.length - 1) * 0.6; // 60% match with alternating pattern
  }
}

// Export singleton instance
export const sensorDataService = new SensorDataService(); 