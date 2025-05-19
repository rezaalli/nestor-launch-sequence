import * as tf from '@tensorflow/tfjs';

/**
 * ML Error types
 */
export enum MLErrorType {
  INITIALIZATION = 'initialization',
  MODEL_LOADING = 'model_loading',
  MODEL_SAVING = 'model_saving',
  MODEL_TRAINING = 'model_training',
  MODEL_PREDICTION = 'model_prediction',
  DATA_PROCESSING = 'data_processing',
  TENSOR_OPERATION = 'tensor_operation',
  OUT_OF_MEMORY = 'out_of_memory',
  NETWORK = 'network',
  UNKNOWN = 'unknown',
}

/**
 * ML Error interface
 */
export interface MLError {
  type: MLErrorType;
  message: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: Date;
}

/**
 * ML Error Handler Service
 * Provides utilities for handling ML-related errors
 */
export class MLErrorHandler {
  private static instance: MLErrorHandler;
  private errors: MLError[] = [];
  private errorCallbacks: ((error: MLError) => void)[] = [];
  private maxErrorsToKeep = 50;

  private constructor() {
    // Monitor for TensorFlow-specific warnings and errors
    tf.env().set('DEBUG', true);
  }

  /**
   * Get the singleton instance of MLErrorHandler
   */
  public static getInstance(): MLErrorHandler {
    if (!MLErrorHandler.instance) {
      MLErrorHandler.instance = new MLErrorHandler();
    }
    return MLErrorHandler.instance;
  }

  /**
   * Determine the error type based on the error
   */
  private determineErrorType(error: Error): MLErrorType {
    const errorMessage = error.message.toLowerCase();
    const errorStack = error.stack?.toLowerCase() || '';
    
    if (errorMessage.includes('memory') || errorStack.includes('memory')) {
      return MLErrorType.OUT_OF_MEMORY;
    }
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('http')) {
      return MLErrorType.NETWORK;
    }
    
    if (errorMessage.includes('tensor') || errorStack.includes('tensor')) {
      return MLErrorType.TENSOR_OPERATION;
    }
    
    if (errorMessage.includes('load') || errorStack.includes('load')) {
      return MLErrorType.MODEL_LOADING;
    }
    
    if (errorMessage.includes('save') || errorStack.includes('save')) {
      return MLErrorType.MODEL_SAVING;
    }
    
    if (errorMessage.includes('train') || errorStack.includes('train') || errorStack.includes('fit')) {
      return MLErrorType.MODEL_TRAINING;
    }
    
    if (errorMessage.includes('predict') || errorStack.includes('predict')) {
      return MLErrorType.MODEL_PREDICTION;
    }
    
    if (errorMessage.includes('init') || errorStack.includes('init')) {
      return MLErrorType.INITIALIZATION;
    }
    
    if (errorMessage.includes('data') || errorStack.includes('data')) {
      return MLErrorType.DATA_PROCESSING;
    }
    
    return MLErrorType.UNKNOWN;
  }

  /**
   * Handle and log an ML-related error
   */
  public handleError(
    error: Error | string,
    type?: MLErrorType,
    context?: Record<string, any>
  ): MLError {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const errorType = type || this.determineErrorType(errorObj);
    
    const mlError: MLError = {
      type: errorType,
      message: errorObj.message,
      originalError: typeof error === 'string' ? undefined : error,
      context,
      timestamp: new Date(),
    };
    
    // Add to errors array
    this.errors.unshift(mlError);
    
    // Keep only the latest errors
    if (this.errors.length > this.maxErrorsToKeep) {
      this.errors = this.errors.slice(0, this.maxErrorsToKeep);
    }
    
    // Log to console
    console.error(`[ML Error] ${mlError.type}: ${mlError.message}`, context);
    
    // Notify callbacks
    this.notifyErrorCallbacks(mlError);
    
    return mlError;
  }

  /**
   * Register a callback to be notified when an error occurs
   */
  public onError(callback: (error: MLError) => void): () => void {
    this.errorCallbacks.push(callback);
    
    // Return a function to remove the callback
    return () => {
      this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Notify all registered callbacks about an error
   */
  private notifyErrorCallbacks(error: MLError): void {
    this.errorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (callbackError) {
        console.error('Error in ML error callback', callbackError);
      }
    });
  }

  /**
   * Get recent errors
   */
  public getRecentErrors(limit: number = this.maxErrorsToKeep): MLError[] {
    return this.errors.slice(0, limit);
  }

  /**
   * Clear all stored errors
   */
  public clearErrors(): void {
    this.errors = [];
  }

  /**
   * Set the maximum number of errors to keep
   */
  public setMaxErrorsToKeep(count: number): void {
    this.maxErrorsToKeep = count;
    
    // Trim errors if needed
    if (this.errors.length > this.maxErrorsToKeep) {
      this.errors = this.errors.slice(0, this.maxErrorsToKeep);
    }
  }

  /**
   * Wrap a function with error handling
   */
  public wrapWithErrorHandling<T extends (...args: any[]) => any>(
    fn: T,
    errorType?: MLErrorType,
    context?: Record<string, any>
  ): (...args: Parameters<T>) => Promise<ReturnType<T>> {
    return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      try {
        const result = await fn(...args);
        return result;
      } catch (error) {
        this.handleError(error as Error, errorType, {
          ...context,
          functionName: fn.name,
          arguments: args,
        });
        throw error;
      }
    };
  }
}

export default MLErrorHandler.getInstance(); 