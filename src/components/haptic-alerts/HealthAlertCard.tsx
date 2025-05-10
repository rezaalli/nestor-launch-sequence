
import React from 'react';
import { Heart, Droplet, Thermometer } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

interface HealthAlertCardProps {
  highHeartRateAlert: boolean;
  setHighHeartRateAlert: (checked: boolean) => void;
  highHeartRateThreshold: number;
  setHighHeartRateThreshold: (value: number) => void;
  lowSpO2Alert: boolean;
  setLowSpO2Alert: (checked: boolean) => void;
  lowSpO2Threshold: number;
  setLowSpO2Threshold: (value: number) => void;
  temperatureAlert: boolean;
  setTemperatureAlert: (checked: boolean) => void;
}

const HealthAlertCard = ({
  highHeartRateAlert,
  setHighHeartRateAlert,
  highHeartRateThreshold,
  setHighHeartRateThreshold,
  lowSpO2Alert,
  setLowSpO2Alert,
  lowSpO2Threshold,
  setLowSpO2Threshold,
  temperatureAlert,
  setTemperatureAlert
}: HealthAlertCardProps) => {
  return (
    <Accordion type="single" collapsible className="w-full border rounded-lg shadow-sm bg-white mb-4">
      <AccordionItem value="health-alerts" className="border-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="h-4 w-4 text-red-600" />
            </div>
            <span className="text-base font-medium">Health Alerts</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-5">
            {/* Heart Rate Alert */}
            <div className="space-y-4 border-t pt-4 first:border-t-0 first:pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Heart className="h-5 w-5 text-red-500 mr-2" />
                  <div>
                    <p className="font-medium text-gray-800">High Heart Rate</p>
                    <p className="text-xs text-gray-500">Alert when heart rate exceeds threshold</p>
                  </div>
                </div>
                <Switch 
                  checked={highHeartRateAlert} 
                  onCheckedChange={setHighHeartRateAlert}
                />
              </div>
              
              {highHeartRateAlert && (
                <div className="ml-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Alert threshold (bpm)</Label>
                    <span className="font-medium text-sm">{highHeartRateThreshold}</span>
                  </div>
                  <Slider
                    value={[highHeartRateThreshold]}
                    onValueChange={(values) => setHighHeartRateThreshold(values[0])}
                    min={80}
                    max={200}
                    step={5}
                    className="py-2"
                  />
                </div>
              )}
            </div>
            
            {/* SpO2 Alert */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Droplet className="h-5 w-5 text-blue-500 mr-2" />
                  <div>
                    <p className="font-medium text-gray-800">Low Blood Oxygen</p>
                    <p className="text-xs text-gray-500">Alert when SpO2 falls below threshold</p>
                  </div>
                </div>
                <Switch 
                  checked={lowSpO2Alert} 
                  onCheckedChange={setLowSpO2Alert}
                />
              </div>
              
              {lowSpO2Alert && (
                <div className="ml-7 space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Alert threshold (%)</Label>
                    <span className="font-medium text-sm">{lowSpO2Threshold}%</span>
                  </div>
                  <Slider
                    value={[lowSpO2Threshold]}
                    onValueChange={(values) => setLowSpO2Threshold(values[0])}
                    min={85}
                    max={95}
                    step={1}
                    className="py-2"
                  />
                </div>
              )}
            </div>
            
            {/* Temperature Alert */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Thermometer className="h-5 w-5 text-orange-500 mr-2" />
                  <div>
                    <p className="font-medium text-gray-800">Temperature Alerts</p>
                    <p className="text-xs text-gray-500">Alert for abnormal body temperature</p>
                  </div>
                </div>
                <Switch 
                  checked={temperatureAlert} 
                  onCheckedChange={setTemperatureAlert}
                />
              </div>
            </div>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default HealthAlertCard;
