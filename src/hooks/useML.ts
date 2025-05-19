import { useState, useEffect, useCallback } from 'react';
import { MLManager } from '@/lib/ml/core/MLManager';
import { MLModel, PredictionResult } from '@/lib/ml/core/MLModel';
import { BiometricFeatureExtractor, BiometricData, BiometricFeatures } from '@/lib/ml/feature-extraction/BiometricFeatureExtractor';
import { 
  AdvancedInsightsEngine, 
  HealthDataSeries, 
  HealthInsightsResult 
} from '@/lib/ml/feature-extraction/AdvancedInsightsEngine';
import { Platform } from '@/utils/platform';
import { 
  CreateMLModelOptions, 
  getEnhancedCreateMLModel,
  getAvailableCreateMLModels
} from '@/lib/ml/ios/EnhancedCreateMLProvider';
import activityClassifier, { ActivityClassification, AccelerometerData, ENABLE_ACTIVITY_CLASSIFICATION } from '@/lib/ml/models/activityClassifier';

interface MLState {
  isInitialized: boolean;
  isLoading: boolean;
  error: Error | null;
  availableModels: string[];
  modelPerformanceMetrics: Record<string, {
    averageExecutionTime: number;
    callCount: number;
    lastExecutionTime?: number;
  }>;
  advancedInsightsAvailable: boolean;
  platformSpecificFeaturesEnabled: boolean;
  activityClassifierInitialized: boolean;
}

interface MLHookReturn extends MLState {
  initializeML: () => Promise<boolean>;
  loadModel: (modelName: string, options?: any) => Promise<MLModel | null>;
  predict: <T, R>(modelName: string, input: T) => Promise<PredictionResult<R> | null>;
  batchPredict: <T, R>(modelName: string, inputs: T[]) => Promise<PredictionResult<R>[] | null>;
  extractFeatures: (data: BiometricData) => Promise<BiometricFeatures | null>;
  generateAdvancedInsights: (data: HealthDataSeries, options?: any) => Promise<HealthInsightsResult>;
  disposeAll: () => Promise<void>;
  getModelInfo: (modelName: string) => any;
  classifyActivity: (data: AccelerometerData[]) => Promise<ActivityClassification | null>;
}

/**
 * Enhanced hook for using ML models in React components
 * Phase 4 implementation with advanced insights and optimized model loading
 */
