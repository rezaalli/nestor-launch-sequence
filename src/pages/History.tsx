
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import FlashLogDisplay from '@/components/FlashLogDisplay';
import StatusBar from '@/components/StatusBar';
import BottomNavbar from '@/components/BottomNavbar';
import { startFlashLogUpload, isFlashLogUploadInProgress } from '@/utils/bleUtils';
import { useToast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const History = () => {
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState('heart-rate');

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
          <div>
            <h1 className="text-2xl font-semibold text-nestor-gray-900">Health History</h1>
            <p className="text-nestor-gray-600 text-sm">View your historical health data from the past 7 days</p>
          </div>
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
          <Tabs defaultValue="heart-rate" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="relative">
              <ScrollArea className="w-full pb-4">
                <TabsList className="w-full flex-nowrap overflow-x-auto inline-flex justify-start bg-gray-100 p-1 h-12">
                  <TabsTrigger value="heart-rate" className="whitespace-nowrap">Heart Rate</TabsTrigger>
                  <TabsTrigger value="spo2" className="whitespace-nowrap">SpO₂</TabsTrigger>
                  <TabsTrigger value="temperature" className="whitespace-nowrap">Temperature</TabsTrigger>
                  <TabsTrigger value="readiness" className="whitespace-nowrap">Readiness</TabsTrigger>
                  <TabsTrigger value="sleep" className="whitespace-nowrap">Sleep</TabsTrigger>
                  <TabsTrigger value="activity" className="whitespace-nowrap">Activity</TabsTrigger>
                </TabsList>
              </ScrollArea>
            </div>
            
            <TabsContent value="heart-rate">
              <FlashLogDisplay metricType="heart-rate" />
            </TabsContent>
            
            <TabsContent value="spo2">
              <FlashLogDisplay metricType="spo2" />
            </TabsContent>
            
            <TabsContent value="temperature">
              <FlashLogDisplay metricType="temperature" />
            </TabsContent>
            
            <TabsContent value="readiness">
              <FlashLogDisplay metricType="readiness" />
            </TabsContent>
            
            <TabsContent value="sleep">
              <FlashLogDisplay metricType="sleep" />
            </TabsContent>
            
            <TabsContent value="activity">
              <FlashLogDisplay metricType="activity" />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <BottomNavbar />
    </div>
  );
};

export default History;
