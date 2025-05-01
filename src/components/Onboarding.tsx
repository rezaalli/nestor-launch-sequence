
import React, { useState } from 'react';
import WelcomeScreen from '../screens/WelcomeScreen';
import AccountCreationScreen from '../screens/AccountCreationScreen';
import DevicePairingScreen from '../screens/DevicePairingScreen';
import DeviceSelectionScreen from '../screens/DeviceSelectionScreen';
import DeviceNameScreen from '../screens/DeviceNameScreen';
import WearCalibrationScreen from '../screens/WearCalibrationScreen';
import DeviceConnectedScreen from '../screens/DeviceConnectedScreen';
import PermissionsScreen from '../screens/PermissionsScreen';
import SetupCompleteScreen from '../screens/SetupCompleteScreen';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const navigate = useNavigate();

  // Steps in the onboarding process
  const steps = [
    'welcome',
    'account',
    'devicePairing',
    'deviceSelection',
    'deviceName',
    'wearCalibration',
    'deviceConnected',
    'permissions',
    'setupComplete'
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Navigate to dashboard when onboarding is complete
      navigate('/dashboard');
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <WelcomeScreen onNext={handleNext} />;
      case 1:
        return <AccountCreationScreen onNext={handleNext} />;
      case 2:
        return <DevicePairingScreen onNext={handleNext} />;
      case 3:
        return <DeviceSelectionScreen onNext={handleNext} />;
      case 4:
        return <DeviceNameScreen onNext={handleNext} />;
      case 5:
        return <WearCalibrationScreen onNext={handleNext} />;
      case 6:
        return <DeviceConnectedScreen onNext={handleNext} />;
      case 7:
        return <PermissionsScreen onNext={handleNext} />;
      case 8:
        return <SetupCompleteScreen onNext={handleNext} />;
      default:
        return <WelcomeScreen onNext={handleNext} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderCurrentStep()}
    </div>
  );
};

export default Onboarding;
