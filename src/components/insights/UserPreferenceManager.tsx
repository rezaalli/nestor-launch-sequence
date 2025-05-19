import React, { useState, useEffect } from 'react';
import { Settings, Save, X, Filter, Layout, Sliders, Clock } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export type InsightCategory = 
  | 'sleep' 
  | 'activity' 
  | 'nutrition' 
  | 'stress' 
  | 'heart' 
  | 'energy' 
  | 'goals' 
  | 'health';

export type DetailLevel = 'minimal' | 'moderate' | 'detailed';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'all-day';
export type LayoutType = 'cards' | 'timeline' | 'focused' | 'compact';

export interface UserPreferences {
  categories: {
    [key in InsightCategory]: {
      enabled: boolean;
      priority: number; // 1-5, with 5 being highest
    };
  };
  display: {
    detailLevel: DetailLevel;
    layout: LayoutType;
    showContextual: boolean;
    darkMode: boolean;
    compactView: boolean;
    autoHideTimeIrrelevant: boolean;
    priorityThreshold: 'all' | 'medium-up' | 'high-up' | 'critical-only';
  };
  notifications: {
    enabled: boolean;
    criticalOnly: boolean;
    timeRanges: TimeOfDay[];
    doNotDisturb: boolean;
  };
  timeContext: {
    useAutomaticTimeContext: boolean;
    manualTimeOfDay: TimeOfDay;
    showTimeRelevantContentFirst: boolean;
  };
}

interface UserPreferenceManagerProps {
  preferences: UserPreferences;
  onPreferencesChange: (preferences: UserPreferences) => void;
  onSave: () => void;
}

