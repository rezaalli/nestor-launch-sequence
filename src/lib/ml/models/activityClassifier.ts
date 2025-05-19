import mlService from '@/services/ml';
import * as tf from '@tensorflow/tfjs';
import { MLErrorType } from '@/services/ml/errorHandling';

// Feature flag to enable/disable activity classification
export const ENABLE_ACTIVITY_CLASSIFICATION = false;

/**
 * Activity types that can be classified
 */
export enum ActivityType {
  STATIONARY = 0,
  WALKING = 1,
  RUNNING = 2,
  CYCLING = 3,
}

/**
 * Activity classification result
 */
export interface ActivityClassification {
  activityType: ActivityType;
  confidence: number;
  timestamp: Date;
}

/**
 * Accelerometer data structure
 */
export interface AccelerometerData {
  x: number;
  y: number;
  z: number;
  timestamp: number;
}

/**
 * Activity Classifier service
 */
export class ActivityClassifier {
  private static instance: ActivityClassifier;
  private modelId: string | null = null;
  private modelName = 'activity-classifier';
  private initialized = false;
  private classes = ['Stationary', 'Walking', 'Running', 'Cycling'];

  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): ActivityClassifier {
    if (!ActivityClassifier.instance) {
      ActivityClassifier.instance = new ActivityClassifier();
    }
    return ActivityClassifier.instance;
  }

  /**
   * Initialize the activity classifier
   */
  public async initialize(): Promise<boolean> {
    try {
      // Ensure ML service is initialized
      if (!mlService.isInitialized()) {
        await mlService.initialize();
      }

      // Check if model exists
      const models = mlService.listModels();
      const existingModels = models.filter(m => m.name === this.modelName);

      if (existingModels.length > 0) {
        // Use existing model
        const latestModel = mlService.getVersionManager().findLatestVersion(existingModels);
        if (latestModel) {
          this.modelId = latestModel.id;
          console.log(`Using existing activity classifier model (${latestModel.version})`);
          this.initialized = true;
          return true;
        }
      }

      // Create a new model
      console.log('Creating new activity classifier model...');
      const result = await mlService.createModel({
        name: this.modelName,
        description: 'Neural network for classifying physical activities',
        tags: ['activity', 'classification'],
        layers: [
          {
            inputShape: [9], // 3 features (x,y,z) from 3 time steps
            units: 16,
            activation: 'relu'
          },
          {
            units: 8,
            activation: 'relu'
          },
          {
            units: 4, // 4 activity types
            activation: 'softmax'
          }
        ],
        compile: {
          optimizer: 'adam',
          loss: 'categoricalCrossentropy',
          metrics: ['accuracy']
        }
      });

      this.modelId = result.metadata.id;
      this.initialized = true;
      console.log(`Activity classifier model created successfully (${result.metadata.version})`);
      
      return true;
    } catch (error) {
      const errorHandler = mlService.getErrorHandler();
      errorHandler.handleError(error as Error, MLErrorType.INITIALIZATION, {
        model: this.modelName,
        action: 'initialize'
      });
      return false;
    }
  }

  /**
   * Preprocess accelerometer data for the model
   */
  private preprocessData(data: AccelerometerData[]): tf.Tensor {
    try {
      // Ensure we have enough data points
      if (data.length < 3) {
        throw new Error('Insufficient accelerometer data. Need at least 3 data points.');
      }

      // Use the last 3 data points
      const recentData = data.slice(-3);

      // Extract features
      const features = recentData.flatMap(d => [d.x, d.y, d.z]);
      
      // Create tensor
      return tf.tensor2d([features], [1, 9]);
    } catch (error) {
      const errorHandler = mlService.getErrorHandler();
      errorHandler.handleError(error as Error, MLErrorType.DATA_PROCESSING, {
        model: this.modelName,
        action: 'preprocessData'
      });
      throw error;
    }
  }

  /**
   * Classify activity based on accelerometer data
   */
  public async classifyActivity(data: AccelerometerData[]): Promise<ActivityClassification | null> {
    if (!this.initialized || !this.modelId) {
      throw new Error('Activity classifier not initialized');
    }

    try {
      // Preprocess data
      const inputTensor = this.preprocessData(data);

      // Make prediction
      const prediction = await mlService.predict(this.modelId, inputTensor);
      
      if (!prediction) {
        throw new Error('Prediction failed');
      }

      // Convert prediction to array
      const predictionArray = (Array.isArray(prediction) ? prediction[0] : prediction).arraySync()[0] as number[];
      
      // Get the highest probability class
      const maxProbIndex = predictionArray.indexOf(Math.max(...predictionArray));
      const confidence = predictionArray[maxProbIndex];

      // Cleanup
      inputTensor.dispose();
      if (prediction instanceof tf.Tensor) {
        prediction.dispose();
      } else if (Array.isArray(prediction)) {
        prediction.forEach(t => t.dispose());
      }

      return {
        activityType: maxProbIndex as ActivityType,
        confidence,
        timestamp: new Date()
      };
    } catch (error) {
      const errorHandler = mlService.getErrorHandler();
      errorHandler.handleError(error as Error, MLErrorType.MODEL_PREDICTION, {
        model: this.modelName,
        action: 'classifyActivity'
      });
      return null;
    }
  }

  /**
   * Train the model with labeled data
   */
  public async trainModel(
    trainingData: AccelerometerData[][],
    labels: ActivityType[],
    epochs: number = 20
  ): Promise<boolean> {
    if (!this.initialized || !this.modelId) {
      throw new Error('Activity classifier not initialized');
    }

    try {
      // Convert training data to tensors
      const features = trainingData.map(sequence => {
        // Ensure we have exactly 3 data points per sequence
        const paddedSequence = sequence.length >= 3 ? sequence.slice(-3) : [...Array(3 - sequence.length).fill({x: 0, y: 0, z: 0}), ...sequence];
        return paddedSequence.flatMap(d => [d.x, d.y, d.z]);
      });

      // Create input tensor
      const xTensor = tf.tensor2d(features, [features.length, 9]);

      // Create one-hot encoded labels
      const yTensor = tf.oneHot(labels, 4);

      // Train the model
      const history = await mlService.trainModel(this.modelId, xTensor, yTensor, {
        epochs,
        batchSize: 16,
        validationSplit: 0.2,
        callbacks: {
          onEpochEnd: (epoch, logs) => {
            console.log(`Epoch ${epoch+1}/${epochs}: loss=${logs?.loss.toFixed(4)}, accuracy=${logs?.acc.toFixed(4)}`);
          }
        }
      });

      // Cleanup
      xTensor.dispose();
      yTensor.dispose();

      return history !== null;
    } catch (error) {
      const errorHandler = mlService.getErrorHandler();
      errorHandler.handleError(error as Error, MLErrorType.MODEL_TRAINING, {
        model: this.modelName,
        action: 'trainModel'
      });
      return false;
    }
  }

  /**
   * Get the activity name from the activity type
   */
  public getActivityName(activityType: ActivityType): string {
    return this.classes[activityType] || 'Unknown';
  }
}

export default ActivityClassifier.getInstance(); 