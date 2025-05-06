
import React, { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Download, X } from 'lucide-react';
import { startFlashLogUpload, isFlashLogUploadInProgress, getFlashLogUploadProgress } from '@/utils/bleUtils';
import { useToast } from '@/hooks/use-toast';

interface FlashLogUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FlashLogUpload = ({ open, onOpenChange }: FlashLogUploadProps) => {
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [readingCount, setReadingCount] = useState(0);
  
  useEffect(() => {
    // Check initial state on open
    if (open) {
      const currentProgress = getFlashLogUploadProgress();
      const currentIsUploading = isFlashLogUploadInProgress();
      
      setProgress(currentProgress);
      setIsUploading(currentIsUploading);
      setIsComplete(false);
    }
    
    // Set up event listeners
    const handleUploadStart = () => {
      setIsUploading(true);
      setIsComplete(false);
      setProgress(0);
    };
    
    const handleUploadProgress = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setProgress(detail.progress);
    };
    
    const handleUploadComplete = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setProgress(100);
      setIsUploading(false);
      setIsComplete(true);
      setReadingCount(detail.readingCount);
      
      toast({
        title: "Flash Log Upload Complete",
        description: `Successfully uploaded ${detail.readingCount} readings from your device.`,
      });
    };
    
    const handleUploadError = (event: Event) => {
      const detail = (event as CustomEvent).detail;
      setIsUploading(false);
      
      toast({
        title: "Upload Failed",
        description: detail.error,
        variant: "destructive",
      });
    };
    
    // Add event listeners
    window.addEventListener('nestor-flash-upload-start', handleUploadStart);
    window.addEventListener('nestor-flash-upload-progress', handleUploadProgress);
    window.addEventListener('nestor-flash-upload-complete', handleUploadComplete);
    window.addEventListener('nestor-flash-upload-error', handleUploadError);
    
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('nestor-flash-upload-start', handleUploadStart);
      window.removeEventListener('nestor-flash-upload-progress', handleUploadProgress);
      window.removeEventListener('nestor-flash-upload-complete', handleUploadComplete);
      window.removeEventListener('nestor-flash-upload-error', handleUploadError);
    };
  }, [open, toast]);
  
  const handleStartUpload = async () => {
    const result = await startFlashLogUpload();
    if (!result) {
      toast({
        title: "Upload Error",
        description: "Failed to start upload. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Flash Log Upload</DialogTitle>
          <DialogDescription>
            {isComplete 
              ? `Upload complete. Retrieved ${readingCount} readings.` 
              : "Sync historical data from your Nestor device."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-4">
          {!isComplete ? (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Upload Progress</span>
                  <span className="text-sm font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  {isUploading 
                    ? "Please keep your device nearby and do not close the app during upload." 
                    : "Flash logs contain historical data from your device when it was not connected to your phone."}
                </p>
              </div>
            </>
          ) : (
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                Your historical data has been successfully uploaded. Your trends and insights now include this data.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          {isComplete ? (
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button 
                onClick={handleStartUpload}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Start Upload"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlashLogUpload;
