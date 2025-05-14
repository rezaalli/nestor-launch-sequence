
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Bluetooth, 
  BluetoothConnected, 
  BluetoothOff, 
  Battery, 
  Pencil, 
  RefreshCw,
  PlusCircle,
  Trash,
  Info,
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import DeviceItem from '@/components/DeviceItem';
import SignalStrength from '@/components/SignalStrength';
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
  const [editDeviceName, setEditDeviceName] = useState(false);
  const [deviceName, setDeviceNameState] = useState('Nestor Device');
  const [newDeviceName, setNewDeviceName] = useState('');
  const [batteryLevel, setBatteryLevel] = useState(85);
  const [isConnected, setIsConnected] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [firmwareStatus, setFirmwareStatus] = useState({
    currentVersion: '1.0.0',
    latestVersion: '1.1.0',
    updateAvailable: true,
    checking: false
  });
  
  const [devices, setDevices] = useState<Array<{
    id: string;
    name: string;
    signalStrength: 'weak' | 'medium' | 'strong';
    battery?: number;
    selected?: boolean;
    lastConnected?: string;
  }>>([
    {
      id: 'connected-device',
      name: 'Nestor Device',
      signalStrength: 'strong',
      battery: 85,
      selected: true,
      lastConnected: 'Now'
    }
  ]);
  
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
      const name = getDeviceName();
      setDeviceNameState(name);
      setNewDeviceName(name);
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
        setDeviceNameState(selectedDevice.name);
        setNewDeviceName(selectedDevice.name);
        
        // Move to connected devices
        setAvailableDevices(prev => prev.filter(d => d.id !== deviceId));
        setDevices([{
          ...selectedDevice,
          selected: true,
          battery: 75,
          lastConnected: 'Now'
        }]);
        
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
    // if (!success) {
    //   const { message } = getLastConnectionError();
    //   setConnectionError(message || 'Failed to connect to device');
    //   setConnecting(false);
    // }
  };
  
  const handleDisconnect = () => {
    // Simulate disconnection
    setTimeout(() => {
      setIsConnected(false);
      
      // Move to available devices
      const disconnectedDevice = devices[0];
      setDevices([]);
      setAvailableDevices(prev => [...prev, {
        ...disconnectedDevice,
        selected: false,
        lastConnected: 'Just now'
      }]);
      
      toast({
        title: "Device disconnected",
        description: `Disconnected from ${disconnectedDevice.name}`,
      });
    }, 500);
    
    // In a real app, we would use:
    // disconnectFromDevice();
  };
  
  const handleSaveDeviceName = () => {
    if (newDeviceName.trim()) {
      // Update device name
      setDeviceNameState(newDeviceName);
      setDevices(prev => prev.map(d => d.selected ? {...d, name: newDeviceName} : d));
      
      // In a real app, we would use:
      // setDeviceName(newDeviceName.trim());
      
      toast({
        title: "Name updated",
        description: "Device name has been updated successfully.",
      });
    }
    
    setEditDeviceName(false);
  };
  
  const handleCheckForUpdates = () => {
    setFirmwareStatus(prev => ({ ...prev, checking: true }));
    
    // Simulate firmware check
    setTimeout(() => {
      setFirmwareStatus({
        checking: false,
        currentVersion: '1.0.0',
        latestVersion: '1.1.0',
        updateAvailable: true
      });
      
      if (true) {  // Always show update available in this mock
        toast({
          title: "Firmware update available",
          description: `Update to version 1.1.0 is available.`,
        });
      }
    }, 2000);
    
    // In a real app, we would use:
    // checkFirmwareUpdate().then(firmware => {
    //   setFirmwareStatus({
    //     checking: false,
    //     currentVersion: firmware.currentVersion,
    //     updateAvailable: firmware.updateAvailable,
    //     latestVersion: firmware.latestVersion
    //   });
    // });
  };
  
  const handleForgetDevice = (deviceId: string) => {
    // Remove the device from available list
    setAvailableDevices(prev => prev.filter(d => d.id !== deviceId));
    
    toast({
      title: "Device forgotten",
      description: "Device has been forgotten from your devices list.",
    });
  };
  
  // Render connected device panel
  const renderConnectedDevice = () => {
    if (!isConnected || devices.length === 0) {
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
    
    const device = devices[0];
    
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BluetoothConnected className="h-8 w-8 text-nestor-blue" />
                </div>
                
                <div>
                  {editDeviceName ? (
                    <div className="flex items-center space-x-2">
                      <Input
                        value={newDeviceName}
                        onChange={(e) => setNewDeviceName(e.target.value)}
                        placeholder="Device name"
                        className="w-40"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleSaveDeviceName}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => {
                          setEditDeviceName(false);
                          setNewDeviceName(deviceName);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <h3 className="text-lg font-medium">{deviceName}</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2" 
                        onClick={() => setEditDeviceName(true)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center mt-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                  <div className="flex items-center space-x-3 mt-2">
                    <div className="flex items-center">
                      <Battery className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-500">{batteryLevel}%</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-1">Signal:</span>
                      <SignalStrength strength={device.signalStrength} />
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Device Information</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Firmware Version</span>
                <span className="font-medium">{firmwareStatus.currentVersion}</span>
              </div>
              
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Last Synced</span>
                <span className="font-medium">Just now</span>
              </div>
              
              <div className="grid grid-cols-2">
                <span className="text-gray-500">MAC Address</span>
                <span className="font-medium">5C:02:B7:AD:F3:E1</span>
              </div>
              
              <div className="grid grid-cols-2">
                <span className="text-gray-500">Model</span>
                <span className="font-medium">Nestor Health Pro</span>
              </div>
            </div>
            
            {firmwareStatus.updateAvailable && (
              <div className="mt-6 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-nestor-blue mr-2" />
                  <span className="text-sm font-medium">
                    Firmware update available (v{firmwareStatus.latestVersion})
                  </span>
                </div>
                <Button size="sm">Update</Button>
              </div>
            )}
            
            <div className="mt-6 flex justify-between">
              <Button
                variant="outline"
                onClick={handleCheckForUpdates}
                disabled={firmwareStatus.checking}
              >
                {firmwareStatus.checking && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Check for updates
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Device Settings</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 items-center">
                <span className="text-gray-700">Vibration</span>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 items-center">
                <span className="text-gray-700">Display</span>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 items-center">
                <span className="text-gray-700">Advanced</span>
                <div className="flex justify-end">
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-3">Previously Connected</h3>
          {availableDevices.length > 0 ? (
            <div className="space-y-3">
              {availableDevices.map(device => (
                <div 
                  key={`history-${device.id}`} 
                  className="p-4 border rounded-lg flex justify-between"
                >
                  <div>
                    <p className="font-medium">{device.name}</p>
                    <p className="text-sm text-gray-500">
                      Last connected: {device.lastConnected}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleForgetDevice(device.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm"
                      onClick={() => handleConnect(device.id)}
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No previously connected devices</p>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className="px-6 py-6">
      <Tabs 
        defaultValue="connected" 
        value={activeTab} 
        onValueChange={(val) => setActiveTab(val as 'connected' | 'available')}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="available">Available</TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
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
