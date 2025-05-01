
import React from 'react';
import { AlertCircle, Heart } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface EcgAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTakeEcg: () => void;
  onDismiss: () => void;
}

const EcgAlertDialog = ({ open, onOpenChange, onTakeEcg, onDismiss }: EcgAlertDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
            <Heart className="text-red-600" size={28} />
          </div>
        </div>
        
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">ECG Anomaly Detected</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            Your latest ECG shows an irregular pattern that may require attention. Would you like to take another reading?
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex space-x-3">
          <AlertDialogCancel 
            className="flex-1 mt-0"
            onClick={onDismiss}
          >
            Dismiss
          </AlertDialogCancel>
          <AlertDialogAction 
            className="flex-1 bg-nestor-blue"
            onClick={onTakeEcg}
          >
            Take ECG
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default EcgAlertDialog;