const UserPreferenceManager: React.FC<UserPreferenceManagerProps> = ({
  preferences,
  onPreferencesChange,
  onSave
}) => {
  const [tempPreferences, setTempPreferences] = useState<UserPreferences>({...preferences});
  
  const handleCategoryToggle = (category: InsightCategory, enabled: boolean) => {
    setTempPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories[category],
          enabled
        }
      }
    }));
  };
  
  const handleCategoryPriority = (category: InsightCategory, priority: number) => {
    setTempPreferences(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: {
          ...prev.categories[category],
          priority
        }
      }
    }));
  };
  
  const handleDisplayChange = (field: keyof UserPreferences['display'], value: any) => {
    setTempPreferences(prev => ({
      ...prev,
      display: {
        ...prev.display,
        [field]: value
      }
    }));
  };
  
  const handleNotificationChange = (field: keyof UserPreferences['notifications'], value: any) => {
    setTempPreferences(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };
  
  const handleTimeContextChange = (field: keyof UserPreferences['timeContext'], value: any) => {
    setTempPreferences(prev => ({
      ...prev,
      timeContext: {
        ...prev.timeContext,
        [field]: value
      }
    }));
  };
  
  const handleSave = () => {
    onPreferencesChange(tempPreferences);
    onSave();
  };
  
  // Reset temp preferences when dialog opens
  useEffect(() => {
    setTempPreferences({...preferences});
  }, [preferences]);
  
  // Get a user-friendly name for the category
  const getCategoryName = (category: InsightCategory): string => {
    const names: Record<InsightCategory, string> = {
      sleep: 'Sleep',
      activity: 'Physical Activity',
      nutrition: 'Nutrition',
      stress: 'Stress & Recovery',
      heart: 'Heart Health',
      energy: 'Energy Levels',
      goals: 'Personal Goals',
      health: 'General Health'
    };
    return names[category];
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto flex items-center gap-1">
          <Settings size={14} />
          <span>Preferences</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Dashboard Preferences</DialogTitle>
          <DialogDescription>
            Customize how your health insights are displayed and prioritized
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="categories" className="mt-4">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="categories" className="flex items-center gap-1.5">
              <Filter size={14} />
              Categories
            </TabsTrigger>
            <TabsTrigger value="display" className="flex items-center gap-1.5">
              <Layout size={14} />
              Display
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-1.5">
              <Bell size={14} />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="timeContext" className="flex items-center gap-1.5">
              <Clock size={14} />
              Time Context
            </TabsTrigger>
          </TabsList>
          
          {/* Categories Tab */}
          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.keys(tempPreferences.categories).map((category) => {
                const cat = category as InsightCategory;
                return (
                  <div key={category} className="flex items-start justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Checkbox 
                          id={`category-${category}`}
                          checked={tempPreferences.categories[cat].enabled}
                          onCheckedChange={(checked) => handleCategoryToggle(cat, checked as boolean)}
                          className="mr-2"
                        />
                        <Label htmlFor={`category-${category}`} className="font-medium">
                          {getCategoryName(cat)}
                        </Label>
                      </div>
                      {tempPreferences.categories[cat].enabled && (
                        <div className="pl-6">
                          <Label className="text-xs text-gray-500 mb-1 block">
                            Priority: {tempPreferences.categories[cat].priority}/5
                          </Label>
                          <Slider 
                            value={[tempPreferences.categories[cat].priority]}
                            min={1}
                            max={5}
                            step={1}
                            onValueChange={([value]) => handleCategoryPriority(cat, value)}
                            className="w-36"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </TabsContent>
          
          {/* Display Tab */}
          <TabsContent value="display" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Detail Level</h3>
                <RadioGroup 
                  value={tempPreferences.display.detailLevel}
                  onValueChange={(value) => handleDisplayChange('detailLevel', value as DetailLevel)}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="minimal" id="detail-minimal" />
                    <Label htmlFor="detail-minimal">Minimal - Show only essential information</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="detail-moderate" />
                    <Label htmlFor="detail-moderate">Moderate - Show additional context and data sources</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="detailed" id="detail-detailed" />
                    <Label htmlFor="detail-detailed">Detailed - Show all available information and visualizations</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Layout</h3>
                <Select 
                  value={tempPreferences.display.layout}
                  onValueChange={(value) => handleDisplayChange('layout', value as LayoutType)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cards">Cards</SelectItem>
                    <SelectItem value="timeline">Timeline</SelectItem>
                    <SelectItem value="focused">Focused</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-3">Priority Threshold</h3>
                <Select 
                  value={tempPreferences.display.priorityThreshold}
                  onValueChange={(value) => handleDisplayChange('priorityThreshold', value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select priority threshold" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Show all priorities</SelectItem>
                    <SelectItem value="medium-up">Medium and higher</SelectItem>
                    <SelectItem value="high-up">High and critical only</SelectItem>
                    <SelectItem value="critical-only">Critical only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-contextual" className="cursor-pointer">Show contextual information</Label>
                  <Switch 
                    id="show-contextual"
                    checked={tempPreferences.display.showContextual}
                    onCheckedChange={(checked) => handleDisplayChange('showContextual', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-view" className="cursor-pointer">Compact view</Label>
                  <Switch 
                    id="compact-view"
                    checked={tempPreferences.display.compactView}
                    onCheckedChange={(checked) => handleDisplayChange('compactView', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode" className="cursor-pointer">Dark mode</Label>
                  <Switch 
                    id="dark-mode"
                    checked={tempPreferences.display.darkMode}
                    onCheckedChange={(checked) => handleDisplayChange('darkMode', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="auto-hide" className="cursor-pointer">Auto-hide time-irrelevant insights</Label>
                  <Switch 
                    id="auto-hide"
                    checked={tempPreferences.display.autoHideTimeIrrelevant}
                    onCheckedChange={(checked) => handleDisplayChange('autoHideTimeIrrelevant', checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications-enabled" className="cursor-pointer">Enable notifications</Label>
              <Switch 
                id="notifications-enabled"
                checked={tempPreferences.notifications.enabled}
                onCheckedChange={(checked) => handleNotificationChange('enabled', checked)}
              />
            </div>
            
            {tempPreferences.notifications.enabled && (
              <>
                <div className="flex items-center justify-between">
                  <Label htmlFor="critical-only" className="cursor-pointer">Critical alerts only</Label>
                  <Switch 
                    id="critical-only"
                    checked={tempPreferences.notifications.criticalOnly}
                    onCheckedChange={(checked) => handleNotificationChange('criticalOnly', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="do-not-disturb" className="cursor-pointer">Do not disturb</Label>
                  <Switch 
                    id="do-not-disturb"
                    checked={tempPreferences.notifications.doNotDisturb}
                    onCheckedChange={(checked) => handleNotificationChange('doNotDisturb', checked)}
                  />
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Notification Time Ranges</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {['morning', 'afternoon', 'evening', 'night', 'all-day'].map((time) => (
                      <div key={time} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`time-${time}`}
                          checked={tempPreferences.notifications.timeRanges.includes(time as TimeOfDay)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleNotificationChange('timeRanges', [
                                ...tempPreferences.notifications.timeRanges,
                                time as TimeOfDay
                              ]);
                            } else {
                              handleNotificationChange('timeRanges', 
                                tempPreferences.notifications.timeRanges.filter(t => t !== time)
                              );
                            }
                          }}
                        />
                        <Label htmlFor={`time-${time}`} className="capitalize">{time.replace('-', ' ')}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </TabsContent>
          
          {/* Time Context Tab */}
          <TabsContent value="timeContext" className="space-y-6">
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-time-context" className="cursor-pointer">
                Use automatic time context
                <p className="text-xs text-gray-500">Uses your device time to determine the time of day</p>
              </Label>
              <Switch 
                id="auto-time-context"
                checked={tempPreferences.timeContext.useAutomaticTimeContext}
                onCheckedChange={(checked) => handleTimeContextChange('useAutomaticTimeContext', checked)}
              />
            </div>
            
            {!tempPreferences.timeContext.useAutomaticTimeContext && (
              <div>
                <h3 className="text-sm font-medium mb-2">Manual Time of Day</h3>
                <RadioGroup 
                  value={tempPreferences.timeContext.manualTimeOfDay}
                  onValueChange={(value) => handleTimeContextChange('manualTimeOfDay', value as TimeOfDay)}
                  className="flex flex-col space-y-2"
                >
                  {['morning', 'afternoon', 'evening', 'night', 'all-day'].map((time) => (
                    <div key={time} className="flex items-center space-x-2">
                      <RadioGroupItem value={time} id={`manual-${time}`} />
                      <Label htmlFor={`manual-${time}`} className="capitalize">{time.replace('-', ' ')}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <Label htmlFor="time-relevant-first" className="cursor-pointer">
                Show time-relevant content first
                <p className="text-xs text-gray-500">Prioritize insights relevant to the current time of day</p>
              </Label>
              <Switch 
                id="time-relevant-first"
                checked={tempPreferences.timeContext.showTimeRelevantContentFirst}
                onCheckedChange={(checked) => handleTimeContextChange('showTimeRelevantContentFirst', checked)}
              />
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline" className="gap-1">
              <X size={14} />
              <span>Cancel</span>
            </Button>
          </DialogClose>
          <Button onClick={handleSave} className="gap-1">
            <Save size={14} />
            <span>Save Preferences</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

function Bell(props: React.SVGProps<SVGSVGElement> & { size?: number }) {
  const { size = 24, ...rest } = props;
  return (
    <svg
      {...rest}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

export default UserPreferenceManager; 