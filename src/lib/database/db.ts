/**
 * Nestor Health local database
 * This file handles initialization and database operations
 * using localforage (IndexedDB wrapper) for efficient local-first storage
 */

import localforage from 'localforage';
import { NestorDBSchema } from './schema';

// Define store names for different data types
const STORES = {
  DEVICES: 'devices',
  BIOMETRIC_DATA: 'biometric_data',
  ASSESSMENTS: 'assessments',
  NUTRITION_LOGS: 'nutrition_logs',
  MEALS: 'meals',
  LIFESTYLE_LOGS: 'lifestyle_logs',
  HAPTIC_SETTINGS: 'haptic_settings',
  NOTIFICATIONS: 'notifications',
  META: 'meta_data'
};

// Database version for migration tracking
const DB_VERSION = 1;

/**
 * Initialize all the stores for our database
 */
export async function initializeDatabase(): Promise<boolean> {
  try {
    // Configure the main database
    localforage.config({
      name: 'nestor_health',
      description: 'Nestor Health App Database',
      version: DB_VERSION
    });

    // Initialize each store
    await Promise.all(Object.values(STORES).map(storeName => {
      const store = localforage.createInstance({
        name: 'nestor_health',
        storeName
      });
      return store.ready();
    }));

    // Store database version information
    const metaStore = getStore(STORES.META);
    await metaStore.setItem('db_version', DB_VERSION);

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

/**
 * Get a specific store by name
 */
export function getStore(storeName: string): LocalForage {
  return localforage.createInstance({
    name: 'nestor_health',
    storeName
  });
}

/**
 * Class for handling basic CRUD operations on any store
 */
export class DataStore<T extends { id: string }> {
  private store: LocalForage;

  constructor(storeName: string) {
    this.store = getStore(storeName);
  }

  /**
   * Save a single item
   */
  async saveItem(item: T): Promise<T> {
    await this.store.setItem(item.id, item);
    return item;
  }

  /**
   * Save multiple items
   */
  async saveItems(items: T[]): Promise<T[]> {
    await Promise.all(
      items.map(item => this.store.setItem(item.id, item))
    );
    return items;
  }

  /**
   * Get a single item by ID
   */
  async getItem(id: string): Promise<T | null> {
    return this.store.getItem<T>(id);
  }

  /**
   * Get all items in the store
   */
  async getAllItems(): Promise<T[]> {
    const items: T[] = [];
    await this.store.iterate<T, void>((value) => {
      items.push(value);
    });
    return items;
  }

  /**
   * Update a single item
   */
  async updateItem(id: string, updates: Partial<T>): Promise<T | null> {
    const item = await this.getItem(id);
    if (!item) return null;

    const updatedItem = { ...item, ...updates } as T;
    await this.store.setItem(id, updatedItem);
    return updatedItem;
  }

  /**
   * Delete a single item
   */
  async deleteItem(id: string): Promise<boolean> {
    await this.store.removeItem(id);
    return true;
  }

  /**
   * Delete all items in the store
   */
  async clearStore(): Promise<boolean> {
    await this.store.clear();
    return true;
  }

  /**
   * Query items based on a filter function
   */
  async query(filterFn: (item: T) => boolean): Promise<T[]> {
    const results: T[] = [];
    await this.store.iterate<T, void>((value) => {
      if (filterFn(value)) {
        results.push(value);
      }
    });
    return results;
  }
}

/**
 * Export store names for use in repositories
 */
export { STORES }; 