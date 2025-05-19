import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, X, Edit, Trash2, Activity, Heart, Clock, Droplet, Thermometer, Zap, Flame, Moon, Minus, Target } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { GoalMetric } from './GoalVisualization';
import { Badge } from '@/components/ui/badge';
import { getLastReading } from '@/utils/bleUtils';

// Define TimeFrame type to ensure type safety
type TimeFrame = 'daily' | 'weekly' | 'monthly' | 'custom';

// Define health metric types
interface MetricDefinition {
  id: string;
  name: string;
  category: string;
  unit: string;
  icon: React.ReactNode;
  minValue: number;
  maxValue: number;
  defaultTarget: number;
  increasingIsBetter: boolean;
  description: string;
  timeframe: TimeFrame;
  currentValueFn?: () => number; // Function to get current value from app data
}

// Predefined health metrics with appropriate units and ranges
const healthMetrics: MetricDefinition[] = [
  {
    id: 'steps',
    name: 'Daily Steps',
    category: 'Activity',
    unit: 'steps',
    icon: <Activity className="h-4 w-4 text-blue-500" />,
    minValue: 3000,
    maxValue: 20000,
    defaultTarget: 10000,
    increasingIsBetter: true,
    description: 'Track your daily step count to maintain an active lifestyle',
    timeframe: 'daily',
    currentValueFn: () => {
      const lastReading = getLastReading();
      return lastReading?.steps || 5000;
    }
  },
  {
    id: 'resting_heart_rate',
    name: 'Resting Heart Rate',
    category: 'Heart Health',
    unit: 'bpm',
    icon: <Heart className="h-4 w-4 text-red-500" />,
    minValue: 40,
    maxValue: 100,
    defaultTarget: 60,
    increasingIsBetter: false,
    description: 'Lower resting heart rate is associated with better cardiovascular fitness',
    timeframe: 'weekly',
    currentValueFn: () => {
      const lastReading = getLastReading();
      return lastReading?.heartRate || 72;
    }
  },
  {
    id: 'spo2',
    name: 'Blood Oxygen',
    category: 'Respiratory Health',
    unit: '%',
    icon: <Droplet className="h-4 w-4 text-blue-500" />,
    minValue: 90,
    maxValue: 100,
    defaultTarget: 98,
    increasingIsBetter: true,
    description: 'Normal blood oxygen levels are typically between 95-100%',
    timeframe: 'daily',
    currentValueFn: () => {
      const lastReading = getLastReading();
      return lastReading?.spo2 || 97;
    }
  },
  {
    id: 'body_temperature',
    name: 'Body Temperature',
    category: 'Vital Signs',
    unit: '°F',
    icon: <Thermometer className="h-4 w-4 text-orange-500" />,
    minValue: 97,
    maxValue: 99,
    defaultTarget: 98.6,
    increasingIsBetter: false,
    description: 'Normal body temperature is around 98.6°F (37°C)',
    timeframe: 'daily',
    currentValueFn: () => {
      const lastReading = getLastReading();
      const tempC = lastReading?.temp ? lastReading.temp / 10 : 36.7;
      return (tempC * 9/5) + 32; // Convert to Fahrenheit
    }
  },
  {
    id: 'readiness_score',
    name: 'Readiness Score',
    category: 'Recovery',
    unit: 'score',
    icon: <Zap className="h-4 w-4 text-yellow-500" />,
    minValue: 50,
    maxValue: 100,
    defaultTarget: 85,
    increasingIsBetter: true,
    description: 'Your daily readiness score indicates how prepared your body is for activity',
    timeframe: 'daily',
    currentValueFn: () => {
      const lastReading = getLastReading();
      return lastReading?.readiness || 75;
    }
  },
  {
    id: 'calories',
    name: 'Calories Burned',
    category: 'Energy',
    unit: 'kcal',
    icon: <Flame className="h-4 w-4 text-red-500" />,
    minValue: 1500,
    maxValue: 4000,
    defaultTarget: 2500,
    increasingIsBetter: true,
    description: 'Total daily energy expenditure including exercise and baseline metabolism',
    timeframe: 'daily',
    currentValueFn: () => {
      const lastReading = getLastReading();
      return lastReading?.calories || 1800;
    }
  }
];

