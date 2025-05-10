
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '@/components/StatusBar';
import BottomNavbar from '@/components/BottomNavbar';
import { Button } from '@/components/ui/button';
import Toggle from '@/components/Toggle';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  ScrollArea,
  ScrollBar
} from '@/components/ui/scroll-area';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { useUser } from '@/contexts/UserContext';
import { 
  ChevronRight, 
  Settings, 
  Bell, 
  Shield, 
  Info, 
  Bluetooth, 
  FlaskConical, 
  User, 
  Palette,
  Calendar,
  Download,
  ExternalLink,
  X,
  Check
} from 'lucide-react';
import DeviceStatus from '@/components/DeviceStatus';
import HapticAlertSettings from '@/components/HapticAlertSettings';
import { formatTemperature } from '@/utils/bleUtils';
import FirmwareUpdatePage from '@/components/FirmwareUpdatePage';

const Profile = () => {
  const [activeScreen, setActiveScreen] = useState<'overview' | 'account' | 'privacy' | 'appearance' | 'firmware'>('overview');
  const [hapticSettingsOpen, setHapticSettingsOpen] = useState(false);
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  
  // Set user preference to imperial units when component mounts
  useEffect(() => {
    if (user.unitPreference !== 'imperial') {
      updateUser({
        unitPreference: 'imperial'
      });
    }
  }, []);
  
  const toggleTempUnit = () => {
    // Keep it locked to imperial
    if (user.unitPreference !== 'imperial') {
      updateUser({
        unitPreference: 'imperial'
      });
    }
  };
  
  const goBack = () => {
    if (activeScreen !== 'overview') {
      setActiveScreen('overview');
    } else {
      navigate('/dashboard');
    }
  };

  const renderOverview = () => (
    <div className="flex-1 px-6 py-6">
      {/* User Profile Card */}
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-16 h-16 rounded-full overflow-hidden">
          <img 
            src={user.avatar} 
            alt="Profile" 
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-lg font-medium text-gray-900">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>
      
      {/* Settings Sections */}
      <div className="space-y-4">
        {/* Account Info */}
        <div 
          className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => setActiveScreen('account')}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-nestor-blue" />
            </div>
            <span className="font-medium text-gray-800">Account Info</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
        
        {/* Privacy */}
        <div 
          className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => setActiveScreen('privacy')}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Shield className="h-5 w-5 text-nestor-blue" />
            </div>
            <span className="font-medium text-gray-800">Privacy</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
        
        {/* Appearance */}
        <div 
          className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => setActiveScreen('appearance')}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Palette className="h-5 w-5 text-nestor-blue" />
            </div>
            <span className="font-medium text-gray-800">Appearance</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
        
        {/* Notifications */}
        <div 
          className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => setHapticSettingsOpen(true)}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Bell className="h-5 w-5 text-nestor-blue" />
            </div>
            <span className="font-medium text-gray-800">Notifications</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
        
        {/* Haptic Alert Settings Modal */}
        <HapticAlertSettings open={hapticSettingsOpen} onOpenChange={setHapticSettingsOpen} />
        
        {/* Connected Devices */}
        <div className="p-4 bg-white rounded-lg border border-gray-200 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                <Bluetooth className="h-5 w-5 text-nestor-blue" />
              </div>
              <span className="font-medium text-gray-800">Connected Devices</span>
            </div>
          </div>
          <div className="mt-4 pl-12">
            <DeviceStatus />
          </div>
        </div>
        
        {/* Firmware Update */}
        <div 
          className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer"
          onClick={() => setActiveScreen('firmware')}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <FlaskConical className="h-5 w-5 text-nestor-blue" />
            </div>
            <span className="font-medium text-gray-800">Firmware Update</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
        
        {/* Help & Support */}
        <div className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
              <Info className="h-5 w-5 text-nestor-blue" />
            </div>
            <span className="font-medium text-gray-800">About Nestor</span>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      {/* Sign Out Button */}
      <div className="mt-8">
        <Button variant="outline" className="w-full">
          Sign Out
        </Button>
      </div>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="flex-1 px-6 py-6">
      <div className="space-y-6">
        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm text-gray-600 font-medium">Email Address</Label>
          <Input 
            type="email" 
            id="email" 
            className="w-full p-4 border border-gray-300 rounded-lg" 
            value={user.email} 
            disabled
          />
        </div>
        
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm text-gray-600 font-medium">Full Name</Label>
          <Input 
            type="text" 
            id="name" 
            className="w-full p-4 border border-gray-300 rounded-lg" 
            value={user.name} 
          />
        </div>
        
        {/* Unit Preference */}
        <div className="space-y-2">
          <Label className="text-sm text-gray-600 font-medium">Unit Preference</Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <input 
                type="radio" 
                id="imperial" 
                name="unit" 
                className="peer hidden" 
                checked={user.unitPreference === 'imperial'} 
                onChange={() => updateUser({ unitPreference: 'imperial' })}
              />
              <label 
                htmlFor="imperial" 
                className="block w-full p-4 text-center border border-gray-300 rounded-lg cursor-pointer peer-checked:bg-nestor-blue peer-checked:text-white peer-checked:border-nestor-blue"
              >
                Imperial
              </label>
            </div>
            <div className="relative">
              <input 
                type="radio" 
                id="metric" 
                name="unit" 
                className="peer hidden"
                checked={user.unitPreference === 'metric'}
                onChange={() => updateUser({ unitPreference: 'metric' })}
                disabled
              />
              <label 
                htmlFor="metric" 
                className="block w-full p-4 text-center border border-gray-300 rounded-lg cursor-not-allowed opacity-50"
              >
                Metric
              </label>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">Imperial units are required for this device</p>
        </div>
      </div>
      
      {/* Save Button */}
      <div className="mt-8">
        <Button 
          className="w-full py-4 bg-nestor-blue text-white font-medium rounded-lg shadow-sm"
          onClick={goBack}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderPrivacy = () => (
    <div className="flex-1 px-6 py-6">
      <div className="space-y-6">
        {/* Cloud Sync Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Cloud Sync</h3>
            <p className="text-sm text-gray-600 mt-1">Sync your data across devices</p>
          </div>
          <Toggle checked={true} onChange={() => {}} />
        </div>
        
        {/* Download Data Button */}
        <div className="pt-4">
          <Button variant="outline" className="w-full flex items-center justify-center">
            <Download className="mr-2 h-4 w-4" />
            Download My Data
          </Button>
        </div>
        
        {/* Legal Links */}
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700 font-medium">Privacy Policy</span>
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </div>
          <div className="flex items-center justify-between cursor-pointer">
            <span className="text-gray-700 font-medium">Terms of Service</span>
            <ExternalLink className="h-4 w-4 text-gray-400" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAppearance = () => (
    <div className="flex-1 px-6 py-6">
      {/* Theme Selector */}
      <div className="mb-8">
        <h2 className="text-base font-medium text-gray-900 mb-4">Theme</h2>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="relative">
            <input type="radio" id="light-theme" name="theme" className="peer hidden" checked />
            <label 
              htmlFor="light-theme" 
              className="block aspect-square border border-gray-300 rounded-lg cursor-pointer overflow-hidden peer-checked:ring-2 peer-checked:ring-nestor-blue"
            >
              <div className="h-full bg-white">
                <div className="h-1/4 bg-gray-100"></div>
              </div>
            </label>
            <span className="block text-center text-sm mt-2">Light</span>
          </div>
          
          <div className="relative">
            <input type="radio" id="dark-theme" name="theme" className="peer hidden" />
            <label 
              htmlFor="dark-theme" 
              className="block aspect-square border border-gray-300 rounded-lg cursor-pointer overflow-hidden peer-checked:ring-2 peer-checked:ring-nestor-blue"
            >
              <div className="h-full bg-gray-900">
                <div className="h-1/4 bg-gray-800"></div>
              </div>
            </label>
            <span className="block text-center text-sm mt-2">Dark</span>
          </div>
          
          <div className="relative">
            <input type="radio" id="system-theme" name="theme" className="peer hidden" />
            <label 
              htmlFor="system-theme"
              className="block aspect-square border border-gray-300 rounded-lg cursor-pointer overflow-hidden peer-checked:ring-2 peer-checked:ring-nestor-blue"
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
      
      {/* Match UI to Watch Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-900">Match UI to Watch</h3>
          <p className="text-sm text-gray-600 mt-1">Adapt UI to your connected watch theme</p>
        </div>
        <Toggle checked={true} onChange={() => {}} />
      </div>
      
      {/* Save Button */}
      <div className="mt-8">
        <Button 
          className="w-full py-4 bg-nestor-blue text-white font-medium rounded-lg shadow-sm"
          onClick={goBack}
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StatusBar />
      
      <div className="flex-1 pb-16">
        {/* Header */}
        <div className="bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {activeScreen !== 'overview' && (
                <button className="mr-2" onClick={goBack}>
                  <ChevronRight className="rotate-180 h-5 w-5 text-gray-700" />
                </button>
              )}
              <h1 className="text-xl font-medium text-nestor-gray-900">
                {activeScreen === 'overview' 
                  ? 'Profile & Settings' 
                  : activeScreen === 'account' 
                    ? 'Account Info' 
                    : activeScreen === 'privacy' 
                      ? 'Privacy & Data' 
                      : activeScreen === 'appearance' 
                        ? 'App Appearance' 
                        : 'Firmware Update'
                }
              </h1>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          {activeScreen === 'overview' && renderOverview()}
          {activeScreen === 'account' && renderAccountSettings()}
          {activeScreen === 'privacy' && renderPrivacy()}
          {activeScreen === 'appearance' && renderAppearance()}
          {activeScreen === 'firmware' && <FirmwareUpdatePage />}
          <ScrollBar />
        </ScrollArea>
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default Profile;
