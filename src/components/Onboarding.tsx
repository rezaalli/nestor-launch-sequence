
import React, { useState } from 'react';
import WelcomeScreen from '../screens/WelcomeScreen';
import AccountCreationScreen from '../screens/AccountCreationScreen';
import DevicePairingScreen from '../screens/DevicePairingScreen';
import DeviceNameScreen from '../screens/DeviceNameScreen';
import WearCalibrationScreen from '../screens/WearCalibrationScreen';
import PermissionsScreen from '../screens/PermissionsScreen';
import SetupCompleteScreen from '../screens/SetupCompleteScreen';
import { useNavigate } from 'react-router-dom';

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const navigate = useNavigate();

  // Steps in the onboarding process
  const steps = [
    'welcome',
    'account',
    'devicePairing',
    'deviceName',
    'wearCalibration',
    'permissions',
    'setupComplete'
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete onboarding but don't redirect
      onComplete();
      // Don't navigate automatically - user will need to click on the appropriate section
      // This prevents the auto-redirect loop
    }
  };

  // Handle manual navigation to a section
  const handleNavigateTo = (path: string) => {
    onComplete();
    navigate(path);
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
        return <DeviceNameScreen onNext={handleNext} />;
      case 4:
        return <WearCalibrationScreen onNext={handleNext} />;
      case 5:
        return <PermissionsScreen onNext={handleNext} />;
      case 6:
        return (
          <SetupCompleteScreen 
            onNext={() => handleNavigateTo('/dashboard')}
          />
        );
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
