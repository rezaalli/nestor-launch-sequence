import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUser } from '@/contexts/UserContext';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import DisplaySettings from '@/components/DisplaySettings';
import DeviceDetailPage from '@/components/DeviceDetailPage';
import AccountInfoForm from '@/components/AccountInfoForm';
import ProfileImageUploader from '@/components/ProfileImageUploader';
import HelpSupportSection from '@/components/HelpSupportSection';
import { 
  User, Bell, Palette, Shield, Watch, HelpCircle, 
  ChevronRight, ArrowLeft, Download, ExternalLink,
  PlusCircle, Trash2, AlertCircle
} from 'lucide-react';

// Define a device interface
interface Device {
  id: string;
  name: string;
  type: 'watch' | 'scale' | 'band';
  status: 'connected' | 'disconnected';
  firmwareVersion: string;
  lastSynced: string;
  macAddress: string;
  modelName: string;
  signalStrength: number;
  updateAvailable?: {
    version: string;
  };
}

interface ProfileProps {
  onShowOnboarding?: () => void;
}

const Profile: React.FC<ProfileProps> = ({ onShowOnboarding }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const { signOut } = useAuth();
  const [activeScreen, setActiveScreen] = useState<'overview' | 'account' | 'privacy' | 'appearance' | 'devices' | 'help'>('overview');
  const [displaySettingsOpen, setDisplaySettingsOpen] = useState(false);
  const [deviceDetailOpen, setDeviceDetailOpen] = useState(false);
  const [addDeviceDialogOpen, setAddDeviceDialogOpen] = useState(false);
  const [removeDeviceDialogOpen, setRemoveDeviceDialogOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [cloudSync, setCloudSync] = useState(true);
  const [biometricLogin, setBiometricLogin] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [accentColor, setAccentColor] = useState<'blue' | 'teal' | 'purple' | 'rose' | 'amber'>('blue');
  const [matchUIToWatch, setMatchUIToWatch] = useState(true);
  
  // Sample connected devices
  const [devices, setDevices] = useState<Device[]>([
    {
      id: '1',
      name: 'Nestor Watch',
      type: 'watch',
      status: 'connected',
      firmwareVersion: '1.2.0',
      lastSynced: '10 minutes ago',
      macAddress: '5C:02:B7:AD:F3:E1',
      modelName: 'Nestor Health Pro',
      signalStrength: 85,
      updateAvailable: { version: '1.3.0' }
    },
    {
      id: '2',
      name: 'Nestor Scale',
      type: 'scale',
      status: 'connected',
      firmwareVersion: '2.1.0',
      lastSynced: '1 hour ago',
      macAddress: '3A:45:C9:D8:F2:E7',
      modelName: 'Nestor Smart Scale',
      signalStrength: 92
    }
  ]);

  // Sample available devices to add
  const availableDevices: Device[] = [
    {
      id: '3',
      name: 'Nestor Band',
      type: 'band',
      status: 'disconnected',
      firmwareVersion: '1.0.0',
      lastSynced: 'Never',
      macAddress: '7B:22:F1:A3:C8:D9',
      modelName: 'Nestor Fitness Band',
      signalStrength: 75
    },
    {
      id: '4',
      name: 'Nestor Watch Pro',
      type: 'watch',
      status: 'disconnected',
      firmwareVersion: '2.0.0',
      lastSynced: 'Never',
      macAddress: '8D:55:E9:B2:A1:F6',
      modelName: 'Nestor Watch Pro',
      signalStrength: 80
    }
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    toast({
      title: "Signed out",
      description: "You have been signed out successfully"
    });
  };

  const handleDownloadData = () => {
    toast({
      title: "Download started",
      description: "Your data is being prepared for download"
    });
  };

  const handleViewDeviceDetails = (device: Device) => {
    setSelectedDevice(device);
    setDeviceDetailOpen(true);
  };

  const handleAddDevice = (device: Device) => {
    setDevices(prev => [...prev, {...device, status: 'connected'}]);
    setAddDeviceDialogOpen(false);
    toast({
      title: "Device connected",
      description: `${device.name} has been connected successfully`
    });
  };

  const handleRemoveDevice = (deviceId: string) => {
    if (devices.length <= 1) {
      toast({
        title: "Cannot remove device",
        description: "At least one device must remain connected",
        variant: "destructive"
      });
      return;
    }
    
    setDevices(prev => prev.filter(d => d.id !== deviceId));
    setRemoveDeviceDialogOpen(false);
    toast({
      title: "Device removed",
      description: "The device has been disconnected successfully"
    });
  };

  const openRemoveDialog = (device: Device) => {
    setSelectedDevice(device);
    setRemoveDeviceDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Overview Screen */}
      {activeScreen === 'overview' && (
        <div className="flex flex-col min-h-screen">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h1 className="text-xl font-semibold text-gray-900">Profile & Settings</h1>
          </div>
          
          <div className="flex-1 px-6 py-6">
            {/* User Profile Card */}
            <div className="flex items-center space-x-4 mb-8">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <ProfileImageUploader size="md" centered={false} />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">{user?.name || "User"}</h2>
                <p className="text-gray-600">{user?.email || "user@example.com"}</p>
              </div>
            </div>
            
            {/* Settings Sections */}
            <div className="space-y-4">
              {/* Account Info */}
              <div 
                className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between"
                onClick={() => setActiveScreen('account')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-blue-900" />
                  </div>
                  <span className="font-medium text-gray-800">Account Info</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              {/* Data & Privacy */}
              <div 
                className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between"
                onClick={() => setActiveScreen('privacy')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Shield className="h-5 w-5 text-blue-900" />
                  </div>
                  <span className="font-medium text-gray-800">Data & Privacy</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              {/* Appearance */}
              <div 
                className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between"
                onClick={() => setActiveScreen('appearance')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Palette className="h-5 w-5 text-blue-900" />
                  </div>
                  <span className="font-medium text-gray-800">Appearance</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              {/* Notifications */}
              <div className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Bell className="h-5 w-5 text-blue-900" />
                  </div>
                  <span className="font-medium text-gray-800">Notifications</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              {/* Connected Devices */}
              <div 
                className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between"
                onClick={() => setActiveScreen('devices')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Watch className="h-5 w-5 text-blue-900" />
                  </div>
                  <span className="font-medium text-gray-800">Connected Devices</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
              
              {/* Help & Support */}
              <div 
                className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between"
                onClick={() => setActiveScreen('help')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <HelpCircle className="h-5 w-5 text-blue-900" />
                  </div>
                  <span className="font-medium text-gray-800">Help & Support</span>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
          
          {/* Bottom Navigation */}
          <div className="h-16 border-t border-gray-200 flex items-center justify-around px-6">
            <div className="flex flex-col items-center" onClick={() => navigate('/')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span className="text-xs text-gray-400 mt-1">Home</span>
            </div>
            <div className="flex flex-col items-center" onClick={() => navigate('/insights')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                <path d="M3 3v18h18" />
                <path d="m19 9-5 5-4-4-3 3" />
              </svg>
              <span className="text-xs text-gray-400 mt-1">Insights</span>
            </div>
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-900">
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span className="text-xs text-blue-900 mt-1">Profile</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Account Info Screen */}
      {activeScreen === 'account' && (
        <div className="flex flex-col min-h-screen bg-white">
          {/* Header with Back Button */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center">
            <button className="mr-4" onClick={() => setActiveScreen('overview')}>
              <ArrowLeft className="h-5 w-5 text-gray-800" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Account Info</h1>
      </div>

          <div className="flex-1 px-6 py-6">
            <AccountInfoForm />
          </div>
        </div>
      )}
      
      {/* Privacy Screen */}
      {activeScreen === 'privacy' && (
        <div className="flex flex-col min-h-screen bg-white">
          {/* Header with Back Button */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center">
            <button className="mr-4" onClick={() => setActiveScreen('overview')}>
              <ArrowLeft className="h-5 w-5 text-gray-800" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Data & Privacy</h1>
          </div>
          
          <div className="flex-1 px-6 py-6">
            <div className="space-y-6">
              {/* Cloud Sync Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Cloud Sync</h3>
                  <p className="text-sm text-gray-600 mt-1">Sync your data across devices</p>
                </div>
                <Switch 
                  checked={cloudSync} 
                  onCheckedChange={setCloudSync} 
                />
              </div>
              
              {/* Biometric Login Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Biometric Login</h3>
                  <p className="text-sm text-gray-600 mt-1">Use Face ID or Touch ID to log in</p>
                </div>
                <Switch 
                  checked={biometricLogin}
                  onCheckedChange={setBiometricLogin}
                />
              </div>
              
              {/* Download Data Button */}
              <div className="pt-4">
                <Button 
                  variant="outline" 
                  className="w-full py-4 border border-blue-900 text-blue-900 font-medium rounded-lg flex items-center justify-center"
                  onClick={handleDownloadData}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download My Data
                </Button>
              </div>
              
              {/* Legal Links */}
              <div className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <span className="block text-gray-700 font-medium cursor-pointer">Privacy Policy</span>
                  <ExternalLink className="h-4 w-4 text-gray-400 text-sm" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="block text-gray-700 font-medium cursor-pointer">Terms of Service</span>
                  <ExternalLink className="h-4 w-4 text-gray-400 text-sm" />
                </div>
              </div>
              
              {/* Delete Account */}
              <div className="pt-6">
                <Button 
                  variant="outline"
                  className="w-full py-4 border border-red-500 text-red-500 font-medium rounded-lg"
                >
                  Delete My Account
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Appearance Screen */}
      {activeScreen === 'appearance' && (
        <div className="flex flex-col min-h-screen bg-white">
          {/* Header with Back Button */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center">
            <button className="mr-4" onClick={() => setActiveScreen('overview')}>
              <ArrowLeft className="h-5 w-5 text-gray-800" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">App Appearance</h1>
          </div>
          
          <div className="flex-1 px-6 py-6">
            {/* Theme Selector */}
            <div className="mb-8">
              <h2 className="text-base font-medium text-gray-900 mb-4">Theme</h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <input 
                    type="radio" 
                    id="light-theme" 
                    name="theme" 
                    className="peer hidden" 
                    checked={theme === 'light'}
                    onChange={() => setTheme('light')}
                  />
                  <label 
                    htmlFor="light-theme" 
                    className="block aspect-square border border-gray-300 rounded-lg cursor-pointer overflow-hidden peer-checked:ring-2 peer-checked:ring-blue-900"
                  >
                    <div className="h-full bg-white">
                      <div className="h-1/4 bg-gray-100"></div>
                    </div>
                  </label>
                  <span className="block text-center text-sm mt-2">Light</span>
                </div>
                
                <div className="relative">
                  <input 
                    type="radio" 
                    id="dark-theme" 
                    name="theme" 
                    className="peer hidden"
                    checked={theme === 'dark'}
                    onChange={() => setTheme('dark')}
                  />
                  <label 
                    htmlFor="dark-theme" 
                    className="block aspect-square border border-gray-300 rounded-lg cursor-pointer overflow-hidden peer-checked:ring-2 peer-checked:ring-blue-900"
                  >
                    <div className="h-full bg-gray-900">
                      <div className="h-1/4 bg-gray-800"></div>
                    </div>
                  </label>
                  <span className="block text-center text-sm mt-2">Dark</span>
                </div>
                
                <div className="relative">
                  <input 
                    type="radio" 
                    id="system-theme" 
                    name="theme" 
                    className="peer hidden"
                    checked={theme === 'system'}
                    onChange={() => setTheme('system')}
                  />
                  <label 
                    htmlFor="system-theme" 
                    className="block aspect-square border border-gray-300 rounded-lg cursor-pointer overflow-hidden peer-checked:ring-2 peer-checked:ring-blue-900"
                  >
                    <div className="h-full flex">
                      <div className="w-1/2 bg-white">
                        <div className="h-1/4 bg-gray-100"></div>
                      </div>
                      <div className="w-1/2 bg-gray-900">
                        <div className="h-1/4 bg-gray-800"></div>
                      </div>
                    </div>
                  </label>
                  <span className="block text-center text-sm mt-2">System</span>
                </div>
              </div>
            </div>
            
            {/* Accent Color Picker */}
            <div className="mb-8">
              <h2 className="text-base font-medium text-gray-900 mb-4">Accent Color</h2>
              
              <div className="grid grid-cols-5 gap-4">
                <div className="relative">
                  <input 
                    type="radio" 
                    id="blue-accent" 
                    name="accent" 
                    className="peer hidden" 
                    checked={accentColor === 'blue'}
                    onChange={() => setAccentColor('blue')}
                  />
                  <label 
                    htmlFor="blue-accent" 
                    className="block w-12 h-12 bg-blue-900 rounded-full cursor-pointer peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-blue-900"
                  ></label>
                </div>
                
                <div className="relative">
                  <input 
                    type="radio" 
                    id="teal-accent" 
                    name="accent" 
                    className="peer hidden"
                    checked={accentColor === 'teal'}
                    onChange={() => setAccentColor('teal')}
                  />
                  <label 
                    htmlFor="teal-accent" 
                    className="block w-12 h-12 bg-teal-600 rounded-full cursor-pointer peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-teal-600"
                  ></label>
                </div>
                
                <div className="relative">
                  <input 
                    type="radio" 
                    id="purple-accent" 
                    name="accent" 
                    className="peer hidden"
                    checked={accentColor === 'purple'}
                    onChange={() => setAccentColor('purple')}
                  />
                  <label 
                    htmlFor="purple-accent" 
                    className="block w-12 h-12 bg-purple-600 rounded-full cursor-pointer peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-purple-600"
                  ></label>
                </div>
                
                <div className="relative">
                  <input 
                    type="radio" 
                    id="rose-accent" 
                    name="accent" 
                    className="peer hidden"
                    checked={accentColor === 'rose'}
                    onChange={() => setAccentColor('rose')}
                  />
                  <label 
                    htmlFor="rose-accent" 
                    className="block w-12 h-12 bg-rose-600 rounded-full cursor-pointer peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-rose-600"
                  ></label>
                </div>
                
                <div className="relative">
                  <input 
                    type="radio" 
                    id="amber-accent" 
                    name="accent" 
                    className="peer hidden"
                    checked={accentColor === 'amber'}
                    onChange={() => setAccentColor('amber')}
                  />
                  <label 
                    htmlFor="amber-accent" 
                    className="block w-12 h-12 bg-amber-500 rounded-full cursor-pointer peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-amber-500"
                  ></label>
                </div>
              </div>
            </div>
            
            {/* Match UI to Watch Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Match UI to Watch</h3>
                <p className="text-sm text-gray-600 mt-1">Adapt UI to your connected watch theme</p>
              </div>
              <Switch 
                checked={matchUIToWatch}
                onCheckedChange={setMatchUIToWatch}
              />
            </div>
            
            {/* Open DisplaySettings Dialog */}
            <div className="mt-8">
              <Button
                className="w-full py-4 bg-blue-900 text-white font-medium rounded-lg shadow-sm"
                onClick={() => setDisplaySettingsOpen(true)}
              >
                Advanced Display Settings
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Devices Screen */}
      {activeScreen === 'devices' && (
        <div className="flex flex-col min-h-screen bg-white">
          {/* Header with Back Button */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center">
            <button className="mr-4" onClick={() => setActiveScreen('overview')}>
              <ArrowLeft className="h-5 w-5 text-gray-800" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Connected Devices</h1>
          </div>
          
          <div className="flex-1 px-6 py-6">
            <div className="space-y-4">
              {/* Connected devices list */}
              {devices.map(device => (
                <div 
                  key={device.id}
                  className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3" onClick={() => handleViewDeviceDetails(device)}>
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                      <Watch className="h-5 w-5 text-blue-900" />
                    </div>
                    <div>
                      <span className="font-medium text-gray-800">{device.name}</span>
                      <p className="text-xs text-gray-500">Connected</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button 
                      className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                      onClick={() => openRemoveDialog(device)}
                    >
                      <Trash2 className="h-4 w-4 text-gray-500" />
                    </button>
                    <button 
                      className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                      onClick={() => handleViewDeviceDetails(device)}
                    >
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>
              ))}
              
              {/* Add a new device button */}
              <Button 
                variant="outline"
                className="w-full mt-4 py-4 flex items-center justify-center gap-2 rounded-lg border-dashed border-2 border-gray-300"
                onClick={() => setAddDeviceDialogOpen(true)}
              >
                <PlusCircle className="h-5 w-5 text-blue-900" />
                <span>Add New Device</span>
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Help & Support Screen */}
      {activeScreen === 'help' && (
        <HelpSupportSection onBack={() => setActiveScreen('overview')} />
      )}
      
      {/* Display Settings Dialog */}
      <Dialog open={displaySettingsOpen} onOpenChange={setDisplaySettingsOpen}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-md">
          <DisplaySettings 
            onClose={() => setDisplaySettingsOpen(false)} 
            onSave={(settings) => {
              if (settings.theme !== theme) {
                setTheme(settings.theme);
              }
              setDisplaySettingsOpen(false);
            }}
            initialSettings={{ 
              textSize: 100,
              highContrast: false,
              reduceMotion: false,
              theme
            }}
          />
        </DialogContent>
      </Dialog>
      
      {/* Device Detail Dialog */}
      <Dialog open={deviceDetailOpen} onOpenChange={setDeviceDetailOpen}>
        <DialogContent className="p-0 border-none bg-transparent shadow-none max-w-md">
          {selectedDevice && (
            <DeviceDetailPage 
              name={selectedDevice.name}
              firmwareVersion={selectedDevice.firmwareVersion}
              lastSynced={selectedDevice.lastSynced}
              macAddress={selectedDevice.macAddress}
              modelName={selectedDevice.modelName}
              signalStrength={selectedDevice.signalStrength}
              isConnected={selectedDevice.status === 'connected'}
              updateAvailable={selectedDevice.updateAvailable}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Add Device Dialog */}
      <Dialog open={addDeviceDialogOpen} onOpenChange={setAddDeviceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Connect a New Device</DialogTitle>
            <DialogDescription>
              Select a device from the list below to connect with your Nestor Health account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 my-4">
            {availableDevices.map(device => (
              <div 
                key={device.id}
                className="p-3 bg-white rounded-lg border border-gray-200 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                onClick={() => handleAddDevice(device)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Watch className="h-5 w-5 text-blue-900" />
                  </div>
                  <div>
                    <span className="font-medium text-gray-800">{device.name}</span>
                    <p className="text-xs text-gray-500">{device.modelName}</p>
                  </div>
                </div>
                <PlusCircle className="h-5 w-5 text-blue-900" />
              </div>
            ))}
          </div>
          
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => setAddDeviceDialogOpen(false)}
          >
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
      
      {/* Remove Device Confirmation Dialog */}
      <Dialog open={removeDeviceDialogOpen} onOpenChange={setRemoveDeviceDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Device</DialogTitle>
            <DialogDescription>
              Are you sure you want to disconnect this device? You can reconnect it at any time.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDevice && (
            <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3 my-4">
              <AlertCircle className="h-5 w-5 text-blue-900 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">You're disconnecting:</p>
                <p className="text-sm text-gray-600">{selectedDevice.name} ({selectedDevice.modelName})</p>
              </div>
            </div>
          )}
          
          <div className="flex gap-4 justify-end">
            <Button 
              variant="outline" 
              onClick={() => setRemoveDeviceDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => selectedDevice && handleRemoveDevice(selectedDevice.id)}
            >
              Remove Device
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
