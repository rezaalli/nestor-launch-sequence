
import React from 'react';
import { Vibrate } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

type HapticStrength = 'low' | 'medium' | 'high' | 'custom';

interface DefaultSettingsCardProps {
  defaultHapticStrength: HapticStrength;
  setDefaultHapticStrength: (value: HapticStrength) => void;
  defaultCustomStrength: number;
  setDefaultCustomStrength: (value: number) => void;
}

const DefaultSettingsCard = ({
  defaultHapticStrength,
  setDefaultHapticStrength,
  defaultCustomStrength,
  setDefaultCustomStrength
}: DefaultSettingsCardProps) => {
  return (
    <Accordion type="single" collapsible defaultValue="default-settings" className="w-full border rounded-lg shadow-sm bg-white mb-4">
      <AccordionItem value="default-settings" className="border-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <Vibrate className="h-4 w-4 text-purple-600" />
            </div>
            <span className="text-base font-medium">Default Settings</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4">
            <div className="flex items-center">
              <Vibrate className="h-5 w-5 text-purple-500 mr-2" />
              <p className="font-medium text-gray-800">Default Haptic Strength</p>
            </div>
            
            <RadioGroup 
              value={defaultHapticStrength} 
              onValueChange={(value: HapticStrength) => setDefaultHapticStrength(value)}
              className="grid grid-cols-2 gap-2"
            >
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                <RadioGroupItem value="low" id="default-haptic-low" />
                <Label htmlFor="default-haptic-low">Low</Label>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                <RadioGroupItem value="medium" id="default-haptic-medium" />
                <Label htmlFor="default-haptic-medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                <RadioGroupItem value="high" id="default-haptic-high" />
                <Label htmlFor="default-haptic-high">High</Label>
              </div>
              <div className="flex items-center space-x-2 bg-gray-50 p-2 rounded-md">
                <RadioGroupItem value="custom" id="default-haptic-custom" />
                <Label htmlFor="default-haptic-custom">Custom</Label>
              </div>
            </RadioGroup>
            
            {defaultHapticStrength === 'custom' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Vibration strength</Label>
                  <span className="font-medium text-sm">{defaultCustomStrength}%</span>
                </div>
                <Slider
                  value={[defaultCustomStrength]}
                  onValueChange={(values) => setDefaultCustomStrength(values[0])}
                  min={1}
                  max={100}
                  step={1}
                  className="py-2"
                />
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default DefaultSettingsCard;
