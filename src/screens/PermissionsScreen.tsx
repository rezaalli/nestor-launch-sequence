
import React, { useState, useEffect } from 'react';
import OnboardingLayout from '../components/OnboardingLayout';
import { Progress } from '@/components/ui/progress';
import { Bluetooth, Bell, HeartPulse, Check } from 'lucide-react';
import Toggle from '@/components/Toggle';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectScrollUpButton,
  SelectScrollDownButton,
} from "@/components/ui/select";
import { ScrollArea } from '@/components/ui/scroll-area';
import { useUser } from '@/contexts/UserContext';

interface PermissionsScreenProps {
  onNext: () => void;
}

const PermissionsScreen = ({ onNext }: PermissionsScreenProps) => {
  const [bluetooth, setBluetooth] = useState(false);
  const [healthKit, setHealthKit] = useState(false);
  const [notifications, setNotifications] = useState(false);
  
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [heightFeet, setHeightFeet] = useState('');
  const [heightInches, setHeightInches] = useState('');
  const { toast } = useToast();
  const { updateUser } = useUser();
  
  // Calculate if all required fields are filled
  const isFormComplete = bluetooth && healthKit && notifications && 
    age !== '' && weight !== '' && heightFeet !== '' && heightInches !== '';
  
  // Calculate progress based on enabled permissions and filled fields
  const calculateProgress = () => {
    let progress = 0;
    if (bluetooth) progress += 20;
    if (healthKit) progress += 20;
    if (notifications) progress += 20;
    if (age !== '') progress += 10;
    if (weight !== '') progress += 10;
    if (heightFeet !== '') progress += 10;
    if (heightInches !== '') progress += 10;
    return progress;
  };

  // Enable a permission
  const togglePermission = (permissionType: 'bluetooth' | 'healthKit' | 'notifications', value: boolean) => {
    switch (permissionType) {
      case 'bluetooth':
        setBluetooth(value);
        break;
      case 'healthKit':
        setHealthKit(value);
        break;
      case 'notifications':
        setNotifications(value);
        break;
    }
  };
  
  // Handle continue button click
  const handleContinue = () => {
    if (!isFormComplete) {
      toast({
        title: "Missing information",
        description: "Please enable all permissions and fill in your details.",
        variant: "destructive",
      });
      return;
    }
    
    // Set unit preference to imperial
    updateUser({
      unitPreference: 'imperial'
    });
    
    onNext();
  };

  // Generate arrays for select options
  const generateAgeOptions = () => {
    return Array.from({ length: 100 }, (_, i) => (i + 1).toString());
  };

  const generateWeightOptions = () => {
    return Array.from({ length: 400 }, (_, i) => (i + 50).toString());
  };

  const generateHeightFeetOptions = () => {
    return Array.from({ length: 8 }, (_, i) => (i + 1).toString());
  };
  
  const generateHeightInchesOptions = () => {
    const options = [];
    for (let i = 0; i <= 11; i += 0.5) {
      options.push(i.toString());
    }
    return options;
  };
  
  const formatHeightInches = (value: string) => {
    if (value.includes('.5')) {
      const parts = value.split('.');
      return `${parts[0]}½`;
    }
    return value;
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
              <div>
                <Toggle 
                  checked={bluetooth} 
                  onChange={(value) => togglePermission('bluetooth', value)} 
                />
              </div>
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
              <div>
                <Toggle 
                  checked={healthKit} 
                  onChange={(value) => togglePermission('healthKit', value)} 
                />
              </div>
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
              <div>
                <Toggle 
                  checked={notifications} 
                  onChange={(value) => togglePermission('notifications', value)} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-nestor-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-nestor-gray-700 mb-2">Age</label>
              <Select value={age} onValueChange={setAge}>
                <SelectTrigger className="w-full p-4 border border-gray-200 rounded-lg">
                  <SelectValue placeholder="Select your age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectScrollUpButton />
                  <ScrollArea className="h-40">
                    <SelectGroup>
                      {generateAgeOptions().map((ageOption) => (
                        <SelectItem key={ageOption} value={ageOption}>
                          {ageOption}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </ScrollArea>
                  <SelectScrollDownButton />
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-nestor-gray-700 mb-2">Weight (lbs)</label>
              <Select value={weight} onValueChange={setWeight}>
                <SelectTrigger className="w-full p-4 border border-gray-200 rounded-lg">
                  <SelectValue placeholder="Select your weight" />
                </SelectTrigger>
                <SelectContent>
                  <SelectScrollUpButton />
                  <ScrollArea className="h-40">
                    <SelectGroup>
                      {generateWeightOptions().map((weightOption) => (
                        <SelectItem key={weightOption} value={weightOption}>
                          {weightOption}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </ScrollArea>
                  <SelectScrollDownButton />
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-nestor-gray-700 mb-2">Height (ft)</label>
                <Select value={heightFeet} onValueChange={setHeightFeet}>
                  <SelectTrigger className="w-full p-4 border border-gray-200 rounded-lg">
                    <SelectValue placeholder="ft" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {generateHeightFeetOptions().map((feet) => (
                        <SelectItem key={feet} value={feet}>
                          {feet}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-nestor-gray-700 mb-2">Height (in)</label>
                <Select value={heightInches} onValueChange={setHeightInches}>
                  <SelectTrigger className="w-full p-4 border border-gray-200 rounded-lg">
                    <SelectValue placeholder="in" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectScrollUpButton />
                    <ScrollArea className="h-40">
                      <SelectGroup>
                        {generateHeightInchesOptions().map((inches) => (
                          <SelectItem key={inches} value={inches}>
                            {formatHeightInches(inches)}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </ScrollArea>
                    <SelectScrollDownButton />
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>

        {/* Continue Button */}
        <button 
          className={`w-full py-4 text-white font-medium rounded-lg mt-8 mb-8 ${
            isFormComplete ? 'bg-nestor-blue' : 'bg-gray-400'
          }`}
          onClick={handleContinue}
          disabled={!isFormComplete}
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
