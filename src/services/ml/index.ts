import tfService from './tfService';
import modelRegistry, { ModelMetadata, RegisteredModel } from './modelRegistry';
import versionManager from './versionManager';
import errorHandler, { MLErrorType, MLError } from './errorHandling';
import * as tf from '@tensorflow/tfjs';

/**
 * Layer configuration type
 */
type LayerConfig = {
  units: number;
  activation?: 'elu' | 'hardSigmoid' | 'linear' | 'relu' | 'relu6' | 'selu' | 'sigmoid' | 'softmax' | 'softplus' | 'softsign' | 'tanh' | 'swish' | 'mish';
  useBias?: boolean;
  kernelInitializer?: string;
  biasInitializer?: string;
  inputShape?: number[];
  inputDim?: number;
};

/**
 * Training callback type
 */
type TrainingCallback = {
  onEpochBegin?: (epoch: number, logs?: any) => void | Promise<void>;
  onEpochEnd?: (epoch: number, logs?: any) => void | Promise<void>;
  onBatchBegin?: (batch: number, logs?: any) => void | Promise<void>;
  onBatchEnd?: (batch: number, logs?: any) => void | Promise<void>;
  onTrainBegin?: (logs?: any) => void | Promise<void>;
  onTrainEnd?: (logs?: any) => void | Promise<void>;
};

/**
 * Unified ML Service for Nestor Health app
 * Integrates all ML-related services
 */
export class MLService {
  private static instance: MLService;
  private initialized: boolean = false;

  private constructor() {}

  /**
   * Get the singleton instance of MLService
   */
  public static getInstance(): MLService {
    if (!MLService.instance) {
      MLService.instance = new MLService();
    }
    return MLService.instance;
  }

  /**
   * Initialize the ML service
   */
  public async initialize(): Promise<boolean> {
    try {
      // Initialize TensorFlow.js
      await tfService.initialize();
      
      // Initialize model registry
      await modelRegistry.initialize();
      
      this.initialized = true;
      console.log('ML Service initialized successfully');
      
      return true;
    } catch (error) {
      errorHandler.handleError(error as Error, MLErrorType.INITIALIZATION);
      this.initialized = false;
      return false;
    }
  }

  /**
   * Check if the ML service is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Create and register a model
   */
  public async createModel(
    modelConfig: {
      name: string;
      version?: string;
      description?: string;
      tags?: string[];
      layers: LayerConfig[];
      compile?: {
        optimizer: string | tf.Optimizer;
        loss: string | string[];
        metrics?: string[];
      }
    }
  ): Promise<RegisteredModel> {
    try {
      // Create model
      const model = tf.sequential();
      
      // Add layers
      for (const layerConfig of modelConfig.layers) {
        model.add(tf.layers.dense(layerConfig));
      }
      
      // Compile if compile config is provided
      if (modelConfig.compile) {
        model.compile(modelConfig.compile);
      }
      
      // Determine version
      let version = modelConfig.version;
      if (!version) {
        const latestModel = modelRegistry.findLatestModelVersion(modelConfig.name);
        version = latestModel
          ? versionManager.getNextVersion(latestModel.version, 'minor')
          : versionManager.initialVersion();
      }
      
      // Register model
      return await modelRegistry.registerModel(
        model,
        modelConfig.name,
        version,
        modelConfig.description,
        modelConfig.tags
      );
    } catch (error) {
      errorHandler.handleError(error as Error, MLErrorType.UNKNOWN, {
        action: 'createModel',
        modelName: modelConfig.name
      });
      throw error;
    }
  }

  /**
   * Load a model by ID
   */
  public async loadModel(id: string): Promise<tf.LayersModel | null> {
    try {
      return await modelRegistry.loadModel(id);
    } catch (error) {
      errorHandler.handleError(error as Error, MLErrorType.MODEL_LOADING, {
        modelId: id
      });
      return null;
    }
  }

  /**
   * Get the latest model by name
   */
  public async getLatestModel(name: string): Promise<tf.LayersModel | null> {
    try {
      const latestMetadata = modelRegistry.findLatestModelVersion(name);
      
      if (!latestMetadata) {
        return null;
      }
      
      return await this.loadModel(latestMetadata.id);
    } catch (error) {
      errorHandler.handleError(error as Error, MLErrorType.MODEL_LOADING, {
        modelName: name
      });
      return null;
    }
  }

  /**
   * Train a model
   */
  public async trainModel(
    modelId: string,
    x: tf.Tensor | tf.Tensor[],
    y: tf.Tensor | tf.Tensor[],
    config: {
      epochs: number;
      batchSize?: number;
      validationSplit?: number;
      callbacks?: TrainingCallback | TrainingCallback[];
    }
  ): Promise<tf.History | null> {
    try {
      const model = await this.loadModel(modelId);
      
      if (!model) {
        throw new Error(`Model with ID ${modelId} not found`);
      }
      
      // Train model
      const history = await model.fit(x, y, config);
      
      // Update model metrics
      const metrics = history.history;
      const simplifiedMetrics: Record<string, number> = {};
      
      // Convert last tensor value of each metric to a number
      Object.entries(metrics).forEach(([key, values]) => {
        const lastValue = values[values.length - 1];
        // Convert tensor to number if needed
        if (lastValue instanceof tf.Tensor) {
          simplifiedMetrics[key] = lastValue.dataSync()[0];
        } else {
          simplifiedMetrics[key] = lastValue as number;
        }
      });
      
      // Update model metadata with metrics
      await modelRegistry.updateModelMetadata(modelId, {
        metrics: simplifiedMetrics
      });
      
      return history;
    } catch (error) {
      errorHandler.handleError(error as Error, MLErrorType.MODEL_TRAINING, {
        modelId
      });
      return null;
    }
  }

  /**
   * Make predictions with a model
   */
  public async predict(
    modelId: string,
    input: tf.Tensor | tf.Tensor[]
  ): Promise<tf.Tensor | tf.Tensor[] | null> {
    try {
      const model = await this.loadModel(modelId);
      
      if (!model) {
        throw new Error(`Model with ID ${modelId} not found`);
      }
      
      return model.predict(input);
    } catch (error) {
      errorHandler.handleError(error as Error, MLErrorType.MODEL_PREDICTION, {
        modelId
      });
      return null;
    }
  }

  /**
   * List all available models
   */
  public listModels(): ModelMetadata[] {
    return modelRegistry.listModels();
  }

  /**
   * Delete a model
   */
  public async deleteModel(id: string): Promise<boolean> {
    try {
      return await modelRegistry.deleteModel(id);
    } catch (error) {
      errorHandler.handleError(error as Error, MLErrorType.UNKNOWN, {
        action: 'deleteModel',
        modelId: id
      });
      return false;
    }
  }

  /**
   * Clean up all ML resources
   */
  public dispose(): void {
    tfService.dispose();
  }

  /**
   * Get error handler instance
   */
  public getErrorHandler(): typeof errorHandler {
    return errorHandler;
  }

  /**
   * Get model registry instance
   */
  public getModelRegistry(): typeof modelRegistry {
    return modelRegistry;
  }

  /**
   * Get version manager instance
   */
  public getVersionManager(): typeof versionManager {
    return versionManager;
  }

  /**
   * Get TensorFlow service instance
   */
  public getTensorFlowService(): typeof tfService {
    return tfService;
  }
}

// Main ML service instance
const mlService = MLService.getInstance();

// Export individual services
export {
  tfService,
  modelRegistry,
  versionManager,
  errorHandler,
  MLErrorType,
  type MLError,
  type ModelMetadata,
  type RegisteredModel
};

// Default export is the main ML service
export default mlService; 