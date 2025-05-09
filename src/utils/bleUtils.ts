
// This file is kept for backward compatibility
// It re-exports all BLE utilities from the new modular structure

import * as BleUtils from './ble';
import { ConnectionUtils } from './ble';

// Re-export everything
export * from './ble';

// Re-export the connection utilities with their original names
export const {
  isBleAvailable,
  requestBlePermissions,
  connectToDeviceById,
  connectToDevice,
  disconnectFromDevice,
  isDeviceConnected,
  setDeviceName,
  getDeviceName,
  getLastConnectionError,
  handleReconnection
} = ConnectionUtils;
