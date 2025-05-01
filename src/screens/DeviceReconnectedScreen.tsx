
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Bluetooth, Battery, RefreshCw, Tag, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import StatusBar from '@/components/StatusBar';

interface DeviceReconnectedScreenProps {
  onContinueToDashboard?: () => void;
  onManageDevices?: () => void;
}

const DeviceReconnectedScreen = ({
  onContinueToDashboard,
  onManageDevices
}: DeviceReconnectedScreenProps) => {
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    // Show reconnection toast
    toast({
      title: "Device reconnected",
      description: "Your Rolex Datejust device is now active",
    });
  }, [toast]);

  const handleContinue = () => {
    setOpen(false);
    if (onContinueToDashboard) {
      onContinueToDashboard();
    } else {
      navigate('/dashboard');
    }
  };

  const handleManageDevices = () => {
    setOpen(false);
    if (onManageDevices) {
      onManageDevices();
    } else {
      setShowTutorial(true);
      // In a real app, this would navigate to a device management screen
      // navigate('/devices');
    }
  };

  const closeTutorial = () => {
    setShowTutorial(false);
    navigate('/dashboard');
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Device Reconnected</DialogTitle>
            <DialogDescription className="text-center">
              A previously connected device is now active
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center my-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Bluetooth className="h-8 w-8 text-nestor-blue" />
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-xl mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">Rolex Datejust</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="flex items-center space-x-1">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Connected</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">87%</span>
                <Battery className="h-5 w-5 text-green-600" />
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Luxury Watch</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Last synced: Just now</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Button onClick={handleContinue} className="w-full bg-nestor-blue">
              Continue to Dashboard
            </Button>
            <Button onClick={handleManageDevices} variant="outline" className="w-full">
              Manage Devices
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Tutorial dialog that would normally be a full device management screen */}
      <Dialog open={showTutorial} onOpenChange={setShowTutorial}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Device Manager</DialogTitle>
            <DialogDescription className="text-center">
              This would be the full device management screen
            </DialogDescription>
          </DialogHeader>
          
          <div className="p-4 bg-white rounded-xl shadow-sm mb-4 border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-gray-900">My Nestor</h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-900 text-xs font-medium rounded-full">Active</span>
            </div>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Rolex Datejust</span>
              </div>
              <div className="flex items-center space-x-2">
                <Battery className="h-4 w-4 text-green-600" />
                <span className="text-sm text-gray-600">87%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">Last sync: Just now</span>
              </div>
              <Button variant="link" className="text-sm text-nestor-blue h-auto p-0">Details</Button>
            </div>
          </div>
          
          <Button onClick={closeTutorial} className="w-full bg-nestor-blue">
            Back to Dashboard
          </Button>
        </DialogContent>
      </Dialog>
      
      {/* Background page that shows when modal is closed */}
      {!open && !showTutorial && (
        <div className="min-h-screen bg-white flex flex-col">
          <StatusBar />
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4">
                <img 
                  src="https://storage.googleapis.com/uxpilot-auth.appspot.com/58cdf9e9fa-b129f3f632a0845a007d.png" 
                  alt="Nestor logo"
                  className="w-full h-full"
                />
              </div>
              <h2 className="text-xl font-semibold mb-2">Device Active</h2>
              <p className="text-gray-600 mb-6">Your device is now successfully reconnected.</p>
              <Button onClick={() => navigate('/dashboard')} className="bg-nestor-blue">
                Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeviceReconnectedScreen;
