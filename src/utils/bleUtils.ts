// BLE Characteristic Integration for Nestor wearable device
// Custom UUID: 0x2A5F within service UUID 0x181C

// Define Nestor BLE service and characteristic UUIDs
const NESTOR_BLE_SERVICE = '181C';
const NESTOR_CHARACTERISTICS = {
  VITALS: '2A5F',
  TEMPERATURE: '2A6E',
  BATTERY: '2A19',
  FIRMWARE: '2A26',
  FLASH_LOG: '2ACE'
};

interface PackedVitals {
  hr: number;         // Heart rate in bpm
  spo2: number;       // SpO2 percentage
  temp: number;       // Temperature in tenths of Celsius (e.g. 367 = 36.7°C)
  battery: number;    // Battery percentage
  motion: number;     // Motion intensity (0-3)
  readiness: number;  // Readiness score (0-100)
  fever: number;      // Fever flag (0 = no fever, 1 = fever detected)
}

interface BleScanOptions {
  timeout?: number;   // Scan timeout in milliseconds
  allowDuplicates?: boolean;
}

// Buffer to store the last 7 days of data (assuming readings every 5 seconds)
// 12 readings per minute * 60 minutes * 24 hours * 7 days = 120,960 maximum readings
// We'll store a more reasonable amount for performance
const MAX_READINGS = 2016; // 7 days of readings at 1 reading per 5 minutes
let vitalReadings: (PackedVitals & { timestamp: number })[] = [];
let lastReading: PackedVitals | null = null;
let isConnected = false;
let isWorn = true; // Assume worn by default until notified otherwise
let deviceName = 'Nestor Device';
let isFlashLogUploading = false;
let flashLogProgress = 0;
let isScanningDevices = false;
let discoveredDevices: { id: string, name: string, rssi: number, lastSeen: number }[] = [];
let reconnectionAttempts = 0;
const MAX_RECONNECTION_ATTEMPTS = 5;
let connectionErrorMessage = '';
let lastErrorTimestamp = 0;

// Event dispatcher for BLE events
const dispatchBleEvent = (eventName: string, detail: any = {}) => {
  const event = new CustomEvent(eventName, { detail });
  window.dispatchEvent(event);
};

// Check if Web Bluetooth is available
export const isBleAvailable = (): boolean => {
  return 'bluetooth' in navigator;
};

// Request Bluetooth permissions
export const requestBlePermissions = async (): Promise<boolean> => {
  try {
    // Simulating permission request
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  } catch (error) {
    console.error('Failed to get Bluetooth permissions:', error);
    return false;
  }
};

