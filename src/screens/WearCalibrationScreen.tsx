
import React from 'react';
import { ArrowLeft, Check, HeartPulse, Waveform, Droplet, RotateCw } from 'lucide-react';
import OnboardingLayout from '../components/OnboardingLayout';
import { Button } from '@/components/ui/button';

interface WearCalibrationScreenProps {
  onNext: () => void;
}

const WearCalibrationScreen = ({ onNext }: WearCalibrationScreenProps) => {
  return (
    <OnboardingLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h2 className="text-lg font-medium text-nestor-gray-900">Wear & Calibration</h2>
        <div className="w-10"></div>
      </div>

      {/* Wear Instructions */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-nestor-gray-500 mb-4">PROPER WEAR GUIDE</h3>
        
        <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="text-nestor-blue"
              >
                <circle cx="12" cy="12" r="6" />
                <path d="M12 8v4l1.5 2" />
                <path d="M6 12a6 6 0 0 0 11.78 1.778c.16-.396.296-.8.306-1.221L18 13" />
                <path d="M17.7 8.3A6 6 0 0 0 6.21 9.7l-.047.095L6 10" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-nestor-gray-900">Position</h4>
              <p className="text-sm text-nestor-gray-600">Place sensor under your watch</p>
            </div>
          </div>
          
          <div className="relative h-48 mb-4 bg-gray-100 rounded-lg overflow-hidden">
            <img 
              className="w-full h-full object-cover" 
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/b3162c5b9a-2dcbd77625ce4c328765.png" 
              alt="Proper wear position of health sensor under watch" 
            />
          </div>
          
          <ul className="space-y-3">
            <li className="flex items-start">
              <Check size={16} className="text-green-500 mt-1 mr-2 shrink-0" />
              <span className="text-sm text-nestor-gray-700">Ensure sensor sits flat against skin</span>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-green-500 mt-1 mr-2 shrink-0" />
              <span className="text-sm text-nestor-gray-700">Watch strap should be snug but comfortable</span>
            </li>
            <li className="flex items-start">
              <Check size={16} className="text-green-500 mt-1 mr-2 shrink-0" />
              <span className="text-sm text-nestor-gray-700">Position above wrist bone for best results</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Signal Quality */}
      <div>
        <h3 className="text-sm font-medium text-nestor-gray-500 mb-4">SIGNAL QUALITY CHECK</h3>
        
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="font-medium text-nestor-gray-900">Excellent Signal</span>
            </div>
            <span className="text-sm text-nestor-gray-600">98% Quality</span>
          </div>
          
          <div className="h-24 mb-6">
            <div className="relative h-full">
              <svg viewBox="0 0 300 100" className="w-full h-full">
                <path 
                  d="M0,50 L20,50 L30,20 L40,80 L50,50 L60,50 L80,50 L90,20 L100,80 L110,50 L120,50 L140,50 L150,20 L160,80 L170,50 L180,50 L200,50 L210,20 L220,80 L230,50 L240,50 L260,50 L270,20 L280,80 L290,50 L300,50" 
                  fill="none" 
                  stroke="#22c55e" 
                  strokeWidth="2"
                  className="animate-dash"
                />
              </svg>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <HeartPulse size={16} className="text-red-500 mr-2" />
                <span className="text-sm text-nestor-gray-700">Heart Rate</span>
              </div>
              <span className="text-sm font-medium text-green-500">Active</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Waveform size={16} className="text-purple-500 mr-2" />
                <span className="text-sm text-nestor-gray-700">ECG</span>
              </div>
              <span className="text-sm font-medium text-green-500">Active</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Droplet size={16} className="text-blue-500 mr-2" />
                <span className="text-sm text-nestor-gray-700">Blood Oxygen</span>
              </div>
              <span className="text-sm font-medium text-green-500">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calibration Button */}
      <div className="mt-8">
        <Button 
          onClick={onNext}
          className="w-full py-4 bg-nestor-blue text-white font-medium rounded-lg flex items-center justify-center"
        >
          <RotateCw size={18} className="mr-2" />
          Start Calibration
        </Button>
      </div>

      <style>
        {`
        @keyframes dash {
          from {
            stroke-dashoffset: 1000;
          }
          to {
            stroke-dashoffset: 0;
          }
        }
        
        .animate-dash {
          animation: dash 2s linear infinite;
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
        }
        `}
      </style>
    </OnboardingLayout>
  );
};

export default WearCalibrationScreen;
