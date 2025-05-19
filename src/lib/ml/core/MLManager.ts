import { MLModel, PredictionResult } from './MLModel';
import { Platform } from '@/utils/platform';

/**
 * Manager for machine learning models across different platforms
 */
export class MLManager {
  private static instance: MLManager;
  private models: Map<string, MLModel> = new Map();
  private initialized: boolean = false;

  /**
   * Private constructor to ensure singleton pattern
   */
  private constructor() {}

  /**
   * Get the singleton instance of MLManager
   */
  public static getInstance(): MLManager {
    if (!MLManager.instance) {
      MLManager.instance = new MLManager();
    }
    return MLManager.instance;
  }

  /**
   * Initialize the ML infrastructure
   */
  public async initialize(): Promise<boolean> {
    try {
      console.log('Initializing ML infrastructure...');
      // Perform any global initialization here
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing ML infrastructure', error);
      return false;
    }
  }

  /**
   * Register a model with the manager
   * @param model The model to register
   */
  public registerModel(model: MLModel): void {
    this.models.set(model.name, model);
    console.log(`Model ${model.name} (v${model.version}) registered`);
  }

  /**
   * Get a model by name
   * @param modelName The name of the model to retrieve
   */
  public getModel(modelName: string): MLModel | undefined {
    return this.models.get(modelName);
  }

  /**
   * Get all available models
   */
  public getAllModels(): MLModel[] {
    return Array.from(this.models.values());
  }

  /**
   * Load a model based on the current platform
   * @param modelName The base name of the model
   */
  public async loadModelForPlatform(modelName: string): Promise<MLModel | null> {
    // Determine current platform
    const platform = Platform.getCurrentPlatform();
    
    try {
      let model: MLModel | null = null;
      
      // Import the appropriate model implementation based on platform
      if (platform === 'ios') {
        const { getIOSModel } = await import('../ios/IOSModelProvider');
        model = await getIOSModel(modelName);
      } else if (platform === 'android') {
        const { getAndroidModel } = await import('../android/AndroidModelProvider');
        model = await getAndroidModel(modelName);
      } else {
        // Web fallback
        const { getWebModel } = await import('./WebModelProvider');
        model = await getWebModel(modelName);
      }
      
      if (model) {
        await model.initialize();
        this.registerModel(model);
        return model;
      }
      
      return null;
    } catch (error) {
      console.error(`Error loading model ${modelName} for platform ${platform}`, error);
      return null;
    }
  }

  /**
   * Run inference with a specific model
   * @param modelName The name of the model to use
   * @param input The input data for inference
   */
  public async predict<T, R>(modelName: string, input: T): Promise<PredictionResult<R> | null> {
    const model = this.getModel(modelName);
    
    if (!model) {
      console.error(`Model ${modelName} not found`);
      return null;
    }
    
    try {
      const result = await model.predict<T, R>(input);
      
      // Format the result as a PredictionResult
      return {
        prediction: result,
        confidence: 0.9, // This should be provided by the model
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Error running inference with model ${modelName}`, error);
      return null;
    }
  }

  /**
   * Clean up all models
   */
  public async disposeAll(): Promise<void> {
    for (const model of this.models.values()) {
      await model.dispose();
    }
    
    this.models.clear();
    console.log('All models disposed');
  }
} 