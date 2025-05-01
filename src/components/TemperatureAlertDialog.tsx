
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNotifications } from '@/contexts/NotificationsContext';
import { Thermometer } from "lucide-react";

interface TemperatureAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  temperature: number;
  temperatureType: 'high' | 'low';
  onDismiss: () => void;
  onMonitor: () => void;
  unitPreference?: 'metric' | 'imperial';
}

const TemperatureAlertDialog = ({
  open,
  onOpenChange,
  temperature = 38.5,
  temperatureType = 'high',
  onDismiss,
  onMonitor,
  unitPreference = 'metric',
}: TemperatureAlertDialogProps) => {
  const { addNotification, deleteNotification } = useNotifications();
  
  const handleDismiss = () => {
    onDismiss();
    // No notification is added when dismissed, following the same pattern as HeartRateAlertDialog
  };

  // Convert Celsius to Fahrenheit
  const temperatureF = (temperature * 9/5) + 32;
  
  // Display temperature based on unit preference
  const displayTemp = unitPreference === 'metric' 
    ? `${temperature}°C` 
    : `${temperatureF.toFixed(1)}°F`;
  
  const secondaryTemp = unitPreference === 'metric'
    ? `(${temperatureF.toFixed(1)}°F)`
    : `(${temperature}°C)`;
  
  // Set up variables based on temperature type
  const iconBgColor = temperatureType === 'high' ? 'bg-red-100' : 'bg-blue-100';
  const iconColor = temperatureType === 'high' ? 'text-red-600' : 'text-blue-600';
  const title = temperatureType === 'high' ? 'High Temperature Alert' : 'Low Temperature Alert';
  const description = temperatureType === 'high' 
    ? `Your body temperature is ${displayTemp}, which is above normal range. This could indicate a fever.`
    : `Your body temperature is ${displayTemp}, which is below normal range. This could indicate hypothermia.`;
  
  const lucideIcon = temperatureType === 'high' ? "thermometer-sun" : "thermometer-snowflake";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white rounded-xl w-[90%] max-w-sm overflow-hidden shadow-xl p-0">
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
          
          <p className="text-center text-gray-600 mb-6">
            {description} Please monitor your condition and consider seeking medical advice if symptoms persist.
          </p>
          
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