export function useML(): MLHookReturn {
  const [state, setState] = useState<MLState>({
    isInitialized: false,
    isLoading: false,
    error: null,
    availableModels: [],
    modelPerformanceMetrics: {},
    advancedInsightsAvailable: false,
    platformSpecificFeaturesEnabled: false,
    activityClassifierInitialized: false
  });

  // Access singletons
  const mlManager = MLManager.getInstance();
  const insightsEngine = new AdvancedInsightsEngine();

  /**
   * Initialize the ML infrastructure
   */
  const initializeML = useCallback(async (): Promise<boolean> => {
    // Exit early if we're in a server-side environment to prevent hydration mismatches
    if (typeof window === 'undefined') {
      console.log('Skipping ML initialization on server side');
      return false;
    }
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Initialize the ML manager with a timeout to handle network issues
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error('ML initialization timed out')), 10000);
      });
      
      const initPromise = mlManager.initialize();
      const success = await Promise.race([initPromise, timeoutPromise])
        .catch(error => {
          console.error('ML initialization error or timeout:', error);
          return false;
        });
      
      if (success) {
        // Check for platform-specific features
        const platform = Platform.getCurrentPlatform();
        const platformSpecificFeaturesEnabled = platform === 'ios' || platform === 'android';
        
        // For iOS, preload available CreateML models
        let availableModels: string[] = [];
        if (platform === 'ios') {
          try {
            availableModels = await getAvailableCreateMLModels();
            console.log('Available CreateML models:', availableModels);
          } catch (error) {
            console.warn('Error loading available CreateML models:', error);
          }
        }

        // Initialize activity classifier with a timeout - only if enabled
        let activityClassifierInitialized = false;
        if (ENABLE_ACTIVITY_CLASSIFICATION) {
          try {
            const activityClassifierPromise = activityClassifier.initialize();
            const activityTimeoutPromise = new Promise<boolean>((_, reject) => {
              setTimeout(() => reject(new Error('Activity classifier initialization timed out')), 5000);
            });
            
            activityClassifierInitialized = await Promise.race([activityClassifierPromise, activityTimeoutPromise])
              .catch(error => {
                console.warn('Activity classifier initialization error or timeout:', error);
                return false;
              });
              
            console.log('Activity classifier initialized:', activityClassifierInitialized);
          } catch (error) {
            console.warn('Error initializing activity classifier:', error);
          }
        } else {
          console.log('Activity classifier disabled by feature flag');
        }
        
        setState(prev => ({ 
          ...prev, 
          isInitialized: true, 
          isLoading: false,
          availableModels,
          advancedInsightsAvailable: true,
          platformSpecificFeaturesEnabled,
          activityClassifierInitialized
        }));
        return true;
      } else {
        throw new Error('Failed to initialize ML infrastructure');
      }
    } catch (error) {
      console.error('Error initializing ML:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error('Unknown error initializing ML') 
      }));
      return false;
    }
  }, [mlManager]);

  /**
   * Load a model by name with optional platform-specific options
   */
  const loadModel = useCallback(async (
    modelName: string,
    options?: any
  ): Promise<MLModel | null> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Check if we need to initialize first
      if (!state.isInitialized) {
        await initializeML();
      }
      
      let model: MLModel | null = null;
      const platform = Platform.getCurrentPlatform();
      
      // Use platform-specific optimized implementations if available
      if (platform === 'ios' && state.platformSpecificFeaturesEnabled) {
        try {
          // Use the enhanced CreateML implementation for iOS
          model = await getEnhancedCreateMLModel(modelName, options as CreateMLModelOptions);
          console.log(`Using enhanced CreateML model for ${modelName}`);
        } catch (error) {
          console.warn(`Error loading enhanced iOS model, falling back to standard implementation:`, error);
          model = await mlManager.loadModelForPlatform(modelName);
        }
      } else {
        // Use the standard platform model
        model = await mlManager.loadModelForPlatform(modelName);
      }
      
      if (model) {
        mlManager.registerModel(model);
        
        setState(prev => {
          const updatedModels = prev.availableModels.includes(modelName) 
            ? prev.availableModels 
            : [...prev.availableModels, modelName];
            
          return {
            ...prev,
            isLoading: false,
            availableModels: updatedModels
          };
        });
        
        return model;
      } else {
        throw new Error(`Failed to load model: ${modelName}`);
      }
    } catch (error) {
      console.error(`Error loading model ${modelName}:`, error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error(`Unknown error loading model ${modelName}`) 
      }));
      return null;
    }
  }, [state.isInitialized, state.platformSpecificFeaturesEnabled, initializeML, mlManager]);

  /**
   * Run a prediction with a model
   */
  const predict = useCallback(async <T, R>(
    modelName: string, 
    input: T
  ): Promise<PredictionResult<R> | null> => {
    const startTime = performance.now();
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Get the model (or load it if not already loaded)
      let model = mlManager.getModel(modelName);
      
      if (!model) {
        console.log(`Model ${modelName} not found, attempting to load it`);
        model = await loadModel(modelName);
        
        if (!model) {
          throw new Error(`Failed to load model: ${modelName}`);
        }
      }
      
      // Run the prediction
      const result = await model.predict<T, R>(input);
      
      // Format and process the result
      const processedResult: PredictionResult<R> = {
        prediction: result,
        confidence: 0.9, // This should be provided by the model in a real implementation
        timestamp: new Date(),
        featureImportance: {} // This would be populated by the model in a real implementation
      };
      
      // Update performance metrics
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      setState(prev => {
        const updatedMetrics = {
          ...prev.modelPerformanceMetrics,
          [modelName]: {
            averageExecutionTime: prev.modelPerformanceMetrics[modelName]
              ? (prev.modelPerformanceMetrics[modelName].averageExecutionTime * prev.modelPerformanceMetrics[modelName].callCount + executionTime) / 
                (prev.modelPerformanceMetrics[modelName].callCount + 1)
              : executionTime,
            callCount: (prev.modelPerformanceMetrics[modelName]?.callCount || 0) + 1,
            lastExecutionTime: executionTime
          }
        };
        
        return {
          ...prev,
          isLoading: false,
          modelPerformanceMetrics: updatedMetrics
        };
      });
      
      return processedResult;
    } catch (error) {
      console.error(`Error running prediction with model ${modelName}:`, error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error(`Unknown error predicting with model ${modelName}`) 
      }));
      return null;
    }
  }, [loadModel, mlManager]);

  /**
   * Run batch predictions with a model for better performance
   */
  const batchPredict = useCallback(async <T, R>(
    modelName: string,
    inputs: T[]
  ): Promise<PredictionResult<R>[] | null> => {
    if (inputs.length === 0) {
      return [];
    }
    
    const startTime = performance.now();
    
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Get the model (or load it if not already loaded)
      let model = mlManager.getModel(modelName);
      
      if (!model) {
        console.log(`Model ${modelName} not found, attempting to load it`);
        model = await loadModel(modelName);
        
        if (!model) {
          throw new Error(`Failed to load model: ${modelName}`);
        }
      }
      
      // Check if the model supports batch prediction
      if ('batchPredict' in model) {
        // Use native batch prediction if available
        const results = await (model as any).batchPredict(inputs);
        
        // Format results
        const processedResults: PredictionResult<R>[] = results.map(result => ({
          prediction: result,
          confidence: 0.9,
          timestamp: new Date(),
          featureImportance: {}
        }));
        
        return processedResults;
      } else {
        // Fallback to sequential prediction
        const results: PredictionResult<R>[] = [];
        
        for (const input of inputs) {
          const result = await predict<T, R>(modelName, input);
          if (result) {
            results.push(result);
          }
        }
        
        return results;
      }
    } catch (error) {
      console.error(`Error running batch prediction with model ${modelName}:`, error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error(`Unknown error in batch prediction with model ${modelName}`) 
      }));
      return null;
    } finally {
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Update metrics for batch operation
      setState(prev => {
        const updatedMetrics = {
          ...prev.modelPerformanceMetrics,
          [`${modelName}_batch`]: {
            averageExecutionTime: prev.modelPerformanceMetrics[`${modelName}_batch`]
              ? (prev.modelPerformanceMetrics[`${modelName}_batch`].averageExecutionTime * prev.modelPerformanceMetrics[`${modelName}_batch`].callCount + executionTime) / 
                (prev.modelPerformanceMetrics[`${modelName}_batch`].callCount + 1)
              : executionTime,
            callCount: (prev.modelPerformanceMetrics[`${modelName}_batch`]?.callCount || 0) + 1,
            lastExecutionTime: executionTime
          }
        };
        
        return {
          ...prev,
          isLoading: false,
          modelPerformanceMetrics: updatedMetrics
        };
      });
    }
  }, [loadModel, mlManager, predict]);

  /**
   * Extract features from biometric data
   */
  const extractFeatures = useCallback(async (
    data: BiometricData
  ): Promise<BiometricFeatures | null> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const extractor = new BiometricFeatureExtractor();
      const features = await extractor.extract(data);
      
      setState(prev => ({ ...prev, isLoading: false }));
      return features;
    } catch (error) {
      console.error('Error extracting features:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error('Unknown error extracting features') 
      }));
      return null;
    }
  }, []);

  /**
   * Generate advanced health insights from time series data
   */
  const generateAdvancedInsights = useCallback(async (
    data: HealthDataSeries,
    options: any = {}
  ): Promise<HealthInsightsResult> => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      if (!state.advancedInsightsAvailable) {
        throw new Error('Advanced insights are not available');
      }
      
      // Generate insights
      const insights = await insightsEngine.generateInsights(data, options);
      
      setState(prev => ({ ...prev, isLoading: false }));
      return insights;
    } catch (error) {
      console.error('Error generating advanced insights:', error);
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error : new Error('Unknown error generating insights') 
      }));
      
      // Return a fallback insights object with minimal information
      return {
        overallScore: 50,
        summary: 'Unable to generate insights due to an error',
        categories: {
          sleep: {
            title: 'Sleep Quality',
            description: 'Sleep analysis unavailable',
            score: 50,
            recommendations: ['Try to improve sleep tracking data collection'],
            trends: [],
            correlations: []
          },
          activity: {
            title: 'Physical Activity',
            description: 'Activity analysis unavailable',
            score: 50,
            recommendations: ['Track activity data for better insights'],
            trends: [],
            correlations: []
          },
          nutrition: {
            title: 'Nutrition & Hydration',
            description: 'Nutrition analysis unavailable',
            score: 50,
            recommendations: ['Log nutrition data for personalized insights'],
            trends: [],
            correlations: []
          },
          stress: {
            title: 'Stress & Recovery',
            description: 'Stress analysis unavailable',
            score: 50,
            recommendations: ['Track stress indicators for better insights'],
            trends: [],
            correlations: []
          },
          heartHealth: {
            title: 'Heart Health',
            description: 'Heart health analysis unavailable',
            score: 50,
            recommendations: ['Track heart rate data for better insights'],
            trends: [],
            correlations: []
          },
          metabolism: {
            title: 'Metabolism',
            description: 'Metabolism analysis unavailable',
            score: 50,
            recommendations: ['Track relevant data for metabolic insights'],
            trends: [],
            correlations: []
          },
          immunity: {
            title: 'Immunity & Resilience',
            description: 'Immunity analysis unavailable',
            score: 50,
            recommendations: ['Monitor relevant health metrics for immunity insights'],
            trends: [],
            correlations: []
          }
        },
        timestamp: new Date(),
        anomalies: [],
        recommendations: {
          daily: ['Ensure the app has access to necessary health data'],
          weekly: ['Review app permissions and data collection settings'],
          longTerm: ['Contact support if this issue persists']
        },
        riskFactors: []
      };
    }
  }, [insightsEngine, state.advancedInsightsAvailable]);

  /**
   * Get information about a specific model
   */
  const getModelInfo = useCallback((modelName: string): any => {
    const model = mlManager.getModel(modelName);
    
    if (!model) {
      return null;
    }
    
    // Get basic info
    const info = model.getInfo();
    
    // Check for enhanced metadata
    if ('getMetadata' in model) {
      const metadata = (model as any).getMetadata();
      return { ...info, metadata };
    }
    
    return info;
  }, [mlManager]);

  /**
   * Dispose of all models
   */
  const disposeAll = useCallback(async (): Promise<void> => {
    try {
      await mlManager.disposeAll();
      
      setState(prev => ({ 
        ...prev, 
        availableModels: [] 
      }));
    } catch (error) {
      console.error('Error disposing models:', error);
    }
  }, [mlManager]);

  // Clean up resources when the component unmounts
  useEffect(() => {
    return () => {
      // Note: we can't use async in the cleanup function
      // so we just call it and ignore the promise
      disposeAll();
    };
  }, [disposeAll]);

  // Initialize automatically on first mount
  useEffect(() => {
    if (!state.isInitialized && !state.isLoading) {
      initializeML().catch(error => {
        console.error('Error in automatic ML initialization:', error);
      });
    }
  }, [state.isInitialized, state.isLoading, initializeML]);

  /**
   * Classify activity using the activity classifier
   */
  const classifyActivity = useCallback(async (
    data: AccelerometerData[]
  ): Promise<ActivityClassification | null> => {
    // Exit early if activity classification is disabled
    if (!ENABLE_ACTIVITY_CLASSIFICATION) {
      console.log('Activity classification is disabled by feature flag');
      return null;
    }
    
    try {
      if (!state.activityClassifierInitialized) {
        console.warn('Activity classifier not initialized');
        return null;
      }
      
      return await activityClassifier.classifyActivity(data);
    } catch (error) {
      console.error('Error classifying activity:', error);
      return null;
    }
  }, [state.activityClassifierInitialized]);

  return {
    ...state,
    initializeML,
    loadModel,
    predict,
    batchPredict,
    extractFeatures,
    generateAdvancedInsights,
    disposeAll,
    getModelInfo,
    classifyActivity
  };
} 