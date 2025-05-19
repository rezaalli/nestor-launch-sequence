import { FeatureExtractor, FeatureInfo } from '../core/MLModel';
import { Matrix } from 'ml-matrix';

/**
 * Raw biometric data format
 */
export interface BiometricData {
  heartRate?: number[];
  respiratoryRate?: number[];
  oxygenSaturation?: number[];
  temperature?: number[];
  steps?: number[];
  activity?: string[];
  sleep?: {
    duration: number;
    quality: number;
    stages?: {
      rem: number;
      light: number;
      deep: number;
      awake: number;
    };
  }[];
  timestamps: string[];
}

/**
 * Processed features for ML models
 */
export interface BiometricFeatures {
  features: number[][];
  featureNames: string[];
  statistics: {
    mean: Record<string, number>;
    std: Record<string, number>;
    min: Record<string, number>;
    max: Record<string, number>;
  };
}

/**
 * Class for extracting features from biometric data
 */
export class BiometricFeatureExtractor implements FeatureExtractor<BiometricData, BiometricFeatures> {
  private windowSize: number;
  private stepSize: number;
  
  constructor(windowSize: number = 24, stepSize: number = 12) {
    this.windowSize = windowSize; // Default 24 hours
    this.stepSize = stepSize;     // Default 12 hours
  }
  
  /**
   * Extract features from raw biometric data
   */
  public async extract(rawData: BiometricData): Promise<BiometricFeatures> {
    console.log('Extracting features from biometric data');
    
    // Validate data
    if (!rawData.timestamps || rawData.timestamps.length === 0) {
      throw new Error('No timestamp data provided');
    }
    
    // Process each data type and extract features
    const featureSets: Record<string, number[]> = {};
    const statistics: BiometricFeatures['statistics'] = {
      mean: {},
      std: {},
      min: {},
      max: {}
    };
    
    // Process heart rate data if available
    if (rawData.heartRate && rawData.heartRate.length > 0) {
      const hrFeatures = this.extractTimeSeriesFeatures(rawData.heartRate, 'hr');
      Object.entries(hrFeatures).forEach(([key, value]) => {
        featureSets[key] = value;
      });
      
      const hrMatrix = new Matrix([rawData.heartRate]);
      statistics.mean.hr = hrMatrix.mean();
      statistics.std.hr = Math.sqrt(hrMatrix.variance());
      statistics.min.hr = Math.min(...rawData.heartRate);
      statistics.max.hr = Math.max(...rawData.heartRate);
    }
    
    // Process respiratory rate data if available
    if (rawData.respiratoryRate && rawData.respiratoryRate.length > 0) {
      const rrFeatures = this.extractTimeSeriesFeatures(rawData.respiratoryRate, 'rr');
      Object.entries(rrFeatures).forEach(([key, value]) => {
        featureSets[key] = value;
      });
      
      const rrMatrix = new Matrix([rawData.respiratoryRate]);
      statistics.mean.rr = rrMatrix.mean();
      statistics.std.rr = Math.sqrt(rrMatrix.variance());
      statistics.min.rr = Math.min(...rawData.respiratoryRate);
      statistics.max.rr = Math.max(...rawData.respiratoryRate);
    }
    
    // Process oxygen saturation data if available
    if (rawData.oxygenSaturation && rawData.oxygenSaturation.length > 0) {
      const spO2Features = this.extractTimeSeriesFeatures(rawData.oxygenSaturation, 'spO2');
      Object.entries(spO2Features).forEach(([key, value]) => {
        featureSets[key] = value;
      });
      
      const spO2Matrix = new Matrix([rawData.oxygenSaturation]);
      statistics.mean.spO2 = spO2Matrix.mean();
      statistics.std.spO2 = Math.sqrt(spO2Matrix.variance());
      statistics.min.spO2 = Math.min(...rawData.oxygenSaturation);
      statistics.max.spO2 = Math.max(...rawData.oxygenSaturation);
    }
    
    // Process temperature data if available
    if (rawData.temperature && rawData.temperature.length > 0) {
      const tempFeatures = this.extractTimeSeriesFeatures(rawData.temperature, 'temp');
      Object.entries(tempFeatures).forEach(([key, value]) => {
        featureSets[key] = value;
      });
      
      const tempMatrix = new Matrix([rawData.temperature]);
      statistics.mean.temp = tempMatrix.mean();
      statistics.std.temp = Math.sqrt(tempMatrix.variance());
      statistics.min.temp = Math.min(...rawData.temperature);
      statistics.max.temp = Math.max(...rawData.temperature);
    }
    
    // Process sleep data if available
    if (rawData.sleep && rawData.sleep.length > 0) {
      const sleepFeatures = this.extractSleepFeatures(rawData.sleep);
      Object.entries(sleepFeatures).forEach(([key, value]) => {
        featureSets[key] = value;
      });
    }
    
    // Combine all features into a matrix
    const featureNames = Object.keys(featureSets);
    const featureArrays = featureNames.map(name => featureSets[name]);
    
    // Create feature matrix (each row is a feature vector)
    const featuresTransposed = featureArrays.map((_, colIndex) => 
      featureArrays.map(row => row[colIndex])
    );
    
    return {
      features: featuresTransposed,
      featureNames,
      statistics
    };
  }
  