interface GoalCustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goals: GoalMetric[];
  onSaveGoals: (goals: GoalMetric[]) => void;
}

interface GoalTemplate {
  name: string;
  category: string;
  unit: string;
  startValue: number;
  targetValue: number;
  timeframe: TimeFrame;
}

// Define interface for the state of an editing goal
interface EditingGoal {
  metricId?: string;
  name?: string;
  category?: string;
  unit?: string;
  currentValue?: number;
  startValue?: number;
  targetValue?: number;
  timeframe?: TimeFrame;
}

// Update the NumberScroller component for better styling
const NumberScroller = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
}) => {
  const handleIncrement = () => {
    if (value + step <= max) {
      onChange(parseFloat((value + step).toFixed(1)));
    }
  };

  const handleDecrement = () => {
    if (value - step >= min) {
      onChange(parseFloat((value - step).toFixed(1)));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  return (
    <div className="flex items-center w-full">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-l-md border-r-0 text-gray-600"
        onClick={handleDecrement}
        disabled={value <= min}
      >
        <span className="sr-only">Decrease</span>
        <Minus className="h-4 w-4" />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        className="h-9 rounded-none text-center border-x-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min={min}
        max={max}
        step={step}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 rounded-r-md border-l-0 text-gray-600"
        onClick={handleIncrement}
        disabled={value >= max}
      >
        <span className="sr-only">Increase</span>
        <Plus className="h-4 w-4" />
      </Button>
      {unit && (
        <div className="ml-2 text-sm text-gray-500 min-w-12">{unit}</div>
      )}
    </div>
  );
};

const GoalCustomizationModal: React.FC<GoalCustomizationModalProps> = ({
  open,
  onOpenChange,
  goals,
  onSaveGoals
}) => {
  const [workingGoals, setWorkingGoals] = useState<GoalMetric[]>(goals);
  const [activeTab, setActiveTab] = useState<string>('current');
  
  // Form state for new/edited goal
  const [editingGoal, setEditingGoal] = useState<EditingGoal>({
    metricId: '',
    name: '',
    category: 'Activity',
    unit: 'steps',
    currentValue: 0,
    startValue: 0,
    targetValue: 0,
    timeframe: 'daily'
  });
  
  const [editingGoalId, setEditingGoalId] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<MetricDefinition | null>(null);
  
  // Update form based on selected metric
  useEffect(() => {
    if (selectedMetric) {
      // Get current value from the metric's function if available
      const currentValue = selectedMetric.currentValueFn ? selectedMetric.currentValueFn() : selectedMetric.minValue;
      
      setEditingGoal({
        metricId: selectedMetric.id,
        name: selectedMetric.name,
        category: selectedMetric.category,
        unit: selectedMetric.unit,
        currentValue: currentValue,
        startValue: currentValue,
        targetValue: selectedMetric.increasingIsBetter ? 
          Math.min(currentValue * 1.2, selectedMetric.defaultTarget) : 
          Math.max(currentValue * 0.9, selectedMetric.defaultTarget),
        timeframe: selectedMetric.timeframe
      });
    }
  }, [selectedMetric]);
  
  // Handle metric selection
  const handleMetricSelect = (metricId: string) => {
    const metric = healthMetrics.find(m => m.id === metricId);
    if (metric) {
      setSelectedMetric(metric);
    }
  };
  
  // Create a new goal ID
  const generateGoalId = () => `goal-${Date.now()}`;
  
  // Update working goals
  const handleAddGoal = () => {
    if (!editingGoal.name || !editingGoal.category || !editingGoal.unit) {
      return; // Don't add incomplete goals
    }
    
    const newGoal: GoalMetric = {
      id: generateGoalId(),
      name: editingGoal.name || '',
      category: editingGoal.category || 'Activity',
      unit: editingGoal.unit || '',
      currentValue: editingGoal.currentValue || editingGoal.startValue || 0,
      startValue: editingGoal.startValue || 0,
      targetValue: editingGoal.targetValue || 0,
      timeframe: editingGoal.timeframe || 'daily',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in the future
      metricId: editingGoal.metricId,
    };
    
    setWorkingGoals([...workingGoals, newGoal]);
    
    // Reset the form
    setEditingGoal({
      metricId: '',
      name: '',
      category: 'Activity',
      unit: 'steps',
      currentValue: 0,
      startValue: 0,
      targetValue: 0,
      timeframe: 'daily'
    });
    setSelectedMetric(null);
    
    setActiveTab('current');
  };
  
  // Update existing goal
  const handleUpdateGoal = () => {
    if (!editingGoalId) return;
    
    setWorkingGoals(workingGoals.map(goal => {
      if (goal.id === editingGoalId) {
        return { 
          ...goal, 
          name: editingGoal.name || goal.name,
          category: editingGoal.category || goal.category,
          unit: editingGoal.unit || goal.unit,
          currentValue: editingGoal.currentValue !== undefined ? editingGoal.currentValue : goal.currentValue,
          startValue: editingGoal.startValue !== undefined ? editingGoal.startValue : goal.startValue,
          targetValue: editingGoal.targetValue !== undefined ? editingGoal.targetValue : goal.targetValue,
          timeframe: editingGoal.timeframe || goal.timeframe,
          metricId: editingGoal.metricId
        };
      }
      return goal;
    }));
    
    // Reset the form
    setEditingGoal({
      metricId: '',
      name: '',
      category: 'Activity',
      unit: 'steps',
      currentValue: 0,
      startValue: 0,
      targetValue: 0,
      timeframe: 'daily'
    });
    setEditingGoalId(null);
    setSelectedMetric(null);
    setActiveTab('current');
  };
  
  // Delete goal
  const handleDeleteGoal = (id: string) => {
    setWorkingGoals(workingGoals.filter(goal => goal.id !== id));
  };
  
  // Start editing a goal
  const handleEditGoal = (goal: GoalMetric) => {
    setEditingGoal({
      metricId: goal.metricId,
      name: goal.name,
      category: goal.category,
      unit: goal.unit,
      currentValue: goal.currentValue,
      startValue: goal.startValue,
      targetValue: goal.targetValue,
      timeframe: goal.timeframe
    });
    
    if (goal.metricId) {
      const metric = healthMetrics.find(m => m.id === goal.metricId);
      if (metric) {
        setSelectedMetric(metric);
      }
    }
    
    setEditingGoalId(goal.id);
    setActiveTab('add');
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center">
            <Target className="mr-2 h-5 w-5 text-primary" />
            Customize Your Goals
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Track your progress by setting measurable health goals. 
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="current" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger 
              value="current" 
              className={activeTab === "current" ? "font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}
            >
              Current Goals
            </TabsTrigger>
            <TabsTrigger 
              value="add" 
              className={activeTab === "add" ? "font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}
            >
              Add Goal
            </TabsTrigger>
            <TabsTrigger 
              value="templates" 
              className={activeTab === "templates" ? "font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground" : ""}
            >
              Templates
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="current" className="mt-4">
            {workingGoals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">You don't have any goals yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-primary text-primary hover:bg-primary/10"
                  onClick={() => setActiveTab('add')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Goal
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {workingGoals.map(goal => (
                  <div key={goal.id} className="flex flex-col p-4 border rounded-lg bg-white hover:bg-gray-50 transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        {goal.metricId && 
                          healthMetrics.find(m => m.id === goal.metricId)?.icon && 
                          <span className="mr-2 p-2 bg-primary/10 rounded-full">
                            {healthMetrics.find(m => m.id === goal.metricId)?.icon}
                          </span>
                        }
                        <div>
                          <h3 className="font-medium text-gray-900">{goal.name}</h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Badge variant="outline" className="mr-2">{goal.category}</Badge>
                            <span>{goal.timeframe}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditGoal(goal)}
                          className="h-8 w-8 text-gray-500 hover:text-primary hover:bg-primary/10"
                          title="Edit goal"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="h-8 w-8 text-red-500 hover:bg-red-50"
                          title="Delete goal"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-1 mb-2">
                      <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            goal.currentValue >= goal.targetValue ? 'bg-green-500' :
                            goal.currentValue >= (goal.targetValue * 0.75) ? 'bg-primary' :
                            goal.currentValue >= (goal.targetValue * 0.5) ? 'bg-yellow-500' :
                            'bg-gray-300'
                          }`}
                          style={{ 
                            width: `${Math.min(100, Math.max(5, (goal.currentValue - goal.startValue) / (goal.targetValue - goal.startValue) * 100))}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-500">Current:</span>
                        <span className="font-medium ml-1">{goal.currentValue} {goal.unit}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Target:</span>
                        <span className="font-medium ml-1">{goal.targetValue} {goal.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="add" className="mt-4 space-y-5">
            <div className="space-y-5">
              {/* Metric Selection */}
              <div className="space-y-2">
                <Label htmlFor="metricSelect" className="text-sm font-medium">Select Health Metric</Label>
                <Select 
                  value={selectedMetric?.id || ''} 
                  onValueChange={handleMetricSelect}
                >
                  <SelectTrigger className="w-full border-gray-300 focus:ring-1 focus:ring-primary focus:border-primary">
                    <SelectValue placeholder="Select a health metric to track" />
                  </SelectTrigger>
                  <SelectContent className="border border-gray-200">
                    {healthMetrics.map(metric => (
                      <SelectItem key={metric.id} value={metric.id}>
                        <div className="flex items-center">
                          <span className="mr-2">{metric.icon}</span>
                          {metric.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedMetric && (
                  <p className="text-xs text-gray-500 italic mt-1">
                    {selectedMetric.description}
                  </p>
                )}
              </div>
              
              {/* Goal Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="goalName" className="text-sm font-medium">Goal Name</Label>
                  <Input 
                    id="goalName" 
                    placeholder="e.g., Increase Daily Steps" 
                    value={editingGoal.name || ''} 
                    onChange={e => setEditingGoal({...editingGoal, name: e.target.value})}
                    className="h-9 border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="goalCategory" className="text-sm font-medium">Category</Label>
                  <Select 
                    value={editingGoal.category} 
                    onValueChange={value => setEditingGoal({...editingGoal, category: value})}
                  >
                    <SelectTrigger className="h-9 border-gray-300 focus:ring-1 focus:ring-primary focus:border-primary">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Activity">Activity</SelectItem>
                      <SelectItem value="Heart Health">Heart Health</SelectItem>
                      <SelectItem value="Mental Health">Mental Health</SelectItem>
                      <SelectItem value="Nutrition">Nutrition</SelectItem>
                      <SelectItem value="Respiratory Health">Respiratory Health</SelectItem>
                      <SelectItem value="Recovery">Recovery</SelectItem>
                      <SelectItem value="Vital Signs">Vital Signs</SelectItem>
                      <SelectItem value="Energy">Energy</SelectItem>
                      <SelectItem value="Lifestyle">Lifestyle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mt-5">
                <div className="space-y-2">
                  <Label htmlFor="currentValue" className="text-sm font-medium">Current Value</Label>
                  <NumberScroller
                    value={editingGoal.currentValue || 0}
                    onChange={(value) => setEditingGoal({...editingGoal, currentValue: value})}
                    min={selectedMetric?.minValue || 0}
                    max={selectedMetric?.maxValue || 100}
                    step={selectedMetric?.id === 'body_temperature' ? 0.1 : 1}
                    unit={editingGoal.unit}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startValue" className="text-sm font-medium">Start Value</Label>
                  <NumberScroller
                    value={editingGoal.startValue || 0}
                    onChange={(value) => setEditingGoal({...editingGoal, startValue: value})}
                    min={selectedMetric?.minValue || 0}
                    max={selectedMetric?.maxValue || 100}
                    step={selectedMetric?.id === 'body_temperature' ? 0.1 : 1}
                    unit={editingGoal.unit}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetValue" className="text-sm font-medium">Target Value</Label>
                  <NumberScroller
                    value={editingGoal.targetValue || 0}
                    onChange={(value) => setEditingGoal({...editingGoal, targetValue: value})}
                    min={selectedMetric?.minValue || 0}
                    max={selectedMetric?.maxValue || 100}
                    step={selectedMetric?.id === 'body_temperature' ? 0.1 : 1}
                    unit={editingGoal.unit}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-5">
                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm font-medium">Unit</Label>
                  <Input 
                    id="unit" 
                    placeholder="e.g., steps, minutes, kg" 
                    value={editingGoal.unit || ''} 
                    onChange={e => setEditingGoal({...editingGoal, unit: e.target.value})}
                    readOnly={!!selectedMetric}
                    className="h-9"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timeframe" className="text-sm font-medium">Timeframe</Label>
                  <Select 
                    value={editingGoal.timeframe || 'daily'} 
                    onValueChange={(value: TimeFrame) => setEditingGoal({...editingGoal, timeframe: value})}
                  >
                    <SelectTrigger className="h-9 border-gray-300 focus:ring-1 focus:ring-primary focus:border-primary">
                      <SelectValue placeholder="Select a timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {selectedMetric && (
                <div className="bg-blue-50 p-3 rounded-md text-sm">
                  <p className="text-blue-700 font-medium mb-1">Typical Range</p>
                  <p className="text-gray-600">
                    For {selectedMetric.name}, most users set targets between {selectedMetric.minValue} and {selectedMetric.maxValue} {selectedMetric.unit}. 
                    {selectedMetric.increasingIsBetter 
                      ? ' Higher values indicate better performance.' 
                      : ' Lower values indicate better performance.'}
                  </p>
                </div>
              )}
              
              <div className="flex justify-end mt-6">
                {editingGoalId ? (
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md" 
                    onClick={handleUpdateGoal}
                    disabled={!editingGoal.name || !editingGoal.category}
                  >
                    Save Changes
                  </Button>
                ) : (
                  <Button 
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md" 
                    onClick={handleAddGoal}
                    disabled={!editingGoal.name || !editingGoal.category || !selectedMetric}
                  >
                    Add Goal
                  </Button>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="templates" className="mt-4">
            <p className="text-sm text-gray-600 mb-4">Select a template to quickly create a goal based on common health metrics.</p>
            <div className="grid grid-cols-1 gap-3">
              {healthMetrics.map((metric) => (
                <div 
                  key={metric.id} 
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center sm:justify-between"
                  onClick={() => {
                    handleMetricSelect(metric.id);
                    setActiveTab('add');
                  }}
                >
                  <div className="flex items-center mb-3 sm:mb-0">
                    <div className="mr-3 p-2 bg-gray-50 rounded-full">
                      {metric.icon}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{metric.name}</h3>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-500 mt-1">
                        <Badge variant="outline">{metric.category}</Badge>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full">{metric.unit}</span>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full capitalize">{metric.timeframe}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:items-end">
                    <p className="text-xs text-gray-600 max-w-xs sm:text-right mb-2">{metric.description}</p>
                    <Button size="sm" variant="ghost" className="sm:self-end text-primary hover:text-primary hover:bg-primary/10">
                      <Plus className="h-4 w-4 mr-1" />
                      Use Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4 pt-4 border-t flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            onClick={() => {
              setWorkingGoals(goals); // Reset to original
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button 
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => {
              onSaveGoals(workingGoals);
              onOpenChange(false);
            }}
          >
            Save All Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GoalCustomizationModal; 