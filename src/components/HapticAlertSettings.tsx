
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast';

// Import our new modular components
import MasterToggleCard from './haptic-alerts/MasterToggleCard';
import DefaultSettingsCard from './haptic-alerts/DefaultSettingsCard';
import HealthAlertCard from './haptic-alerts/HealthAlertCard';
import CustomAlertCard from './haptic-alerts/CustomAlertCard';

interface HapticAlertSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type HapticStrength = 'low' | 'medium' | 'high' | 'custom';
type HapticPattern = 'single' | 'double' | 'continuous';

interface CustomAlert {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  hapticStrength: HapticStrength;
  hapticPattern: HapticPattern;
  customStrength?: number;
  enabled: boolean;
}

const HapticAlertSettings = ({ open, onOpenChange }: HapticAlertSettingsProps) => {
  const { toast } = useToast();
  
  // Master toggle
  const [enableHaptic, setEnableHaptic] = useState(true);
  
  // Health alert settings
  const [highHeartRateAlert, setHighHeartRateAlert] = useState(true);
  const [highHeartRateThreshold, setHighHeartRateThreshold] = useState(100);
  const [lowSpO2Alert, setLowSpO2Alert] = useState(true);
  const [lowSpO2Threshold, setLowSpO2Threshold] = useState(95);
  const [temperatureAlert, setTemperatureAlert] = useState(true);
  
  // Default haptic settings
  const [defaultHapticStrength, setDefaultHapticStrength] = useState<HapticStrength>('medium');
  const [defaultCustomStrength, setDefaultCustomStrength] = useState(50);
  
  // Custom alerts
  const [customAlerts, setCustomAlerts] = useState<CustomAlert[]>([]);
  
  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your haptic alert settings have been updated.",
    });
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-lg">Haptic Alert Settings</DialogTitle>
          <DialogDescription className="text-center">
            Configure when your Nestor device will vibrate to alert you.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh] pr-3 -mr-3">
          <div className="space-y-2 py-2">
            <MasterToggleCard 
              enableHaptic={enableHaptic}
              setEnableHaptic={setEnableHaptic}
            />
            
            {enableHaptic && (
              <>
                <DefaultSettingsCard
                  defaultHapticStrength={defaultHapticStrength}
                  setDefaultHapticStrength={setDefaultHapticStrength}
                  defaultCustomStrength={defaultCustomStrength}
                  setDefaultCustomStrength={setDefaultCustomStrength}
                />
                
                <HealthAlertCard
                  highHeartRateAlert={highHeartRateAlert}
                  setHighHeartRateAlert={setHighHeartRateAlert}
                  highHeartRateThreshold={highHeartRateThreshold}
                  setHighHeartRateThreshold={setHighHeartRateThreshold}
                  lowSpO2Alert={lowSpO2Alert}
                  setLowSpO2Alert={setLowSpO2Alert}
                  lowSpO2Threshold={lowSpO2Threshold}
                  setLowSpO2Threshold={setLowSpO2Threshold}
                  temperatureAlert={temperatureAlert}
                  setTemperatureAlert={setTemperatureAlert}
                />
                
                <CustomAlertCard
                  customAlerts={customAlerts}
                  setCustomAlerts={setCustomAlerts}
                />
              </>
            )}
          </div>
        </ScrollArea>
        
        <div className="sticky bottom-0 pt-2 bg-white">
          <Button 
            onClick={handleSave}
            className="w-full bg-nestor-blue hover:bg-blue-700"
          >
            Save Settings
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HapticAlertSettings;
