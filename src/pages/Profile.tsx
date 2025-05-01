import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import StatusBar from "@/components/StatusBar";
import BottomNavbar from "@/components/BottomNavbar";
import { useNavigate } from 'react-router-dom';
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Shield, 
  Palette, 
  Bell, 
  Watch, 
  CircleHelp, 
  ArrowLeft, 
  Download, 
  ExternalLink,
  Thermometer
} from "lucide-react";

interface TemperatureDisplay {
  celsius: number;
  fahrenheit: number;
  display: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const { toast } = useToast();
  const [activeScreen, setActiveScreen] = useState<'main' | 'account' | 'privacy' | 'appearance'>('main');
  const [unitPreference, setUnitPreference] = useState<'metric' | 'imperial'>('metric');
  
  // Form states for account info
  const [formName, setFormName] = useState(user.name);
  const [formEmail, setFormEmail] = useState(user.email);
  
  // Sample temperature value in Celsius
  const [temperature, setTemperature] = useState<TemperatureDisplay>({
    celsius: 36.7,
    fahrenheit: convertCelsiusToFahrenheit(36.7),
    display: '36.7°C'
  });

  // Function to convert Celsius to Fahrenheit
  function convertCelsiusToFahrenheit(celsius: number): number {
    return (celsius * 9/5) + 32;
  }

  // Function to handle unit preference change
  const handleUnitChange = (unit: 'metric' | 'imperial') => {
    setUnitPreference(unit);
    if (unit === 'metric') {
      setTemperature(prev => ({
        ...prev,
        display: `${prev.celsius}°C`
      }));
    } else {
      setTemperature(prev => ({
        ...prev,
        display: `${prev.fahrenheit.toFixed(1)}°F`
      }));
    }
  };
  
  const goBack = () => setActiveScreen('main');
  
  // Update form fields when user data changes
  useEffect(() => {
    setFormName(user.name);
    setFormEmail(user.email);
  }, [user]);
  
