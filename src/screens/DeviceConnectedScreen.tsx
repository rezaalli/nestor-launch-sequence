
import React, { useState, useEffect } from 'react';
import { Check, ArrowRight, Battery } from 'lucide-react';
import OnboardingLayout from '../components/OnboardingLayout';

interface DeviceConnectedScreenProps {
  onNext: () => void;
}

const DeviceConnectedScreen = ({ onNext }: DeviceConnectedScreenProps) => {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'syncing' | 'connected'>('splash');

  useEffect(() => {
    // Show splash screen briefly, then move to syncing
    const splashTimer = setTimeout(() => {
      setCurrentScreen('syncing');
    }, 2000);

    // After a few seconds show the connected screen
    const syncingTimer = setTimeout(() => {
      setCurrentScreen('connected');
    }, 5000);

    return () => {
      clearTimeout(splashTimer);
      clearTimeout(syncingTimer);
    };
  }, []);

  const renderSplashScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-32 h-32 mb-12">
        <img 
          className="w-full h-full" 
          src="https://storage.googleapis.com/uxpilot-auth.appspot.com/58cdf9e9fa-b129f3f632a0845a007d.png" 
          alt="Nestor logo" 
        />
      </div>
      
      <div className="w-full max-w-xs flex flex-col items-center px-8">
        <h1 className="text-2xl font-semibold text-nestor-blue mb-2">Nestor</h1>
        <p className="text-nestor-gray-600 text-center text-sm">Your Health Companion</p>
      </div>
    </div>
  );

  const renderSyncingScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-24 h-24 mb-8">
        <img 
          className="w-full h-full" 
          src="https://storage.googleapis.com/uxpilot-auth.appspot.com/58cdf9e9fa-b129f3f632a0845a007d.png" 
          alt="Nestor logo" 
        />
      </div>
      
      <div className="flex flex-col items-center px-8">
        <div className="w-16 h-16 mb-6">
          <div className="w-full h-full rounded-full border-4 border-gray-200 border-t-nestor-blue animate-spin"></div>
        </div>
        <h2 className="text-xl font-medium text-nestor-gray-900 mb-2">Syncing Device</h2>
        <p className="text-nestor-gray-600 text-center mb-8">Please wait while we sync your data...</p>
      </div>
    </div>
  );

  const renderConnectedScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="w-24 h-24 mb-8">
        <img 
          className="w-full h-full" 
          src="https://storage.googleapis.com/uxpilot-auth.appspot.com/58cdf9e9fa-b129f3f632a0845a007d.png" 
          alt="Nestor logo" 
        />
      </div>
      
      <div className="flex flex-col items-center px-8">
        <div className="w-16 h-16 mb-6 flex items-center justify-center">
          <Check size={48} className="text-green-500" />
        </div>
        <h2 className="text-xl font-medium text-nestor-gray-900 mb-2">Device Connected</h2>
        <p className="text-nestor-gray-600 text-center mb-8">
          Your Nestor device is successfully connected and ready to track your health data.
        </p>
        
        <div className="w-full max-w-xs bg-gray-50 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-nestor-gray-600">Device Status</span>
            <span className="text-sm font-medium text-green-500">Connected</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-nestor-gray-600">Battery Level</span>
            <div className="flex items-center">
              <Battery className="text-green-500 mr-2 h-4 w-4" />
              <span className="text-sm font-medium text-nestor-gray-900">85%</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onNext}
          className="w-full max-w-xs bg-nestor-blue text-white font-medium rounded-lg py-4 mb-3 flex items-center justify-center"
        >
          Continue to Dashboard
          <ArrowRight size={16} className="ml-2" />
        </button>
      </div>
    </div>
  );

  return (
    <OnboardingLayout className="p-0">
      {currentScreen === 'splash' && renderSplashScreen()}
      {currentScreen === 'syncing' && renderSyncingScreen()}
      {currentScreen === 'connected' && renderConnectedScreen()}

      <style jsx>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </OnboardingLayout>
  );
};

export default DeviceConnectedScreen;
