
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNotifications } from '@/contexts/NotificationsContext';

interface HeartRateAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heartRate: number;
  onDismiss: () => void;
  onMonitor: () => void;
}

const HeartRateAlertDialog = ({
  open,
  onOpenChange,
  heartRate = 120,
  onDismiss,
  onMonitor,
}: HeartRateAlertDialogProps) => {
  const { addNotification, deleteNotification } = useNotifications();
  
  const handleDismiss = () => {
    onDismiss();
    
    // Instead of adding to notifications when dismissed, we'll skip that
    // The notification will only be added if the user chooses to monitor
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-xl w-[90%] max-w-sm overflow-hidden shadow-xl p-0">
        <div className="p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <i className="fa-solid fa-heart-pulse text-red-600 text-2xl"></i>
          </div>
          
          <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">High Heart Rate Alert</h3>
          <p className="text-center text-gray-600 mb-6">
            Your heart rate is currently {heartRate} BPM, which is above your normal resting range. Consider taking a moment to rest.
          </p>
          
          <DialogFooter className="flex space-x-3 mt-4">
            <button 
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg"
              onClick={handleDismiss}
            >
              Dismiss
            </button>
            <button 
              className="flex-1 py-3 bg-blue-900 text-white font-medium rounded-lg"
              onClick={onMonitor}
            >
              Monitor
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HeartRateAlertDialog;
