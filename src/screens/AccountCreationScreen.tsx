
import React, { useState } from 'react';
import OnboardingLayout from '../components/OnboardingLayout';
import { Apple, ArrowRight } from 'lucide-react';

interface AccountCreationScreenProps {
  onNext: () => void;
}

const AccountCreationScreen = ({ onNext }: AccountCreationScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <OnboardingLayout>
      <h1 className="text-2xl font-semibold text-nestor-gray-900 mb-10">Create Your Account</h1>
      
      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-nestor-gray-600 font-medium">Email</label>
          <input 
            type="email" 
            id="email" 
            className="nestor-input"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-nestor-gray-600 font-medium">Password</label>
          <input 
            type="password" 
            id="password" 
            className="nestor-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      
      <div className="flex flex-col space-y-4 mb-8">
        <button className="nestor-btn-outline">
          <Apple size={20} />
          <span className="font-medium text-nestor-gray-800 ml-2">Continue with Apple</span>
        </button>
        
        <button className="nestor-btn-outline">
          <span className="font-medium text-nestor-gray-800">Continue with Google</span>
        </button>
      </div>
      
      <button 
        className="nestor-btn mb-4"
        onClick={onNext}
      >
        Next
      </button>
      
      <p className="text-center text-nestor-gray-600">
        Already have an account? <span className="text-nestor-blue font-medium cursor-pointer">Log In Instead</span>
      </p>
    </OnboardingLayout>
  );
};

export default AccountCreationScreen;
