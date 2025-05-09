import React, { useState, useEffect } from 'react';
import { Bluetooth, BluetoothSearching, BluetoothOff, BluetoothConnected, Plus, ArrowLeft, Battery, Watch, LightbulbIcon, RefreshCw, Shield } from 'lucide-react';
import OnboardingLayout from '../components/OnboardingLayout';
import { Button } from '@/components/ui/button';
import SignalStrength from '../components/SignalStrength';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  scanForDevices, 
  getDiscoveredDevices, 
  isScanning, 
  connectToDeviceById,
  isBleAvailable,
  getSignalStrengthFromRssi,
  requestBlePermissions
} from '../utils/bleUtils';

interface DevicePairingScreenProps {
  onNext: () => void;
}

const DevicePairingScreen = ({ onNext }: DevicePairingScreenProps) => {
  const [selectedWrist, setSelectedWrist] = useState<'left' | 'right'>('left');
  const [isSearching, setIsSearching] = useState(false);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [bluetoothAvailable, setBluetoothAvailable] = useState<boolean>(true);
  const [devices, setDevices] = useState<Array<{
    id: string;
    name: string;
    rssi: number;
    signalStrength: 'weak' | 'medium' | 'strong';
    lastSeen: number;
  }>>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  // This represents our two main tabs/screens - Pairing and Device Selection
  const tabs = ['Pair Device', 'My Devices'];

  // Check for Bluetooth availability on component mount
  useEffect(() => {
    const checkBluetooth = async () => {
      const available = isBleAvailable();
      setBluetoothAvailable(available);
      
      if (available) {
        const hasPerms = await requestBlePermissions();
        setHasPermissions(Boolean(hasPerms)); // Fix: Ensure a boolean is passed
      }
    };
    
    checkBluetooth();
    
    // Set up BLE event listeners
    const handleDevicesDiscovered = (event: Event) => {
      const { devices: discoveredDevices } = (event as CustomEvent).detail;
      setDevices(discoveredDevices.map((device: any) => ({
        ...device,
        signalStrength: getSignalStrengthFromRssi(device.rssi)
      })));
    };
    
    const handleScanComplete = () => {
      setIsSearching(false);
    };
    
    const handleScanError = (event: Event) => {
      setIsSearching(false);
      setConnectionError((event as CustomEvent).detail.error);
    };
    
    const handleDeviceConnected = (event: Event) => {
      setConnecting(null);
      onNext(); // Navigate to next screen on successful connection
    };
    
    const handleConnectionError = (event: Event) => {
      const { error } = (event as CustomEvent).detail;
      setConnectionError(error);
      setConnecting(null);
    };
    
    // Add event listeners
    window.addEventListener('nestor-devices-discovered', handleDevicesDiscovered);
    window.addEventListener('nestor-scan-complete', handleScanComplete);
    window.addEventListener('nestor-scan-error', handleScanError);
    window.addEventListener('nestor-connected', handleDeviceConnected);
    window.addEventListener('nestor-connection-error', handleConnectionError);
    
    return () => {
      // Remove event listeners
      window.removeEventListener('nestor-devices-discovered', handleDevicesDiscovered);
      window.removeEventListener('nestor-scan-complete', handleScanComplete);
      window.removeEventListener('nestor-scan-error', handleScanError);
      window.removeEventListener('nestor-connected', handleDeviceConnected);
      window.removeEventListener('nestor-connection-error', handleConnectionError);
    };
  }, [onNext]);

  const handleScan = async () => {
    // Clear previous errors
    setConnectionError(null);
    
    // If Bluetooth is not available, show error
    if (!bluetoothAvailable) {
      setConnectionError('Bluetooth is not available on this device.');
      return;
    }
    
    // If no permissions, request them
    if (hasPermissions === false) {
      const hasPerms = await requestBlePermissions();
      setHasPermissions(Boolean(hasPerms)); // Fix: Ensure a boolean is passed
      if (!hasPerms) {
        setConnectionError('Bluetooth permissions are required to scan for devices.');
        return;
      }
    }
    
    setIsSearching(true);
    setDevices([]);
    
    // Start scanning for devices
    await scanForDevices({ timeout: 10000 });
  };
  
  const handleConnect = async (deviceId: string) => {
    setConnecting(deviceId);
    setConnectionError(null);
    
    // Connect to device
    const success = await connectToDeviceById(deviceId);
    
    if (!success) {
      setConnectionError('Failed to connect to device. Please try again.');
      setConnecting(null);
    }
    // On success, the event listener will handle navigation
  };

  const renderBluetoothUnavailable = () => (
    <div className="flex flex-col items-center justify-center mt-8">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <BluetoothOff size={32} className="text-red-500" />
      </div>
      <h3 className="text-lg font-medium text-center mb-2">Bluetooth Not Available</h3>
      <p className="text-sm text-gray-600 text-center mb-4 max-w-xs">
        Bluetooth is required to connect to your Nestor device. Please enable Bluetooth on your device and try again.
      </p>
    </div>
  );

  const renderPermissionDenied = () => (
    <div className="flex flex-col items-center justify-center mt-8">
      <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
        <Shield size={32} className="text-yellow-500" />
      </div>
      <h3 className="text-lg font-medium text-center mb-2">Permission Required</h3>
      <p className="text-sm text-gray-600 text-center mb-4 max-w-xs">
        Bluetooth permission is required to connect to your Nestor device. Please grant permission and try again.
      </p>
      <Button onClick={async () => setHasPermissions(await requestBlePermissions())}>
        Request Permission
      </Button>
    </div>
  );

  const renderPairingTab = () => (
    <div className="flex-1 px-6 pt-8">
      {/* Device Illustration */}
      <div className="flex justify-center mb-8">
        <img 
          className="w-48 h-48" 
          src="https://storage.googleapis.com/uxpilot-auth.appspot.com/b6efa33225-8d6343e2ad980d865f92.png" 
          alt="Nestor device" 
        />
      </div>

      {/* Instructions */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-nestor-gray-900 mb-3">Connect Your Nestor</h3>
        <p className="text-nestor-gray-600 text-sm leading-relaxed mb-6">
          Place your Nestor device nearby and ensure Bluetooth is enabled on your phone to begin the pairing process.
        </p>
      </div>

      {/* Handiness Preference */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-nestor-gray-700 mb-3">Which wrist will you wear Nestor on?</h4>
        <div className="grid grid-cols-2 gap-3">
          <button 
            className={`p-4 border rounded-lg flex flex-col items-center justify-center ${
              selectedWrist === 'left' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setSelectedWrist('left')}
          >
            <div className={`mb-2 transform -rotate-45 ${
              selectedWrist === 'left' ? 'text-nestor-blue' : 'text-nestor-gray-400'
            }`}>
              <Watch size={28} />
            </div>
            <span className={`text-sm font-medium ${
              selectedWrist === 'left' ? 'text-nestor-gray-900' : 'text-nestor-gray-600'
            }`}>Left Wrist</span>
          </button>
          <button 
            className={`p-4 border rounded-lg flex flex-col items-center justify-center ${
              selectedWrist === 'right' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setSelectedWrist('right')}
          >
            <div className={`mb-2 transform rotate-45 ${
              selectedWrist === 'right' ? 'text-nestor-blue' : 'text-nestor-gray-400'
            }`}>
              <Watch size={28} />
            </div>
            <span className={`text-sm font-medium ${
              selectedWrist === 'right' ? 'text-nestor-gray-900' : 'text-nestor-gray-600'
            }`}>Right Wrist</span>
          </button>
        </div>
      </div>

      {/* Display Bluetooth unavailable or permission denied messages if needed */}
      {!bluetoothAvailable && renderBluetoothUnavailable()}
      {bluetoothAvailable && hasPermissions === false && renderPermissionDenied()}

      {/* Connection Error Alert */}
      {connectionError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}

      {/* Device List */}
      {bluetoothAvailable && hasPermissions !== false && (
        <div className="space-y-3 mb-8">
          {isSearching && devices.length === 0 && (
            <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <BluetoothSearching size={20} className="text-nestor-blue" />
                </div>
                <div>
                  <h4 className="font-medium text-nestor-gray-900">Searching...</h4>
                  <p className="text-xs text-nestor-gray-500">Looking for nearby devices</p>
                </div>
              </div>
              <div className="animate-spin">
                <RefreshCw size={20} className="text-nestor-blue" />
              </div>
            </div>
          )}

          {devices.map(device => (
            <div key={device.id} className="p-4 border border-blue-100 bg-blue-50 rounded-lg flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <BluetoothConnected size={20} className="text-nestor-blue" />
                </div>
                <div>
                  <h4 className="font-medium text-nestor-gray-900">{device.name}</h4>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs text-nestor-gray-500">Signal:</p>
                    <SignalStrength strength={device.signalStrength} />
                  </div>
                </div>
              </div>
              {connecting === device.id ? (
                <div className="flex items-center">
                  <RefreshCw size={16} className="text-nestor-blue animate-spin mr-2" />
                  <span className="text-sm">Connecting...</span>
                </div>
              ) : (
                <button 
                  className="px-4 py-2 bg-nestor-blue text-white text-sm font-medium rounded-lg"
                  onClick={() => handleConnect(device.id)}
                >
                  Connect
                </button>
              )}
            </div>
          ))}
          
          {devices.length > 0 && !isSearching && (
            <div className="text-sm text-center text-gray-500 mt-2">
              {devices.length} {devices.length === 1 ? 'device' : 'devices'} found
            </div>
          )}
        </div>
      )}

      {/* Scan Button */}
      <button 
        className="w-full py-4 bg-nestor-blue text-white font-medium rounded-lg flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed"
        onClick={handleScan}
        disabled={isSearching || !bluetoothAvailable || hasPermissions === false}
      >
        {isSearching ? (
          <>
            <RefreshCw size={20} className="animate-spin mr-2" />
            Scanning...
          </>
        ) : (
          <>
            <BluetoothSearching size={20} className="mr-2" />
            Scan for Devices
          </>
        )}
      </button>

      {/* Help Text */}
      <p className="text-center text-sm text-nestor-gray-500 mt-6">
        Having trouble? <span className="text-nestor-blue font-medium cursor-pointer">View setup guide</span>
      </p>
    </div>
  );

  const renderDevicesTab = () => (
    <div className="flex flex-col flex-1">
      {/* Connected Device */}
      <div className="px-6 mt-6">
        <h3 className="text-sm font-medium text-nestor-gray-500 mb-3">CONNECTED</h3>
        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <Watch size={24} className="text-nestor-gray-700" />
              </div>
              <div>
                <h4 className="font-medium text-nestor-gray-900">Nestor N-100</h4>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
                  <span className="text-xs text-nestor-gray-600">Connected</span>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Battery className="text-green-500 mr-2 h-5 w-5" />
              <span className="text-sm text-nestor-gray-600">85%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Devices */}
      <div className="px-6 mt-6">
        <h3 className="text-sm font-medium text-nestor-gray-500 mb-3">AVAILABLE</h3>
        <div className="space-y-3">
          {devices.filter(device => !device.id.includes('connected')).map(device => (
            <div key={device.id} className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <Watch size={24} className="text-nestor-gray-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-nestor-gray-900">{device.name}</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-nestor-gray-600">Signal:</span>
                      <SignalStrength strength={device.signalStrength} />
                    </div>
                  </div>
                </div>
                {connecting === device.id ? (
                  <div className="flex items-center">
                    <RefreshCw size={16} className="text-nestor-blue animate-spin mr-2" />
                    <span className="text-sm">Connecting...</span>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleConnect(device.id)} 
                    className="px-4 py-2 text-sm text-nestor-blue font-medium bg-blue-50 rounded-lg"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {devices.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-4">
              No available devices found. Tap "Scan for Devices" to search.
            </div>
          )}
        </div>
      </div>

      {/* Add New Device */}
      <div className="px-6 mt-8">
        <button 
          onClick={() => setSelectedTabIndex(0)} 
          className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-nestor-gray-500"
        >
          <Plus size={18} className="mr-2" />
          Add New Device
        </button>
      </div>

      {/* Device Tips */}
      <div className="px-6 mt-8 mb-6">
        <div className="p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start">
            <LightbulbIcon size={18} className="text-nestor-blue mt-1 mr-3" />
            <p className="text-sm text-nestor-gray-700">
              For optimal tracking, ensure your watch is worn snugly on your wrist and maintain the device within 30 feet of your phone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <OnboardingLayout>
      {/* Header with back button and tabs */}
      <div className="flex flex-col mb-4">
        <div className="flex items-center justify-between mb-4">
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <ArrowLeft size={20} className="text-nestor-gray-700" />
          </button>
          <h2 className="text-lg font-medium text-nestor-gray-900">{tabs[selectedTabIndex]}</h2>
          <button 
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            onClick={() => setSelectedTabIndex(selectedTabIndex === 0 ? 1 : 0)}
          >
            {selectedTabIndex === 0 ? (
              <div className="flex items-center justify-center">
                <Watch size={20} className="text-nestor-gray-700" />
              </div>
            ) : (
              <Plus size={20} className="text-nestor-gray-700" />
            )}
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`flex-1 text-center py-2 px-4 text-sm font-medium ${
                selectedTabIndex === index
                  ? 'text-nestor-blue border-b-2 border-nestor-blue'
                  : 'text-nestor-gray-500'
              }`}
              onClick={() => setSelectedTabIndex(index)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab content */}
      {selectedTabIndex === 0 ? renderPairingTab() : renderDevicesTab()}
    </OnboardingLayout>
  );
};

export default DevicePairingScreen;
