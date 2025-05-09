
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DeviceConnectionLostScreen from "../screens/DeviceConnectionLostScreen";
import DeviceReconnectedScreen from "../screens/DeviceReconnectedScreen";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { requestBlePermissions } from "@/utils/bleUtils";

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
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // ALWAYS bypass connection state in development environment
  if (process.env.NODE_ENV === 'development') {
    return null; // Never show connection lost screen in development
  }
  
  // Only show these screens in production
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
