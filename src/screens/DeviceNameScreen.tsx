
import React, { useState } from 'react';
import OnboardingLayout from '../components/OnboardingLayout';

interface DeviceNameScreenProps {
  onNext: () => void;
}

const DeviceNameScreen = ({ onNext }: DeviceNameScreenProps) => {
  const [deviceName, setDeviceName] = useState('My Nestor');
  const [watchTag, setWatchTag] = useState('Rolex Datejust');
  
  return (
    <OnboardingLayout>
      <h1 className="text-2xl font-semibold text-nestor-gray-900 mb-8">Name This Device</h1>
      
      <div className="space-y-6 mb-6">
        <div className="space-y-2">
          <label htmlFor="device-name" className="text-sm text-nestor-gray-600 font-medium">Custom Name</label>
          <input 
            type="text" 
            id="device-name" 
            className="nestor-input"
            placeholder="My Nestor"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="watch-tag" className="text-sm text-nestor-gray-600 font-medium">Watch Tag</label>
          <div className="relative">
            <select 
              id="watch-tag" 
              className="nestor-input appearance-none"
              value={watchTag}
              onChange={(e) => setWatchTag(e.target.value)}
            >
              <option>Rolex Datejust</option>
              <option>Omega Seamaster</option>
              <option>Apple Watch</option>
              <option>Other (Custom)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm text-nestor-gray-600 font-medium">Watch Photo</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p className="text-sm text-nestor-gray-500 text-center mb-3">Upload a photo of your watch</p>
            <button className="px-4 py-2 bg-gray-100 text-nestor-gray-700 rounded-md font-medium text-sm">Upload Photo</button>
          </div>
        </div>
      </div>
      
      <div className="flex-1"></div>
      
      <button 
        className="nestor-btn"
        onClick={onNext}
      >
        Continue
      </button>
    </OnboardingLayout>
  );
};

export default DeviceNameScreen;