  // Handle save account info
  const handleSaveAccountInfo = () => {
    updateUser({
      name: formName,
      email: formEmail
    });
    
    toast({
      title: "Account updated",
      description: "Your account information has been saved.",
    });
    
    setActiveScreen('main');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <StatusBar />
      
      {activeScreen === 'main' && (
        <>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <h1 className="text-xl font-semibold text-gray-900">Profile & Settings</h1>
          </div>
          
          <div className="flex-1 px-6 py-6">
            {/* User Profile Card */}
            <div className="flex items-center space-x-4 mb-8">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user.avatar} alt="User profile" />
                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
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
                    <User className="text-blue-900" size={20} />
                  </div>
                  <span className="font-medium text-gray-800">Account Info</span>
                </div>
                <i className="fa-solid fa-chevron-right text-gray-400"></i>
              </div>
              
              {/* Privacy */}
              <div 
                className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer"
                onClick={() => setActiveScreen('privacy')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Shield className="text-blue-900" size={20} />
                  </div>
                  <span className="font-medium text-gray-800">Privacy</span>
                </div>
                <i className="fa-solid fa-chevron-right text-gray-400"></i>
              </div>
              
              {/* Appearance */}
              <div 
                className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer"
                onClick={() => setActiveScreen('appearance')}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Palette className="text-blue-900" size={20} />
                  </div>
                  <span className="font-medium text-gray-800">Appearance</span>
                </div>
                <i className="fa-solid fa-chevron-right text-gray-400"></i>
              </div>
              
              {/* Notifications */}
              <div className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Bell className="text-blue-900" size={20} />
                  </div>
                  <span className="font-medium text-gray-800">Notifications</span>
                </div>
                <i className="fa-solid fa-chevron-right text-gray-400"></i>
              </div>
              
              {/* Connected Devices */}
              <div className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <Watch className="text-blue-900" size={20} />
                  </div>
                  <span className="font-medium text-gray-800">Connected Devices</span>
                </div>
                <i className="fa-solid fa-chevron-right text-gray-400"></i>
              </div>
              
              {/* Help & Support */}
              <div className="p-4 bg-white rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center">
                    <CircleHelp className="text-blue-900" size={20} />
                  </div>
                  <span className="font-medium text-gray-800">Help & Support</span>
                </div>
                <i className="fa-solid fa-chevron-right text-gray-400"></i>
              </div>
            </div>
          </div>
        </>
      )}

      {activeScreen === 'account' && (
        <>
          {/* Account Info Screen */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center">
            <button onClick={goBack} className="mr-4">
              <ArrowLeft className="text-gray-800" size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Account Info</h1>
          </div>
          
          <div className="flex-1 px-6 py-6">
            <div className="space-y-6">
              {/* Name Field */}
              <div className="space-y-2">
                <Label htmlFor="full-name" className="text-sm text-gray-600 font-medium">Full Name</Label>
                <Input 
                  type="text" 
                  id="full-name" 
                  className="p-4" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)} 
                />
              </div>
              
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email-address" className="text-sm text-gray-600 font-medium">Email Address</Label>
                <Input 
                  type="email" 
                  id="email-address" 
                  className="p-4" 
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>
              
              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-gray-600 font-medium">Password</Label>
                <Input type="password" id="password" className="p-4" defaultValue="••••••••••" />
              </div>
              
              {/* Date of Birth Field */}
              <div className="space-y-2">
                <Label htmlFor="date-of-birth" className="text-sm text-gray-600 font-medium">Date of Birth</Label>
                <Input type="date" id="date-of-birth" className="p-4" defaultValue="1985-06-15" />
              </div>
              
              {/* Unit Preference */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600 font-medium">Unit Preference</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <input 
                      type="radio" 
                      id="metric" 
                      name="unit" 
                      className="peer hidden" 
                      checked={unitPreference === 'metric'} 
                      onChange={() => handleUnitChange('metric')}
                    />
                    <label htmlFor="metric" className="block w-full p-4 text-center border border-gray-300 rounded-lg cursor-pointer peer-checked:bg-blue-900 peer-checked:text-white peer-checked:border-blue-900">
                      Metric
                    </label>
                  </div>
                  <div className="relative">
                    <input 
                      type="radio" 
                      id="imperial" 
                      name="unit" 
                      className="peer hidden" 
                      checked={unitPreference === 'imperial'} 
                      onChange={() => handleUnitChange('imperial')}
                    />
                    <label htmlFor="imperial" className="block w-full p-4 text-center border border-gray-300 rounded-lg cursor-pointer peer-checked:bg-blue-900 peer-checked:text-white peer-checked:border-blue-900">
                      Imperial
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Temperature Display Demo */}
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Thermometer className="text-blue-900 mr-2" size={18} />
                    <span className="text-sm text-gray-600">Current Temperature</span>
                  </div>
                  <span className="text-lg font-medium text-blue-900">{temperature.display}</span>
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="mt-8">
              <Button 
                className="w-full py-6 bg-blue-900 text-white font-medium" 
                onClick={handleSaveAccountInfo}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </>
      )}

