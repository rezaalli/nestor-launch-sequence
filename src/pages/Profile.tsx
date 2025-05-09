
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBar from '@/components/StatusBar';
import BottomNavbar from '@/components/BottomNavbar';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import { ChevronRight, Settings, Bell, Shield, Info, Bluetooth, FlaskConical } from 'lucide-react';
import DeviceStatus from '@/components/DeviceStatus';
import HapticAlertSettings from '@/components/HapticAlertSettings';
import { formatTemperature } from '@/utils/bleUtils';
import FirmwareUpdatePage from '@/components/FirmwareUpdatePage';

const Profile = () => {
  const [activeSection, setActiveSection] = useState<'general' | 'firmware'>('general');
  const { user, updateUser } = useUser();
  const navigate = useNavigate();
  
  const toggleTempUnit = () => {
    updateUser({
      ...user,
      unitPreference: user.unitPreference === 'metric' ? 'imperial' : 'metric'
    });
  };
  
  const goBack = () => {
    if (activeSection !== 'general') {
      setActiveSection('general');
    } else {
      navigate('/dashboard');
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StatusBar />
      
      <div className="flex-1 pb-16">
        {/* Header */}
        <div className="bg-white px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button className="mr-2" onClick={goBack}>
                <ChevronRight className="rotate-180 h-5 w-5 text-gray-700" />
              </button>
              <h1 className="text-xl font-medium text-nestor-gray-900">
                {activeSection === 'general' ? 'Settings' : 'Firmware Update'}
              </h1>
            </div>
          </div>
        </div>
        
        <ScrollArea className="flex-1">
          {activeSection === 'general' ? (
            <div className="px-6 py-4 space-y-6">
              {/* User Info */}
              <div className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm">
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-16 h-16 rounded-full" 
                />
                <div>
                  <h2 className="text-xl font-medium">{user.name}</h2>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              
              {/* Device Status */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-nestor-gray-500">DEVICE</h3>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <DeviceStatus />
                </div>
              </div>
              
              {/* Alert Settings */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-nestor-gray-500">ALERT SETTINGS</h3>
                <div className="bg-white rounded-xl p-4 shadow-sm">
                  <HapticAlertSettings />
                </div>
              </div>
              
              {/* Unit Preferences */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-nestor-gray-500">PREFERENCES</h3>
                <div className="bg-white rounded-xl divide-y divide-gray-100 shadow-sm">
                  <div className="p-4 flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-nestor-gray-900">Temperature Unit</h4>
                      <p className="text-sm text-nestor-gray-500">
                        {user.unitPreference === 'metric' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}
                      </p>
                    </div>
                    <Switch 
                      checked={user.unitPreference === 'imperial'} 
                      onCheckedChange={toggleTempUnit} 
                    />
                  </div>
                </div>
              </div>
              
              {/* Device Management */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-nestor-gray-500">DEVICE MANAGEMENT</h3>
                <div className="bg-white rounded-xl divide-y divide-gray-100 shadow-sm">
                  <button 
                    className="p-4 flex items-center justify-between w-full text-left"
                    onClick={() => setActiveSection('firmware')}
                  >
                    <div className="flex items-center">
                      <FlaskConical className="h-5 w-5 text-nestor-gray-700 mr-3" />
                      <div>
                        <h4 className="font-medium text-nestor-gray-900">Firmware Update</h4>
                        <p className="text-sm text-nestor-gray-500">Check for device updates</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-nestor-gray-500" />
                  </button>
                  
                  <button className="p-4 flex items-center justify-between w-full text-left">
                    <div className="flex items-center">
                      <Bluetooth className="h-5 w-5 text-nestor-gray-700 mr-3" />
                      <div>
                        <h4 className="font-medium text-nestor-gray-900">Bluetooth Settings</h4>
                        <p className="text-sm text-nestor-gray-500">Manage connection settings</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-nestor-gray-500" />
                  </button>
                </div>
              </div>
              
              {/* About */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-nestor-gray-500">ABOUT</h3>
                <div className="bg-white rounded-xl divide-y divide-gray-100 shadow-sm">
                  <button className="p-4 flex items-center justify-between w-full text-left">
                    <div className="flex items-center">
                      <Info className="h-5 w-5 text-nestor-gray-700 mr-3" />
                      <div>
                        <h4 className="font-medium text-nestor-gray-900">About Nestor</h4>
                        <p className="text-sm text-nestor-gray-500">App version 1.0.0</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-nestor-gray-500" />
                  </button>
                  
                  <button className="p-4 flex items-center justify-between w-full text-left">
                    <div className="flex items-center">
                      <Shield className="h-5 w-5 text-nestor-gray-700 mr-3" />
                      <div>
                        <h4 className="font-medium text-nestor-gray-900">Privacy Policy</h4>
                        <p className="text-sm text-nestor-gray-500">How we protect your data</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-nestor-gray-500" />
                  </button>
                </div>
              </div>
              
              {/* Logout Button */}
              <div className="py-4">
                <Button variant="outline" className="w-full">
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <FirmwareUpdatePage />
          )}
          <ScrollBar />
        </ScrollArea>
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default Profile;
