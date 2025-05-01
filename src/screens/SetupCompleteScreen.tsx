
import React from 'react';
import OnboardingLayout from '../components/OnboardingLayout';
import { Check, Watch } from 'lucide-react';

interface SetupCompleteScreenProps {
  onNext: () => void;
}

const SetupCompleteScreen = ({ onNext }: SetupCompleteScreenProps) => {
  return (
    <OnboardingLayout className="items-center justify-center">
      <div className="w-full max-w-sm text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto flex items-center justify-center">
            <Check className="text-nestor-blue text-3xl" size={36} />
          </div>
        </div>
        
        {/* Text Content */}
        <h1 className="text-2xl font-semibold text-nestor-gray-900 mb-3 text-center">Setup Complete!</h1>
        <p className="text-nestor-gray-600 text-center mb-8">Your Nestor device is now connected and ready to track your wellness journey.</p>
        
        {/* Device Info */}
        <div className="bg-gray-50 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-center">
            <Watch className="text-nestor-blue mr-2" size={18} />
            <span className="text-nestor-gray-900 font-medium">Nestor Watch • Connected</span>
          </div>
          <div className="flex items-center justify-center mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
            <span className="text-sm text-nestor-gray-600">Syncing data</span>
          </div>
        </div>
        
        {/* Action Button */}
        <button 
          className="w-full py-4 bg-nestor-blue text-white font-medium rounded-lg mb-4"
          onClick={onNext}
        >
          Go to Dashboard
        </button>
        
        {/* Skip Link */}
        <button className="text-sm text-nestor-gray-500">
          Watch the quick tour
        </button>
      </div>
    </OnboardingLayout>
  );
};

export default SetupCompleteScreen;
