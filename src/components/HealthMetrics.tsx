
import React from 'react';
import { HeartPulse, Droplet, Activity, Thermometer } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const HealthMetrics = () => {
  // Get unit preference from user context
  const { user } = useUser();
  const unitPreference = user.unitPreference;
  
  // Temperature conversion (assuming we get it in Celsius from the device)
  const tempCelsius = 36.7;
  const tempFahrenheit = (tempCelsius * 9/5) + 32;
  
  // Display value based on user preference
  const tempDisplay = unitPreference === 'metric' 
    ? { value: tempCelsius.toFixed(1), unit: '°C' }
    : { value: tempFahrenheit.toFixed(1), unit: '°F' };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-4 bg-white border border-gray-200 rounded-xl metric-card" id="heartRate">
        <div className="flex items-center mb-2">
          <HeartPulse className="text-red-500 mr-2" size={16} />
          <span className="text-xs text-gray-600">Heart Rate</span>
        </div>
        <div className="flex items-end">
          <span className="text-2xl font-semibold text-nestor-gray-900">72</span>
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
          <span className="text-2xl font-semibold text-nestor-gray-900">98</span>
          <span className="text-sm text-nestor-gray-600 ml-1 mb-0.5">%</span>
        </div>
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{width: '98%'}}></div>
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
            <div className="bg-orange-500 h-1.5 rounded-full" style={{width: '50%'}}></div>
          </div>
          <span className="text-xs text-nestor-gray-500 ml-2">Normal</span>
        </div>
      </div>
    </div>
  );
};

export default HealthMetrics;
