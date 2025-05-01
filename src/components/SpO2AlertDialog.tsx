
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { Wind } from "lucide-react";
import { useNotifications } from '@/contexts/NotificationsContext';

interface SpO2AlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spO2Level: number;
  onDismiss: () => void;
  onTakeReading: () => void;
}

const SpO2AlertDialog = ({
  open,
  onOpenChange,
  spO2Level = 92,
  onDismiss,
  onTakeReading,
}: SpO2AlertDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-xl w-[90%] max-w-sm overflow-hidden shadow-xl p-0">
        <div className="p-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <Wind className="text-red-600 h-8 w-8" />
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <span className="text-4xl font-bold text-red-600">{spO2Level}%</span>
            <span className="text-sm text-gray-500 ml-2">SpO2</span>
          </div>
          
          <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">
            {spO2Level < 90 ? 'Critical Oxygen Level' : 'Low Oxygen Level'}
          </h3>
          <p className="text-center text-gray-600 mb-6">
            {spO2Level < 90 
              ? 'Your blood oxygen level is dangerously low. Please seek immediate medical attention if this persists.' 
              : 'Your blood oxygen level is below the normal range. Consider resting and monitoring your breathing.'}
          </p>
          
          <DialogFooter className="flex flex-col space-y-3 mt-4">
            <button 
              className="w-full py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              onClick={onTakeReading}
            >
              Take New Reading
            </button>
            <button 
              className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              onClick={onDismiss}
            >
              Dismiss
            </button>
          </DialogFooter>
          
          <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
            <span>Normal range: 95-100%</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SpO2AlertDialog;
