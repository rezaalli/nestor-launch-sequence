
import React, { useState } from 'react';
import { ArrowLeft, Plus, Watch, Battery, LightbulbIcon } from 'lucide-react';
import OnboardingLayout from '../components/OnboardingLayout';
import DeviceItem from '../components/DeviceItem';

interface DeviceSelectionScreenProps {
  onNext: () => void;
}

const DeviceSelectionScreen = ({ onNext }: DeviceSelectionScreenProps) => {
  const [selectedDevice, setSelectedDevice] = useState<string | null>('device1');
  
  const connectedDevices = [
    { 
      id: 'device1', 
      name: 'Nestor N-100', 
      signalStrength: 'strong' as const, 
      battery: 85, 
      status: 'connected' 
    }
  ];
  
  const availableDevices = [
    { 
      id: 'device2', 
      name: 'Nestor N-100', 
      lastConnected: '2 days ago',
      signalStrength: 'medium' as const,
      battery: 65 
    },
    { 
      id: 'device3', 
      name: 'Nestor N-200', 
      lastConnected: '5 days ago',
      signalStrength: 'weak' as const,
      battery: 45 
    }
  ];
  
  return (
    <OnboardingLayout>
      {/* Header with back button and title */}
      <div className="flex items-center justify-between mb-4">
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h2 className="text-lg font-medium text-nestor-gray-900">Devices</h2>
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <Plus size={20} className="text-gray-700" />
        </button>
      </div>
      
      {/* Connected Devices */}
      <div className="px-0 mt-6 mb-6">
        <h3 className="text-sm font-medium text-nestor-gray-500 mb-3">CONNECTED</h3>
        <div className="space-y-3">
          {connectedDevices.map(device => (
            <div key={device.id} className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                    <Watch size={24} className="text-nestor-gray-700" />
                  </div>
                  <div>
                    <h4 className="font-medium text-nestor-gray-900">{device.name}</h4>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
                      <span className="text-xs text-nestor-gray-600">Connected</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <Battery className="text-green-500 mr-2 h-5 w-5" />
                  <span className="text-sm text-nestor-gray-600">{device.battery}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Available Devices */}
      <div className="px-0 mt-6">
        <h3 className="text-sm font-medium text-nestor-gray-500 mb-3">AVAILABLE</h3>
        <div className="space-y-3 mb-8">
          {availableDevices.map(device => (
            <div key={device.id} className="p-4 bg-white border border-gray-200 rounded-xl">
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
                  onClick={() => {
                    setSelectedDevice(device.id);
                    onNext();
                  }}
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
      <div className="px-0 mt-8">
        <button className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-nestor-gray-500">
          <Plus size={18} className="mr-2" />
          Add New Device
        </button>
      </div>
      
      {/* Device Tips */}
      <div className="px-0 mt-8 mb-6">
        <div className="p-4 bg-blue-50 rounded-xl">
          <div className="flex items-start">
            <LightbulbIcon size={18} className="text-nestor-blue mt-1 mr-3" />
            <p className="text-sm text-nestor-gray-700">
              For optimal tracking, ensure your watch is worn snugly on your wrist and maintain the device within 30 feet of your phone.
            </p>
          </div>
        </div>
      </div>
    </OnboardingLayout>
  );
};

export default DeviceSelectionScreen;