// Scan for nearby BLE devices
export const scanForDevices = async (options: BleScanOptions = {}): Promise<boolean> => {
  if (isScanningDevices) return false;
  
  try {
    console.log('Starting BLE scan...');
    isScanningDevices = true;
    discoveredDevices = [];
    
    // Dispatch event to notify scan started
    dispatchBleEvent('nestor-scan-started');
    
    // In a real implementation, this would use Web Bluetooth API
    // navigator.bluetooth.requestDevice({ filters: [{ services: [NESTOR_BLE_SERVICE] }] })
    
    // Simulate finding devices
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Add mock discovered devices with simulated signal strength
    discoveredDevices.push({
      id: 'nestor-001',
      name: 'Nestor N-100',
      rssi: -65, // Stronger signal (closer)
      lastSeen: Date.now()
    });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    discoveredDevices.push({
      id: 'nestor-002',
      name: 'Nestor N-200',
      rssi: -85, // Weaker signal (further away)
      lastSeen: Date.now()
    });
    
    // Dispatch event with discovered devices
    dispatchBleEvent('nestor-devices-discovered', { devices: discoveredDevices });
    
    // Simulate scan completion
    setTimeout(() => {
      isScanningDevices = false;
      dispatchBleEvent('nestor-scan-complete', { deviceCount: discoveredDevices.length });
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('Scan failed:', error);
    isScanningDevices = false;
    dispatchBleEvent('nestor-scan-error', { error: 'Failed to scan for devices' });
    return false;
  }
};

// Get discovered devices
export const getDiscoveredDevices = () => {
  return [...discoveredDevices];
};

// Is currently scanning
export const isScanning = (): boolean => {
  return isScanningDevices;
};

// Connect to a specific device by ID
export const connectToDeviceById = async (deviceId: string): Promise<boolean> => {
  try {
    console.log(`Connecting to device ${deviceId}...`);
    
    // Dispatch event to notify connection attempt
    dispatchBleEvent('nestor-connecting', { deviceId });
    
    // Find device in discovered devices list
    const device = discoveredDevices.find(d => d.id === deviceId);
    if (!device) {
      throw new Error('Device not found');
    }
    
    // Simulate connection process with a delay based on signal strength
    // Weaker signal takes longer to connect
    const connectionDelay = Math.max(1000, Math.min(3000, Math.abs(device.rssi) * 20));
    await new Promise(resolve => setTimeout(resolve, connectionDelay));
    
    // 90% success rate for good signal, 60% for weak signal
    const connectionSuccessRate = device.rssi > -75 ? 0.9 : 0.6;
    
    if (Math.random() <= connectionSuccessRate) {
      isConnected = true;
      deviceName = device.name;
      reconnectionAttempts = 0;
      
      // Start data polling
      startDataPolling();
      
      // Dispatch connected event
      dispatchBleEvent('nestor-connected', { deviceId, deviceName });
      return true;
    } else {
      // Simulate connection failure
      throw new Error('Connection failed');
    }
  } catch (error) {
    console.error(`Failed to connect to device ${deviceId}:`, error);
    connectionErrorMessage = String(error);
    lastErrorTimestamp = Date.now();
    dispatchBleEvent('nestor-connection-error', { 
      deviceId, 
      error: connectionErrorMessage
    });
    return false;
  }
};

// Connect to device (legacy function for backward compatibility)
export const connectToDevice = async (): Promise<boolean> => {
  try {
    console.log('Connecting to BLE device...');
    
    // If we have discovered devices, try connecting to the first one
    if (discoveredDevices.length > 0) {
      return connectToDeviceById(discoveredDevices[0].id);
    }
    
    // Otherwise, simulate connecting to a default device
    await new Promise(resolve => setTimeout(resolve, 1000));
    isConnected = true;
    
    // Start polling for data
    startDataPolling();
    
    return true;
  } catch (error) {
    console.error('Failed to connect to device:', error);
    isConnected = false;
    return false;
  }
};

export const disconnectFromDevice = (): void => {
  console.log('Disconnecting from BLE device...');
  isConnected = false;
  // Clear any polling intervals
  stopDataPolling();
  
  // Dispatch disconnected event
  dispatchBleEvent('nestor-disconnected');
};

let pollingInterval: number | null = null;

const startDataPolling = (): void => {
  if (pollingInterval) return; // Already polling
  
  pollingInterval = window.setInterval(() => {
    if (!isConnected) {
      stopDataPolling();
      return;
    }
    
    // If device is not worn, we don't get new readings
    if (!isWorn) return;
    
    // Mock data - in a real implementation, this would come from the BLE characteristic
    const mockData = generateMockVitalData();
    processVitalData(mockData);
    
  }, 5000); // Poll every 5 seconds
};

const stopDataPolling = (): void => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
};

const generateMockVitalData = (): PackedVitals => {
  // Generate realistic mock data
  const hr = Math.floor(Math.random() * 20) + 60; // 60-80 bpm
  const spo2 = Math.floor(Math.random() * 3) + 96; // 96-99%
  const temp = 367 + Math.floor(Math.random() * 10) - 5; // 36.2-37.2°C
  const battery = Math.max(0, lastReading?.battery ?? 92 - Math.floor(Math.random() * 2)); // Slowly decreasing
  const motion = Math.floor(Math.random() * 4); // 0-3
  const readiness = Math.floor(Math.random() * 20) + 70; // 70-90
  const fever = temp > 378 ? 1 : 0; // Fever if above 37.8°C
  
  return { hr, spo2, temp, battery, motion, readiness, fever };
};

const processVitalData = (data: PackedVitals): void => {
  // Process incoming data from the device
  lastReading = data;
  
  // Add to readings history with timestamp
  const newReading = {
    ...data,
    timestamp: Date.now()
  };
  
  vitalReadings.push(newReading);
  
  // Trim if exceeding max size
  if (vitalReadings.length > MAX_READINGS) {
    vitalReadings = vitalReadings.slice(vitalReadings.length - MAX_READINGS);
  }
  
  // Dispatch event for components to listen to
  dispatchBleEvent('nestor-vital-update', { ...data });
  
  // Check for fever condition
  if (data.fever === 1) {
    dispatchBleEvent('nestor-fever-alert', { 
      temperature: data.temp / 10, 
      type: 'high' 
    });
  }
};

// Get the last reading
export const getLastReading = (): (PackedVitals & { timestamp: number }) | null => {
  if (vitalReadings.length === 0) return null;
  return vitalReadings[vitalReadings.length - 1];
};

// Get readings for a time period
export const getReadings = (days: number = 7): (PackedVitals & { timestamp: number })[] => {
  const cutoffTime = Date.now() - (days * 24 * 60 * 60 * 1000);
  return vitalReadings.filter(reading => reading.timestamp >= cutoffTime);
};

// Check if device is connected
export const isDeviceConnected = (): boolean => {
  return isConnected;
};

// Check if device is being worn
export const isDeviceWorn = (): boolean => {
  return isWorn;
};

// Set device worn state
export const setDeviceWorn = (worn: boolean): void => {
  isWorn = worn;
  
  // Dispatch event for components to react to wear state change
  dispatchBleEvent('nestor-wear-state', { worn });
};

// Set device name
export const setDeviceName = (name: string): void => {
  deviceName = name;
  dispatchBleEvent('nestor-device-renamed', { name });
};

// Get device name
export const getDeviceName = (): string => {
  return deviceName;
};

// Get the signal strength description based on RSSI value
export const getSignalStrengthFromRssi = (rssi: number): 'weak' | 'medium' | 'strong' => {
  if (rssi >= -70) return 'strong';
  if (rssi >= -85) return 'medium';
  return 'weak';
};

// Format temperature for display based on unit preference
export const formatTemperature = (tempInTenthsCelsius: number, unitPreference: 'metric' | 'imperial'): { value: string, unit: string } => {
  const celsius = tempInTenthsCelsius / 10;
  
  if (unitPreference === 'imperial') {
    const fahrenheit = (celsius * 9/5) + 32;
    return { value: fahrenheit.toFixed(1), unit: '°F' };
  }
  return { value: celsius.toFixed(1), unit: '°C' };
};

// NEW: Begin Flash Log Upload
export const startFlashLogUpload = async (): Promise<boolean> => {
  if (isFlashLogUploading) return false;
  
  try {
    isFlashLogUploading = true;
    flashLogProgress = 0;
    
    // Dispatch event to notify about upload start
    dispatchBleEvent('nestor-flash-upload-start');
    
    // Mock flash log upload process with more realistic encryption and verification stages
    const stages = [
      { name: 'Initializing secure connection', progress: 10 },
      { name: 'Authenticating device', progress: 20 },
      { name: 'Requesting log data', progress: 30 },
      { name: 'Decrypting data packets', progress: 50 },
      { name: 'Verifying data integrity', progress: 70 },
      { name: 'Processing historical records', progress: 85 },
      { name: 'Finalizing upload', progress: 95 }
    ];
    
    // Process each stage with realistic delays
    for (const stage of stages) {
      await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
      flashLogProgress = stage.progress;
      
      // Dispatch progress event with stage information
      dispatchBleEvent('nestor-flash-upload-progress', { 
        progress: flashLogProgress,
        stage: stage.name
      });
      
      // Generate some historical data
      if (stage.progress > 50) {
        const historyCount = Math.floor(Math.random() * 10) + 5;
        const now = Date.now();
        
        for (let j = 0; j < historyCount; j++) {
          const timeOffset = (Math.floor(Math.random() * 60) + 1) * 60000; // Random minutes in the past
          const historyReading = {
            ...generateMockVitalData(),
            timestamp: now - timeOffset - (stage.progress * 3600) // Hours in the past based on stage
          };
          vitalReadings.push(historyReading);
        }
      }
    }
    
    // Complete the upload
    await new Promise(resolve => setTimeout(resolve, 500));
    flashLogProgress = 100;
    
    // Sort readings by timestamp
    vitalReadings.sort((a, b) => a.timestamp - b.timestamp);
    
    // Trim if exceeding max size
    if (vitalReadings.length > MAX_READINGS) {
      vitalReadings = vitalReadings.slice(vitalReadings.length - MAX_READINGS);
    }
    
    // Dispatch event to notify about upload completion
    dispatchBleEvent('nestor-flash-upload-complete', {
      readingCount: vitalReadings.length
    });
    
    isFlashLogUploading = false;
    
    return true;
  } catch (error) {
    console.error('Flash log upload failed:', error);
    
    // Dispatch event to notify about upload failure
    dispatchBleEvent('nestor-flash-upload-error', {
      error: 'Upload failed, please try again.'
    });
    
    isFlashLogUploading = false;
    return false;
  }
};

// Check if flash log upload is in progress
export const isFlashLogUploadInProgress = (): boolean => {
  return isFlashLogUploading;
};

// Get flash log upload progress (0-100)
export const getFlashLogUploadProgress = (): number => {
  return flashLogProgress;
};

// Export data as JSON
export const exportDataAsJSON = (): string => {
  return JSON.stringify(vitalReadings);
};

// Export data as CSV
export const exportDataAsCSV = (): string => {
  if (vitalReadings.length === 0) return '';
  
  const headers = ['timestamp', 'hr', 'spo2', 'temp', 'battery', 'motion', 'readiness', 'fever'];
  let csv = headers.join(',') + '\n';
  
  vitalReadings.forEach(reading => {
    const row = [
      new Date(reading.timestamp).toISOString(),
      reading.hr,
      reading.spo2,
      reading.temp / 10, // Convert to actual Celsius
      reading.battery,
      reading.motion,
      reading.readiness,
      reading.fever
    ].join(',');
    csv += row + '\n';
  });
  
  return csv;
};

// Initialize mock data for development
export const initializeMockData = (): void => {
  const now = Date.now();
  
  // Generate 7 days of mock data at 1-hour intervals
  for (let i = 0; i < 7 * 24; i++) {
    const mockData = generateMockVitalData();
    const timestamp = now - ((7 * 24 - i) * 60 * 60 * 1000); // Going backwards from 7 days ago
    
    vitalReadings.push({
      ...mockData,
      timestamp
    });
  }
};

// Create a trigger for flash log upload on reconnection
export const handleReconnection = (): void => {
  // Increment reconnection attempts
  reconnectionAttempts++;
  
  // If too many reconnection attempts, stop trying
  if (reconnectionAttempts > MAX_RECONNECTION_ATTEMPTS) {
    dispatchBleEvent('nestor-reconnection-failed', {
      attempts: reconnectionAttempts,
      message: 'Maximum reconnection attempts reached'
    });
    return;
  }
  
  // When device reconnects, check if there's flash log data available
  const hasFlashData = Math.random() > 0.3; // 70% chance of having flash data
  
  if (hasFlashData) {
    // Notify that flash data is available
    dispatchBleEvent('nestor-flash-data-available');
  }
};

// Get last connection error
export const getLastConnectionError = (): { message: string, timestamp: number } => {
  return {
    message: connectionErrorMessage,
    timestamp: lastErrorTimestamp
  };
};

// Check firmware version and if update is available
export const checkFirmwareUpdate = async (): Promise<{ currentVersion: string, updateAvailable: boolean, latestVersion: string }> => {
  // Simulate checking for firmware updates
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const currentVersion = '1.2.3';
  const latestVersion = Math.random() > 0.7 ? '1.2.4' : '1.2.3';
  
  return {
    currentVersion,
    updateAvailable: latestVersion !== currentVersion,
    latestVersion
  };
};

// Initialize mock data on module load for development
initializeMockData();
