/**
 * Base interface for all ML models in Nestor
 * This provides a common interface that platform-specific implementations will follow
 */
export interface MLModel {
  /**
   * The name/identifier of the model
   */
  readonly name: string;
  
  /**
   * The version of the model
   */
  readonly version: string;
  
  /**
   * Initialize the model, loading any necessary weights or parameters
   */
  initialize(): Promise<boolean>;
  
  /**
   * Run inference using the provided input data
   * @param input The input data for inference
   * @returns The inference result
   */
  predict<T, R>(input: T): Promise<R>;
  
  /**
   * Get information about the model
   */
  getInfo(): ModelInfo;
  
  /**
   * Dispose of the model resources when no longer needed
   */
  dispose(): Promise<void>;
}

/**
 * Information about a model
 */
export interface ModelInfo {
  name: string;
  version: string;
  description: string;
  inputShape: number[];
  outputShape: number[];
  lastUpdated: Date;
  accuracy?: number;
  platform: 'ios' | 'android' | 'web' | 'cross-platform';
}

/**
 * Base class for feature extraction
 */
export interface FeatureExtractor<T, R> {
  /**
   * Extract features from raw data
   * @param rawData The raw data to extract features from
   */
  extract(rawData: T): Promise<R>;
  
  /**
   * Get information about the features extracted
   */
  getFeatureInfo(): FeatureInfo[];
}

/**
 * Information about a feature
 */
export interface FeatureInfo {
  name: string;
  description: string;
  type: 'numerical' | 'categorical' | 'time-series';
  range?: [number, number];
  categories?: string[];
}

/**
 * Result of a model prediction
 */
export interface PredictionResult<T> {
  prediction: T;
  confidence: number;
  timestamp: Date;
  featureImportance?: Record<string, number>;
} 