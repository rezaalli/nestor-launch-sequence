
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d060442585854716bdb491caa4a5cf16',
  appName: 'nestor-launch-sequence',
  webDir: 'dist',
  server: {
    url: 'https://d0604425-8585-4716-bdb4-91caa4a5cf16.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#FFFFFF",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    },
    BluetoothLe: {
      displayStrings: {
        scanning: "Searching for Nestor devices...",
        cancel: "Cancel",
        availableDevices: "Available Nestor Devices",
        noDeviceFound: "No Nestor devices found"
      }
    }
  },
  android: {
    useLegacyBridge: false
  },
  // Add permissions for iOS
  ios: {
    permissions: [
      {
        name: "NSBluetoothAlwaysUsageDescription",
        text: "The app uses Bluetooth to connect to your Nestor device and monitor your vital signs."
      },
      {
        name: "NSBluetoothPeripheralUsageDescription",
        text: "The app connects to your Nestor device to display your health metrics and sync data."
      }
    ]
  }
};

export default config;
