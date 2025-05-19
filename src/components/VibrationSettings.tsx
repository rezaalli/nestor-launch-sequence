import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

export interface VibrationSettingsValues {
  enabled: boolean;
  intensity: number;
  alerts: boolean;
  hapticFeedback: boolean;
}

interface VibrationSettingsProps {
  onClose: () => void;
  onSave: (settings: VibrationSettingsValues) => void;
  initialSettings?: Partial<VibrationSettingsValues>;
}

const VibrationSettings: React.FC<VibrationSettingsProps> = ({
  onClose,
  onSave,
  initialSettings,
}) => {
  const [settings, setSettings] = useState<VibrationSettingsValues>({
    enabled: initialSettings?.enabled ?? true,
    intensity: initialSettings?.intensity ?? 50,
    alerts: initialSettings?.alerts ?? true,
    hapticFeedback: initialSettings?.hapticFeedback ?? true,
  });

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <Card className="w-full max-w-md mx-auto border rounded-lg overflow-hidden">
      <div className="p-4">
        <h2 className="text-lg font-medium mb-4 text-center">Vibration Settings</h2>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Label htmlFor="vibration-enabled" className="flex-1">Enable Vibration</Label>
            <Switch
              id="vibration-enabled"
              checked={settings.enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, enabled: checked })}
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Intensity: {settings.intensity}%</Label>
            </div>
            <Slider
              value={[settings.intensity]}
              min={0}
              max={100}
              step={10}
              disabled={!settings.enabled}
              onValueChange={(value) => setSettings({ ...settings, intensity: value[0] })}
              className="py-4"
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <Label htmlFor="alerts" className="flex-1">Vibrate for Alerts</Label>
            <Switch
              id="alerts"
              checked={settings.alerts}
              disabled={!settings.enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, alerts: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="haptic-feedback" className="flex-1">Haptic Feedback</Label>
            <Switch
              id="haptic-feedback"
              checked={settings.hapticFeedback}
              disabled={!settings.enabled}
              onCheckedChange={(checked) => setSettings({ ...settings, hapticFeedback: checked })}
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end border-t p-4">
        <Button 
          variant="outline" 
          className="mr-2"
          onClick={onClose}
        >
          Close
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </Card>
  );
};

export default VibrationSettings; 