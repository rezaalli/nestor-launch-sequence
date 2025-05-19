/**
 * Device Management Hook
 * Provides functionality for managing Nestor devices
 */

import { useState, useEffect, useCallback } from 'react';
import { BluetoothDeviceService, NestorDeviceInfo } from '@/services/bluetooth/deviceService';
import { SyncService, SyncResult } from '@/services/syncService';
import { repositories } from '@/lib/database/repositories';
import { Device } from '@/lib/database/schema';

export interface UseDeviceManagementResult {
  // Devices
  devices: Device[];
  activeDevice: Device | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  refreshDevices: () => Promise<void>;
  scanForDevices: () => Promise<NestorDeviceInfo[]>;
  connectToDevice: (deviceId: string) => Promise<boolean>;
  disconnectDevice: () => Promise<boolean>;
  syncDevice: (deviceId: string) => Promise<SyncResult>;
  syncAllDevices: () => Promise<SyncResult[]>;
  setActiveDevice: (deviceId: string) => Promise<boolean>;
  registerDevice: (device: NestorDeviceInfo, watchName: string) => Promise<Device | null>;
  removeDevice: (deviceId: string) => Promise<boolean>;
  
  // Scanning state
  isScanning: boolean;
  scanResults: NestorDeviceInfo[];
  
  // Connection state
  isConnecting: boolean;
  isConnected: boolean;
  connectedDeviceId: string | null;
  
  // Sync state
  isSyncing: boolean;
  lastSyncResults: SyncResult[];
}

export function useDeviceManagement(): UseDeviceManagementResult {
  // Initialize services
  const deviceService = new BluetoothDeviceService(repositories.device);
  const syncService = new SyncService(deviceService, repositories);
  
  // State
  const [devices, setDevices] = useState<Device[]>([]);
  const [activeDevice, setActiveDeviceState] = useState<Device | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Scanning state
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<NestorDeviceInfo[]>([]);
  
  // Connection state
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [connectedDeviceId, setConnectedDeviceId] = useState<string | null>(null);
  
  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncResults, setLastSyncResults] = useState<SyncResult[]>([]);
  
  /**
   * Load devices from database
   */
  const loadDevices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get all devices
      const allDevices = await repositories.device.getAllDevices();
      setDevices(allDevices);
      
      // Get active device
      const active = await repositories.device.getActiveDevice();
      setActiveDeviceState(active);
      
      setIsLoading(false);
    } catch (err) {
      setError((err as Error).message);
      setIsLoading(false);
    }
  }, []);
  
  /**
   * Refresh devices
   */
  const refreshDevices = useCallback(async () => {
    await loadDevices();
  }, [loadDevices]);
  
  /**
   * Scan for Nestor devices
   */
  const scanForDevices = useCallback(async (): Promise<NestorDeviceInfo[]> => {
    try {
      setIsScanning(true);
      setScanResults([]);
      
      // Initialize Bluetooth if needed
      await deviceService.initialize();
      
      // Scan for devices
      const results = await deviceService.scanForDevices();
      setScanResults(results);
      setIsScanning(false);
      
      return results;
    } catch (err) {
      setError((err as Error).message);
      setIsScanning(false);
      return [];
    }
  }, [deviceService]);
  
  /**
   * Connect to a device
   */
  const connectToDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      setIsConnecting(true);
      setIsConnected(false);
      setConnectedDeviceId(null);
      
      const connected = await deviceService.connectToDevice(deviceId);
      
      setIsConnecting(false);
      setIsConnected(connected);
      
      if (connected) {
        setConnectedDeviceId(deviceId);
      }
      
      return connected;
    } catch (err) {
      setError((err as Error).message);
      setIsConnecting(false);
      setIsConnected(false);
      return false;
    }
  }, [deviceService]);
  
  /**
   * Disconnect from device
   */
  const disconnectDevice = useCallback(async (): Promise<boolean> => {
    try {
      const disconnected = await deviceService.disconnect();
      
      if (disconnected) {
        setIsConnected(false);
        setConnectedDeviceId(null);
      }
      
      return disconnected;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }, [deviceService]);
  
  /**
   * Sync data from a device
   */
  const syncDevice = useCallback(async (deviceId: string): Promise<SyncResult> => {
    try {
      setIsSyncing(true);
      
      const result = await syncService.syncFromDevice(deviceId);
      
      setIsSyncing(false);
      setLastSyncResults([result]);
      
      // Refresh devices to get updated last sync time
      await refreshDevices();
      
      return result;
    } catch (err) {
      setError((err as Error).message);
      setIsSyncing(false);
      
      return {
        success: false,
        deviceId,
        dataPoints: 0,
        batteryLevel: 0,
        errors: [(err as Error).message]
      };
    }
  }, [syncService, refreshDevices]);
  
  /**
   * Sync all devices
   */
  const syncAllDevices = useCallback(async (): Promise<SyncResult[]> => {
    try {
      setIsSyncing(true);
      
      const results = await syncService.syncAllDevices();
      
      setIsSyncing(false);
      setLastSyncResults(results);
      
      // Refresh devices to get updated last sync time
      await refreshDevices();
      
      return results;
    } catch (err) {
      setError((err as Error).message);
      setIsSyncing(false);
      return [];
    }
  }, [syncService, refreshDevices]);
  
  /**
   * Set active device
   */
  const setActiveDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      const success = await repositories.device.setActiveDevice(deviceId);
      
      if (success) {
        // Refresh devices to get updated active device
        await refreshDevices();
      }
      
      return success;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }, [refreshDevices]);
  
  /**
   * Register a new device
   */
  const registerDevice = useCallback(async (deviceInfo: NestorDeviceInfo, watchName: string): Promise<Device | null> => {
    try {
      // Start with just a simple device registration
      const device = await repositories.device.registerDevice({
        device_name: deviceInfo.name,
        device_type: 'Nestor Wearable',
        firmware_version: deviceInfo.firmwareVersion || '1.0.0',
        last_sync: new Date().toISOString(),
        battery_level: deviceInfo.batteryLevel || 100,
        is_active: devices.length === 0, // Make active if it's the first device
        associated_watch: watchName,
        mac_address: deviceInfo.deviceId
      });
      
      // Refresh devices after registration
      await refreshDevices();
      
      return device;
    } catch (err) {
      setError((err as Error).message);
      return null;
    }
  }, [devices.length, refreshDevices]);
  
  /**
   * Remove a device
   */
  const removeDevice = useCallback(async (deviceId: string): Promise<boolean> => {
    try {
      const removed = await repositories.device.removeDevice(deviceId);
      
      if (removed) {
        // Refresh devices after removal
        await refreshDevices();
      }
      
      return removed;
    } catch (err) {
      setError((err as Error).message);
      return false;
    }
  }, [refreshDevices]);
  
  // Initial load
  useEffect(() => {
    loadDevices();
    // Initialize Bluetooth
    deviceService.initialize().catch(err => {
      setError(`Failed to initialize Bluetooth: ${err.message}`);
    });
  }, [loadDevices, deviceService]);
  
  return {
    // Devices
    devices,
    activeDevice,
    isLoading,
    error,
    
    // Actions
    refreshDevices,
    scanForDevices,
    connectToDevice,
    disconnectDevice,
    syncDevice,
    syncAllDevices,
    setActiveDevice,
    registerDevice,
    removeDevice,
    
    // Scanning state
    isScanning,
    scanResults,
    
    // Connection state
    isConnecting,
    isConnected,
    connectedDeviceId,
    
    // Sync state
    isSyncing,
    lastSyncResults
  };
} 