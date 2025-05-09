
// Main BLE utilities export file
// This file exports all the BLE utilities functions for use in the app

// Re-export everything from the individual modules
export * from './bleConfig';
export * from './bleScanning';
// Fix: Resolve the ambiguity by importing and re-exporting with explicit names
import * as ConnectionUtils from './bleConnection';
export { ConnectionUtils };
export * from './bleDataMonitoring';
export * from './bleFlashLog';
export * from './bleEvents';

// Initialize mock data for development when real device is not available
import { dispatchBleEvent } from './bleEvents';

// Function to initialize mock data when a real device is not connected
export const initializeMockDataIfNeeded = (): void => {
  // Check if running in a development environment
  if (process.env.NODE_ENV === 'development') {
    console.log('Development environment detected, initializing mock BLE data');
    
    // Generate some mock vitals data for testing
    const generateMockVital = (hour: number) => {
      const now = new Date();
      now.setHours(now.getHours() - hour);
      
      // Generate realistic mock data
      const hr = Math.floor(Math.random() * 20) + 60; // 60-80 bpm
      const spo2 = Math.floor(Math.random() * 3) + 96; // 96-99%
      const temp = 367 + Math.floor(Math.random() * 10) - 5; // 36.2-37.2°C
      const battery = Math.max(0, 92 - Math.floor(hour/5)); // Slowly decreasing
      const motion = Math.floor(Math.random() * 4); // 0-3
      const readiness = Math.floor(Math.random() * 20) + 70; // 70-90
      const fever = temp > 378 ? 1 : 0; // Fever if above 37.8°C
      
      dispatchBleEvent('nestor-vital-update', { 
        hr, spo2, temp, battery, motion, readiness, fever,
        timestamp: now.getTime()
      });
    };
    
    // Generate some historical data
    for (let i = 24; i > 0; i--) {
      generateMockVital(i);
    }
    
    // Add a recurring interval to simulate real-time data updates (every 5 seconds)
    setInterval(() => {
      generateMockVital(0);
    }, 5000);
  }
};

// Initialize mock data on module load for development
initializeMockDataIfNeeded();
