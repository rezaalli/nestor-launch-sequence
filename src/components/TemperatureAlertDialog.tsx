
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotifications } from '@/contexts/NotificationsContext';
import { useUser } from '@/contexts/UserContext';
import { Thermometer } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface TemperatureAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  temperature: number;
  temperatureType: 'high' | 'low';
  onDismiss: () => void;
  onMonitor: () => void;
}

const TemperatureAlertDialog = ({
  open,
  onOpenChange,
  temperature = 38.5,
  temperatureType = 'high',
  onDismiss,
  onMonitor,
}: TemperatureAlertDialogProps) => {
  const { addNotification, deleteNotification } = useNotifications();
  const { user } = useUser();
  
  const handleDismiss = () => {
    onDismiss();
    // No notification is added when dismissed, following the same pattern as HeartRateAlertDialog
  };

  // Convert Celsius to Fahrenheit
  const temperatureF = (temperature * 9/5) + 32;
  
  // Display temperature based on unit preference
  const displayTemp = user.unitPreference === 'metric' 
    ? `${temperature}°C` 
    : `${temperatureF.toFixed(1)}°F`;
  
  const secondaryTemp = user.unitPreference === 'metric'
    ? `(${temperatureF.toFixed(1)}°F)`
    : `(${temperature}°C)`;
  
  // Set up variables based on temperature type
  const iconBgColor = temperatureType === 'high' ? 'bg-red-100' : 'bg-blue-100';
  const iconColor = temperatureType === 'high' ? 'text-red-600' : 'text-blue-600';
  const title = temperatureType === 'high' ? 'High Temperature Alert' : 'Low Temperature Alert';
  
  // More detailed description based on temperature type
  const description = temperatureType === 'high' 
    ? `Your body temperature is ${displayTemp}, which is above normal range. This could indicate a fever.`
    : `Your body temperature is ${displayTemp}, which is below normal range. This could indicate hypothermia.`;
    
  // Additional guidance based on temperature severity
  let guidance = '';
  if (temperatureType === 'high') {
    if (temperature >= 39) {
      guidance = 'Seek medical attention if temperature persists above 39°C (102.2°F).';
    } else {
      guidance = 'Monitor your temperature and stay hydrated.';
    }
  } else {
    if (temperature <= 35) {
      guidance = 'Seek immediate medical attention if temperature remains below 35°C (95°F).';
    } else {
      guidance = 'Warm up gradually and monitor your temperature.';
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-xl w-[90%] max-w-sm overflow-hidden shadow-xl p-0">
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="p-6">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${iconBgColor} flex items-center justify-center`}>
            <Thermometer className={`${iconColor} text-2xl`} />
          </div>
          
          <h3 className="text-lg font-semibold text-center text-gray-900 mb-2">{title}</h3>
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className={`text-3xl font-bold ${temperatureType === 'high' ? 'text-red-600' : 'text-blue-600'}`}>
              {displayTemp}
            </span>
            <span className="text-lg text-gray-500">{secondaryTemp}</span>
          </div>
          
          <p className="text-center text-gray-600 mb-3">
            {description}
          </p>
          
          <Alert variant={temperatureType === 'high' ? 'destructive' : 'default'} className="mb-4">
            <AlertTitle>Health Guidance</AlertTitle>
            <AlertDescription>{guidance}</AlertDescription>
          </Alert>
          
          <DialogFooter className="flex flex-col space-y-3 mt-4">
            <button 
              className={`w-full py-3 ${temperatureType === 'high' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white font-medium rounded-lg transition-colors`}
              onClick={onMonitor}
            >
              Track Temperature
            </button>
            <button 
              className="w-full py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              onClick={handleDismiss}
            >
              Dismiss
            </button>
          </DialogFooter>
          
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
            <span>Last reading: Just now</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemperatureAlertDialog;
