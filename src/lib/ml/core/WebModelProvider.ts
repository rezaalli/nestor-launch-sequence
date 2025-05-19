import { MLModel, ModelInfo, PredictionResult } from './MLModel';
import mlService from '@/services/ml';
import * as tf from '@tensorflow/tfjs';

/**
 * Implementation of MLModel that uses TensorFlow.js for web
 */
class WebTensorFlowModel implements MLModel {
  private model: tf.LayersModel | null = null;
  private modelId: string | null = null;
  private modelMetadata: any = null;

  constructor(
    public readonly name: string,
    public readonly version: string,
    private config: any
  ) {}

  /**
   * Initialize the model
   */
  public async initialize(): Promise<boolean> {
    try {
      // Ensure ML service is initialized
      if (!mlService.isInitialized()) {
        await mlService.initialize();
      }

      // Check if model exists in registry
      const models = mlService.listModels();
      const matchingModels = models.filter(model => model.name === this.name);

      if (matchingModels.length > 0) {
        // Use existing model
        this.modelMetadata = matchingModels[0];
        this.modelId = this.modelMetadata.id;
        this.model = await mlService.loadModel(this.modelId);
        return this.model !== null;
      } else if (this.config?.layers) {
        // Create new model if configuration is provided
        const result = await mlService.createModel({
          name: this.name,
          version: this.version,
          description: this.config.description || `Web model for ${this.name}`,
          layers: this.config.layers,
          compile: this.config.compile
        });
        
        this.modelId = result.metadata.id;
        this.modelMetadata = result.metadata;
        this.model = result.model || null;
        return this.model !== null;
      }
      
      console.error(`Model ${this.name} not found and no configuration provided to create it`);
      return false;
    } catch (error) {
      console.error(`Error initializing web model ${this.name}:`, error);
      return false;
    }
  }

  /**
   * Run inference with the model
   */
  public async predict<T, R>(input: T): Promise<R> {
    if (!this.model || !this.modelId) {
      throw new Error(`Model ${this.name} not initialized`);
    }

    try {
      // Convert input to tensor
      let inputTensor: tf.Tensor;
      
      if (input instanceof tf.Tensor) {
        inputTensor = input;
      } else if (Array.isArray(input)) {
        // Handle array input
        inputTensor = tf.tensor(input);
      } else {
        // Handle object input by extracting values
        const values = Object.values(input as object);
        inputTensor = tf.tensor(values);
      }

      // Make prediction
      const result = await mlService.predict(this.modelId, inputTensor);
      
      if (!result) {
        throw new Error('Prediction returned null');
      }
      
      // Convert prediction to expected output format
      let output: any;
      
      if (Array.isArray(result)) {
        // Handle multiple output tensors
        output = result.map(tensor => tensor.arraySync());
      } else {
        // Handle single output tensor
        output = result.arraySync();
      }
      
      // Dispose tensors to free memory
      if (!(input instanceof tf.Tensor)) {
        inputTensor.dispose();
      }
      
      return output as R;
    } catch (error) {
      console.error(`Error during prediction with model ${this.name}:`, error);
      throw error;
    }
  }

  /**
   * Get information about the model
   */
  public getInfo(): ModelInfo {
    const info: ModelInfo = {
      name: this.name,
      version: this.version,
      description: this.modelMetadata?.description || `Web model for ${this.name}`,
      inputShape: this.model?.inputs[0]?.shape?.slice(1) || [],
      outputShape: this.model?.outputs[0]?.shape?.slice(1) || [],
      lastUpdated: this.modelMetadata?.updatedAt || new Date(),
      platform: 'web',
    };
    
    if (this.modelMetadata?.metrics?.accuracy) {
      info.accuracy = this.modelMetadata.metrics.accuracy;
    }
    
    return info;
  }

  /**
   * Dispose of model resources
   */
  public async dispose(): Promise<void> {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
  }
}

/**
 * Get a web model implementation for the given model name
 */
export async function getWebModel(modelName: string, config?: any): Promise<MLModel | null> {
  try {
    // Check if ML service is initialized
    if (!mlService.isInitialized()) {
      await mlService.initialize();
    }
    
    // Look for existing model in registry
    const models = mlService.listModels();
    const matchingModels = models.filter(model => model.name === modelName);
    
    let version = '1.0.0';
    
    if (matchingModels.length > 0) {
      // Use the latest version
      const latestModel = mlService.getVersionManager().findLatestVersion(matchingModels);
      if (latestModel) {
        version = latestModel.version;
      }
    }
    
    // Create the model wrapper
    const model = new WebTensorFlowModel(modelName, version, config);
    
    // Initialize the model
    const success = await model.initialize();
    
    return success ? model : null;
  } catch (error) {
    console.error(`Error getting web model ${modelName}:`, error);
    return null;
  }
} 