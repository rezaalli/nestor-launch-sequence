import * as tf from '@tensorflow/tfjs';

/**
 * TensorFlow Service for Nestor Health app
 * Provides initialization and basic utilities for TensorFlow.js operations
 */
export class TensorFlowService {
  private static instance: TensorFlowService;
  private initialized: boolean = false;
  private memoryInfo: tf.MemoryInfo | null = null;
  private isBrowser: boolean = typeof window !== 'undefined';
  private initAttempts: number = 0;
  private maxRetries: number = 3;

  private constructor() {}

  /**
   * Get the singleton instance of TensorFlowService
   */
  public static getInstance(): TensorFlowService {
    if (!TensorFlowService.instance) {
      TensorFlowService.instance = new TensorFlowService();
    }
    return TensorFlowService.instance;
  }

  /**
   * Initialize TensorFlow.js with retry capability
   */
  public async initialize(): Promise<boolean> {
    // Skip initialization if not in browser environment
    if (!this.isBrowser) {
      console.log('Skipping TensorFlow.js initialization in server environment');
      return false;
    }
    
    if (this.initialized) {
      console.log('TensorFlow.js already initialized');
      return true;
    }
    
    if (this.initAttempts >= this.maxRetries) {
      console.error(`Failed to initialize TensorFlow.js after ${this.maxRetries} attempts`);
      return false;
    }
    
    this.initAttempts++;
    
    try {
      // Add a delay between retry attempts
      if (this.initAttempts > 1) {
        const delayMs = 1000 * this.initAttempts;
        console.log(`Retrying TensorFlow.js initialization (attempt ${this.initAttempts}) after ${delayMs}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
      
      // Set backend to WebGL if available, fallback to CPU
      await tf.setBackend('webgl');
      
      // Enable debug mode in development
      if (import.meta.env.DEV) {
        tf.enableDebugMode();
      }
      
      this.initialized = true;
      console.log(`TensorFlow.js initialized with backend: ${tf.getBackend()}`);
      
      // Print memory info
      this.memoryInfo = tf.memory();
      console.log('TensorFlow.js memory usage:', this.memoryInfo);
      
      return true;
    } catch (error) {
      console.error(`Failed to initialize TensorFlow.js (attempt ${this.initAttempts}/${this.maxRetries}):`, error);
      
      // Try again with a different backend if WebGL failed
      if (this.initAttempts === 1) {
        try {
          console.log('Attempting to initialize with CPU backend instead...');
          await tf.setBackend('cpu');
          
          this.initialized = true;
          console.log(`TensorFlow.js initialized with fallback backend: ${tf.getBackend()}`);
          
          // Print memory info
          this.memoryInfo = tf.memory();
          console.log('TensorFlow.js memory usage:', this.memoryInfo);
          
          return true;
        } catch (cpuError) {
          console.error('Failed to initialize TensorFlow.js with CPU backend:', cpuError);
        }
      }
      
      // Try again recursively with exponential backoff
      if (this.initAttempts < this.maxRetries) {
        return this.initialize();
      }
      
      return false;
    }
  }

  /**
   * Check if TensorFlow.js is initialized
   */
  public isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get current TensorFlow.js backend
   */
  public getBackend(): string {
    if (!this.isBrowser || !this.initialized) {
      return 'none';
    }
    return tf.getBackend();
  }

  /**
   * Cleanup TensorFlow.js resources
   */
  public dispose(): void {
    if (!this.isBrowser || !this.initialized) {
      return;
    }
    
    try {
      tf.disposeVariables();
      tf.engine().endScope();
      tf.engine().startScope();
      console.log('TensorFlow.js resources disposed');
    } catch (error) {
      console.error('Error disposing TensorFlow.js resources:', error);
    }
  }

  /**
   * Get current memory usage
   */
  public getMemoryUsage(): tf.MemoryInfo {
    if (!this.isBrowser || !this.initialized) {
      return { numBytes: 0, numDataBuffers: 0, numTensors: 0, unreliable: true } as tf.MemoryInfo;
    }
    return tf.memory();
  }
  
  /**
   * Reset the service state - useful for recovery after errors
   */
  public reset(): void {
    if (this.initialized) {
      this.dispose();
    }
    this.initialized = false;
    this.initAttempts = 0;
    this.memoryInfo = null;
    console.log('TensorFlow.js service has been reset');
  }
}

export default TensorFlowService.getInstance(); 