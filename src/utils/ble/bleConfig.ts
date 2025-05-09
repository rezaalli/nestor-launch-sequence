
// BLE Configuration Constants for Nestor wearable device

// Define Nestor BLE service and characteristic UUIDs
export const NESTOR_BLE_SERVICE = '181C';
export const NESTOR_CHARACTERISTICS = {
  VITALS: '2A5F',
  TEMPERATURE: '2A6E',
  BATTERY: '2A19',
  FIRMWARE: '2A26',
  FLASH_LOG: '2ACE'
};

export interface PackedVitals {
  hr: number;         // Heart rate in bpm
  spo2: number;       // SpO2 percentage
  temp: number;       // Temperature in tenths of Celsius (e.g. 367 = 36.7°C)
  battery: number;    // Battery percentage
  motion: number;     // Motion intensity (0-3)
  readiness: number;  // Readiness score (0-100)
  fever: number;      // Fever flag (0 = no fever, 1 = fever detected)
}

export interface BleScanOptions {
  timeout?: number;   // Scan timeout in milliseconds
  allowDuplicates?: boolean;
}
