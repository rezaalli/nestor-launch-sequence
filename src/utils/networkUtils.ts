/**
 * Network utility functions for Nestor Health app
 */

/**
 * Network utilities for checking connection status and quality
 */
import { useState, useEffect } from 'react';

// Connection check endpoint that returns quickly
const CONNECTION_CHECK_ENDPOINT = 'https://nestor-api.health/api/ping';
// Fallback endpoint (in case the primary endpoint is down)
const FALLBACK_CHECK_ENDPOINT = 'https://www.cloudflare.com/cdn-cgi/trace';
// Test file used for measuring download speed
const SPEED_TEST_FILE = 'https://nestor-cdn.health/static/network-test-100kb.dat';

export interface ConnectionStatus {
  connected: boolean;
  speed?: number;  // in Mbps
  latency?: number; // in ms
  lastChecked: Date;
}

/**
 * Class for handling network connectivity status
 */
class NetworkStatus {
  private status: ConnectionStatus = {
    connected: navigator.onLine,
    lastChecked: new Date()
  };
  
  private listeners: Array<(status: ConnectionStatus) => void> = [];
  
  constructor() {
    // Set up listeners for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }
  
  /**
   * Add a listener for network status changes
   */
  addListener(callback: (status: ConnectionStatus) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }
  
  /**
   * Check the current connection status
   */
  async check(): Promise<ConnectionStatus> {
    // Start with the browser's online status
    const initialStatus = navigator.onLine;
    
    // If browser says we're offline, no need to check further
    if (!initialStatus) {
      this.updateStatus({
        connected: false,
        lastChecked: new Date()
      });
      return this.status;
    }
    
    try {
      // Try an actual API call to confirm connectivity
      const startTime = performance.now();
      const response = await fetch(CONNECTION_CHECK_ENDPOINT, {
        method: 'HEAD',
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
        mode: 'cors',
        // Short timeout
        signal: AbortSignal.timeout(3000)
      });
      
      const endTime = performance.now();
      
      if (response.ok) {
        // Successfully connected
        const latency = endTime - startTime;
        
        // Only measure speed if we need to
        let speed: number | undefined = undefined;
        
        if (this.status.connected === false || !this.status.speed) {
          // We were previously disconnected or don't have a speed measurement,
          // so let's measure speed
          speed = await this.measureConnectionSpeed();
        } else {
          speed = this.status.speed;
        }
        
        this.updateStatus({
          connected: true,
          speed,
          latency,
          lastChecked: new Date()
        });
      } else {
        // Server responded but with an error
        this.updateStatus({
          connected: false,
          lastChecked: new Date()
        });
      }
    } catch (error) {
      // Connection failed, try fallback endpoint
      try {
        const fallbackResponse = await fetch(FALLBACK_CHECK_ENDPOINT, {
          method: 'HEAD',
          cache: 'no-store',
          mode: 'cors',
          signal: AbortSignal.timeout(3000)
        });
        
        if (fallbackResponse.ok) {
          // Fallback connection succeeded
          this.updateStatus({
            connected: true,
            // We don't have accurate speed/latency from fallback
            lastChecked: new Date()
          });
        } else {
          // All connection attempts failed
          this.updateStatus({
            connected: false,
            lastChecked: new Date()
          });
        }
      } catch (fallbackError) {
        // All connection attempts failed
        this.updateStatus({
          connected: false,
          lastChecked: new Date()
        });
      }
    }
    
    return this.status;
  }
  
  /**
   * Measure the connection speed
   */
  private async measureConnectionSpeed(): Promise<number> {
    try {
      const startTime = performance.now();
      const response = await fetch(SPEED_TEST_FILE, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
        signal: AbortSignal.timeout(10000)
      });
      
      if (!response.ok) {
        return 0;
      }
      
      const data = await response.arrayBuffer();
      const endTime = performance.now();
      const duration = (endTime - startTime) / 1000; // in seconds
      const fileSizeInBits = data.byteLength * 8;
      const speedMbps = (fileSizeInBits / duration) / (1024 * 1024); // in Mbps
      
      return parseFloat(speedMbps.toFixed(2));
    } catch (error) {
      console.error('Error measuring connection speed:', error);
      return 0;
    }
  }
  
  /**
   * Update the status and notify listeners
   */
  private updateStatus(newStatus: Partial<ConnectionStatus>) {
    this.status = { ...this.status, ...newStatus };
    
    // Notify listeners
    this.listeners.forEach(listener => {
      listener(this.status);
    });
  }
  
  /**
   * Handle the browser's online event
   */
  private handleOnline = () => {
    // Don't immediately trust the browser's online status
    // Verify with an actual connection check
    this.check();
  };
  
  /**
   * Handle the browser's offline event
   */
  private handleOffline = () => {
    this.updateStatus({
      connected: false,
      lastChecked: new Date()
    });
  };
  
  /**
   * Get the current cached status without performing a check
   */
  getStatus(): ConnectionStatus {
    return this.status;
  }
}

// Singleton instance of NetworkStatus
export const networkStatus = new NetworkStatus();

/**
 * Hook to use network status in React components
 */
export function useNetworkStatus() {
  const [status, setStatus] = useState<ConnectionStatus>(networkStatus.getStatus());
  
  useEffect(() => {
    const unsubscribe = networkStatus.addListener((newStatus) => {
      setStatus(newStatus);
    });
    
    // Check status when component mounts
    networkStatus.check().then(setStatus);
    
    return unsubscribe;
  }, []);
  
  return status;
}

/**
 * Calculate how much data to sync based on connection quality
 */
export function calculateSyncBatchSize(connectionSpeed: number): number {
  if (connectionSpeed >= 5) {
    // Good connection - sync up to 5MB
    return 5 * 1024 * 1024;
  } else if (connectionSpeed >= 1) {
    // Moderate connection - sync up to 1MB
    return 1 * 1024 * 1024;
  } else {
    // Poor connection - sync up to 250KB
    return 250 * 1024;
  }
}

/**
 * Determine if automatic sync should be enabled based on connection
 */
export function shouldEnableAutoSync(status: ConnectionStatus): boolean {
  if (!status.connected) {
    return false;
  }
  
  // If on a very poor connection, maybe don't auto-sync
  if (status.speed !== undefined && status.speed < 0.5) {
    return false;
  }
  
  return true;
}

/**
 * Helper function to get human-readable connection quality
 * @param quality Connection quality (0-3)
 */
export function getConnectionQualityLabel(quality: number): string {
  switch (quality) {
    case 0:
      return 'Poor';
    case 1:
      return 'Fair';
    case 2:
      return 'Good';
    case 3:
      return 'Excellent';
    default:
      return 'Unknown';
  }
}

/**
 * Utility function to get recommended sync settings based on network quality
 * @param quality Connection quality (0-3)
 */
export function getRecommendedSyncSettings(quality: number): {
  compressionEnabled: boolean;
  syncInterval: number; // minutes
  batchSize: number;
} {
  switch (quality) {
    case 0: // Poor
      return {
        compressionEnabled: true,
        syncInterval: 120, // 2 hours
        batchSize: 10
      };
    case 1: // Fair
      return {
        compressionEnabled: true,
        syncInterval: 60, // 1 hour
        batchSize: 25
      };
    case 2: // Good
      return {
        compressionEnabled: true,
        syncInterval: 30, // 30 minutes
        batchSize: 50
      };
    case 3: // Excellent
      return {
        compressionEnabled: false, // Speed over compression
        syncInterval: 15, // 15 minutes
        batchSize: 100
      };
    default:
      return {
        compressionEnabled: true,
        syncInterval: 60,
        batchSize: 25
      };
  }
} 