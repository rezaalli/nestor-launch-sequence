/**
 * Device Management Screen
 * Allows users to manage their Nestor devices with a modern, intuitive interface
 */

import React, { useState, useEffect } from 'react';
import { useDeviceManagement } from '@/hooks/useDeviceManagement';
import { NestorDeviceInfo } from '@/services/bluetooth/deviceService';
import { Device } from '@/lib/database/schema';
import { useToast } from "@/hooks/use-toast";
import { 
  Bluetooth, 
  Battery, 
  Signal, 
  Clock, 
  RefreshCw, 
  PlusCircle, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Settings, 
  ArrowLeft,
  X,
  Watch,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SimpleSkeletonLoader as Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from 'react-router-dom';

export default function DeviceManagementScreen() {
  const {
    devices,
    activeDevice,
    isLoading,
    error,
    refreshDevices,
    scanForDevices,
    connectToDevice,
    disconnectDevice,
    syncDevice,
    syncAllDevices,
    setActiveDevice,
    removeDevice,
    isScanning,
    scanResults,
    isConnecting,
    isConnected,
    connectedDeviceId,
    isSyncing,
    registerDevice: hookRegisterDevice
  } = useDeviceManagement();

  const { toast } = useToast();
  const navigate = useNavigate();
  
  // State variables
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showScanResults, setShowScanResults] = useState(false);
  const [newWatchName, setNewWatchName] = useState('');
  const [selectedScanDevice, setSelectedScanDevice] = useState<NestorDeviceInfo | null>(null);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [deviceToRemove, setDeviceToRemove] = useState<Device | null>(null);
  const [showAddDeviceDialog, setShowAddDeviceDialog] = useState(false);
  const [showDeviceDetailsDialog, setShowDeviceDetailsDialog] = useState(false);
  const [deviceTab, setDeviceTab] = useState("paired");
  const [manualFirmwareVersion, setManualFirmwareVersion] = useState("1.0.0");
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(false);

  // Handle device selection
  const handleSelectDevice = (device: Device) => {
    setSelectedDevice(device);
    setShowDeviceDetailsDialog(true);
  };

  // Handle scanning for new devices
  const handleScan = async () => {
    setDeviceTab("available");
    
    try {
      await scanForDevices();
      setShowScanResults(true);
      
      if (scanResults.length === 0) {
        toast({
          title: "No devices found",
          description: "Make sure your Nestor device is in pairing mode and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Scan failed",
        description: "Failed to scan for devices. Please check Bluetooth permissions.",
        variant: "destructive"
      });
    }
  };

  // Handle registering a new device
  const handleRegisterDevice = async (deviceInfo: NestorDeviceInfo) => {
    setSelectedScanDevice(deviceInfo);
    setShowAddDeviceDialog(true);
  };

  // Handle confirming device registration with watch name
  const handleConfirmRegistration = async () => {
    if (!selectedScanDevice || !newWatchName) {
      toast({
        title: "Missing information",
        description: "Please provide a name for your watch.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Get firmware version
      let firmwareVersion = selectedScanDevice.firmwareVersion || manualFirmwareVersion;
      
      // Use the registerDevice function from the hook
      const device = await hookRegisterDevice(selectedScanDevice, newWatchName);
      
      if (device) {
        toast({
          title: "Device registered",
          description: `${selectedScanDevice.name} has been paired with "${newWatchName}"`,
        });
        
        // Reset state
        setNewWatchName('');
        setSelectedScanDevice(null);
        setShowAddDeviceDialog(false);
        setDeviceTab("paired");
      } else {
        throw new Error("Failed to register device");
      }
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Failed to register device. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle syncing a device
  const handleSync = async (deviceId: string) => {
    try {
      await syncDevice(deviceId);
      
      toast({
        title: "Sync completed",
        description: "Device data has been synchronized successfully.",
      });
    } catch (error) {
      toast({
        title: "Sync failed",
        description: "Failed to sync device data. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle removing a device
  const handleRemoveDevice = (device: Device) => {
    setDeviceToRemove(device);
    setShowRemoveDialog(true);
  };

  // Confirm device removal
  const confirmRemoveDevice = async () => {
    if (!deviceToRemove) return;
    
    try {
      await removeDevice(deviceToRemove.device_id);
      
      toast({
        title: "Device removed",
        description: `${deviceToRemove.device_name} has been removed.`,
      });
      
      // Close dialogs and reset state
      setShowRemoveDialog(false);
      setDeviceToRemove(null);
      if (selectedDevice?.device_id === deviceToRemove.device_id) {
        setSelectedDevice(null);
        setShowDeviceDetailsDialog(false);
      }
    } catch (error) {
      toast({
        title: "Removal failed",
        description: "Failed to remove device. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle setting as active device
  const handleSetActive = async (deviceId: string) => {
    try {
      await setActiveDevice(deviceId);
      
      toast({
        title: "Active device set",
        description: "Your active Nestor device has been updated.",
      });
    } catch (error) {
      toast({
        title: "Failed to set active device",
        description: "An error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Format last sync date nicely
  const formatLastSync = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Never synced";
      }
      
      // If synced today, show time
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // If synced yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      
      // Otherwise show date and time
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + 
             ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return "Unknown";
    }
  };
  
  // Get battery status class based on level
  const getBatteryStatusClass = (level: number) => {
    if (level >= 80) return "text-green-600";
    if (level >= 40) return "text-amber-600";
    return "text-red-600";
  };
  
  // Generate mock battery level if none exists
  const getBatteryLevel = (device: Device) => {
    if (device.battery_level) return device.battery_level;
    
    // Generate deterministic battery level based on device ID
    const sum = device.device_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 20 + (sum % 80); // Between 20% and 99%
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Device Management</h1>
          <div className="w-[70px]">{/* Spacer to balance layout */}</div>
        </div>
        
        <div className="space-y-6">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Device Management</h1>
        <div className="w-[70px]">{/* Spacer to balance layout */}</div>
      </div>

      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-800">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <Button 
          onClick={refreshDevices} 
          variant="outline" 
          className="flex-1 h-12"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Devices
        </Button>
        
        <Button 
          onClick={handleScan} 
          disabled={isScanning} 
          className="flex-1 h-12"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          {isScanning ? 'Scanning...' : 'Add New Device'}
        </Button>
      </div>

      <Tabs value={deviceTab} onValueChange={setDeviceTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="paired">My Devices ({devices.length})</TabsTrigger>
          <TabsTrigger value="available">Available Devices ({scanResults.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="paired" className="mt-4">
          {devices.length === 0 ? (
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Watch className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No devices paired</h3>
                <p className="text-gray-500 mb-6">You haven't paired any Nestor devices yet. Click the button below to scan for devices.</p>
                <Button onClick={handleScan}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add New Device
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {devices.map(device => (
                <Card 
                  key={device.device_id} 
                  className={`overflow-hidden transition-all ${
                    activeDevice?.device_id === device.device_id 
                      ? 'border-blue-300 shadow-sm' 
                      : ''
                  }`}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Active indicator */}
                      {activeDevice?.device_id === device.device_id && (
                        <div className="bg-blue-600 md:w-1 w-full h-1 md:h-auto flex-shrink-0"></div>
                      )}
                      
                      <div className="p-4 flex-grow">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium text-lg">{device.device_name}</h3>
                              {activeDevice?.device_id === device.device_id && (
                                <Badge className="ml-2" variant="default">Active</Badge>
                              )}
                            </div>
                            <p className="text-gray-500 text-sm">
                              Attached to: <span className="font-medium">{device.associated_watch}</span>
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Badge variant="outline" className={getBatteryStatusClass(getBatteryLevel(device))}>
                              <Battery className="mr-1 h-3 w-3" />
                              {getBatteryLevel(device)}%
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-2 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            Last synced: {formatLastSync(device.last_sync)}
                          </div>
                        </div>
                        
                        <div className="mt-4 flex flex-wrap gap-2">
                          {activeDevice?.device_id !== device.device_id && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleSetActive(device.device_id)}
                            >
                              Set as Active
                            </Button>
                          )}
                          
                          <Button 
                            size="sm"
                            onClick={() => handleSync(device.device_id)} 
                            disabled={isSyncing && connectedDeviceId === device.device_id}
                          >
                            {isSyncing && connectedDeviceId === device.device_id ? (
                              <>
                                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                                Syncing...
                              </>
                            ) : (
                              <>Sync Now</>
                            )}
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleSelectDevice(device)}
                          >
                            Device Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="available" className="mt-4">
          {isScanning ? (
            <div className="flex flex-col items-center justify-center py-10">
              <RefreshCw className="h-10 w-10 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">Scanning for Nestor devices...</p>
            </div>
          ) : scanResults.length === 0 ? (
            <Card>
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Bluetooth className="h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No devices found</h3>
                <p className="text-gray-500 mb-6">Make sure your Nestor device is in pairing mode and nearby.</p>
                <Button onClick={handleScan}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Scan Again
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {scanResults.map(device => (
                <Card key={device.deviceId} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{device.name || 'Unknown Device'}</h3>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Signal className="mr-1 h-3 w-3" />
                          <span>Signal: {device.rssi} dBm</span>
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleRegisterDevice(device)}
                        disabled={isConnecting}
                      >
                        {isConnecting ? 'Connecting...' : 'Pair Device'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="mt-4 flex justify-center">
            <Button 
              variant="outline" 
              onClick={handleScan}
              disabled={isScanning}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
              Refresh Scan
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Settings Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Settings className="mr-2 h-5 w-5" />
            Device Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-sync">Automatic Background Sync</Label>
              <p className="text-sm text-gray-500">Sync your devices in the background every 4 hours</p>
            </div>
            <Switch
              id="auto-sync"
              checked={autoSyncEnabled}
              onCheckedChange={setAutoSyncEnabled}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>All Devices</Label>
              <p className="text-sm text-gray-500">Manage all your devices at once</p>
            </div>
            <Button
              variant="outline" 
              size="sm"
              onClick={syncAllDevices}
              disabled={isSyncing || devices.length === 0}
            >
              Sync All Devices
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Device Registration Dialog */}
      <Dialog open={showAddDeviceDialog} onOpenChange={setShowAddDeviceDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pair New Device</DialogTitle>
            <DialogDescription>
              Enter details about the watch this Nestor will be attached to.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="watch-name">Watch Name</Label>
              <Input
                id="watch-name"
                placeholder="e.g., Dress Watch, Sport Watch"
                value={newWatchName}
                onChange={(e) => setNewWatchName(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                Give your watch a name so you can easily identify it later.
              </p>
            </div>
            
            {!selectedScanDevice?.firmwareVersion && (
              <div className="space-y-2">
                <Label htmlFor="firmware-version">Firmware Version</Label>
                <Select 
                  value={manualFirmwareVersion}
                  onValueChange={setManualFirmwareVersion}
                >
                  <SelectTrigger id="firmware-version">
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Firmware Versions</SelectLabel>
                      <SelectItem value="1.0.0">Version 1.0.0</SelectItem>
                      <SelectItem value="1.1.0">Version 1.1.0</SelectItem>
                      <SelectItem value="1.2.0">Version 1.2.0 (Latest)</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDeviceDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmRegistration} disabled={!newWatchName}>
              Pair Device
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Device Details Dialog */}
      <Dialog open={showDeviceDetailsDialog} onOpenChange={setShowDeviceDetailsDialog}>
        {selectedDevice && (
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedDevice.device_name}</span>
                {activeDevice?.device_id === selectedDevice.device_id && (
                  <Badge variant="default">Active</Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Device details and management options
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              {/* Device Information */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Watch Name</span>
                  <span className="font-medium">{selectedDevice.associated_watch}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Device Type</span>
                  <span>{selectedDevice.device_type}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Firmware Version</span>
                  <span>{selectedDevice.firmware_version || '1.0.0'}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Battery Level</span>
                  <span className={`flex items-center ${getBatteryStatusClass(getBatteryLevel(selectedDevice))}`}>
                    <Battery className="mr-1 h-4 w-4" />
                    {getBatteryLevel(selectedDevice)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last Synced</span>
                  <span>{formatLastSync(selectedDevice.last_sync)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">MAC Address</span>
                  <span className="font-mono text-xs">{selectedDevice.mac_address}</span>
                </div>
              </div>
              
              <Separator />
              
              {/* Actions */}
              <div className="space-y-3">
                <Button 
                  className="w-full" 
                  onClick={() => handleSync(selectedDevice.device_id)}
                  disabled={isSyncing && connectedDeviceId === selectedDevice.device_id}
                >
                  {isSyncing && connectedDeviceId === selectedDevice.device_id ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Device
                    </>
                  )}
                </Button>
                
                {activeDevice?.device_id !== selectedDevice.device_id && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleSetActive(selectedDevice.device_id)}
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Set as Active Device
                  </Button>
                )}
                
                <Button 
                  variant="destructive" 
                  className="w-full"
                  onClick={() => handleRemoveDevice(selectedDevice)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove Device
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Remove Device Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will remove {deviceToRemove?.device_name} from your account.
              All local data will be preserved, but the device will need to be paired again for future use.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveDevice} className="bg-red-600 hover:bg-red-700">
              Remove Device
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 