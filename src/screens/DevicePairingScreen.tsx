
import React from 'react';
import OnboardingLayout from '../components/OnboardingLayout';

interface DevicePairingScreenProps {
  onNext: () => void;
}

const DevicePairingScreen = ({ onNext }: DevicePairingScreenProps) => {
  return (
    <OnboardingLayout>
      <h1 className="text-2xl font-semibold text-nestor-gray-900 mb-8">Pair Your Device</h1>
      
      <div className="flex-1 flex flex-col items-center justify-center mb-10">
        <div className="w-64 h-64 mb-8">
          <img 
            className="w-full h-full" 
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/b6efa33225-8d6343e2ad980d865f92.png" 
            alt="Nestor device" 
          />
        </div>
        
        <p className="text-nestor-gray-600 text-center mb-6">
          Position your Nestor device near your phone to begin the pairing process. Make sure Bluetooth is enabled.
        </p>
      </div>
      
      <button 
        className="nestor-btn"
        onClick={onNext}
      >
        Scan for Devices
      </button>
    </OnboardingLayout>
  );
};

export default DevicePairingScreen;
