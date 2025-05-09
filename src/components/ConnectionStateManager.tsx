
import React, { useEffect } from 'react';
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
  
  // In development environment, provide an easy way to bypass the connection state
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  useEffect(() => {
    // Show permissions toast if needed when in disconnected state
    if (connectionState === 'disconnected' && isDevelopment) {
      toast({
        title: "Permission Required",
        description: "Bluetooth permission is required to connect to your Nestor device.",
        action: (
          <Button 
            onClick={async () => {
              const granted = await requestBlePermissions();
              if (granted) {
                toast({
                  title: "Permission Granted",
                  description: "You can now connect to your device."
                });
                onRetryConnection();
              }
            }} 
            variant="outline"
            className="bg-primary text-primary-foreground"
          >
            Request Permission
          </Button>
        )
      });
    }
  }, [connectionState, isDevelopment, toast, onRetryConnection]);
  
  if (connectionState === 'disconnected') {
    return (
      <>
        <DeviceConnectionLostScreen 
          onRetry={onRetryConnection}
          onContinueWithoutDevice={onContinueWithoutDevice}
        />
        
        {/* Development mode bypass buttons */}
        {isDevelopment && (
          <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[60] flex flex-col gap-2 w-11/12 max-w-xs">
            <Button 
              onClick={onContinueWithoutDevice}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold"
            >
              DEV MODE: Continue Without Device
            </Button>
            
            <Button 
              onClick={() => navigate('/dashboard')}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold"
            >
              DEV MODE: Go to Dashboard
            </Button>
            
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full border-amber-500 text-amber-700 hover:bg-amber-50">
                  DEV MODE: Quick Navigation
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="grid gap-4 py-4">
                  <h2 className="font-bold text-lg">Quick Navigation</h2>
                  <div className="grid gap-2">
                    <Button onClick={() => navigate('/')} variant="outline" className="justify-start">
                      Home / Onboarding
                    </Button>
                    <Button onClick={() => navigate('/dashboard')} variant="outline" className="justify-start">
                      Dashboard
                    </Button>
                    <Button onClick={() => navigate('/history')} variant="outline" className="justify-start">
                      History
                    </Button>
                    <Button onClick={() => navigate('/trends')} variant="outline" className="justify-start">
                      Trends
                    </Button>
                    <Button onClick={() => navigate('/lifestyle-checkin')} variant="outline" className="justify-start">
                      Lifestyle Check-in
                    </Button>
                    <Button onClick={() => navigate('/reports')} variant="outline" className="justify-start">
                      Reports
                    </Button>
                    <Button onClick={() => navigate('/notifications')} variant="outline" className="justify-start">
                      Notifications
                    </Button>
                    <Button onClick={() => navigate('/profile')} variant="outline" className="justify-start">
                      Profile
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
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
