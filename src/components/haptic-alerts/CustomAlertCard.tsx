
import React from 'react';
import { Plus, Trash2, SlidersHorizontal, Heart, Droplet, Thermometer, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { 
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';

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

interface CustomAlertCardProps {
  customAlerts: CustomAlert[];
  setCustomAlerts: React.Dispatch<React.SetStateAction<CustomAlert[]>>;
}

const CustomAlertCard = ({ customAlerts, setCustomAlerts }: CustomAlertCardProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const [newAlertName, setNewAlertName] = React.useState('');
  const [newAlertCondition, setNewAlertCondition] = React.useState('heart-rate-high');
  const [newAlertThreshold, setNewAlertThreshold] = React.useState(120);
  const [newHapticStrength, setNewHapticStrength] = React.useState<HapticStrength>('medium');
  const [newHapticPattern, setNewHapticPattern] = React.useState<HapticPattern>('single');
  const [newCustomStrength, setNewCustomStrength] = React.useState(50);

  const handleAddCustomAlert = () => {
    if (!newAlertName.trim()) {
      toast({
        title: "Alert name required",
        description: "Please provide a name for your custom alert.",
        variant: "destructive",
      });
      return;
    }
    
    const newAlert: CustomAlert = {
      id: Date.now().toString(),
      name: newAlertName.trim(),
      condition: newAlertCondition,
      threshold: newAlertThreshold,
      hapticStrength: newHapticStrength,
      hapticPattern: newHapticPattern,
      customStrength: newHapticStrength === 'custom' ? newCustomStrength : undefined,
      enabled: true
    };
    
    setCustomAlerts([...customAlerts, newAlert]);
    setIsOpen(false);
    setNewAlertName('');
    setNewAlertCondition('heart-rate-high');
    setNewAlertThreshold(120);
    setNewHapticStrength('medium');
    setNewHapticPattern('single');
    setNewCustomStrength(50);
    
    toast({
      title: "Custom Alert Created",
      description: `"${newAlertName.trim()}" alert has been created successfully.`,
    });
  };

  const handleDeleteCustomAlert = (id: string) => {
    setCustomAlerts(customAlerts.filter(alert => alert.id !== id));
    
    toast({
      title: "Alert Removed",
      description: "The custom alert has been deleted.",
    });
  };
  
  const toggleCustomAlert = (id: string) => {
    setCustomAlerts(customAlerts.map(alert => 
      alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
    ));
    
    const alert = customAlerts.find(a => a.id === id);
    if (alert) {
      toast({
        title: alert.enabled ? "Alert Disabled" : "Alert Enabled",
        description: `${alert.name} has been ${alert.enabled ? "disabled" : "enabled"}.`,
      });
    }
  };
  
  const renderConditionIcon = (condition: string) => {
    switch (condition) {
      case 'heart-rate-high':
      case 'heart-rate-low':
        return <Heart className="h-4 w-4 text-red-500" />;
      case 'spo2-low':
        return <Droplet className="h-4 w-4 text-blue-500" />;
      case 'temp-high':
      case 'temp-low':
        return <Thermometer className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };
  
  const renderConditionLabel = (condition: string) => {
    switch (condition) {
      case 'heart-rate-high': return 'High Heart Rate';
      case 'heart-rate-low': return 'Low Heart Rate';
      case 'spo2-low': return 'Low Blood Oxygen';
      case 'temp-high': return 'High Temperature';
      case 'temp-low': return 'Low Temperature';
      default: return 'Unknown Condition';
    }
  };
  
  const getThresholdLabel = (condition: string, value: number) => {
    switch (condition) {
      case 'heart-rate-high': return `Above ${value} bpm`;
      case 'heart-rate-low': return `Below ${value} bpm`;
      case 'spo2-low': return `Below ${value}%`;
      case 'temp-high': return `Above ${value}°C`;
      case 'temp-low': return `Below ${value}°C`;
      default: return `${value}`;
    }
  };
  
  const getMinThreshold = (condition: string) => {
    switch (condition) {
      case 'heart-rate-high': return 80;
      case 'heart-rate-low': return 40;
      case 'spo2-low': return 85;
      case 'temp-high': return 36.5;
      case 'temp-low': return 34;
      default: return 0;
    }
  };
  
  const getMaxThreshold = (condition: string) => {
    switch (condition) {
      case 'heart-rate-high': return 200;
      case 'heart-rate-low': return 60;
      case 'spo2-low': return 95;
      case 'temp-high': return 40;
      case 'temp-low': return 36;
      default: return 100;
    }
  };
  
  const getStepValue = (condition: string) => {
    switch (condition) {
      case 'temp-high':
      case 'temp-low':
        return 0.1;
      default:
        return 1;
    }
  };
  
  return (
    <Accordion type="single" collapsible className="w-full border rounded-lg shadow-sm bg-white mb-4">
      <AccordionItem value="custom-alerts" className="border-none">
        <AccordionTrigger className="px-4 py-3 hover:no-underline">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-base font-medium">Custom Alerts</span>
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <div className="space-y-4">
            <Button 
              variant={isOpen ? "secondary" : "outline"} 
              size="sm"
              className="w-full flex items-center justify-center"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Plus className="h-4 w-4 mr-1" />
              {isOpen ? "Cancel" : "Add New Alert"}
            </Button>
            
            <Collapsible
              open={isOpen}
              onOpenChange={setIsOpen}
              className="space-y-4"
            >
              <CollapsibleContent className="border p-4 rounded-md bg-gray-50">
                <h4 className="font-medium text-sm mb-4">New Custom Alert</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="alert-name">Alert Name</Label>
                    <Input 
                      id="alert-name" 
                      placeholder="Enter alert name"
                      value={newAlertName}
                      onChange={(e) => setNewAlertName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="alert-condition">Condition</Label>
                    <select 
                      id="alert-condition"
                      className="w-full p-2 border rounded-md"
                      value={newAlertCondition}
                      onChange={(e) => {
                        setNewAlertCondition(e.target.value);
                        // Set default threshold based on condition
                        switch(e.target.value) {
                          case 'heart-rate-high': setNewAlertThreshold(120); break;
                          case 'heart-rate-low': setNewAlertThreshold(50); break;
                          case 'spo2-low': setNewAlertThreshold(92); break;
                          case 'temp-high': setNewAlertThreshold(37.8); break;
                          case 'temp-low': setNewAlertThreshold(35.5); break;
                        }
                      }}
                    >
                      <option value="heart-rate-high">Heart Rate - Above Threshold</option>
                      <option value="heart-rate-low">Heart Rate - Below Threshold</option>
                      <option value="spo2-low">SpO2 - Below Threshold</option>
                      <option value="temp-high">Temperature - Above Threshold</option>
                      <option value="temp-low">Temperature - Below Threshold</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Threshold Value</Label>
                      <span className="font-medium">
                        {newAlertCondition.includes('temp') ? newAlertThreshold.toFixed(1) : newAlertThreshold}
                        {newAlertCondition.includes('spo2') ? '%' : newAlertCondition.includes('heart') ? ' bpm' : '°C'}
                      </span>
                    </div>
                    <Slider
                      value={[newAlertThreshold]}
                      onValueChange={(values) => setNewAlertThreshold(values[0])}
                      min={getMinThreshold(newAlertCondition)}
                      max={getMaxThreshold(newAlertCondition)}
                      step={getStepValue(newAlertCondition)}
                      className="py-2"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Haptic Pattern</Label>
                    <RadioGroup 
                      value={newHapticPattern} 
                      onValueChange={(value: HapticPattern) => setNewHapticPattern(value)}
                      className="grid grid-cols-3 gap-2"
                    >
                      <div className="flex items-center justify-center space-x-2 bg-white p-2 rounded-md border">
                        <RadioGroupItem value="single" id="pattern-single" />
                        <Label htmlFor="pattern-single" className="text-xs">Single</Label>
                      </div>
                      <div className="flex items-center justify-center space-x-2 bg-white p-2 rounded-md border">
                        <RadioGroupItem value="double" id="pattern-double" />
                        <Label htmlFor="pattern-double" className="text-xs">Double</Label>
                      </div>
                      <div className="flex items-center justify-center space-x-2 bg-white p-2 rounded-md border">
                        <RadioGroupItem value="continuous" id="pattern-continuous" />
                        <Label htmlFor="pattern-continuous" className="text-xs">Continuous</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Haptic Strength</Label>
                    <RadioGroup 
                      value={newHapticStrength} 
                      onValueChange={(value: HapticStrength) => setNewHapticStrength(value)}
                      className="grid grid-cols-2 gap-2"
                    >
                      <div className="flex items-center space-x-2 bg-white p-2 rounded-md border">
                        <RadioGroupItem value="low" id="haptic-low" />
                        <Label htmlFor="haptic-low">Low</Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-white p-2 rounded-md border">
                        <RadioGroupItem value="medium" id="haptic-medium" />
                        <Label htmlFor="haptic-medium">Medium</Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-white p-2 rounded-md border">
                        <RadioGroupItem value="high" id="haptic-high" />
                        <Label htmlFor="haptic-high">High</Label>
                      </div>
                      <div className="flex items-center space-x-2 bg-white p-2 rounded-md border">
                        <RadioGroupItem value="custom" id="haptic-custom" />
                        <Label htmlFor="haptic-custom">Custom</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  {newHapticStrength === 'custom' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Custom Strength</Label>
                        <span className="font-medium">{newCustomStrength}%</span>
                      </div>
                      <Slider
                        value={[newCustomStrength]}
                        onValueChange={(values) => setNewCustomStrength(values[0])}
                        min={1}
                        max={100}
                        step={1}
                        className="py-2"
                      />
                    </div>
                  )}
                  
                  <div className="pt-2">
                    <Button 
                      className="w-full"
                      onClick={handleAddCustomAlert}
                    >
                      Add Alert
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
            
            {/* List of Custom Alerts */}
            {customAlerts.length > 0 ? (
              <div className="space-y-3 mt-2">
                {customAlerts.map(alert => (
                  <Card key={alert.id} className="p-3 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-2">
                          {renderConditionIcon(alert.condition)}
                        </div>
                        <span className="font-medium">{alert.name}</span>
                      </div>
                      <Switch 
                        checked={alert.enabled} 
                        onCheckedChange={() => toggleCustomAlert(alert.id)}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-3 flex justify-between items-center">
                      <div>
                        <span>{renderConditionLabel(alert.condition)} {getThresholdLabel(alert.condition, alert.threshold)}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="ml-2">
                          <SlidersHorizontal className="inline h-3 w-3 mr-1" /> 
                          {alert.hapticStrength === 'custom' ? `${alert.customStrength}%` : alert.hapticStrength}
                        </span>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-500 p-1 h-auto ml-2" 
                          onClick={() => handleDeleteCustomAlert(alert.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center bg-gray-50 rounded-md">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <AlertCircle className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-gray-500 mb-2">No custom alerts configured</p>
                <p className="text-sm text-gray-400">Add your first custom alert to get started</p>
              </div>
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

export default CustomAlertCard;
