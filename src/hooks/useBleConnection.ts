
import { useState, useEffect } from 'react';
import { 
  scanForDevices,
  getDiscoveredDevices,
  isScanning,
  connectToDeviceById,
  isDeviceConnected,
  disconnectFromDevice,
  getLastReading,
  startFlashLogUpload,
  isFlashLogUploadInProgress,
  getFlashLogUploadProgress,
  getDeviceName
} from '@/utils/bleUtils';
import { PackedVitals } from '@/utils/ble/bleConfig';

export const useBleConnection = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStage, setSyncStage] = useState('');
  const [lastReading, setLastReading] = useState<(PackedVitals & { timestamp: number }) | null>(null);
  const [devices, setDevices] = useState<ReturnType<typeof getDiscoveredDevices>>([]);
  const [scanning, setScanning] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  // Initialize event listeners
  useEffect(() => {
    const handleVitalUpdate = (event: Event) => {
      const vitalData = (event as CustomEvent).detail;
      setLastReading(vitalData);
    };
    
    const handleDevicesDiscovered = (event: Event) => {
      const { devices: discoveredDevices } = (event as CustomEvent).detail;
      setDevices(discoveredDevices);
    };
    
    const handleScanStart = () => {
      setScanning(true);
    };
    
    const handleScanComplete = () => {
      setScanning(false);
    };
    
    const handleConnected = () => {
      setIsConnecting(false);
      setIsConnected(true);
      setConnectionError(null);
    };
    
    const handleDisconnected = () => {
      setIsConnected(false);
    };
    
    const handleConnectionError = (event: Event) => {
      const { error } = (event as CustomEvent).detail;
      setConnectionError(error);
      setIsConnecting(false);
    };
    
    const handleFlashUploadStart = () => {
      setIsSyncing(true);
    };
    
    const handleFlashUploadProgress = (event: Event) => {
      const { progress, stage } = (event as CustomEvent).detail;
      setSyncProgress(progress);
      setSyncStage(stage);
    };
    
    const handleFlashUploadComplete = () => {
      setIsSyncing(false);
      setSyncProgress(100);
    };
    
    const handleFlashUploadError = () => {
      setIsSyncing(false);
    };
    
    // Add event listeners
    window.addEventListener('nestor-vital-update', handleVitalUpdate);
    window.addEventListener('nestor-devices-discovered', handleDevicesDiscovered);
    window.addEventListener('nestor-scan-started', handleScanStart);
    window.addEventListener('nestor-scan-complete', handleScanComplete);
    window.addEventListener('nestor-connected', handleConnected);
    window.addEventListener('nestor-disconnected', handleDisconnected);
    window.addEventListener('nestor-connection-error', handleConnectionError);
    window.addEventListener('nestor-flash-upload-start', handleFlashUploadStart);
    window.addEventListener('nestor-flash-upload-progress', handleFlashUploadProgress);
    window.addEventListener('nestor-flash-upload-complete', handleFlashUploadComplete);
    window.addEventListener('nestor-flash-upload-error', handleFlashUploadError);
    
    // Check initial connection status
    setIsConnected(isDeviceConnected());
    
    // Get last known reading
    const lastKnownReading = getLastReading();
    if (lastKnownReading) {
      setLastReading(lastKnownReading);
    }
    
    return () => {
      // Remove event listeners
      window.removeEventListener('nestor-vital-update', handleVitalUpdate);
      window.removeEventListener('nestor-devices-discovered', handleDevicesDiscovered);
      window.removeEventListener('nestor-scan-started', handleScanStart);
      window.removeEventListener('nestor-scan-complete', handleScanComplete);
      window.removeEventListener('nestor-connected', handleConnected);
      window.removeEventListener('nestor-disconnected', handleDisconnected);
      window.removeEventListener('nestor-connection-error', handleConnectionError);
      window.removeEventListener('nestor-flash-upload-start', handleFlashUploadStart);
      window.removeEventListener('nestor-flash-upload-progress', handleFlashUploadProgress);
      window.removeEventListener('nestor-flash-upload-complete', handleFlashUploadComplete);
      window.removeEventListener('nestor-flash-upload-error', handleFlashUploadError);
    };
  }, []);
  
  // Function to scan for devices
  const scanDevices = async () => {
    setConnectionError(null);
    return scanForDevices();
  };
  
  // Function to connect to a device
  const connectDevice = async (deviceId: string) => {
    setIsConnecting(true);
    return connectToDeviceById(deviceId);
  };
  
  // Function to disconnect
  const disconnectDevice = async () => {
    return disconnectFromDevice();
  };
  
  // Function to start sync
  const syncDeviceData = async () => {
    if (isFlashLogUploadInProgress()) return false;
    return startFlashLogUpload();
  };
  
  return {
    devices,
    scanning,
    isConnecting,
    isConnected,
    isSyncing,
    syncProgress,
    syncStage,
    connectionError,
    lastReading,
    deviceName: getDeviceName(),
    scanDevices,
    connectDevice,
    disconnectDevice,
    syncDeviceData
  };
};