  /**
   * Extract features from time series data
   */
  private extractTimeSeriesFeatures(data: number[], prefix: string): Record<string, number[]> {
    const features: Record<string, number[]> = {};
    
    // Simple features: mean, std, min, max
    const matrix = new Matrix([data]);
    features[`${prefix}_mean`] = [matrix.mean()];
    features[`${prefix}_std`] = [Math.sqrt(matrix.variance())];
    features[`${prefix}_min`] = [Math.min(...data)];
    features[`${prefix}_max`] = [Math.max(...data)];
    
    // Sliding window features
    if (data.length >= this.windowSize) {
      const windowFeatures: number[] = [];
      
      for (let i = 0; i <= data.length - this.windowSize; i += this.stepSize) {
        const window = data.slice(i, i + this.windowSize);
        const windowMatrix = new Matrix([window]);
        
        // Calculate window statistics
        const windowMean = windowMatrix.mean();
        windowFeatures.push(windowMean);
      }
      
      features[`${prefix}_window_mean`] = windowFeatures;
    }
    
    return features;
  }
  
  /**
   * Extract features from sleep data
   */
  private extractSleepFeatures(sleepData: BiometricData['sleep']): Record<string, number[]> {
    const features: Record<string, number[]> = {};
    
    if (!sleepData || sleepData.length === 0) {
      return features;
    }
    
    // Extract duration and quality
    const durations = sleepData.map(s => s.duration);
    const qualities = sleepData.map(s => s.quality);
    
    // Calculate basic statistics
    const durationMatrix = new Matrix([durations]);
    features['sleep_duration_mean'] = [durationMatrix.mean()];
    features['sleep_duration_std'] = [Math.sqrt(durationMatrix.variance())];
    
    const qualityMatrix = new Matrix([qualities]);
    features['sleep_quality_mean'] = [qualityMatrix.mean()];
    features['sleep_quality_std'] = [Math.sqrt(qualityMatrix.variance())];
    
    // Extract sleep stage information if available
    if (sleepData[0].stages) {
      const remValues = sleepData.map(s => s.stages?.rem || 0);
      const lightValues = sleepData.map(s => s.stages?.light || 0);
      const deepValues = sleepData.map(s => s.stages?.deep || 0);
      
      const remMatrix = new Matrix([remValues]);
      features['sleep_rem_mean'] = [remMatrix.mean()];
      
      const lightMatrix = new Matrix([lightValues]);
      features['sleep_light_mean'] = [lightMatrix.mean()];
      
      const deepMatrix = new Matrix([deepValues]);
      features['sleep_deep_mean'] = [deepMatrix.mean()];
      
      // Calculate sleep quality ratio (deep + rem) / total
      const qualityRatios = sleepData.map(s => {
        const total = (s.stages?.rem || 0) + (s.stages?.light || 0) + 
                     (s.stages?.deep || 0) + (s.stages?.awake || 0);
        if (total === 0) return 0;
        return ((s.stages?.deep || 0) + (s.stages?.rem || 0)) / total;
      });
      
      const ratioMatrix = new Matrix([qualityRatios]);
      features['sleep_quality_ratio'] = [ratioMatrix.mean()];
    }
    
    return features;
  }
  
  /**
   * Get feature information
   */
  public getFeatureInfo(): FeatureInfo[] {
    return [
      {
        name: 'hr_mean',
        description: 'Mean heart rate',
        type: 'numerical',
        range: [40, 200]
      },
      {
        name: 'hr_std',
        description: 'Standard deviation of heart rate',
        type: 'numerical',
        range: [0, 50]
      },
      {
        name: 'rr_mean',
        description: 'Mean respiratory rate',
        type: 'numerical',
        range: [8, 25]
      },
      {
        name: 'spO2_mean',
        description: 'Mean oxygen saturation',
        type: 'numerical',
        range: [85, 100]
      },
      {
        name: 'temp_mean',
        description: 'Mean body temperature',
        type: 'numerical',
        range: [95, 104]
      },
      {
        name: 'sleep_duration_mean',
        description: 'Mean sleep duration in hours',
        type: 'numerical',
        range: [0, 12]
      },
      {
        name: 'sleep_quality_mean',
        description: 'Mean sleep quality score',
        type: 'numerical',
        range: [0, 100]
      },
      {
        name: 'sleep_quality_ratio',
        description: 'Ratio of quality sleep (deep + REM) to total sleep',
        type: 'numerical',
        range: [0, 1]
      }
    ];
  }
} 