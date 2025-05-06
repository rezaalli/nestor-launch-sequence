
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Heart, Thermometer, Droplet, Plus, Trash2, Settings, SliderHorizontal, AlertCircle, Vibrate } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";

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
  customStrength?: number; // 1-100 for custom strength
  enabled: boolean;
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
  
  // Custom alerts
  const [customAlerts, setCustomAlerts] = useState<CustomAlert[]>([]);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlertName, setNewAlertName] = useState('');
  const [newAlertCondition, setNewAlertCondition] = useState('heart-rate-high');
  const [newAlertThreshold, setNewAlertThreshold] = useState(120);
  const [newHapticStrength, setNewHapticStrength] = useState<HapticStrength>('medium');
  const [newHapticPattern, setNewHapticPattern] = useState<HapticPattern>('single');
  const [newCustomStrength, setNewCustomStrength] = useState(50);
  
  // Default haptic settings
  const [defaultHapticStrength, setDefaultHapticStrength] = useState<HapticStrength>('medium');
  const [defaultCustomStrength, setDefaultCustomStrength] = useState(50);
  
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
    setShowAddAlert(false);
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
  };
  
  const handleSave = () => {
    // In a real implementation, this would save to user preferences
    
    toast({
      title: "Settings Saved",
      description: "Your haptic alert settings have been updated.",
    });
    
    onOpenChange(false);
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
              {/* Default Haptic Strength */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center">
                  <Vibrate className="h-5 w-5 text-purple-500 mr-2" />
                  <p className="font-medium">Default Haptic Strength</p>
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
                      <span className="font-medium">{defaultCustomStrength}%</span>
                    </div>
                    <Slider
                      value={[defaultCustomStrength]}
                      onValueChange={(values) => setDefaultCustomStrength(values[0])}
                      min={1}
                      max={100}
                      step={1}
                    />
                  </div>
                )}
              </div>
              
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
              
              {/* Custom Alerts */}
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="font-medium">Custom Alerts</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setShowAddAlert(!showAddAlert)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add New
                  </Button>
                </div>
                
                {/* Add Custom Alert Form */}
                {showAddAlert && (
                  <div className="space-y-4 border p-3 rounded-md bg-gray-50">
                    <h4 className="font-medium text-sm">New Custom Alert</h4>
                    
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
                        />
                      </div>
                    )}
                    
                    <div className="flex space-x-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-1/2"
                        onClick={() => setShowAddAlert(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        size="sm" 
                        className="w-1/2"
                        onClick={handleAddCustomAlert}
                      >
                        Add Alert
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* List of Custom Alerts */}
                {customAlerts.length > 0 && (
                  <div className="space-y-3 mt-2">
                    {customAlerts.map(alert => (
                      <div key={alert.id} className="border rounded-md p-3 bg-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {renderConditionIcon(alert.condition)}
                            <span className="font-medium ml-2">{alert.name}</span>
                          </div>
                          <Switch 
                            checked={alert.enabled} 
                            onCheckedChange={() => toggleCustomAlert(alert.id)}
                            size="sm"
                          />
                        </div>
                        <div className="text-xs text-gray-500 mt-1 flex justify-between">
                          <div>
                            <span>{renderConditionLabel(alert.condition)} {getThresholdLabel(alert.condition, alert.threshold)}</span>
                          </div>
                          <div>
                            <span className="ml-2">
                              <SliderHorizontal className="inline h-3 w-3 mr-1" /> 
                              {alert.hapticStrength === 'custom' ? `${alert.customStrength}%` : alert.hapticStrength}
                            </span>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-red-500 p-0 h-auto ml-2" 
                              onClick={() => handleDeleteCustomAlert(alert.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {customAlerts.length === 0 && !showAddAlert && (
                  <p className="text-sm text-gray-500 italic">No custom alerts configured. Add one to get started.</p>
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
