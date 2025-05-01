
import React, { useState } from 'react';
import OnboardingLayout from '../components/OnboardingLayout';
import { Apple } from 'lucide-react';

interface AccountCreationScreenProps {
  onNext: () => void;
}

const AccountCreationScreen = ({ onNext }: AccountCreationScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <OnboardingLayout>
      {/* Back button */}
      <div className="mb-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nestor-gray-900">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
      </div>

      <h1 className="text-3xl font-semibold text-nestor-gray-900 mb-3">Create Your Account</h1>
      <p className="text-nestor-gray-600 mb-10">Join Nestor to start your health journey</p>
      
      <div className="space-y-6 mb-8">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm text-nestor-gray-600 font-medium">Email</label>
          <div className="relative">
            <input 
              type="email" 
              id="email" 
              className="nestor-input pl-11"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-nestor-gray-400">
              <rect width="20" height="16" x="2" y="4" rx="2"/>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
            </svg>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm text-nestor-gray-600 font-medium">Password</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              id="password" 
              className="nestor-input pl-11 pr-11"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-nestor-gray-400">
              <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nestor-gray-400">
                  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                  <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                  <line x1="2" x2="22" y1="2" y2="22"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nestor-gray-400">
                  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-nestor-gray-500">Must be at least 8 characters</p>
        </div>
      </div>
      
      <div className="relative flex items-center justify-center mb-8">
        <hr className="w-full border-nestor-gray-200" />
        <span className="absolute bg-white px-4 text-sm text-nestor-gray-500">or continue with</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button className="p-4 border border-nestor-gray-300 rounded-lg flex items-center justify-center space-x-2 hover:bg-nestor-gray-50">
          <Apple size={20} />
          <span className="font-medium text-nestor-gray-800">Apple</span>
        </button>
        
        <button className="p-4 border border-nestor-gray-300 rounded-lg flex items-center justify-center space-x-2 hover:bg-nestor-gray-50">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-nestor-gray-800">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="font-medium text-nestor-gray-800">Google</span>
        </button>
      </div>
      
      <button 
        className="nestor-btn mb-6"
        onClick={onNext}
      >
        Create Account
      </button>
      
      <p className="text-center text-nestor-gray-600 mb-8">
        Already have an account? <span className="text-nestor-blue font-medium cursor-pointer">Log In</span>
      </p>
      
      <p className="text-xs text-center text-nestor-gray-500">
        By continuing, you agree to our <span className="text-nestor-gray-900 underline">Terms</span> and <span className="text-nestor-gray-900 underline">Privacy Policy</span>
      </p>
    </OnboardingLayout>
  );
};

export default AccountCreationScreen;
