
import React from 'react';
import OnboardingLayout from '../components/OnboardingLayout';
import { Check } from 'lucide-react';

interface SetupCompleteScreenProps {
  onNext: () => void;
}

const SetupCompleteScreen = ({ onNext }: SetupCompleteScreenProps) => {
  return (
    <OnboardingLayout className="items-center justify-center">
      <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-8">
        <Check className="text-nestor-blue text-3xl" size={36} />
      </div>
      
      <h1 className="text-2xl font-semibold text-nestor-gray-900 mb-3 text-center">You're All Set!</h1>
      <p className="text-nestor-gray-600 text-center mb-12">Your Nestor device is ready to track your health data.</p>
      
      <div className="w-full">
        <button 
          className="nestor-btn"
          onClick={onNext}
        >
          Go to Dashboard
        </button>
      </div>
    </OnboardingLayout>
  );
};

export default SetupCompleteScreen;
