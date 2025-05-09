
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertTriangle, Check, Info } from 'lucide-react';
import { getDiscoveredDevices, checkFirmwareUpdate } from '@/utils/bleUtils';

// Mock firmware update process since we don't have the actual implementation
const MOCK_UPDATE_STAGES = [
  { name: 'Preparing device', progress: 10 },
  { name: 'Uploading firmware', progress: 30 },
  { name: 'Verifying data', progress: 50 },
  { name: 'Applying changes', progress: 70 },
  { name: 'Finalizing', progress: 90 }
];

const FirmwareUpdatePage = () => {
  const { toast } = useToast();
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [currentVersion, setCurrentVersion] = useState('');
  const [availableVersion, setAvailableVersion] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateStage, setUpdateStage] = useState('');
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [batteryLevel, setBatteryLevel] = useState(85);

  // Check for firmware updates
  const checkForUpdates = async () => {
    setIsCheckingForUpdates(true);
    try {
      const result = await checkFirmwareUpdate();
      setCurrentVersion(result.currentVersion);
      setAvailableVersion(result.latestVersion);
      setUpdateAvailable(result.updateAvailable);

      if (result.updateAvailable) {
        toast({
          title: "Update Available",
          description: `Version ${result.latestVersion} is available for installation.`,
        });
      } else {
        toast({
          title: "No Updates",
          description: "Your device is already on the latest firmware version.",
        });
      }
    } catch (error) {
      console.error('Failed to check for firmware updates:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to check for firmware updates. Please ensure your device is connected.",
      });
    } finally {
      setIsCheckingForUpdates(false);
    }
  };

  // Check if device is connected
  const isDeviceConnected = () => {
    const devices = getDiscoveredDevices();
    return devices.length > 0;
  };

  // Mock battery check, in a real app would get this from BLE characteristic
  const checkBatteryLevel = () => {
    // Simulated battery check
    return batteryLevel;
  };

  // Start firmware update process
  const startUpdate = () => {
    // Check battery level first
    const battery = checkBatteryLevel();
    if (battery < 30) {
      toast({
        variant: "destructive",
        title: "Low Battery",
        description: "Battery level is too low for firmware update. Please charge your device.",
      });
      return;
    }

    setShowUpdateDialog(true);
    setIsUpdating(true);
    setUpdateProgress(0);
    setUpdateStage('Preparing update...');
    setHasError(false);
    
    // Mock update process
    let stageIndex = 0;
    
    const updateInterval = setInterval(() => {
      if (stageIndex < MOCK_UPDATE_STAGES.length) {
        const stage = MOCK_UPDATE_STAGES[stageIndex];
        setUpdateProgress(stage.progress);
        setUpdateStage(stage.name);
        stageIndex++;
      } else {
        clearInterval(updateInterval);
        setUpdateProgress(100);
        setUpdateStage('Update complete!');
        setIsUpdating(false);
        
        toast({
          title: "Update Complete",
          description: `Your device has been updated to version ${availableVersion}`,
        });
        
        // Update current version
        setCurrentVersion(availableVersion);
        setUpdateAvailable(false);
        
        // Simulate a random error (10% chance)
        if (Math.random() < 0.1) {
          setHasError(true);
          toast({
            variant: "destructive",
            title: "Update Error",
            description: "There was an issue finalizing the update. Please try again.",
          });
        }
      }
    }, 1500); // Update every 1.5 seconds
    
    // Cleanup
    return () => clearInterval(updateInterval);
  };

  // Check updates on component mount
  useEffect(() => {
    if (isDeviceConnected()) {
      checkForUpdates();
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-xl font-semibold">Firmware Update</h2>
        
        {isDeviceConnected() ? (
          <>
            <div className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Current Version</span>
                <span className="font-medium">{currentVersion || 'Unknown'}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Battery Level</span>
                <span className="font-medium">{batteryLevel}%</span>
              </div>
            </div>
            
            <div className="flex space-x-4">
              <Button 
                variant="outline" 
                onClick={checkForUpdates} 
                disabled={isCheckingForUpdates}
                className="flex-1"
              >
                {isCheckingForUpdates && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                Check for Updates
              </Button>
              
              {updateAvailable && (
                <Button 
                  onClick={startUpdate} 
                  disabled={isUpdating}
                  className="flex-1"
                >
                  Update to {availableVersion}
                </Button>
              )}
            </div>
            
            {updateAvailable && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Update Available</AlertTitle>
                <AlertDescription>
                  A new firmware version ({availableVersion}) is available for your device.
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Device Not Connected</AlertTitle>
            <AlertDescription>
              Please connect your Nestor device to check for firmware updates.
            </AlertDescription>
          </Alert>
        )}
      </div>
      
      {/* Update Progress Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{hasError ? 'Update Failed' : (isUpdating ? 'Updating Firmware' : 'Update Complete')}</DialogTitle>
            <DialogDescription>
              {hasError 
                ? 'There was an error updating your device.' 
                : (isUpdating 
                  ? 'Please keep your device close and do not turn it off.' 
                  : 'Your device has been successfully updated.')}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {isUpdating ? (
              <>
                <div className="flex justify-between text-sm">
                  <span>{updateStage}</span>
                  <span>{updateProgress}%</span>
                </div>
                <Progress value={updateProgress} className="h-2" />
              </>
            ) : (
              <div className="flex flex-col items-center justify-center space-y-3 py-4">
                {hasError ? (
                  <AlertTriangle className="h-10 w-10 text-red-500" />
                ) : (
                  <Check className="h-10 w-10 text-green-500" />
                )}
                <p className="text-center">
                  {hasError 
                    ? 'Update failed. Please try again later.' 
                    : `Successfully updated to version ${availableVersion}`}
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            {!isUpdating && (
              <Button 
                onClick={() => {
                  setShowUpdateDialog(false);
                  if (hasError) {
                    // Reset error state
                    setHasError(false);
                  }
                }}
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FirmwareUpdatePage;
