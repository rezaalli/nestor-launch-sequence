import React, { useState, useEffect } from 'react';
import { Bluetooth, BluetoothSearching, BluetoothOff, BluetoothConnected, Plus, ArrowLeft, Battery, Watch, LightbulbIcon, RefreshCw } from 'lucide-react';
import OnboardingLayout from '../components/OnboardingLayout';
import { Button } from '@/components/ui/button';
import SignalStrength from '../components/SignalStrength';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  scanForDevices, 
  getDiscoveredDevices, 
  isScanning, 
  connectToDeviceById,
  isBleAvailable,
  getSignalStrengthFromRssi,
  requestBlePermissions
} from '../utils/bleUtils';
import { Card, CardContent } from "@/components/ui/card";

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
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const { toast } = useToast();

  // This represents our two main tabs/screens - Pairing and Device Selection
  const tabs = ['Pair Device', 'My Devices'];

  // Check for Bluetooth availability on component mount
  useEffect(() => {
    const checkBluetooth = async () => {
      const available = isBleAvailable();
      setBluetoothAvailable(available);
      
      if (available) {
        // Always assume we have permissions in development mode
        const hasPerms = process.env.NODE_ENV === 'development' ? true : await requestBlePermissions();
        setHasPermissions(hasPerms);
      }
    };
    
    checkBluetooth();
    
    // Set up BLE event listeners
    const handleDevicesDiscovered = (event: Event) => {
      const { devices: discoveredDevices } = (event as CustomEvent).detail;
      const mappedDevices = discoveredDevices.map((device: any) => ({
        ...device,
        signalStrength: getSignalStrengthFromRssi(device.rssi)
      }));
      
      setDevices(mappedDevices);
      
      // If there are devices and none is selected, auto-select the first one
      if (mappedDevices.length > 0 && !selectedDevice) {
        setSelectedDevice(mappedDevices[0].id);
      }
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
  }, [onNext, toast, selectedDevice]);

  const handleScan = async () => {
    // Clear previous errors
    setConnectionError(null);
    
    // Skip permission checks in development mode
    if (process.env.NODE_ENV === 'development') {
      setIsSearching(true);
      setDevices([{
        id: 'mock-device-1',
        name: 'Nestor Watch',
        rssi: -65,
        signalStrength: 'strong',
        lastSeen: Date.now()
      }]);
      
      // Auto-select the mock device
      setSelectedDevice('mock-device-1');
      
      // Simulate scan completion after 2 seconds
      setTimeout(() => {
        setIsSearching(false);
      }, 2000);
      
      return;
    }
    
    // If Bluetooth is not available, show toast
    if (!bluetoothAvailable) {
      toast({
        title: "Bluetooth Not Available",
        description: "Bluetooth is required to connect to your Nestor device.",
        variant: "destructive"
      });
      return;
    }
    
    // If no permissions, request them
    if (hasPermissions === false) {
      const granted = await requestBlePermissions();
      setHasPermissions(granted);
      if (!granted) {
        return;
      }
    }
    
    setIsSearching(true);
    setDevices([]);
    setSelectedDevice(null);
    
    // Start scanning for devices
    await scanForDevices({ timeout: 10000 });
  };
  
  const handleConnect = async (deviceIdToConnect?: string) => {
    // Use the provided deviceId or the selectedDevice state
    const deviceId = deviceIdToConnect || selectedDevice;
    
    if (!deviceId) return;
    
    setConnecting(deviceId);
    setConnectionError(null);
    
    if (process.env.NODE_ENV === 'development') {
      // Simulate connection in development mode
      setTimeout(() => {
        onNext();
      }, 1000);
      return;
    }
    
    // Connect to device
    const success = await connectToDeviceById(deviceId);
    
    if (!success) {
      setConnectionError('Failed to connect to device. Please try again.');
      setConnecting(null);
    }
    // On success, the event listener will handle navigation
  };

  const renderBluetoothUnavailable = () => (
    <Card className="mb-6 border-2 border-red-200 bg-red-50">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3 mt-2">
            <BluetoothOff size={24} className="text-red-500" />
          </div>
          <h3 className="text-lg font-medium mb-2">Bluetooth Not Available</h3>
          <p className="text-sm text-gray-600 mb-4">
            Bluetooth is required to connect to your Nestor device. Please enable Bluetooth on your device and try again.
          </p>
        </div>
      </CardContent>
    </Card>
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

      {/* Display Bluetooth unavailable message if needed */}
      {!bluetoothAvailable && renderBluetoothUnavailable()}

      {/* Connection Error Alert */}
      {connectionError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}

      {/* Device List */}
      {bluetoothAvailable && (
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
            <div 
              key={device.id} 
              className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer ${
                selectedDevice === device.id ? 'border-blue-100 bg-blue-50' : 'border-gray-200'
              }`}
              onClick={() => setSelectedDevice(device.id)}
            >
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
              {connecting === device.id && (
                <div className="flex items-center">
                  <RefreshCw size={16} className="text-nestor-blue animate-spin mr-2" />
                  <span className="text-sm">Connecting...</span>
                </div>
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

      {/* Action Buttons - Connect and Scan */}
      <div className="flex flex-col gap-4">
        {/* Connect Button - Only show when a device is found and selected */}
        {devices.length > 0 && selectedDevice && (
          <button 
            className={`w-full py-4 bg-nestor-blue text-white font-medium rounded-lg flex items-center justify-center ${
              connecting ? 'opacity-75' : ''
            }`}
            onClick={() => handleConnect()}
            disabled={connecting !== null}
          >
            {connecting ? (
              <>
                <RefreshCw size={20} className="animate-spin mr-2" />
                Connecting...
              </>
            ) : (
              <>
                <BluetoothConnected size={20} className="mr-2" />
                Connect
              </>
            )}
          </button>
        )}
        
        {/* Scan Button */}
        <button 
          className={`w-full py-4 ${devices.length > 0 ? 'bg-gray-200 text-gray-700' : 'bg-nestor-blue text-white'} font-medium rounded-lg flex items-center justify-center disabled:bg-gray-300 disabled:cursor-not-allowed`}
          onClick={handleScan}
          disabled={isSearching || !bluetoothAvailable}
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
      </div>

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
                    onClick={(e) => {
                      e.preventDefault();
                      handleConnect(device.id);
                    }}
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

      {/* Display Bluetooth unavailable message if needed */}
      <div className="px-6 mt-8">
        {!bluetoothAvailable && renderBluetoothUnavailable()}
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
      {/* Header with tabs */}
      <div className="flex flex-col mb-4">
        <div className="flex items-center justify-between mb-4">
          {/* Removed the redundant back button that was here */}
          <div className="w-10 h-10"></div> {/* Empty div to maintain layout */}
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
