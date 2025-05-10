
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';

const FirmwareUpdatePage = () => {
  const firmwareState = {
    currentVersion: '1.0.0',
    latestVersion: '1.1.0',
    updateAvailable: true,
    isChecking: false,
    isUpdating: false,
    updateComplete: false,
    error: null
  };

  return (
    <div className="px-6 py-4">
      <div className="bg-white rounded-xl p-5 mb-6">
        <h3 className="text-lg font-medium mb-4">Firmware Update</h3>
        
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-nestor-gray-500">Current Version</span>
            <span className="font-medium">{firmwareState.currentVersion}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-nestor-gray-500">Latest Version</span>
            <span className="font-medium">{firmwareState.latestVersion}</span>
          </div>
          
          {firmwareState.updateAvailable && (
            <div className="p-4 bg-blue-50 rounded-lg flex items-center text-sm">
              <AlertTriangle className="text-blue-500 mr-2 flex-shrink-0" size={18} />
              <p className="text-nestor-gray-700">
                A new firmware update is available. Please ensure your device is charged above 50% before updating.
              </p>
            </div>
          )}
          
          {firmwareState.updateComplete && (
            <div className="p-4 bg-green-50 rounded-lg flex items-center text-sm">
              <CheckCircle className="text-green-500 mr-2 flex-shrink-0" size={18} />
              <p className="text-nestor-gray-700">
                Firmware has been successfully updated to version {firmwareState.latestVersion}.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-xl p-5 mb-6">
        <h3 className="text-lg font-medium mb-4">Update History</h3>
        <ScrollArea className="h-60">
          <div className="space-y-4">
            <div className="border-b pb-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Version 1.0.0</span>
                <span className="text-xs text-nestor-gray-500">May 2, 2025</span>
              </div>
              <p className="text-sm text-nestor-gray-600 mt-2">
                Initial release with heart rate, SpO2, and temperature monitoring. Readiness score calculation and basic activity tracking.
              </p>
            </div>
            
            <div className="border-b pb-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">Version 0.9.1 (Beta)</span>
                <span className="text-xs text-nestor-gray-500">Apr 18, 2025</span>
              </div>
              <p className="text-sm text-nestor-gray-600 mt-2">
                Beta release with stability improvements and battery optimization.
              </p>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Version 0.9.0 (Beta)</span>
                <span className="text-xs text-nestor-gray-500">Apr 5, 2025</span>
              </div>
              <p className="text-sm text-nestor-gray-600 mt-2">
                First beta release for internal testing.
              </p>
            </div>
          </div>
        </ScrollArea>
      </div>
      
      <div className="space-x-3 flex">
        <Button 
          variant="outline" 
          className="flex-1"
        >
          Check for Updates
        </Button>
        
        <Button 
          className="flex-1"
          disabled={!firmwareState.updateAvailable || firmwareState.isUpdating}
        >
          {firmwareState.isUpdating ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            'Update Firmware'
          )}
        </Button>
      </div>
    </div>
  );
};

export default FirmwareUpdatePage;
