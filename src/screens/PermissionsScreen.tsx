
import React, { useState } from 'react';
import OnboardingLayout from '../components/OnboardingLayout';
import PermissionItem from '../components/PermissionItem';

interface PermissionsScreenProps {
  onNext: () => void;
}

const PermissionsScreen = ({ onNext }: PermissionsScreenProps) => {
  const [bluetooth, setBluetooth] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [healthKit, setHealthKit] = useState(true);
  
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [sleepStart, setSleepStart] = useState('10:00 PM');
  const [sleepEnd, setSleepEnd] = useState('6:00 AM');
  
  return (
    <OnboardingLayout>
      <h1 className="text-2xl font-semibold text-nestor-gray-900 mb-8">Allow Access</h1>
      
      <div className="flex-1 mb-8">
        <div className="space-y-6">
          <PermissionItem 
            icon="bluetooth"
            title="Bluetooth"
            description="Required for device connection"
            checked={bluetooth}
            onChange={setBluetooth}
          />
          
          <PermissionItem 
            icon="bell"
            title="Notifications"
            description="For health alerts and reminders"
            checked={notifications}
            onChange={setNotifications}
          />
          
          <PermissionItem 
            icon="heart-pulse"
            title="HealthKit"
            description="For health data integration"
            checked={healthKit}
            onChange={setHealthKit}
          />
        </div>
        
        <div className="mt-10">
          <h2 className="text-lg font-medium text-nestor-gray-900 mb-6">Optional Information</h2>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="age" className="text-sm text-nestor-gray-600 font-medium">Age</label>
              <input 
                type="number" 
                id="age" 
                className="nestor-input"
                placeholder="Enter your age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="weight" className="text-sm text-nestor-gray-600 font-medium">Weight (kg)</label>
              <input 
                type="number" 
                id="weight" 
                className="nestor-input"
                placeholder="Enter your weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm text-nestor-gray-600 font-medium">Sleep Schedule</label>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <select 
                    className="nestor-input appearance-none"
                    value={sleepStart}
                    onChange={(e) => setSleepStart(e.target.value)}
                  >
                    <option>10:00 PM</option>
                    <option>10:30 PM</option>
                    <option>11:00 PM</option>
                    <option>11:30 PM</option>
                    <option>12:00 AM</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="relative">
                  <select 
                    className="nestor-input appearance-none"
                    value={sleepEnd}
                    onChange={(e) => setSleepEnd(e.target.value)}
                  >
                    <option>6:00 AM</option>
                    <option>6:30 AM</option>
                    <option>7:00 AM</option>
                    <option>7:30 AM</option>
                    <option>8:00 AM</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        className="nestor-btn"
        onClick={onNext}
      >
        Continue
      </button>
    </OnboardingLayout>
  );
};

export default PermissionsScreen;
