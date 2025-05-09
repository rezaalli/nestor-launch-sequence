
import React from 'react';
import DeviceConnectionLostScreen from "../screens/DeviceConnectionLostScreen";
import DeviceReconnectedScreen from "../screens/DeviceReconnectedScreen";
import { Button } from "@/components/ui/button";

interface ConnectionStateManagerProps {
  connectionState: 'connected' | 'disconnected' | 'reconnecting';
  onRetryConnection: () => Promise<boolean>;
  onContinueWithoutDevice: () => void;
}

const ConnectionStateManager = ({
  connectionState,
  onRetryConnection,
  onContinueWithoutDevice
}: ConnectionStateManagerProps) => {
  // In development environment, provide an easy way to bypass the connection state
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (connectionState === 'disconnected') {
    return (
      <>
        <DeviceConnectionLostScreen 
          onRetry={onRetryConnection}
          onContinueWithoutDevice={onContinueWithoutDevice}
        />
        
        {/* Development mode bypass button */}
        {isDevelopment && (
          <div className="fixed bottom-28 left-1/2 transform -translate-x-1/2 z-[60]">
            <Button 
              onClick={onContinueWithoutDevice}
              className="bg-purple-700 hover:bg-purple-800 text-white font-bold"
            >
              DEV MODE: Skip Connection Check
            </Button>
          </div>
        )}
      </>
    );
  } else if (connectionState === 'reconnecting') {
    return <DeviceReconnectedScreen />;
  }
  
  return null;
};

export default ConnectionStateManager;
