
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import FlashLogDisplay from '@/components/FlashLogDisplay';
import StatusBar from '@/components/StatusBar';
import BottomNavbar from '@/components/BottomNavbar';
import { startFlashLogUpload, isFlashLogUploadInProgress } from '@/utils/bleUtils';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';

const History = () => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncNow = async () => {
    if (isFlashLogUploadInProgress()) {
      toast({
        title: "Sync in progress",
        description: "Please wait for the current sync to complete",
      });
      return;
    }
    
    setIsSyncing(true);
    const result = await startFlashLogUpload();
    if (!result) {
      toast({
        title: "Sync failed",
        description: "Could not start syncing data from your device",
        variant: "destructive",
      });
    }
    setIsSyncing(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <StatusBar />
      
      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-nestor-gray-900">Health History</h1>
          <Button 
            onClick={handleSyncNow}
            disabled={isSyncing}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
        
        <div className="mb-8">
          <FlashLogDisplay />
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default History;
