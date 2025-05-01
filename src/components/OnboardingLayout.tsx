
import React from 'react';
import StatusBar from './StatusBar';

interface OnboardingLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const OnboardingLayout = ({ children, className = "" }: OnboardingLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-white animate-fade-in">
      <StatusBar />
      <div className={`flex-1 px-6 py-10 flex flex-col ${className}`}>
        {children}
      </div>
    </div>
  );
};

export default OnboardingLayout;
