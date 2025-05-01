
import React, { useState } from 'react';
import OnboardingLayout from '../components/OnboardingLayout';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Bluetooth, Bell, HeartPulse, Check } from 'lucide-react';

interface PermissionsScreenProps {
  onNext: () => void;
}

const PermissionsScreen = ({ onNext }: PermissionsScreenProps) => {
  const [bluetooth, setBluetooth] = useState(false);
  const [healthKit, setHealthKit] = useState(false);
  const [notifications, setNotifications] = useState(false);
  
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  
  // Calculate progress based on enabled permissions
  const calculateProgress = () => {
    let progress = 25; // Start with 25%
    if (bluetooth) progress += 25;
    if (healthKit) progress += 25;
    if (notifications) progress += 25;
    return progress;
  };

  // Enable a permission
  const enablePermission = (permissionType: 'bluetooth' | 'healthKit' | 'notifications') => {
    switch (permissionType) {
      case 'bluetooth':
        setBluetooth(true);
        break;
      case 'healthKit':
        setHealthKit(true);
        break;
      case 'notifications':
        setNotifications(true);
        break;
    }
  };
  
  return (
    <div className="min-h-screen bg-white">
      {/* Progress Bar */}
      <div className="fixed top-0 w-full h-1 bg-gray-100">
        <Progress value={calculateProgress()} className="h-full rounded-none" />
      </div>

      {/* Setup Content */}
      <div className="px-6 pt-16">
        <h1 className="text-2xl font-semibold text-nestor-gray-900 mb-2">Let's set up Nestor</h1>
        <p className="text-nestor-gray-600 mb-8">Enable these features to get the most out of your health tracking experience.</p>

        {/* Permissions Cards */}
        <div className="space-y-4">
          {/* Bluetooth Permission */}
          <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <Bluetooth className="text-blue-900" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-nestor-gray-900 mb-1">Bluetooth</h3>
                <p className="text-sm text-nestor-gray-600">Required to connect with your watch and receive real-time data.</p>
              </div>
              <button 
                className={`ml-4 px-4 py-2 ${bluetooth ? 'bg-green-500' : 'bg-nestor-blue'} text-white text-sm font-medium rounded-lg`}
                onClick={() => enablePermission('bluetooth')}
              >
                {bluetooth ? 'Enabled' : 'Enable'}
              </button>
            </div>
          </div>

          {/* HealthKit Permission */}
          <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                <HeartPulse className="text-green-700" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-nestor-gray-900 mb-1">Health Data</h3>
                <p className="text-sm text-nestor-gray-600">Access and store your health metrics securely.</p>
              </div>
              <button 
                className={`ml-4 px-4 py-2 ${healthKit ? 'bg-green-500' : 'bg-nestor-blue'} text-white text-sm font-medium rounded-lg`}
                onClick={() => enablePermission('healthKit')}
              >
                {healthKit ? 'Enabled' : 'Enable'}
              </button>
            </div>
            <div className="pl-13 ml-13">
              <div className="flex items-center mb-2">
                <Check size={16} className="text-green-500 mr-2 text-sm" />
                <span className="text-sm text-nestor-gray-600">Heart Rate & ECG</span>
              </div>
              <div className="flex items-center mb-2">
                <Check size={16} className="text-green-500 mr-2 text-sm" />
                <span className="text-sm text-nestor-gray-600">Blood Oxygen</span>
              </div>
              <div className="flex items-center">
                <Check size={16} className="text-green-500 mr-2 text-sm" />
                <span className="text-sm text-nestor-gray-600">Sleep Analysis</span>
              </div>
            </div>
          </div>

          {/* Notifications Permission */}
          <div className="p-5 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <Bell className="text-purple-700" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-nestor-gray-900 mb-1">Notifications</h3>
                <p className="text-sm text-nestor-gray-600">Get alerts for important health updates and reminders.</p>
              </div>
              <button 
                className={`ml-4 px-4 py-2 ${notifications ? 'bg-green-500' : 'bg-nestor-blue'} text-white text-sm font-medium rounded-lg`}
                onClick={() => enablePermission('notifications')}
              >
                {notifications ? 'Enabled' : 'Enable'}
              </button>
            </div>
          </div>
        </div>

        {/* Optional Information */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-nestor-gray-900 mb-4">Basic Information (Optional)</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-nestor-gray-700 mb-2">Age</label>
              <Input 
                type="number" 
                className="w-full p-4 border border-gray-200 rounded-lg" 
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-nestor-gray-700 mb-2">Weight (kg)</label>
              <Input 
                type="number" 
                className="w-full p-4 border border-gray-200 rounded-lg" 
                placeholder="Enter your weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-nestor-gray-700 mb-2">Height (cm)</label>
              <Input 
                type="number" 
                className="w-full p-4 border border-gray-200 rounded-lg" 
                placeholder="Enter your height"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button 
          className="w-full py-4 bg-nestor-blue text-white font-medium rounded-lg mt-8 mb-8"
          onClick={onNext}
        >
          Continue
        </button>
        
        <p className="text-xs text-nestor-gray-500 text-center mb-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default PermissionsScreen;
