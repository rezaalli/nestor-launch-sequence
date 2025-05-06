
import React, { useState, useEffect } from 'react';
import { HeartPulse, Droplet, Activity, Thermometer } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { getLastReading, isDeviceWorn, formatTemperature } from '@/utils/bleUtils';

const HealthMetrics = () => {
  // Get unit preference from user context
  const { user } = useUser();
  const unitPreference = user.unitPreference || 'imperial'; // Default to imperial (Fahrenheit)
  
  const [lastReading, setLastReading] = useState(getLastReading());
  const [deviceWorn, setDeviceWorn] = useState(isDeviceWorn());
  
  // Subscribe to vital updates
  useEffect(() => {
    const handleVitalUpdate = () => {
      setLastReading(getLastReading());
      setDeviceWorn(isDeviceWorn());
    };
    
    const handleWearStateChange = (event: Event) => {
      const { worn } = (event as CustomEvent).detail;
      setDeviceWorn(worn);
    };
    
    window.addEventListener('nestor-vital-update', handleVitalUpdate);
    window.addEventListener('nestor-wear-state', handleWearStateChange);
    
    return () => {
      window.removeEventListener('nestor-vital-update', handleVitalUpdate);
      window.removeEventListener('nestor-wear-state', handleWearStateChange);
    };
  }, []);
  
  // If device is not worn, show a message
  if (!deviceWorn) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white border border-gray-200 rounded-xl col-span-2 text-center">
          <div className="py-6 text-gray-500">
            <p className="mb-2">Device not being worn</p>
            <p className="text-sm">Put on your device to see real-time metrics</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Get values from last reading or use defaults
  const heartRate = lastReading?.hr ?? 72;
  const spo2 = lastReading?.spo2 ?? 98;
  const tempCelsius = (lastReading?.temp ?? 367) / 10;
  
  // Display temperature based on user preference
  const tempDisplay = formatTemperature(lastReading?.temp ?? 367, unitPreference);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-4 bg-white border border-gray-200 rounded-xl metric-card" id="heartRate">
        <div className="flex items-center mb-2">
          <HeartPulse className="text-red-500 mr-2" size={16} />
          <span className="text-xs text-gray-600">Heart Rate</span>
        </div>
        <div className="flex items-end">
          <span className="text-2xl font-semibold text-nestor-gray-900">{heartRate}</span>
          <span className="text-sm text-nestor-gray-600 ml-1 mb-0.5">bpm</span>
        </div>
        <div className="mt-2 h-8">
          <div className="relative h-full">
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between space-x-1">
              {[2, 3, 4, 5, 7, 5, 3, 2, 1].map((height, index) => (
                <div 
                  key={index} 
                  className={`w-1 bg-red-${height === 7 ? '500' : height >= 4 ? '400' : height >= 3 ? '300' : '200'} rounded-t`} 
                  style={{height: `${height * 4}px`}}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-white border border-gray-200 rounded-xl metric-card" id="spo2">
        <div className="flex items-center mb-2">
          <Droplet className="text-blue-500 mr-2" size={16} />
          <span className="text-xs text-gray-600">SpO₂</span>
        </div>
        <div className="flex items-end">
          <span className="text-2xl font-semibold text-nestor-gray-900">{spo2}</span>
          <span className="text-sm text-nestor-gray-600 ml-1 mb-0.5">%</span>
        </div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${spo2}%`}}></div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-xs text-nestor-gray-500">90</span>
            <span className="text-xs text-nestor-gray-500">100</span>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-white border border-gray-200 rounded-xl metric-card" id="ecg">
        <div className="flex items-center mb-2">
          <Activity className="text-purple-500 mr-2" size={16} />
          <span className="text-xs text-gray-600">ECG</span>
        </div>
        <div className="text-sm text-nestor-gray-900 font-medium">Normal Sinus</div>
        <div className="mt-2 h-10">
          <div className="relative h-full flex items-center">
            <div className="absolute inset-0">
              <svg viewBox="0 0 100 30" className="w-full h-full">
                <path d="M0,15 L10,15 L15,5 L20,25 L25,15 L30,15 L35,15 L40,5 L45,25 L50,15 L55,15 L60,15 L65,5 L70,25 L75,15 L80,15 L85,15 L90,5 L95,25 L100,15" 
                      fill="none" stroke="#a855f7" strokeWidth="1.5"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-white border border-gray-200 rounded-xl metric-card" id="temperature">
        <div className="flex items-center mb-2">
          <Thermometer className="text-orange-500 mr-2" size={16} />
          <span className="text-xs text-gray-600">Temperature</span>
        </div>
        <div className="flex items-end">
          <span className="text-2xl font-semibold text-nestor-gray-900">{tempDisplay.value}</span>
          <span className="text-sm text-nestor-gray-600 ml-1 mb-0.5">{tempDisplay.unit}</span>
        </div>
        <div className="mt-2 flex items-center">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${tempCelsius > 37.5 ? 'bg-red-500' : 'bg-orange-500'}`} 
              style={{width: `${Math.min(100, Math.max(0, ((tempCelsius - 35) / 3) * 100))}%`}}
            ></div>
          </div>
          <span className="text-xs text-nestor-gray-500 ml-2">
            {tempCelsius > 37.5 ? 'Elevated' : 'Normal'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HealthMetrics;
