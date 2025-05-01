
import React from 'react';
import { Bluetooth, Watch, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface DeviceConnectionLostScreenProps {
  onRetry: () => void;
  onContinueWithoutDevice: () => void;
}

const DeviceConnectionLostScreen = ({ 
  onRetry, 
  onContinueWithoutDevice 
}: DeviceConnectionLostScreenProps) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center fixed inset-0 z-50">
      <div className="w-24 h-24 mb-8">
        <img 
          className="w-full h-full" 
          src="https://storage.googleapis.com/uxpilot-auth.appspot.com/58cdf9e9fa-b129f3f632a0845a007d.png" 
          alt="Nestor logo" 
        />
      </div>
      
      <div className="flex flex-col items-center px-8">
        <div className="w-16 h-16 mb-6 flex items-center justify-center">
          <Watch size={48} className="text-gray-400" />
        </div>
        <h2 className="text-xl font-medium text-nestor-gray-900 mb-2">Connection Lost</h2>
        <p className="text-nestor-gray-600 text-center mb-8">
          We couldn't connect to your Nestor device. Please ensure it's nearby and Bluetooth is enabled.
        </p>
        
        <div className="w-full max-w-xs space-y-4">
          <Button 
            onClick={onRetry}
            className="w-full py-6 bg-nestor-blue text-white font-medium rounded-lg flex items-center justify-center"
          >
            <RefreshCw size={18} className="mr-2" /> 
            Retry Connection
          </Button>
          
          <Button
            onClick={onContinueWithoutDevice}
            variant="outline"
            className="w-full py-6 bg-white text-nestor-blue font-medium rounded-lg border border-nestor-blue"
          >
            Continue Without Device
          </Button>
        </div>
      </div>
      
      <div className="absolute bottom-6 w-full max-w-xs text-center">
        <button 
          onClick={() => navigate('/dashboard')}
          className="text-sm text-nestor-gray-500 underline"
        >
          Go to Dashboard Anyway
        </button>
      </div>
    </div>
  );
};

export default DeviceConnectionLostScreen;
