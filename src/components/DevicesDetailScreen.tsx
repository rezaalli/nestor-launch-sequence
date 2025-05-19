import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { SimpleSkeletonLoader as Skeleton } from '@/components/ui/skeleton';
import { 
  Bluetooth, 
  BluetoothConnected, 
  BluetoothOff, 
  Battery, 
  Pencil, 
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DeviceItem from '@/components/DeviceItem';
import DeviceDetailPage from '@/components/DeviceDetailPage';
import { 
  connectToDeviceById, 
  disconnectFromDevice,
  getDeviceName,
  setDeviceName,
  isDeviceConnected,
  scanForDevices,
  getDiscoveredDevices,
  isScanning,
  requestBlePermissions,
  isBleAvailable,
  getLastConnectionError,
  checkFirmwareUpdate
} from '@/utils/bleUtils';

const DevicesDetailScreen: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'connected' | 'available'>('connected');
  const [scanning, setScanning] = useState(false);
  const [bluetoothAvailable, setBluetoothAvailable] = useState(true);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const [connectedDevice, setConnectedDevice] = useState({
    id: 'connected-device',
    name: 'Nestor Device',
    firmwareVersion: '1.0.0',
    lastSynced: 'Just now',
    macAddress: '5C:02:B7:AD:F3:E1',
    modelName: 'Nestor Health Pro',
    signalStrength: 85,
    isConnected: true,
    updateAvailable: {
      version: '1.1.0'
    }
  });
  
  // Mock available devices
  const [availableDevices, setAvailableDevices] = useState<Array<{
    id: string;
    name: string;
    signalStrength: 'weak' | 'medium' | 'strong';
    battery?: number;
    lastConnected?: string;
  }>>([
    {
      id: 'device-1',
      name: 'Nestor Watch',
      signalStrength: 'medium',
      lastConnected: 'Yesterday'
    },
    {
      id: 'device-2',
      name: 'Nestor Band',
      signalStrength: 'weak',
      lastConnected: 'Last week'
    }
  ]);
  
  // Initialize device state
  useEffect(() => {
    const checkBluetooth = async () => {
      const available = isBleAvailable();
      setBluetoothAvailable(available);
      
      if (available) {
        const hasPerms = await requestBlePermissions();
        setHasPermissions(hasPerms);
      }
    };
    
    checkBluetooth();
    
    // Initialize with connected device (if any)
    if (isDeviceConnected()) {
      setIsConnected(true);
    }
    
    // Event listeners for BLE events would be set up here in a real app
  }, []);
  
  const handleStartScan = async () => {
    setConnectionError(null);
    
    // Check for Bluetooth availability
    if (!bluetoothAvailable) {
      toast({
        title: "Bluetooth unavailable",
        description: "Bluetooth is required to scan for devices.",
        variant: "destructive",
      });
      return;
    }
    
    // Check for permissions
    if (hasPermissions === false) {
      const hasPerms = await requestBlePermissions();
      setHasPermissions(hasPerms);
      if (!hasPerms) {
        toast({
          title: "Permission denied",
          description: "Bluetooth permissions are required to scan for devices.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setScanning(true);
    
    // Simulate scanning
    setTimeout(() => {
      setScanning(false);
      toast({
        title: "Scan complete",
        description: `Found ${availableDevices.length} Nestor devices.`,
      });
    }, 3000);
    
    // In a real app, we would use:
    // await scanForDevices({ timeout: 10000 });
  };
  
  const handleConnect = async (deviceId: string) => {
    setConnectionError(null);
    setConnecting(true);
    
    // Simulate connection
    setTimeout(() => {
      setConnecting(false);
      
      // Update the selected device
      const selectedDevice = availableDevices.find(d => d.id === deviceId);
      if (selectedDevice) {
        setIsConnected(true);
        
        // Move to connected devices
        setAvailableDevices(prev => prev.filter(d => d.id !== deviceId));
        
        // Switch to connected tab
        setActiveTab('connected');
        
        toast({
          title: "Device connected",
          description: `Successfully connected to ${selectedDevice.name}`,
        });
      }
    }, 2000);
    
    // In a real app, we would use:
    // const success = await connectToDeviceById(deviceId);
  };
  
  // Render connected device panel
  const renderConnectedDevice = () => {
    if (!isConnected) {
      return (
        <div className="p-6 flex flex-col items-center justify-center border border-dashed rounded-lg">
          <BluetoothOff className="h-10 w-10 text-gray-400 mb-3" />
          <p className="text-gray-500 font-medium mb-2">No device connected</p>
          <p className="text-gray-400 text-sm text-center mb-4">
            Connect to a Nestor device to see its details here
          </p>
          <Button
            variant="default"
            onClick={() => setActiveTab('available')}
          >
            Connect a device
          </Button>
        </div>
      );
    }
    
    return <DeviceDetailPage {...connectedDevice} />;
  };
  
  // Render available devices panel
  const renderAvailableDevices = () => {
    return (
      <div className="space-y-6">
        {!bluetoothAvailable && (
          <div className="p-4 mb-4 bg-red-50 rounded-lg">
            <div className="flex items-center">
              <BluetoothOff className="h-6 w-6 text-red-500 mr-3" />
              <div>
                <h3 className="font-medium text-red-800">Bluetooth Not Available</h3>
                <p className="text-sm text-red-600">
                  Bluetooth is required to connect to your Nestor device.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {bluetoothAvailable && hasPermissions === false && (
          <div className="p-4 mb-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-yellow-500 mr-3" />
              <div>
                <h3 className="font-medium text-yellow-800">Bluetooth Permission Required</h3>
                <p className="text-sm text-yellow-600">
                  Permission is needed to scan for and connect to Bluetooth devices.
                </p>
              </div>
            </div>
            <Button 
              size="sm" 
              className="mt-3" 
              onClick={async () => setHasPermissions(await requestBlePermissions())}
            >
              Request Permission
            </Button>
          </div>
        )}
        
        {connectionError && (
          <div className="p-4 mb-4 bg-red-50 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-6 w-6 text-red-500 mr-3" />
              <div>
                <h3 className="font-medium text-red-800">Connection Error</h3>
                <p className="text-sm text-red-600">{connectionError}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Available Devices</h3>
          <Button
            onClick={handleStartScan}
            disabled={scanning || !bluetoothAvailable || hasPermissions === false}
          >
            {scanning ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              "Scan for Devices"
            )}
          </Button>
        </div>
        
        <div className="space-y-3">
          {scanning && (
            <div className="border border-dashed p-4 rounded-lg flex flex-col items-center">
              <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mb-3" />
              <p className="text-gray-700">Searching for nearby devices...</p>
            </div>
          )}
          
          {!scanning && availableDevices.length === 0 && (
            <div className="border border-dashed p-6 rounded-lg text-center">
              <Bluetooth className="h-10 w-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 font-medium mb-1">No devices found</p>
              <p className="text-gray-400 text-sm">
                Make sure your device is in pairing mode and nearby
              </p>
            </div>
          )}
          
          {availableDevices.map(device => (
            <DeviceItem
              key={device.id}
              name={device.name}
              signalStrength={device.signalStrength}
              battery={device.battery || 0}
              onSelect={() => handleConnect(device.id)}
            />
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <Tabs 
        defaultValue="connected" 
        value={activeTab} 
        onValueChange={(val) => setActiveTab(val as 'connected' | 'available')}
        className="w-full"
      >
        <TabsList className="hidden">
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
        </TabsList>
        
        <div>
          <TabsContent value="connected">
            {renderConnectedDevice()}
          </TabsContent>
          
          <TabsContent value="available">
            {renderAvailableDevices()}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default DevicesDetailScreen;
