
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bluetooth, Pencil, RefreshCw, Trash } from "lucide-react";
import { connectToDevice, getDeviceName, setDeviceName, isDeviceConnected } from "@/utils/bleUtils";
import { useToast } from '@/hooks/use-toast';

interface BleDeviceManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const BleDeviceManager = ({ open, onOpenChange }: BleDeviceManagerProps) => {
  const { toast } = useToast();
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Array<{
    id: string;
    name: string;
    isConnected: boolean;
    lastConnected?: string;
    batteryLevel?: number;
  }>>([
    {
      id: "nestor-001",
      name: getDeviceName(),
      isConnected: isDeviceConnected(),
      lastConnected: "Today",
      batteryLevel: 85,
    }
  ]);
  const [editDevice, setEditDevice] = useState<string | null>(null);
  const [newDeviceName, setNewDeviceName] = useState("");

  // Start scanning for devices
  const handleScan = () => {
    setIsScanning(true);
    
    // Simulate finding devices after 2 seconds
    setTimeout(() => {
      const foundDevices = [
        ...devices,
        {
          id: "nestor-002",
          name: "Nestor Device",
          isConnected: false,
          lastConnected: "Never",
        }
      ];
      
      // Only add the new device if it's not already in the list
      if (!devices.some(d => d.id === "nestor-002")) {
        setDevices(foundDevices);
      }
      
      setIsScanning(false);
      toast({
        title: "Scan complete",
        description: "Found 1 new Nestor device.",
      });
    }, 2000);
  };

  // Connect to a device
  const handleConnect = async (deviceId: string) => {
    const deviceIndex = devices.findIndex(d => d.id === deviceId);
    if (deviceIndex === -1) return;
    
    // Update device connection status
    const updatedDevices = [...devices];
    
    // Connect to device using BLE utils
    const connected = await connectToDevice();
    
    if (connected) {
      // Update all other devices to disconnected
      updatedDevices.forEach((d, i) => {
        if (i !== deviceIndex) {
          d.isConnected = false;
        }
      });
      
      // Update the current device to connected
      updatedDevices[deviceIndex].isConnected = true;
      updatedDevices[deviceIndex].lastConnected = "Just now";
      
      toast({
        title: "Device connected",
        description: `Successfully connected to ${updatedDevices[deviceIndex].name}`,
      });
    } else {
      toast({
        title: "Connection failed",
        description: "Could not connect to device. Please try again.",
        variant: "destructive",
      });
    }
    
    setDevices(updatedDevices);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage Devices</DialogTitle>
          <DialogDescription>
            Connect, rename, or remove your Nestor devices.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4 max-h-[60vh] overflow-y-auto">
          {devices.map(device => (
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
                      <Bluetooth className={device.isConnected ? "text-blue-600" : "text-gray-400"} size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium">{device.name}</h3>
                      <div className="flex items-center text-xs text-gray-500">
                        {device.isConnected ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                            <span>Connected</span>
                          </>
                        ) : (
                          <span>Last connected: {device.lastConnected}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => handleEditName(device.id)}>
                      <Pencil size={16} />
                    </Button>
                    {!device.isConnected && (
                      <Button size="sm" variant="ghost" onClick={() => handleRemoveDevice(device.id)}>
                        <Trash size={16} />
                      </Button>
                    )}
                    {!device.isConnected ? (
                      <Button size="sm" onClick={() => handleConnect(device.id)}>Connect</Button>
                    ) : (
                      <Button size="sm" variant="outline" disabled>Connected</Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isScanning && (
            <div className="p-4 border border-dashed rounded-lg flex items-center justify-center">
              <RefreshCw className="animate-spin text-blue-500 mr-2" size={18} />
              <span>Searching for devices...</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleScan} disabled={isScanning}>
            {isScanning ? "Scanning..." : "Scan for Devices"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BleDeviceManager;
