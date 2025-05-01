
import React, { useState } from 'react';
import { Bluetooth, Plus, ArrowLeft, Battery, Watch, LightbulbIcon } from 'lucide-react';
import OnboardingLayout from '../components/OnboardingLayout';
import { Button } from '@/components/ui/button';

interface DevicePairingScreenProps {
  onNext: () => void;
}

const DevicePairingScreen = ({ onNext }: DevicePairingScreenProps) => {
  const [selectedWrist, setSelectedWrist] = useState<'left' | 'right'>('left');
  const [isSearching, setIsSearching] = useState(false);
  const [deviceFound, setDeviceFound] = useState(false);
  const [selectedTabIndex, setSelectedTabIndex] = useState(0);

  // This represents our two main tabs/screens - Pairing and Device Selection
  const tabs = ['Pair Device', 'My Devices'];

  const handleScan = () => {
    setIsSearching(true);
    setDeviceFound(false);
    
    // Simulate finding a device after 2 seconds
    setTimeout(() => {
      setIsSearching(false);
      setDeviceFound(true);
    }, 2000);
  };

  const renderPairingTab = () => (
    <div className="flex-1 px-6 pt-8">
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
            <div className={`mb-2 transform -rotate-45 ${
              selectedWrist === 'left' ? 'text-nestor-blue' : 'text-nestor-gray-400'
            }`}>
              <Watch size={28} />
            </div>
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
            <div className={`mb-2 transform rotate-45 ${
              selectedWrist === 'right' ? 'text-nestor-blue' : 'text-nestor-gray-400'
            }`}>
              <Watch size={28} />
            </div>
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
                <Watch size={20} className="text-nestor-blue" />
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
                <Watch size={20} className="text-nestor-blue" />
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
    </div>
  );

  const renderDevicesTab = () => (
    <div className="flex flex-col flex-1">
      {/* Connected Device */}
      <div className="px-6 mt-6">
        <h3 className="text-sm font-medium text-nestor-gray-500 mb-3">CONNECTED</h3>
        <div className="p-4 bg-white border border-gray-200 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                <Watch size={24} className="text-nestor-gray-700" />
              </div>
              <div>
                <h4 className="font-medium text-nestor-gray-900">Nestor N-100</h4>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
                  <span className="text-xs text-nestor-gray-600">Connected</span>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Battery className="text-green-500 mr-2 h-5 w-5" />
              <span className="text-sm text-nestor-gray-600">85%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Devices */}
      <div className="px-6 mt-6">
        <h3 className="text-sm font-medium text-nestor-gray-500 mb-3">AVAILABLE</h3>
        <div className="space-y-3">
          {[
            { name: "Nestor N-100", lastConnected: "2 days ago" },
            { name: "Nestor N-200", lastConnected: "5 days ago" }
          ].map((device, index) => (
            <div key={index} className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <Watch size={24} className="text-nestor-gray-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-nestor-gray-900">{device.name}</h4>
                    <span className="text-xs text-nestor-gray-600">Last connected {device.lastConnected}</span>
                  </div>
                </div>
                <button 
                  onClick={onNext} 
                  className="px-4 py-2 text-sm text-nestor-blue font-medium bg-blue-50 rounded-lg"
                >
                  Connect
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Device */}
      <div className="px-6 mt-8">
        <button 
          onClick={() => setSelectedTabIndex(0)} 
          className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-nestor-gray-500"
        >
          <Plus size={18} className="mr-2" />
          Add New Device
        </button>
      </div>

      {/* Device Tips */}
      <div className="px-6 mt-8 mb-6">
        <div className="p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start">
            <LightbulbIcon size={18} className="text-nestor-blue mt-1 mr-3" />
            <p className="text-sm text-nestor-gray-700">
              For optimal tracking, ensure your watch is worn snugly on your wrist and maintain the device within 30 feet of your phone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <OnboardingLayout>
      {/* Header with back button and tabs */}
      <div className="flex flex-col mb-4">
        <div className="flex items-center justify-between mb-4">
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <ArrowLeft size={20} className="text-nestor-gray-700" />
          </button>
          <h2 className="text-lg font-medium text-nestor-gray-900">{tabs[selectedTabIndex]}</h2>
          <button 
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            onClick={() => setSelectedTabIndex(selectedTabIndex === 0 ? 1 : 0)}
          >
            {selectedTabIndex === 0 ? (
              <div className="flex items-center justify-center">
                <Watch size={20} className="text-nestor-gray-700" />
              </div>
            ) : (
              <Plus size={20} className="text-nestor-gray-700" />
            )}
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`flex-1 text-center py-2 px-4 text-sm font-medium ${
                selectedTabIndex === index
                  ? 'text-nestor-blue border-b-2 border-nestor-blue'
                  : 'text-nestor-gray-500'
              }`}
              onClick={() => setSelectedTabIndex(index)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tab content */}
      {selectedTabIndex === 0 ? renderPairingTab() : renderDevicesTab()}
    </OnboardingLayout>
  );
};

export default DevicePairingScreen;