      {activeScreen === 'privacy' && (
        <>
          {/* Privacy & Data Screen */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center">
            <button onClick={goBack} className="mr-4">
              <ArrowLeft className="text-gray-800" size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Privacy & Data</h1>
          </div>
          
          <div className="flex-1 px-6 py-6">
            <div className="space-y-6">
              {/* Cloud Sync Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Cloud Sync</h3>
                  <p className="text-sm text-gray-600 mt-1">Sync your data across devices</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
                </label>
              </div>
              
              {/* Biometric Login Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Biometric Login</h3>
                  <p className="text-sm text-gray-600 mt-1">Use Face ID or Touch ID to log in</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
                </label>
              </div>
              
              {/* Download Data Button */}
              <div className="pt-4">
                <Button variant="outline" className="w-full py-6 border border-blue-900 text-blue-900 font-medium">
                  <Download size={18} className="mr-2" />
                  Download My Data
                </Button>
              </div>
              
              {/* Legal Links */}
              <div className="space-y-4 pt-4">
                <span className="block text-gray-700 font-medium cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span>Privacy Policy</span>
                    <ExternalLink className="text-gray-400" size={16} />
                  </div>
                </span>
                <span className="block text-gray-700 font-medium cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span>Terms of Service</span>
                    <ExternalLink className="text-gray-400" size={16} />
                  </div>
                </span>
              </div>
              
              {/* Delete Account */}
              <div className="pt-6">
                <Button variant="outline" className="w-full py-6 border border-red-500 text-red-500 font-medium">
                  Delete My Account
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {activeScreen === 'appearance' && (
        <>
          {/* Appearance & Theme Screen */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center">
            <button onClick={goBack} className="mr-4">
              <ArrowLeft className="text-gray-800" size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">App Appearance</h1>
          </div>
          
          <div className="flex-1 px-6 py-6">
            {/* Theme Selector */}
            <div className="mb-8">
              <h2 className="text-base font-medium text-gray-900 mb-4">Theme</h2>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="relative">
                  <input type="radio" id="light-theme" name="theme" className="peer hidden" defaultChecked />
                  <label htmlFor="light-theme" className="block aspect-square border border-gray-300 rounded-lg cursor-pointer overflow-hidden peer-checked:ring-2 peer-checked:ring-blue-900">
                    <div className="h-full bg-white">
                      <div className="h-1/4 bg-gray-100"></div>
                    </div>
                  </label>
                  <span className="block text-center text-sm mt-2">Light</span>
                </div>
                
                <div className="relative">
                  <input type="radio" id="dark-theme" name="theme" className="peer hidden" />
                  <label htmlFor="dark-theme" className="block aspect-square border border-gray-300 rounded-lg cursor-pointer overflow-hidden peer-checked:ring-2 peer-checked:ring-blue-900">
                    <div className="h-full bg-gray-900">
                      <div className="h-1/4 bg-gray-800"></div>
                    </div>
                  </label>
                  <span className="block text-center text-sm mt-2">Dark</span>
                </div>
                
                <div className="relative">
                  <input type="radio" id="system-theme" name="theme" className="peer hidden" />
                  <label htmlFor="system-theme" className="block aspect-square border border-gray-300 rounded-lg cursor-pointer overflow-hidden peer-checked:ring-2 peer-checked:ring-blue-900">
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
                  <input type="radio" id="blue-accent" name="accent" className="peer hidden" defaultChecked />
                  <label htmlFor="blue-accent" className="block w-12 h-12 bg-blue-900 rounded-full cursor-pointer peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-blue-900"></label>
                </div>
                
                <div className="relative">
                  <input type="radio" id="teal-accent" name="accent" className="peer hidden" />
                  <label htmlFor="teal-accent" className="block w-12 h-12 bg-teal-600 rounded-full cursor-pointer peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-teal-600"></label>
                </div>
                
                <div className="relative">
                  <input type="radio" id="purple-accent" name="accent" className="peer hidden" />
                  <label htmlFor="purple-accent" className="block w-12 h-12 bg-purple-600 rounded-full cursor-pointer peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-purple-600"></label>
                </div>
                
                <div className="relative">
                  <input type="radio" id="rose-accent" name="accent" className="peer hidden" />
                  <label htmlFor="rose-accent" className="block w-12 h-12 bg-rose-600 rounded-full cursor-pointer peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-rose-600"></label>
                </div>
                
                <div className="relative">
                  <input type="radio" id="amber-accent" name="accent" className="peer hidden" />
                  <label htmlFor="amber-accent" className="block w-12 h-12 bg-amber-500 rounded-full cursor-pointer peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-amber-500"></label>
                </div>
              </div>
            </div>
            
            {/* Match UI to Watch Toggle */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Match UI to Watch</h3>
                <p className="text-sm text-gray-600 mt-1">Adapt UI to your connected watch theme</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
              </label>
            </div>
            
            {/* Preview Section */}
            <div className="mt-8">
              <h2 className="text-base font-medium text-gray-900 mb-4">Preview</h2>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-blue-900 p-4">
                  <h3 className="text-white font-medium">App Preview</h3>
                </div>
                <div className="p-4 bg-white">
                  <div className="h-3 bg-gray-200 rounded-full w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded-full w-1/2 mb-4"></div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-blue-900 rounded-full"></div>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full w-1/3"></div>
                  </div>
                  
                  <div className="h-20 bg-gray-100 rounded-lg mb-4"></div>
                  
                  <div className="flex justify-end">
                    <div className="w-1/3 h-8 bg-blue-900 rounded-md"></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="mt-8">
              <Button className="w-full py-6 bg-blue-900 text-white font-medium" onClick={goBack}>
                Save Changes
              </Button>
            </div>
          </div>
        </>
      )}

      <BottomNavbar />
    </div>
  );
};

export default Profile;
