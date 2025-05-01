
import React, { useState } from 'react';
import OnboardingLayout from '../components/OnboardingLayout';

interface DevicePairingScreenProps {
  onNext: () => void;
}

const DevicePairingScreen = ({ onNext }: DevicePairingScreenProps) => {
  const [selectedWrist, setSelectedWrist] = useState<'left' | 'right'>('left');
  const [isSearching, setIsSearching] = useState(false);
  const [deviceFound, setDeviceFound] = useState(false);

  const handleScan = () => {
    setIsSearching(true);
    setDeviceFound(false);
    
    // Simulate finding a device after 2 seconds
    setTimeout(() => {
      setIsSearching(false);
      setDeviceFound(true);
    }, 2000);
  };

  return (
    <OnboardingLayout>
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-8">
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nestor-gray-700">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
        <h2 className="text-lg font-medium text-nestor-gray-900">Pair Your Device</h2>
        <div className="w-10"></div>
      </div>
      
      {/* Device Illustration */}
      <div className="flex justify-center mb-8">
        <img 
          className="w-48 h-48" 
          src="https://storage.googleapis.com/uxpilot-auth.appspot.com/b6efa33225-8d6343e2ad980d865f92.png" 
          alt="Nestor device" 
        />
      </div>

      {/* Instructions */}
      <div className="text-center mb-8">
        <h3 className="text-xl font-semibold text-nestor-gray-900 mb-3">Connect Your Nestor</h3>
        <p className="text-nestor-gray-600 text-sm leading-relaxed mb-6">
          Place your Nestor device nearby and ensure Bluetooth is enabled on your phone to begin the pairing process.
        </p>
      </div>

      {/* Handiness Preference */}
      <div className="mb-8">
        <h4 className="text-sm font-medium text-nestor-gray-700 mb-3">Which wrist will you wear Nestor on?</h4>
        <div className="grid grid-cols-2 gap-3">
          <button 
            className={`p-4 border rounded-lg flex flex-col items-center justify-center ${
              selectedWrist === 'left' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setSelectedWrist('left')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mb-2 transform -rotate-45 ${
              selectedWrist === 'left' ? 'text-nestor-blue' : 'text-nestor-gray-400'
            }`}>
              <path d="M18 8V4m0 0l3 3m-3-3l-3 3"/>
              <path d="M18 11v-1a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v1"/>
              <path d="M6 11v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-5"/>
              <path d="M12 11v5"/>
              <path d="M13 13.5a1.5 1.5 0 0 1-3 0"/>
            </svg>
            <span className={`text-sm font-medium ${
              selectedWrist === 'left' ? 'text-nestor-gray-900' : 'text-nestor-gray-600'
            }`}>Left Wrist</span>
          </button>
          <button 
            className={`p-4 border rounded-lg flex flex-col items-center justify-center ${
              selectedWrist === 'right' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'
            }`}
            onClick={() => setSelectedWrist('right')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`mb-2 transform rotate-45 ${
              selectedWrist === 'right' ? 'text-nestor-blue' : 'text-nestor-gray-400'
            }`}>
              <path d="M18 8V4m0 0l3 3m-3-3l-3 3"/>
              <path d="M18 11v-1a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v1"/>
              <path d="M6 11v5a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-5"/>
              <path d="M12 11v5"/>
              <path d="M13 13.5a1.5 1.5 0 0 1-3 0"/>
            </svg>
            <span className={`text-sm font-medium ${
              selectedWrist === 'right' ? 'text-nestor-gray-900' : 'text-nestor-gray-600'
            }`}>Right Wrist</span>
          </button>
        </div>
      </div>

      {/* Device List */}
      <div className="space-y-3 mb-8">
        {isSearching ? (
          <div className="p-4 border border-gray-200 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nestor-blue">
                  <rect width="8" height="10" x="8" y="5" rx="1"/>
                  <path d="M15 2H9"/>
                  <path d="M8 22h8"/>
                  <path d="M12 2v2"/>
                  <path d="M12 20v2"/>
                  <path d="M14 16h2"/>
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-nestor-gray-900">Searching...</h4>
                <p className="text-xs text-nestor-gray-500">Looking for nearby devices</p>
              </div>
            </div>
            <div className="animate-spin">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nestor-blue">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            </div>
          </div>
        ) : deviceFound ? (
          <div className="p-4 border border-blue-100 bg-blue-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nestor-blue">
                  <rect width="8" height="10" x="8" y="5" rx="1"/>
                  <path d="M15 2H9"/>
                  <path d="M8 22h8"/>
                  <path d="M12 2v2"/>
                  <path d="M12 20v2"/>
                  <path d="M14 16h2"/>
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-nestor-gray-900">Nestor Device</h4>
                <p className="text-xs text-nestor-gray-500">Ready to pair</p>
              </div>
            </div>
            <button 
              className="px-4 py-2 bg-nestor-blue text-white text-sm font-medium rounded-lg"
              onClick={onNext}
            >
              Connect
            </button>
          </div>
        ) : null}
      </div>

      {/* Scan Button */}
      <button 
        className="w-full py-4 bg-nestor-blue text-white font-medium rounded-lg flex items-center justify-center"
        onClick={handleScan}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
          <path d="M3 3v5h5"/>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
          <path d="M16 21h5v-5"/>
        </svg>
        Scan for Devices
      </button>

      {/* Help Text */}
      <p className="text-center text-sm text-nestor-gray-500 mt-6">
        Having trouble? <span className="text-nestor-blue font-medium cursor-pointer">View setup guide</span>
      </p>
    </OnboardingLayout>
  );
};

export default DevicePairingScreen;
