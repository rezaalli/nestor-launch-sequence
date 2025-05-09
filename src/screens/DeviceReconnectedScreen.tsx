
import React, { useState, useEffect } from 'react';
import { BluetoothConnected, Shield, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { isDeviceConnected, connectToDevice, getDeviceName, startFlashLogUpload, isFlashLogUploadInProgress, getFlashLogUploadProgress } from '@/utils/bleUtils';

const DeviceReconnectedScreen = () => {
  const navigate = useNavigate();
  const [reconnectionState, setReconnectionState] = useState<'connecting' | 'connected' | 'syncing' | 'completed'>('connecting');
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStage, setSyncStage] = useState('Initializing');
  const [deviceName, setDeviceName] = useState(getDeviceName());
  const [readingsCount, setReadingsCount] = useState(0);

  useEffect(() => {
    let autoRedirectTimer: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    const simulateReconnection = async () => {
      // Simulate connection attempt
      setReconnectionState('connecting');
      
      // Attempt to connect
      const connected = await connectToDevice();
      
      if (!connected) {
        navigate('/connection-lost');
        return;
      }
      
      // Connected successfully
      setReconnectionState('connected');
      setDeviceName(getDeviceName());
      
      // Wait a moment before starting sync
      setTimeout(() => {
        setReconnectionState('syncing');
        
        // Start the flash log upload
        startFlashLogUpload();
        
        // Set up progress monitoring
        progressInterval = setInterval(() => {
          const isInProgress = isFlashLogUploadInProgress();
          const progress = getFlashLogUploadProgress();
          
          setSyncProgress(progress);
          
          // Set sync stage based on progress
          if (progress < 20) setSyncStage('Initializing secure connection');
          else if (progress < 40) setSyncStage('Requesting offline data');
          else if (progress < 60) setSyncStage('Downloading records');
          else if (progress < 80) setSyncStage('Processing data');
          else if (progress < 100) setSyncStage('Finalizing sync');
          
          // If upload is complete
          if (!isInProgress && progress === 100) {
            setReconnectionState('completed');
            clearInterval(progressInterval);
          }
        }, 500);
        
      }, 2000);
    };
    
    // Set up event handlers
    const handleFlashUploadComplete = (event: Event) => {
      const { readingCount } = (event as CustomEvent).detail;
      setReadingsCount(readingCount);
      setReconnectionState('completed');
      
      // Auto-redirect after sync completion
      autoRedirectTimer = setTimeout(() => {
        navigate('/dashboard');
      }, 3000);
    };
    
    const handleFlashUploadError = () => {
      // Even on error, let the user continue
      setReconnectionState('completed');
    };
    
    // Add event listeners
    window.addEventListener('nestor-flash-upload-complete', handleFlashUploadComplete);
    window.addEventListener('nestor-flash-upload-error', handleFlashUploadError);
    
    // Start the reconnection process
    simulateReconnection();
    
    return () => {
      window.removeEventListener('nestor-flash-upload-complete', handleFlashUploadComplete);
      window.removeEventListener('nestor-flash-upload-error', handleFlashUploadError);
      if (autoRedirectTimer) clearTimeout(autoRedirectTimer);
      if (progressInterval) clearInterval(progressInterval);
    };
  }, [navigate]);

  // Render different content based on the reconnection state
  const renderContent = () => {
    switch (reconnectionState) {
      case 'connecting':
        return (
          <>
            <div className="w-16 h-16 mb-6">
              <div className="w-full h-full rounded-full border-4 border-gray-200 border-t-nestor-blue animate-spin"></div>
            </div>
            <h2 className="text-xl font-medium text-nestor-gray-900 mb-2">Reconnecting</h2>
            <p className="text-nestor-gray-600 text-center mb-8">
              Attempting to reconnect to your Nestor device...
            </p>
          </>
        );
        
      case 'connected':
        return (
          <>
            <div className="w-16 h-16 mb-6 flex items-center justify-center">
              <BluetoothConnected size={48} className="text-blue-500" />
            </div>
            <h2 className="text-xl font-medium text-nestor-gray-900 mb-2">Device Connected</h2>
            <p className="text-nestor-gray-600 text-center mb-8">
              Successfully reconnected to {deviceName}
            </p>
          </>
        );
        
      case 'syncing':
        return (
          <>
            <div className="w-16 h-16 mb-6 relative">
              <RefreshCw size={48} className="text-blue-500 animate-spin" />
            </div>
            <h2 className="text-xl font-medium text-nestor-gray-900 mb-2">Syncing Data</h2>
            <p className="text-nestor-gray-600 text-center mb-4">
              Retrieving your offline data from the device
            </p>
            
            <div className="w-full max-w-xs mb-2">
              <div className="flex justify-between items-center text-xs text-nestor-gray-500 mb-1">
                <span>{syncStage}</span>
                <span>{syncProgress}%</span>
              </div>
              <Progress value={syncProgress} className="h-2" />
            </div>
            
            <p className="text-xs text-nestor-gray-500 mb-8">
              Please keep your device nearby until syncing is complete
            </p>
          </>
        );
        
      case 'completed':
        return (
          <>
            <div className="w-16 h-16 mb-6 flex items-center justify-center">
              <Check size={48} className="text-green-500" />
            </div>
            <h2 className="text-xl font-medium text-nestor-gray-900 mb-2">Sync Complete</h2>
            <p className="text-nestor-gray-600 text-center mb-4">
              {readingsCount > 0 
                ? `Successfully synced ${readingsCount} readings from your device.` 
                : 'Your device is now fully synced and ready to use.'}
            </p>
            
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
              <Shield size={24} className="text-blue-600" />
            </div>
            <p className="text-sm text-nestor-gray-600 text-center mb-8">
              Your health data is securely stored and encrypted
            </p>
          </>
        );
    }
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
        {renderContent()}
        
        <Button 
          onClick={() => navigate('/dashboard')}
          className={`w-full max-w-xs bg-nestor-blue text-white font-medium rounded-lg py-4 mb-3 ${
            reconnectionState !== 'completed' && reconnectionState !== 'connected' ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={reconnectionState !== 'completed' && reconnectionState !== 'connected'}
        >
          Continue to Dashboard
        </Button>
      </div>

      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
          .animate-spin {
            animation: spin 1s linear infinite;
          }
        `}
      </style>
    </div>
  );
};

export default DeviceReconnectedScreen;
