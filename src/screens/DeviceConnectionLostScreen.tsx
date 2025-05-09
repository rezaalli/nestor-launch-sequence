
import React, { useState } from 'react';
import { Bluetooth, Watch, RefreshCw, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { connectToDevice } from '@/utils/ble/bleConnection';
import { useToast } from '@/hooks/use-toast';

interface DeviceConnectionLostScreenProps {
  onRetry: () => void;
  onContinueWithoutDevice: () => void;
}

const DeviceConnectionLostScreen = ({ 
  onRetry, 
  onContinueWithoutDevice 
}: DeviceConnectionLostScreenProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleRetryConnection = async () => {
    setIsConnecting(true);
    
    try {
      // Attempt to reconnect to the BLE device
      const connected = await connectToDevice();
      
      if (connected) {
        toast({
          title: "Connection successful",
          description: "Your Nestor device is now connected",
        });
        onRetry(); // Call the parent's onRetry function on success
      } else {
        toast({
          title: "Connection failed",
          description: "Unable to connect to your Nestor device",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Connection error:', error);
      toast({
        title: "Connection error",
        description: "An error occurred while connecting to your device",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleContinueWithoutDevice = () => {
    toast({
      title: "Continuing without device",
      description: "You can connect your device later from the dashboard",
    });
    onContinueWithoutDevice();
  };

  const handleGoToDashboard = () => {
    toast({
      title: "Going to dashboard",
      description: "Bypassing connection check",
    });
    navigate('/dashboard');
  };

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
            onClick={handleRetryConnection}
            className="w-full py-6 bg-nestor-blue text-white font-medium rounded-lg flex items-center justify-center"
            disabled={isConnecting}
          >
            {isConnecting ? (
              <>
                <RefreshCw size={18} className="mr-2 animate-spin" /> 
                Connecting...
              </>
            ) : (
              <>
                <RefreshCw size={18} className="mr-2" /> 
                Retry Connection
              </>
            )}
          </Button>
          
          <Button
            onClick={handleContinueWithoutDevice}
            variant="outline"
            className="w-full py-6 bg-white text-nestor-blue font-medium rounded-lg border border-nestor-blue"
          >
            <ArrowRight size={18} className="mr-2" />
            Continue Without Device
          </Button>
        </div>
      </div>
      
      <div className="absolute bottom-6 w-full max-w-xs text-center">
        <button 
          onClick={handleGoToDashboard}
          className="text-sm text-nestor-blue underline font-medium flex items-center justify-center w-full"
          disabled={isConnecting}
        >
          Go to Dashboard Anyway
          <ArrowRight size={14} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default DeviceConnectionLostScreen;
