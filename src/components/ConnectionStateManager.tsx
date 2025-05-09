
import React from 'react';
import DeviceConnectionLostScreen from "../screens/DeviceConnectionLostScreen";
import DeviceReconnectedScreen from "../screens/DeviceReconnectedScreen";

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
  
  if (connectionState === 'disconnected') {
    return (
      <DeviceConnectionLostScreen 
        onRetry={onRetryConnection}
        onContinueWithoutDevice={onContinueWithoutDevice}
      />
    );
  } else if (connectionState === 'reconnecting') {
    return <DeviceReconnectedScreen />;
  }
  
  return null;
};

export default ConnectionStateManager;
