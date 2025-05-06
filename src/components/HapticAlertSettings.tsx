
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Heart, Thermometer, Droplet } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface HapticAlertSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const HapticAlertSettings = ({ open, onOpenChange }: HapticAlertSettingsProps) => {
  const { toast } = useToast();
  
  // Alert settings
  const [enableHaptic, setEnableHaptic] = useState(true);
  const [highHeartRateAlert, setHighHeartRateAlert] = useState(true);
  const [highHeartRateThreshold, setHighHeartRateThreshold] = useState(100);
  const [lowSpO2Alert, setLowSpO2Alert] = useState(true);
  const [lowSpO2Threshold, setLowSpO2Threshold] = useState(95);
  const [temperatureAlert, setTemperatureAlert] = useState(true);
  
  const handleSave = () => {
    // In a real implementation, this would save to user preferences
    
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
          <DialogTitle>Haptic Alert Settings</DialogTitle>
          <DialogDescription>
            Configure when your Nestor device will vibrate to alert you.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-4">
          {/* Master Switch */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Enable Haptic Alerts</p>
              <p className="text-sm text-gray-500">Device will vibrate for important health alerts</p>
            </div>
            <Switch 
              checked={enableHaptic} 
              onCheckedChange={setEnableHaptic} 
              aria-label="Enable haptic alerts"
            />
          </div>
          
          {enableHaptic && (
            <>
              {/* Heart Rate Alert */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="h-5 w-5 text-red-500 mr-2" />
                    <p className="font-medium">High Heart Rate</p>
                  </div>
                  <Switch 
                    checked={highHeartRateAlert} 
                    onCheckedChange={setHighHeartRateAlert} 
                    aria-label="Enable heart rate alerts"
                  />
                </div>
                
                {highHeartRateAlert && (
                  <div className="ml-7 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Alert threshold (bpm)</Label>
                      <span className="font-medium">{highHeartRateThreshold}</span>
                    </div>
                    <Slider
                      value={[highHeartRateThreshold]}
                      onValueChange={(values) => setHighHeartRateThreshold(values[0])}
                      min={80}
                      max={200}
                      step={5}
                    />
                    <p className="text-xs text-gray-500">
                      Alert when heart rate exceeds this threshold for over 10 minutes at rest
                    </p>
                  </div>
                )}
              </div>
              
              {/* SpO2 Alert */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Droplet className="h-5 w-5 text-blue-500 mr-2" />
                    <p className="font-medium">Low Blood Oxygen</p>
                  </div>
                  <Switch 
                    checked={lowSpO2Alert} 
                    onCheckedChange={setLowSpO2Alert} 
                    aria-label="Enable SpO2 alerts"
                  />
                </div>
                
                {lowSpO2Alert && (
                  <div className="ml-7 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Alert threshold (%)</Label>
                      <span className="font-medium">{lowSpO2Threshold}%</span>
                    </div>
                    <Slider
                      value={[lowSpO2Threshold]}
                      onValueChange={(values) => setLowSpO2Threshold(values[0])}
                      min={85}
                      max={95}
                      step={1}
                    />
                    <p className="text-xs text-gray-500">
                      Alert when blood oxygen level falls below this percentage
                    </p>
                  </div>
                )}
              </div>
              
              {/* Temperature Alert */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Thermometer className="h-5 w-5 text-orange-500 mr-2" />
                    <p className="font-medium">Temperature Alerts</p>
                  </div>
                  <Switch 
                    checked={temperatureAlert} 
                    onCheckedChange={setTemperatureAlert} 
                    aria-label="Enable temperature alerts"
                  />
                </div>
                
                {temperatureAlert && (
                  <div className="ml-7">
                    <p className="text-xs text-gray-500">
                      Alert when temperature indicates possible fever (&gt;37.8°C) or significant temperature drop
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HapticAlertSettings;
