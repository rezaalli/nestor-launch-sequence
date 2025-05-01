
import React, { useState } from 'react';
import OnboardingLayout from '../components/OnboardingLayout';
import DeviceItem from '../components/DeviceItem';

interface DeviceSelectionScreenProps {
  onNext: () => void;
}

const DeviceSelectionScreen = ({ onNext }: DeviceSelectionScreenProps) => {
  const [selectedDevice, setSelectedDevice] = useState<string | null>('device1');
  
  const devices = [
    { id: 'device1', name: 'Nestor N-100', signalStrength: 'strong' as const, battery: 98 },
    { id: 'device2', name: 'Nestor N-100', signalStrength: 'weak' as const, battery: 45 }
  ];
  
  return (
    <OnboardingLayout>
      <h1 className="text-2xl font-semibold text-nestor-gray-900 mb-8">Devices Found Nearby</h1>
      
      <div className="flex-1 mb-8">
        <div className="space-y-4">
          {devices.map(device => (
            <DeviceItem 
              key={device.id}
              name={device.name}
              signalStrength={device.signalStrength}
              battery={device.battery}
              selected={selectedDevice === device.id}
              onSelect={() => setSelectedDevice(device.id)}
            />
          ))}
        </div>
      </div>
      
      <button 
        className="nestor-btn"
        onClick={onNext}
        disabled={!selectedDevice}
      >
        Connect
      </button>
    </OnboardingLayout>
  );
};

export default DeviceSelectionScreen;
