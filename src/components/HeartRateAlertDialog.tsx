
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
  const { addNotification } = useNotifications();
  
  const handleDismiss = () => {
    onDismiss();
    
    // Add to notifications even if dismissed from dialog
    addNotification({
      title: "High Heart Rate Alert",
      description: `Your heart rate was ${heartRate} BPM, which is above your normal resting range.`,
      type: "health",
      icon: "heart-pulse",
      iconBgColor: "bg-red-100",
      iconColor: "text-red-600",
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      date: "Today",
      actions: {
        primary: {
          label: "Monitor",
          action: () => console.log("Monitor heart rate")
        },
        secondary: {
          label: "Dismiss",
          action: () => console.log("Dismiss heart rate notification")
        }
      }
    });
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
