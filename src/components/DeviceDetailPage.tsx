import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bluetooth, Edit, RefreshCw } from 'lucide-react';
import SignalStrength from '@/components/SignalStrength';
import DisplaySettings, { DisplaySettingsValues } from '@/components/DisplaySettings';
import VibrationSettings, { VibrationSettingsValues } from '@/components/VibrationSettings';
import AdvancedSettings, { AdvancedSettingsValues } from '@/components/AdvancedSettings';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface DeviceProps {
  name: string;
  firmwareVersion: string;
  lastSynced: string;
  macAddress: string;
  modelName: string;
  signalStrength: number;
  isConnected: boolean;
  updateAvailable?: {
    version: string;
  };
}

export function DeviceDetailPage({ 
  name = "Nestor Device",
  firmwareVersion = "1.0.0",
  lastSynced = "Just now",
  macAddress = "5C:02:B7:AD:F3:E1",
  modelName = "Nestor Health Pro",
  signalStrength = 85,
  isConnected = true,
  updateAvailable
}: DeviceProps) {
  
  const [checking, setChecking] = useState(false);
  const [activeSettings, setActiveSettings] = useState<'display' | 'vibration' | 'advanced' | null>(null);
  
  // Settings state
  const [displaySettings, setDisplaySettings] = useState<DisplaySettingsValues>({
    textSize: 100,
    highContrast: false,
    reduceMotion: false,
    theme: 'system'
  });
  
  const [vibrationSettings, setVibrationSettings] = useState<VibrationSettingsValues>({
    enabled: true,
    intensity: 50,
    alerts: true,
    hapticFeedback: true
  });
  
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettingsValues>({
    powerSaving: true,
    dataSyncFrequency: 30,
    locationTracking: false,
    developerMode: false,
    dataCollection: true
  });
  
  // Handle checking for updates
  const checkForUpdates = () => {
    setChecking(true);
    // Simulate checking for updates
    setTimeout(() => {
      setChecking(false);
    }, 2000);
  };
  
  // Handle configuration
  const handleConfigure = (setting: 'display' | 'vibration' | 'advanced') => {
    setActiveSettings(setting);
  };
  
  // Handle save display settings
  const handleSaveDisplaySettings = (settings: DisplaySettingsValues) => {
    setDisplaySettings(settings);
    // Apply theme
    const html = document.documentElement;
    if (settings.theme === 'dark') {
      html.classList.add('dark');
    } else if (settings.theme === 'light') {
      html.classList.remove('dark');
    } else {
      // System - check prefers-color-scheme
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        html.classList.add('dark');
      } else {
        html.classList.remove('dark');
      }
    }
    
    // Apply reduced motion
    if (settings.reduceMotion) {
      html.classList.add('reduce-motion');
    } else {
      html.classList.remove('reduce-motion');
    }
    
    // Apply high contrast
    if (settings.highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }
  };
  
  // Handle save vibration settings
  const handleSaveVibrationSettings = (settings: VibrationSettingsValues) => {
    setVibrationSettings(settings);
    console.log('Vibration settings saved:', settings);
  };
  
  // Handle save advanced settings
  const handleSaveAdvancedSettings = (settings: AdvancedSettingsValues) => {
    setAdvancedSettings(settings);
    console.log('Advanced settings saved:', settings);
  };
  
  return (
    <div className="space-y-4 pb-24">
      {/* Connection Status Tabs */}
      <div className="grid grid-cols-2 text-center mb-2">
        <div className={`pb-2 ${isConnected ? 'font-medium border-b-2 border-primary' : 'text-gray-500'}`}>
          Connected
        </div>
        <div className={`pb-2 ${!isConnected ? 'font-medium border-b-2 border-primary' : 'text-gray-500'}`}>
          Available
        </div>
      </div>
      
      {/* Device Info Card */}
      <Card className="p-0 overflow-hidden border rounded-lg">
        <div className="flex">
          {/* Bluetooth Visualization */}
          <div className="w-[250px] h-[150px] bg-blue-50 flex items-center justify-center">
            <Bluetooth className="h-10 w-10 text-blue-600" />
          </div>
          
          {/* Device Info */}
          <div className="p-4 flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">{name}</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500"></span>
              <span className="text-sm text-green-600">Connected</span>
            </div>
            
            <div className="flex items-center mt-3">
              <span className="text-sm text-gray-500 mr-2">{signalStrength}%</span>
              <span className="text-sm text-gray-500 mr-1">Signal:</span>
              <SignalStrength 
                strength={signalStrength >= 80 ? 'strong' : signalStrength >= 40 ? 'medium' : 'weak'} 
              />
            </div>
          </div>
        </div>
      </Card>
      
      {/* Device Information Card */}
      <Card className="overflow-hidden border rounded-lg">
        <div className="p-4">
          <h3 className="text-center font-medium pb-3 border-b">Device Information</h3>
          
          <div className="space-y-4 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Firmware Version</span>
              <span className="text-sm">{firmwareVersion}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Last Synced</span>
              <span className="text-sm">{lastSynced}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">MAC Address</span>
              <span className="text-sm">{macAddress}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Model</span>
              <span className="text-sm">{modelName}</span>
            </div>
          </div>
          
          {updateAvailable && (
            <div className="mt-4 bg-blue-50 p-4 rounded-md">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full border border-blue-500 flex items-center justify-center">
                  <div className="h-1 w-1 rounded-full bg-blue-500"></div>
                </div>
                <span className="text-sm text-blue-700">
                  Firmware update available (v{updateAvailable.version})
                </span>
              </div>
            </div>
          )}
          
          <div className="mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full rounded-md border-gray-200"
              onClick={checkForUpdates}
              disabled={checking}
            >
              {checking ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : "Check for updates"}
            </Button>
          </div>
        </div>
      </Card>
      
      {/* Device Settings Card */}
      <Card className="overflow-hidden border rounded-lg">
        <div className="p-4">
          <h3 className="text-center font-medium pb-3 border-b">Device Settings</h3>
          
          <div className="space-y-4 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Vibration</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8 px-4 rounded-md"
                onClick={() => handleConfigure('vibration')}
              >
                Configure
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Display</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8 px-4 rounded-md"
                onClick={() => handleConfigure('display')}
              >
                Configure
              </Button>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm">Advanced</span>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-8 px-4 rounded-md"
                onClick={() => handleConfigure('advanced')}
              >
                Configure
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Settings Dialogs */}
      <Dialog open={activeSettings === 'display'} onOpenChange={() => setActiveSettings(null)}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-md">
          <DisplaySettings 
            onClose={() => setActiveSettings(null)} 
            onSave={handleSaveDisplaySettings}
            initialSettings={displaySettings}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={activeSettings === 'vibration'} onOpenChange={() => setActiveSettings(null)}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-md">
          <VibrationSettings 
            onClose={() => setActiveSettings(null)} 
            onSave={handleSaveVibrationSettings}
            initialSettings={vibrationSettings}
          />
        </DialogContent>
      </Dialog>
      
      <Dialog open={activeSettings === 'advanced'} onOpenChange={() => setActiveSettings(null)}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-md">
          <AdvancedSettings 
            onClose={() => setActiveSettings(null)} 
            onSave={handleSaveAdvancedSettings}
            initialSettings={advancedSettings}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DeviceDetailPage; 