
import React from 'react';
import OnboardingLayout from '../components/OnboardingLayout';
import SignalStrength from '../components/SignalStrength';

interface WearCalibrationScreenProps {
  onNext: () => void;
}

const WearCalibrationScreen = ({ onNext }: WearCalibrationScreenProps) => {
  return (
    <OnboardingLayout>
      <h1 className="text-2xl font-semibold text-nestor-gray-900 mb-8">How to Wear Nestor</h1>
      
      <div className="flex-1 mb-8">
        <div className="mb-10">
          <div className="relative h-64 mb-4">
            <img 
              className="w-full h-full object-cover rounded-lg" 
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/713f1d1bc7-68248692bd7270b9f1f1.png" 
              alt="Step 1: Place device on wrist" 
            />
            <div className="absolute bottom-4 left-4 bg-nestor-blue text-white px-3 py-1 rounded-full text-sm">
              Step 1
            </div>
          </div>
          <p className="text-nestor-gray-600">Place Nestor on your wrist with the sensor facing down.</p>
        </div>
        
        <div className="mb-10">
          <div className="relative h-64 mb-4">
            <img 
              className="w-full h-full object-cover rounded-lg" 
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/33e428c7ed-cbabb865c2fa44c117d6.png" 
              alt="Step 2: Place watch over device" 
            />
            <div className="absolute bottom-4 left-4 bg-nestor-blue text-white px-3 py-1 rounded-full text-sm">
              Step 2
            </div>
          </div>
          <p className="text-nestor-gray-600">Place your watch over Nestor and fasten securely.</p>
        </div>
        
        <div className="bg-blue-50 p-4 rounded-lg flex items-center space-x-3 mb-8">
          <div className="nestor-icon-container">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-nestor-blue" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zm-2.83 2.83a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-nestor-gray-900">Signal Strength</h3>
            <SignalStrength strength="strong" />
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

export default WearCalibrationScreen;
