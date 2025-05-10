
// Mock bleUtils file as a replacement for the removed BLE functionality

/**
 * Mock function to format temperature values
 */
export const formatTemperature = (value: number, unitPreference: 'metric' | 'imperial' = 'imperial') => {
  if (!value) return { value: '0', unit: unitPreference === 'imperial' ? '°F' : '°C' };
  
  // Convert from decimal celsius (367 = 36.7°C)
  const celsius = value / 10;
  
  if (unitPreference === 'imperial') {
    const fahrenheit = (celsius * 9/5) + 32;
    return { value: fahrenheit.toFixed(1), unit: '°F' };
  }
  
  return { value: celsius.toFixed(1), unit: '°C' };
};

/**
 * Mock function to get the last health reading
 */
export const getLastReading = () => {
  return {
    hr: 72, // Heart rate in bpm
    spo2: 98, // Blood oxygen percentage
    temp: 367, // Temperature in tenths of a degree Celsius (36.7°C)
    timestamp: Date.now()
  };
};

/**
 * Mock function to check if the device is being worn
 */
export const isDeviceWorn = () => {
  return true; // Always return true for mock data
};

/**
 * Mock function to check if data export is in progress
 */
export const isFlashLogUploadInProgress = () => {
  return false;
};

/**
 * Mock function to start data export
 */
export const startFlashLogUpload = async () => {
  return true; // Always succeeds in mock implementation
};

/**
 * Mock function to export data as JSON
 */
export const exportDataAsJSON = () => {
  const mockData = {
    user: "Test User",
    data: [
      { type: "heartRate", value: 72, timestamp: Date.now() - 3600000 },
      { type: "spo2", value: 98, timestamp: Date.now() - 7200000 },
      { type: "temperature", value: 36.7, timestamp: Date.now() - 10800000 }
    ]
  };
  return JSON.stringify(mockData, null, 2);
};

/**
 * Mock function to export data as CSV
 */
export const exportDataAsCSV = () => {
  return "timestamp,type,value\n" +
    `${new Date(Date.now() - 3600000).toISOString()},heartRate,72\n` +
    `${new Date(Date.now() - 7200000).toISOString()},spo2,98\n` +
    `${new Date(Date.now() - 10800000).toISOString()},temperature,36.7\n`;
};
