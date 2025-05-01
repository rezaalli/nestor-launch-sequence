
import React from 'react';

interface WelcomeScreenProps {
  onNext: () => void;
}

const WelcomeScreen = ({ onNext }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="h-6 w-full bg-white"></div>
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 animate-slide-up">
        <div className="mb-12 w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
          <img className="w-16 h-16" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/58cdf9e9fa-b129f3f632a0845a007d.png" alt="Nestor logo" />
        </div>
        
        <h1 className="text-2xl font-semibold text-nestor-gray-900 mb-3 text-center">Welcome to Nestor</h1>
        <p className="text-nestor-gray-600 text-center mb-12">Effortless health tracking. Personal style preserved.</p>
        
        <button 
          className="nestor-btn"
          onClick={onNext}
        >
          Let's Get Started
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
