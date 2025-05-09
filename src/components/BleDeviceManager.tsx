
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { BluetoothConnected, BluetoothSearching, BluetoothOff, Pencil, RefreshCw, Trash, Battery, ShieldAlert } from "lucide-react";
import SignalStrength from './SignalStrength';
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
} from "@/utils/bleUtils";
import { useToast } from '@/hooks/use-toast';

interface BleDeviceManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BleDeviceManager = ({ open, onOpenChange }: BleDeviceManagerProps) => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [bluetoothAvailable, setBluetoothAvailable] = useState(true);
  const [hasPermissions, setHasPermissions] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState<Array<{
    id: string;
    name: string;
    rssi: number;
    signalStrength: 'weak' | 'medium' | 'strong';
    isConnected: boolean;
    lastConnected?: string;
    batteryLevel?: number;
    lastSeen: number;
  }>>([]);
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [editDevice, setEditDevice] = useState<string | null>(null);
  const [newDeviceName, setNewDeviceName] = useState("");
  const [firmwareStatus, setFirmwareStatus] = useState<{
    checking: boolean;
    currentVersion: string;
    updateAvailable: boolean;
    latestVersion: string;
  }>({
    checking: false,
    currentVersion: '',
    updateAvailable: false,
    latestVersion: ''
  });

  // Effect to initialize BLE state and set up event listeners
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
    
    // Initialize the devices state with the currently connected device (if any)
    if (isDeviceConnected()) {
      const connectedDeviceName = getDeviceName();
      setDevices([{
        id: "nestor-connected",
        name: connectedDeviceName,
        rssi: -60, // Strong signal by default for connected device
        signalStrength: 'strong',
        isConnected: true,
        lastConnected: "Just now",
        batteryLevel: 85,
        lastSeen: Date.now()
      }]);
    }
    
    // Set up event listeners for BLE events
    const handleDevicesDiscovered = (event: Event) => {
      const discoveredDevices = (event as CustomEvent).detail.devices;
      
      // Map discovered devices and merge with existing devices
      const newDevices = discoveredDevices.map((device: any) => ({
        ...device,
        signalStrength: device.rssi > -70 ? 'strong' : (device.rssi > -85 ? 'medium' : 'weak'),
        isConnected: false,
        lastConnected: 'Never'
      }));
      
      // Filter out duplicates
      setDevices(prev => {
        const existingIds = new Set(prev.map(d => d.id));
        const filteredNew = newDevices.filter((d: any) => !existingIds.has(d.id));
        return [...prev, ...filteredNew];
      });
    };
    
    const handleScanComplete = () => {
      setScanning(false);
      toast({
        title: "Scan complete",
        description: `Found ${getDiscoveredDevices().length} Nestor devices.`,
      });
    };
    
    const handleScanError = (event: Event) => {
      setScanning(false);
      const { error } = (event as CustomEvent).detail;
      setConnectionError(error);
      toast({
        title: "Scan failed",
        description: error,
        variant: "destructive",
      });
    };
    
    const handleDeviceConnected = (event: Event) => {
      const { deviceId, deviceName } = (event as CustomEvent).detail;
      
      // Update device connection status
      setDevices(prev => prev.map(d => {
        // Set all other devices to disconnected
        if (d.id !== deviceId) {
          return { ...d, isConnected: false };
        }
        // Update the connected device
        return { 
          ...d, 
          isConnected: true, 
          name: deviceName,
          lastConnected: 'Just now' 
        };
      }));
      
      setConnecting(null);
      toast({
        title: "Device connected",
        description: `Successfully connected to ${deviceName}`,
      });
      
      // Check for firmware updates
      checkFirmware();
    };
    
    const handleConnectionError = (event: Event) => {
      const { error, deviceId } = (event as CustomEvent).detail;
      setConnectionError(error);
      setConnecting(null);
      toast({
        title: "Connection failed",
        description: error,
        variant: "destructive",
      });
    };
    
    const handleDeviceRenamed = (event: Event) => {
      const { name } = (event as CustomEvent).detail;
      
      // Update the name of the connected device
      setDevices(prev => prev.map(d => {
        if (d.isConnected) {
          return { ...d, name };
        }
        return d;
      }));
    };
    
    // Add event listeners
    window.addEventListener('nestor-devices-discovered', handleDevicesDiscovered);
    window.addEventListener('nestor-scan-complete', handleScanComplete);
    window.addEventListener('nestor-scan-error', handleScanError);
    window.addEventListener('nestor-connected', handleDeviceConnected);
    window.addEventListener('nestor-connection-error', handleConnectionError);
    window.addEventListener('nestor-device-renamed', handleDeviceRenamed);
    
    return () => {
      // Remove event listeners
      window.removeEventListener('nestor-devices-discovered', handleDevicesDiscovered);
      window.removeEventListener('nestor-scan-complete', handleScanComplete);
      window.removeEventListener('nestor-scan-error', handleScanError);
      window.removeEventListener('nestor-connected', handleDeviceConnected);
      window.removeEventListener('nestor-connection-error', handleConnectionError);
      window.removeEventListener('nestor-device-renamed', handleDeviceRenamed);
    };
  }, [toast]);

  // Start scanning for devices
  const handleScan = async () => {
    // Clear previous errors
    setConnectionError(null);
    
    // If Bluetooth is not available, show error
    if (!bluetoothAvailable) {
      setConnectionError('Bluetooth is not available on this device.');
      toast({
        title: "Bluetooth unavailable",
        description: "Bluetooth is required to scan for devices.",
        variant: "destructive",
      });
      return;
    }
    
    // If no permissions, request them
    if (hasPermissions === false) {
      const hasPerms = await requestBlePermissions();
      // Fix: Instead of directly setting the state with a Promise
      setHasPermissions(hasPerms);
      if (!hasPerms) {
        setConnectionError('Bluetooth permissions are required to scan for devices.');
        toast({
          title: "Permission denied",
          description: "Bluetooth permissions are required to scan for devices.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setScanning(true);
    
    // Start scanning for devices
    await scanForDevices({ timeout: 10000 });
  };

  // Connect to a device
  const handleConnect = async (deviceId: string) => {
    setConnecting(deviceId);
    setConnectionError(null);
    
    // Connect to device
    const success = await connectToDeviceById(deviceId);
    
    if (!success) {
      const { message } = getLastConnectionError();
      setConnectionError(message || 'Failed to connect to device. Please try again.');
      setConnecting(null);
    }
    // On success, the event listener will handle updates
  };

  // Edit device name
  const handleEditName = (deviceId: string) => {
    const device = devices.find(d => d.id === deviceId);
    if (device) {
      setEditDevice(deviceId);
      setNewDeviceName(device.name);
    }
  };

  // Save device name
  const handleSaveName = () => {
    if (!editDevice || !newDeviceName.trim()) return;
    
    const deviceIndex = devices.findIndex(d => d.id === editDevice);
    if (deviceIndex === -1) return;
    
    const updatedDevices = [...devices];
    updatedDevices[deviceIndex].name = newDeviceName.trim();
    
    // Update in BLE utils if this is the current connected device
    if (updatedDevices[deviceIndex].isConnected) {
      setDeviceName(newDeviceName.trim());
    }
    
    setDevices(updatedDevices);
    setEditDevice(null);
    setNewDeviceName("");
    
    toast({
      title: "Name updated",
      description: "Device name has been updated successfully.",
    });
  };

  // Remove device
  const handleRemoveDevice = (deviceId: string) => {
    const updatedDevices = devices.filter(d => d.id !== deviceId);
    setDevices(updatedDevices);
    
    toast({
      title: "Device removed",
      description: "Device has been removed from your list.",
    });
  };

  // Check for firmware updates
  const checkFirmware = async () => {
    setFirmwareStatus(prev => ({ ...prev, checking: true }));
    
    try {
      const firmware = await checkFirmwareUpdate();
      setFirmwareStatus({
        checking: false,
        currentVersion: firmware.currentVersion,
        updateAvailable: firmware.updateAvailable,
        latestVersion: firmware.latestVersion
      });
      
      if (firmware.updateAvailable) {
        toast({
          title: "Firmware update available",
          description: `Update to version ${firmware.latestVersion} is available.`,
        });
      }
    } catch (error) {
      setFirmwareStatus(prev => ({ ...prev, checking: false }));
      toast({
        title: "Firmware check failed",
        description: "Could not check for firmware updates.",
        variant: "destructive",
      });
    }
  };

  // Render Bluetooth unavailable message
  const renderBluetoothUnavailable = () => (
    <div className="flex flex-col items-center justify-center my-6 p-4 bg-red-50 rounded-lg border border-red-100">
      <BluetoothOff className="text-red-500 mb-2" size={24} />
      <h3 className="font-medium text-red-800">Bluetooth Not Available</h3>
      <p className="text-sm text-red-600 text-center mt-1">
        Bluetooth is required to connect to your Nestor device.
      </p>
    </div>
  );

  // Render permission denied message
  const renderPermissionDenied = () => (
    <div className="flex flex-col items-center justify-center my-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
      <ShieldAlert className="text-yellow-500 mb-2" size={24} />
      <h3 className="font-medium text-yellow-800">Bluetooth Permission Required</h3>
      <p className="text-sm text-yellow-600 text-center mt-1 mb-3">
        Permission is needed to scan for and connect to Bluetooth devices.
      </p>
      <Button size="sm" onClick={async () => setHasPermissions(await requestBlePermissions())}>
        Request Permission
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Devices</DialogTitle>
          <DialogDescription>
            Connect, rename, or remove your Nestor devices.
          </DialogDescription>
        </DialogHeader>

        {/* Display Bluetooth status messages if needed */}
        {!bluetoothAvailable && renderBluetoothUnavailable()}
        {bluetoothAvailable && hasPermissions === false && renderPermissionDenied()}

        {/* Connection Error Alert */}
        {connectionError && (
          <Alert variant="destructive" className="my-4">
            <AlertDescription>{connectionError}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto">
          {/* Connected Devices Section */}
          {devices.some(d => d.isConnected) && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">CONNECTED</h3>
              {devices
                .filter(d => d.isConnected)
                .map(device => (
                  <div key={device.id} className="p-4 border border-green-100 bg-green-50 rounded-lg">
                    {editDevice === device.id ? (
                      <div className="flex items-center space-x-2">
                        <Input 
                          value={newDeviceName} 
                          onChange={(e) => setNewDeviceName(e.target.value)}
                          placeholder="Device name"
                          className="flex-1"
                        />
                        <Button size="sm" onClick={handleSaveName}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditDevice(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <BluetoothConnected className="text-blue-600" size={24} />
                          </div>
                          <div>
                            <h3 className="font-medium">{device.name}</h3>
                            <div className="flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                              <span className="text-xs text-gray-500">Connected</span>
                            </div>
                            {firmwareStatus.currentVersion && (
                              <div className="text-xs text-gray-500 mt-1">
                                Firmware: v{firmwareStatus.currentVersion}
                                {firmwareStatus.updateAvailable && (
                                  <span className="text-blue-500 ml-1">
                                    (Update available: v{firmwareStatus.latestVersion})
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center mr-2">
                            <Battery className={`${device.batteryLevel && device.batteryLevel > 20 ? 'text-green-500' : 'text-red-500'} mr-1`} size={16} />
                            <span className="text-sm">{device.batteryLevel || 0}%</span>
                          </div>
                          <Button size="sm" variant="ghost" onClick={() => handleEditName(device.id)}>
                            <Pencil size={16} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => {
                              disconnectFromDevice();
                              setDevices(prev => prev.map(d => 
                                d.id === device.id ? { ...d, isConnected: false } : d
                              ));
                            }}
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Available Devices Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500">AVAILABLE</h3>
            {devices
              .filter(d => !d.isConnected)
              .map(device => (
                <div key={device.id} className="p-4 border rounded-lg">
                  {editDevice === device.id ? (
                    <div className="flex items-center space-x-2">
                      <Input 
                        value={newDeviceName} 
                        onChange={(e) => setNewDeviceName(e.target.value)}
                        placeholder="Device name"
                        className="flex-1"
                      />
                      <Button size="sm" onClick={handleSaveName}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditDevice(null)}>Cancel</Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <BluetoothSearching className="text-gray-400" size={24} />
                        </div>
                        <div>
                          <h3 className="font-medium">{device.name}</h3>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Signal:</span>
                            <SignalStrength strength={device.signalStrength} />
                          </div>
                          {device.lastConnected && (
                            <span className="text-xs text-gray-500">Last connected: {device.lastConnected}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" onClick={() => handleEditName(device.id)}>
                          <Pencil size={16} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleRemoveDevice(device.id)}>
                          <Trash size={16} />
                        </Button>
                        {connecting === device.id ? (
                          <Button size="sm" disabled>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Connecting
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => handleConnect(device.id)}>Connect</Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
            {devices.filter(d => !d.isConnected).length === 0 && !scanning && (
              <div className="text-center p-6 border border-dashed rounded-lg text-gray-500">
                No available devices found. Click "Scan for Devices" to search.
              </div>
            )}
            
            {scanning && (
              <div className="p-4 border border-dashed rounded-lg flex flex-col items-center justify-center">
                <div className="flex items-center mb-3">
                  <RefreshCw className="animate-spin text-blue-500 mr-2" size={18} />
                  <span>Searching for devices...</span>
                </div>
                <Progress value={Math.floor(Math.random() * 100)} className="w-full" />
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button 
            onClick={handleScan} 
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BleDeviceManager;
