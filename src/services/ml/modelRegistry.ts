import * as tf from '@tensorflow/tfjs';
import tfService from './tfService';
import { v4 as uuidv4 } from 'uuid';
import localforage from 'localforage';

/**
 * Model metadata interface
 */
export interface ModelMetadata {
  id: string;
  name: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  description?: string;
  metrics?: Record<string, number>;
  tags?: string[];
}

/**
 * Registered model interface
 */
export interface RegisteredModel {
  metadata: ModelMetadata;
  model?: tf.LayersModel;
  isLoaded: boolean;
}

/**
 * Model Registry Service
 * Manages model registration, versioning, and storage
 */
export class ModelRegistryService {
  private static instance: ModelRegistryService;
  private models: Map<string, RegisteredModel> = new Map();
  private storageKey = 'nestor-ml-models';
  private modelStore: LocalForage;

  private constructor() {
    // Initialize localForage instance for model storage
    this.modelStore = localforage.createInstance({
      name: 'nestorMLStorage',
      storeName: 'models'
    });
  }

  /**
   * Get the singleton instance of ModelRegistryService
   */
  public static getInstance(): ModelRegistryService {
    if (!ModelRegistryService.instance) {
      ModelRegistryService.instance = new ModelRegistryService();
    }
    return ModelRegistryService.instance;
  }

  /**
   * Initialize the model registry
   */
  public async initialize(): Promise<void> {
    try {
      // Ensure TensorFlow.js is initialized
      if (!tfService.isInitialized()) {
        await tfService.initialize();
      }
      
      // Load model registry from storage
      await this.loadRegistry();
      console.log(`Model registry initialized with ${this.models.size} models`);
    } catch (error) {
      console.error('Failed to initialize model registry', error);
      throw error;
    }
  }

  /**
   * Load the model registry from storage
   */
  private async loadRegistry(): Promise<void> {
    try {
      const metadataList = await this.modelStore.getItem<ModelMetadata[]>(this.storageKey) || [];
      
      // Clear existing models
      this.models.clear();
      
      // Register models from metadata
      for (const metadata of metadataList) {
        this.models.set(metadata.id, {
          metadata,
          isLoaded: false
        });
      }
    } catch (error) {
      console.error('Failed to load model registry from storage', error);
      throw error;
    }
  }

  /**
   * Save the model registry to storage
   */
  private async saveRegistry(): Promise<void> {
    try {
      const metadataList = Array.from(this.models.values()).map(model => model.metadata);
      await this.modelStore.setItem(this.storageKey, metadataList);
    } catch (error) {
      console.error('Failed to save model registry to storage', error);
      throw error;
    }
  }

  /**
   * Register a new model
   */
  public async registerModel(
    model: tf.LayersModel,
    name: string,
    version: string,
    description?: string,
    tags?: string[]
  ): Promise<RegisteredModel> {
    try {
      const id = uuidv4();
      const now = new Date();
      
      const metadata: ModelMetadata = {
        id,
        name,
        version,
        createdAt: now,
        updatedAt: now,
        description,
        tags
      };
      
      const registeredModel: RegisteredModel = {
        metadata,
        model,
        isLoaded: true
      };
      
      // Save to registry
      this.models.set(id, registeredModel);
      
      // Save model to storage
      const modelPath = `indexeddb://${name}-${version}`;
      await model.save(modelPath);
      
      // Save registry
      await this.saveRegistry();
      
      console.log(`Model ${name} (v${version}) registered with ID: ${id}`);
      
      return registeredModel;
    } catch (error) {
      console.error('Failed to register model', error);
      throw error;
    }
  }

  /**
   * Get a registered model by ID
   */
  public async getModel(id: string): Promise<RegisteredModel | null> {
    const registeredModel = this.models.get(id);
    
    if (!registeredModel) {
      return null;
    }
    
    // Load model if not already loaded
    if (!registeredModel.isLoaded) {
      await this.loadModel(id);
    }
    
    return this.models.get(id) || null;
  }

  /**
   * Load a model from storage
   */
  public async loadModel(id: string): Promise<tf.LayersModel | null> {
    const registeredModel = this.models.get(id);
    
    if (!registeredModel) {
      console.error(`Model with ID ${id} not found`);
      return null;
    }
    
    try {
      if (!registeredModel.isLoaded) {
        const { name, version } = registeredModel.metadata;
        const modelPath = `indexeddb://${name}-${version}`;
        
        const model = await tf.loadLayersModel(modelPath);
        
        // Update registry
        this.models.set(id, {
          ...registeredModel,
          model,
          isLoaded: true
        });
      }
      
      return registeredModel.model || null;
    } catch (error) {
      console.error(`Failed to load model with ID ${id}`, error);
      return null;
    }
  }

  /**
   * Update model metadata
   */
  public async updateModelMetadata(
    id: string,
    updates: Partial<Omit<ModelMetadata, 'id' | 'createdAt'>>
  ): Promise<RegisteredModel | null> {
    const registeredModel = this.models.get(id);
    
    if (!registeredModel) {
      console.error(`Model with ID ${id} not found`);
      return null;
    }
    
    try {
      const updatedMetadata = {
        ...registeredModel.metadata,
        ...updates,
        updatedAt: new Date()
      };
      
      // Update registry
      this.models.set(id, {
        ...registeredModel,
        metadata: updatedMetadata
      });
      
      // Save registry
      await this.saveRegistry();
      
      return this.models.get(id) || null;
    } catch (error) {
      console.error(`Failed to update metadata for model with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * Delete a model
   */
  public async deleteModel(id: string): Promise<boolean> {
    const registeredModel = this.models.get(id);
    
    if (!registeredModel) {
      console.error(`Model with ID ${id} not found`);
      return false;
    }
    
    try {
      const { name, version } = registeredModel.metadata;
      const modelPath = `indexeddb://${name}-${version}`;
      
      // Delete from IndexedDB
      await tf.io.removeModel(modelPath);
      
      // Delete from registry
      this.models.delete(id);
      
      // Save registry
      await this.saveRegistry();
      
      console.log(`Model ${name} (v${version}) deleted`);
      
      return true;
    } catch (error) {
      console.error(`Failed to delete model with ID ${id}`, error);
      return false;
    }
  }

  /**
   * List all registered models
   */
  public listModels(): ModelMetadata[] {
    return Array.from(this.models.values()).map(model => model.metadata);
  }

  /**
   * Find models by name
   */
  public findModelsByName(name: string): ModelMetadata[] {
    return Array.from(this.models.values())
      .filter(model => model.metadata.name === name)
      .map(model => model.metadata);
  }

  /**
   * Find the latest version of a model by name
   */
  public findLatestModelVersion(name: string): ModelMetadata | null {
    const models = this.findModelsByName(name);
    
    if (models.length === 0) {
      return null;
    }
    
    // Sort by version (assuming semantic versioning)
    return models.sort((a, b) => {
      // Simple version comparison, can be improved for semantic versioning
      return b.version.localeCompare(a.version, undefined, { numeric: true });
    })[0];
  }
}

export default ModelRegistryService.getInstance(); 