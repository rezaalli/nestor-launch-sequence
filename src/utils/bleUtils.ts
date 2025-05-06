
// BLE Characteristic Integration for Nestor wearable device
// Custom UUID: 0x2A5F within service UUID 0x181C

interface PackedVitals {
  hr: number;         // Heart rate in bpm
  spo2: number;       // SpO2 percentage
  temp: number;       // Temperature in tenths of Celsius (e.g. 367 = 36.7°C)
  battery: number;    // Battery percentage
  motion: number;     // Motion intensity (0-3)
  readiness: number;  // Readiness score (0-100)
  fever: number;      // Fever flag (0 = no fever, 1 = fever detected)
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

// Mock BLE connection for development - replace with actual BLE implementation
export const connectToDevice = async (): Promise<boolean> => {
  try {
    console.log('Connecting to BLE device...');
    // In a real implementation, this would use Web Bluetooth API
    // navigator.bluetooth.requestDevice({ filters: [{ services: ['181C'] }] })
    
    // Simulate successful connection after a delay
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
  const event = new CustomEvent('nestor-vital-update', { detail: data });
  window.dispatchEvent(event);
  
  // Check for fever condition
  if (data.fever === 1) {
    const feverEvent = new CustomEvent('nestor-fever-alert', { 
      detail: { temperature: data.temp / 10, type: 'high' }
    });
    window.dispatchEvent(feverEvent);
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
  const event = new CustomEvent('nestor-wear-state', { detail: { worn } });
  window.dispatchEvent(event);
};

// Set device name
export const setDeviceName = (name: string): void => {
  deviceName = name;
};

// Get device name
export const getDeviceName = (): string => {
  return deviceName;
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
    const startEvent = new CustomEvent('nestor-flash-upload-start');
    window.dispatchEvent(startEvent);
    
    // Mock flash log upload process
    for (let i = 1; i <= 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      flashLogProgress = i * 10;
      
      // Dispatch progress event
      const progressEvent = new CustomEvent('nestor-flash-upload-progress', { 
        detail: { progress: flashLogProgress } 
      });
      window.dispatchEvent(progressEvent);
      
      // Generate some historical data
      if (i % 2 === 0) {
        const historyCount = Math.floor(Math.random() * 10) + 5;
        const now = Date.now();
        
        for (let j = 0; j < historyCount; j++) {
          const timeOffset = (Math.floor(Math.random() * 60) + 1) * 60000; // Random minutes in the past
          const historyReading = {
            ...generateMockVitalData(),
            timestamp: now - timeOffset - (i * 3600000) // Hours in the past based on iteration
          };
          vitalReadings.push(historyReading);
        }
      }
    }
    
    // Sort readings by timestamp
    vitalReadings.sort((a, b) => a.timestamp - b.timestamp);
    
    // Trim if exceeding max size
    if (vitalReadings.length > MAX_READINGS) {
      vitalReadings = vitalReadings.slice(vitalReadings.length - MAX_READINGS);
    }
    
    // Dispatch event to notify about upload completion
    const completeEvent = new CustomEvent('nestor-flash-upload-complete', {
      detail: { readingCount: vitalReadings.length }
    });
    window.dispatchEvent(completeEvent);
    
    isFlashLogUploading = false;
    flashLogProgress = 100;
    
    return true;
  } catch (error) {
    console.error('Flash log upload failed:', error);
    
    // Dispatch event to notify about upload failure
    const errorEvent = new CustomEvent('nestor-flash-upload-error', {
      detail: { error: 'Upload failed, please try again.' }
    });
    window.dispatchEvent(errorEvent);
    
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
  const dayInMs = 24 * 60 * 60 * 1000;
  
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

// Initialize mock data on module load for development
initializeMockData();

// Create a trigger for flash log upload on reconnection
export const handleReconnection = (): void => {
  // When device reconnects, check if there's flash log data available
  const hasFlashData = Math.random() > 0.3; // 70% chance of having flash data
  
  if (hasFlashData) {
    // Notify that flash data is available
    const flashDataEvent = new CustomEvent('nestor-flash-data-available');
    window.dispatchEvent(flashDataEvent);
  }
};
