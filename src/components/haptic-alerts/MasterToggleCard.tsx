
import React from 'react';
import { Bell } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface MasterToggleCardProps {
  enableHaptic: boolean;
  setEnableHaptic: (checked: boolean) => void;
}

const MasterToggleCard = ({ enableHaptic, setEnableHaptic }: MasterToggleCardProps) => {
  const { toast } = useToast();
  
  const handleToggle = (checked: boolean) => {
    setEnableHaptic(checked);
    
    toast({
      title: checked ? "Haptic Alerts Enabled" : "Haptic Alerts Disabled",
      description: checked 
        ? "Your device will vibrate for important health alerts." 
        : "All haptic alerts have been turned off.",
    });
  };
  
  return (
    <Card className="bg-white shadow-sm mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                <Bell className="h-4 w-4 text-nestor-blue" />
              </div>
              <h3 className="font-medium text-gray-900">Enable Haptic Alerts</h3>
            </div>
            <p className="text-sm text-gray-500 mt-1 ml-10">Device will vibrate for important health alerts</p>
          </div>
          <Switch 
            checked={enableHaptic} 
            onCheckedChange={handleToggle}
            aria-label="Enable haptic alerts"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MasterToggleCard;
