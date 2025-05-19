import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusCircle, Clock, Calendar, LineChart, BarChart, 
  Flame, Heart, ArrowUpRight, Footprints, MapPin, 
  Timer, Bike, PersonStanding, Dumbbell, Plus, X, MoreHorizontal,
  ChevronRight, ChevronDown, Search, Zap, LayoutGrid, Activity
} from 'lucide-react';
import { format, parseISO, isToday, isYesterday, isThisWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { variants, easings } from '@/styles/motion';

// Define activity types
interface Activity {
  id: string;
  type: 'run' | 'cycle' | 'swim' | 'walk' | 'workout' | 'yoga' | 'hiking' | 'other';
  title: string;
  duration: number; // in minutes
  distance?: number; // in kilometers
  caloriesBurned: number;
  avgHeartRate?: number;
  date: string; // ISO string
  location?: string;
  notes?: string;
  autoDetected?: boolean;
  elevationGain?: number; // in meters
  steps?: number;
  images?: string[];
}

// Sample activity data
const sampleActivities: Activity[] = [
  {
    id: '1',
    type: 'run',
    title: 'Morning Run',
    duration: 28,
    distance: 4.2,
    caloriesBurned: 320,
    avgHeartRate: 148,
    date: new Date().toISOString(),
    location: 'Central Park',
    autoDetected: true,
    elevationGain: 45,
    steps: 5400
  },
  {
    id: '2',
    type: 'cycle',
    title: 'Evening Ride',
    duration: 45,
    distance: 15.3,
    caloriesBurned: 450,
    avgHeartRate: 142,
    date: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
    location: 'Riverside Route',
    elevationGain: 120
  },
  {
    id: '3',
    type: 'workout',
    title: 'Strength Training',
    duration: 50,
    caloriesBurned: 280,
    avgHeartRate: 132,
    date: new Date(new Date().setDate(new Date().getDate() - 2)).toISOString(),
    notes: 'Focus on upper body',
  },
  {
    id: '4',
    type: 'swim',
    title: 'Pool Laps',
    duration: 35,
    distance: 1.2,
    caloriesBurned: 310,
    avgHeartRate: 125,
    date: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
    location: 'Downtown Pool'
  }
];

// Activity icon mapping - ENHANCED with more intuitive icons and consistent sizes
const ActivityIcon = ({ type, className = "w-4 h-4" }: { type: Activity['type'], className?: string }) => {
  switch (type) {
    case 'run':
      return <PersonStanding className={className} strokeWidth={2.5} />;
    case 'cycle':
      return <Bike className={className} strokeWidth={2.5} />;
    case 'swim':
      return <Footprints className={className} strokeWidth={2.5} />;
    case 'walk':
      return <Footprints className={className} strokeWidth={2.5} />;
    case 'workout':
      return <Dumbbell className={className} strokeWidth={2.5} />;
    case 'yoga':
      return <Activity className={className} strokeWidth={2.5} />;
    case 'hiking':
      return <MapPin className={className} strokeWidth={2.5} />;
    default:
      return <Activity className={className} strokeWidth={2.5} />;
  }
};

// Activity background colors - ENHANCED with better contrast
const getActivityColor = (type: Activity['type']) => {
  switch (type) {
    case 'run':
      return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800/50';
    case 'cycle':
      return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
    case 'swim':
      return 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800/50';
    case 'walk':
      return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800/50';
    case 'workout':
      return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800/50';
    case 'yoga':
      return 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800/50';
    case 'hiking':
      return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
    default:
      return 'bg-slate-100 dark:bg-slate-900/30 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800/50';
  }
};

// Format activity date
const formatActivityDate = (dateString: string) => {
  const date = parseISO(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  if (isThisWeek(date)) return format(date, 'EEEE'); // Day name
  return format(date, 'MMM d'); // Month and day
};

interface ActivityTrackerProps {
  onAddActivity?: (activity: Omit<Activity, 'id'>) => void;
  onDeleteActivity?: (id: string) => void;
}

const ActivityTracker: React.FC<ActivityTrackerProps> = ({ 
  onAddActivity, 
  onDeleteActivity 
}) => {
  const [activities, setActivities] = useState<Activity[]>(sampleActivities);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [newActivity, setNewActivity] = useState<Partial<Activity>>({
    type: 'run',
    title: '',
    duration: 30,
    distance: 0,
    caloriesBurned: 0,
    date: new Date().toISOString(),
  });
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);
  const [detectingSuggestion, setDetectingSuggestion] = useState(false);

  // Simulated auto-detection (in a real app this would connect to device sensors)
  useEffect(() => {
    if (autoDetectEnabled) {
      // Simulate an activity detection after 5 seconds
      const timeout = setTimeout(() => {
        setDetectingSuggestion(true);
        // After "detection", suggest an activity
        setTimeout(() => {
          setDetectingSuggestion(false);
          
          // Only suggest if we haven't added a similar activity recently
          const recentActivities = activities.filter(a => 
            isToday(parseISO(a.date)) && a.type === 'walk'
          );
          
          if (recentActivities.length === 0) {
            const newId = `auto-${Date.now()}`;
            const suggestedActivity: Activity = {
              id: newId,
              type: 'walk',
              title: 'Afternoon Walk',
              duration: Math.floor(15 + Math.random() * 10),
              distance: parseFloat((1 + Math.random() * 1.5).toFixed(1)),
              caloriesBurned: Math.floor(100 + Math.random() * 100),
              avgHeartRate: Math.floor(100 + Math.random() * 30),
              date: new Date().toISOString(),
              autoDetected: true,
              steps: Math.floor(2000 + Math.random() * 2000)
            };
            
            // Add the suggested activity to the list
            setActivities(prev => [suggestedActivity, ...prev]);
          }
        }, 2000);
      }, 5000);
      
      return () => clearTimeout(timeout);
    }
  }, [autoDetectEnabled, activities]);
  
  const handleAddActivity = () => {
    if (!newActivity.title || !newActivity.duration) return;
    
    const activityToAdd = {
      ...newActivity,
      id: `manual-${Date.now()}`
    } as Activity;
    
    setActivities(prev => [activityToAdd, ...prev]);
    if (onAddActivity) onAddActivity(activityToAdd);
    
    // Reset form and close dialog
    setNewActivity({
      type: 'run',
      title: '',
      duration: 30,
      distance: 0,
      caloriesBurned: 0,
      date: new Date().toISOString(),
    });
    setAddActivityOpen(false);
  };
  
  const handleDeleteActivity = (id: string) => {
    setActivities(prev => prev.filter(activity => activity.id !== id));
    if (onDeleteActivity) onDeleteActivity(id);
  };
  
  const filteredActivities = activeTab === 'all' 
    ? activities 
    : activities.filter(activity => activity.type === activeTab);

  // Group activities by date
  const groupedActivities: { [key: string]: Activity[] } = {};
  filteredActivities.forEach(activity => {
    const dateKey = formatActivityDate(activity.date);
    if (!groupedActivities[dateKey]) {
      groupedActivities[dateKey] = [];
    }
    groupedActivities[dateKey].push(activity);
  });
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Header with auto-detection toggle - ENHANCED with improved visuals */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
          <Zap className="w-4 h-4 mr-2 text-blue-500 dark:text-blue-400" />
          Activity Log
        </h3>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Auto-detect</span>
            <Switch
              checked={autoDetectEnabled}
              onCheckedChange={setAutoDetectEnabled}
              className="data-[state=checked]:bg-green-600"
            />
          </div>
          <Button 
            size="sm"
            onClick={() => setAddActivityOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
      
      {/* Activity type tabs - ENHANCED with better visual clarity */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
          <TabsList className="w-full h-9 bg-slate-100 dark:bg-slate-800 p-1">
            <TabsTrigger value="all" className="text-xs h-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:font-medium data-[state=active]:shadow-sm">
              All
            </TabsTrigger>
            <TabsTrigger value="run" className="text-xs h-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:font-medium data-[state=active]:shadow-sm">
              <PersonStanding className="w-3 h-3 mr-1" />
              Run
            </TabsTrigger>
            <TabsTrigger value="cycle" className="text-xs h-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:font-medium data-[state=active]:shadow-sm">
              <Bike className="w-3 h-3 mr-1" />
              Cycle
            </TabsTrigger>
            <TabsTrigger value="workout" className="text-xs h-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:font-medium data-[state=active]:shadow-sm">
              <Dumbbell className="w-3 h-3 mr-1" />
              Workout
            </TabsTrigger>
            <TabsTrigger value="other" className="text-xs h-full data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:font-medium data-[state=active]:shadow-sm">
              <MoreHorizontal className="w-3 h-3" />
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Activity detection indicator - ENHANCED with more visually clear feedback */}
        <AnimatePresence>
          {detectingSuggestion && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-b border-blue-100 dark:border-blue-800/30"
            >
              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center">
                  <div className="animate-ping absolute h-2 w-2 rounded-full bg-blue-400 dark:bg-blue-500 opacity-75"></div>
                  <div className="relative rounded-full h-2 w-2 bg-blue-500 dark:bg-blue-400"></div>
                </div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Detecting activity...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Activities list - ENHANCED with better visual clarity and information hierarchy */}
        <TabsContent value={activeTab} className="flex-1 overflow-hidden mt-0 data-[state=active]:flex flex-col">
          <div className="flex-1 overflow-y-auto px-1 py-2 space-y-4">
            {Object.keys(groupedActivities).length > 0 ? (
              Object.entries(groupedActivities).map(([dateGroup, activitiesInGroup]) => (
                <div key={dateGroup} className="space-y-2">
                  <div className="px-3 py-1">
                    <h4 className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center">
                      <Calendar className="w-3 h-3 mr-1.5" />
                      {dateGroup}
                    </h4>
                  </div>
                  
                  <div className="space-y-2 px-2">
                    {activitiesInGroup.map(activity => (
                      <motion.div
                        key={activity.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className={`
                          rounded-lg border ${activity.autoDetected 
                            ? 'border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10' 
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                          } overflow-hidden shadow-sm hover:shadow transition-shadow duration-200
                        `}
                      >
                        <div className="flex items-start p-3">
                          <div className={`p-2 rounded-full mr-3 ${getActivityColor(activity.type)}`}>
                            <ActivityIcon type={activity.type} className="w-4 h-4" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                                {activity.title}
                              </h3>
                              {activity.autoDetected && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] border-blue-200 dark:border-blue-800 font-medium">
                                  <Zap className="w-2.5 h-2.5 mr-0.5" />
                                  Auto
                                </Badge>
                              )}
                            </div>
                            
                            {/* ENHANCED metrics display with better hierarchy and visual separation */}
                            <div className="flex flex-wrap items-center gap-3 mt-2">
                              <div className="flex items-center text-slate-700 dark:text-slate-300 text-xs gap-1 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded font-medium">
                                <Clock className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                <span>{activity.duration} min</span>
                              </div>
                              
                              {activity.distance && (
                                <div className="flex items-center text-slate-700 dark:text-slate-300 text-xs gap-1 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded font-medium">
                                  <ArrowUpRight className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                                  <span>{activity.distance} km</span>
                                </div>
                              )}
                              
                              <div className="flex items-center text-slate-700 dark:text-slate-300 text-xs gap-1 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded font-medium">
                                <Flame className="w-3 h-3 text-orange-500 dark:text-orange-400" />
                                <span>{activity.caloriesBurned} cal</span>
                              </div>
                              
                              {activity.avgHeartRate && (
                                <div className="flex items-center text-slate-700 dark:text-slate-300 text-xs gap-1 bg-slate-100 dark:bg-slate-700/50 px-1.5 py-0.5 rounded font-medium">
                                  <Heart className="w-3 h-3 text-red-500 dark:text-red-400" />
                                  <span>{activity.avgHeartRate} bpm</span>
                                </div>
                              )}
                            </div>
                            
                            {activity.location && (
                              <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{activity.location}</span>
                              </div>
                            )}
                            
                            {activity.notes && (
                              <div className="text-xs italic text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                {activity.notes}
                              </div>
                            )}
                          </div>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-7 w-7 opacity-50 hover:opacity-100 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex-shrink-0 ml-1"
                            onClick={() => handleDeleteActivity(activity.id)}
                            aria-label="Delete activity"
                          >
                            <X className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        
                        {/* Activity stats - ENHANCED visualization with labeled data points */}
                        <div className="px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-700/50 mt-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Activity Intensity</div>
                            {activity.autoDetected && (
                              <div className="text-[10px] font-medium text-blue-600 dark:text-blue-400">Auto-tracked</div>
                            )}
                          </div>
                          <div className="w-full h-10 flex items-end gap-0.5 relative">
                            {Array.from({ length: 12 }).map((_, i) => {
                              const randomHeight = 15 + Math.random() * 85;
                              const isHighlighted = i === 5; // Simulated peak point
                              return (
                                <div key={i} className="group relative flex-1">
                                  <div
                                    className={`
                                      ${isHighlighted 
                                        ? getActivityColor(activity.type).split(' ')[0] + ' ' + getActivityColor(activity.type).split(' ')[2]
                                        : getActivityColor(activity.type).split(' ')[0] + ' opacity-70 dark:opacity-50'
                                      } rounded-t-sm transition-all duration-200 group-hover:opacity-100
                                    `}
                                    style={{ height: `${randomHeight}%` }}
                                  ></div>
                                  {isHighlighted && (
                                    <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-[9px] font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                      Peak
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-8 text-center text-slate-500 dark:text-slate-400">
                <LayoutGrid className="w-12 h-12 opacity-20 mb-3" />
                <p className="text-sm font-medium">No activities found</p>
                <p className="text-xs mt-1">Start tracking your fitness journey</p>
                <Button 
                  onClick={() => setAddActivityOpen(true)}
                  className="mt-4"
                  variant="outline"
                  size="sm"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Activity
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Weekly summary footer - ENHANCED with improved typography and data presentation */}
      <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center">
              <BarChart className="w-3 h-3 mr-1.5 text-blue-500 dark:text-blue-400" />
              This Week's Summary
            </h4>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400">Activities</span>
                <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                  {activities.length}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400">Duration</span>
                <div className="flex items-baseline">
                  <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {activities.reduce((sum, a) => sum + a.duration, 0)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">min</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400">Calories</span>
                <div className="flex items-baseline">
                  <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {activities.reduce((sum, a) => sum + a.caloriesBurned, 0)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">cal</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-slate-500 dark:text-slate-400">Distance</span>
                <div className="flex items-baseline">
                  <span className="text-base font-bold text-slate-800 dark:text-slate-200">
                    {activities
                      .filter(a => a.distance)
                      .reduce((sum, a) => sum + (a.distance || 0), 0)
                      .toFixed(1)}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">km</span>
                </div>
              </div>
            </div>
          </div>
          
          <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 shadow-sm">
            <LineChart className="w-4 h-4 mr-1" />
            Detailed Analysis
          </Button>
        </div>
      </div>
      
      {/* Add Activity Dialog - ENHANCED with better validation and feedback */}
      <Dialog open={addActivityOpen} onOpenChange={setAddActivityOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Plus className="w-4 h-4 mr-2 text-blue-500" />
              Add Activity
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="col-span-4">
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                  Activity Type <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['run', 'cycle', 'swim', 'walk', 'workout', 'yoga', 'hiking', 'other'] as const).map(type => (
                    <div
                      key={type}
                      className={`
                        flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer border transition-all duration-200
                        ${newActivity.type === type 
                          ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 shadow-sm' 
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}
                      `}
                      onClick={() => setNewActivity(prev => ({ ...prev, type }))}
                    >
                      <div className={`p-2 rounded-full ${getActivityColor(type)}`}>
                        <ActivityIcon type={type} />
                      </div>
                      <span className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">
                        {type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="col-span-4">
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Title <span className="text-red-500">*</span></span>
                  {newActivity.title ? (
                    <span className="text-xs text-green-600">{newActivity.title.length} chars</span>
                  ) : (
                    <span className="text-xs text-red-500">Required</span>
                  )}
                </label>
                <Input
                  value={newActivity.title || ''}
                  onChange={e => setNewActivity(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Morning Run, Yoga Session, etc."
                  className={!newActivity.title ? "border-red-300 focus-visible:ring-red-500" : ""}
                  aria-required="true"
                />
                {!newActivity.title && (
                  <p className="text-xs text-red-500 mt-1">Please enter an activity title</p>
                )}
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300 flex justify-between">
                  <span>Duration (mins) <span className="text-red-500">*</span></span>
                  {(!newActivity.duration || newActivity.duration <= 0) && (
                    <span className="text-xs text-red-500">Required</span>
                  )}
                </label>
                <Input
                  type="number"
                  value={newActivity.duration || ''}
                  onChange={e => setNewActivity(prev => ({ 
                    ...prev, 
                    duration: parseInt(e.target.value) || 0,
                    // Estimate calories based on duration and activity type
                    caloriesBurned: Math.round((parseInt(e.target.value) || 0) * 
                      (['run', 'cycle', 'swim'].includes(prev.type || 'other') ? 10 : 6))
                  }))}
                  className={(!newActivity.duration || newActivity.duration <= 0) ? "border-red-300 focus-visible:ring-red-500" : ""}
                  aria-required="true"
                  min="1"
                />
                {(!newActivity.duration || newActivity.duration <= 0) && (
                  <p className="text-xs text-red-500 mt-1">Please enter a valid duration</p>
                )}
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                  Distance (km)
                  {['workout', 'yoga'].includes(newActivity.type || '') && (
                    <span className="text-xs text-slate-500 ml-1">(Not applicable)</span>
                  )}
                </label>
                <Input
                  type="number"
                  step="0.1"
                  value={newActivity.distance || ''}
                  onChange={e => setNewActivity(prev => ({ ...prev, distance: parseFloat(e.target.value) || 0 }))}
                  disabled={['workout', 'yoga'].includes(newActivity.type || '')}
                  placeholder="Optional"
                  min="0"
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                  Calories <span className="text-xs text-slate-500 ml-1">(Auto-calculated)</span>
                </label>
                <Input
                  type="number"
                  value={newActivity.caloriesBurned || ''}
                  onChange={e => setNewActivity(prev => ({ ...prev, caloriesBurned: parseInt(e.target.value) || 0 }))}
                  className="bg-slate-50 dark:bg-slate-800"
                  min="0"
                />
              </div>
              
              <div className="col-span-2">
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                  Heart Rate (avg)
                </label>
                <Input
                  type="number"
                  value={newActivity.avgHeartRate || ''}
                  onChange={e => setNewActivity(prev => ({ ...prev, avgHeartRate: parseInt(e.target.value) || 0 }))}
                  placeholder="Optional"
                  min="0"
                  max="220"
                />
              </div>
              
              <div className="col-span-4">
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                  Location
                </label>
                <Input
                  value={newActivity.location || ''}
                  onChange={e => setNewActivity(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
              
              <div className="col-span-4">
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                  Notes
                </label>
                <Input
                  value={newActivity.notes || ''}
                  onChange={e => setNewActivity(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddActivityOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddActivity}
              disabled={!newActivity.title || !newActivity.duration || newActivity.duration <= 0}
              className={
                !newActivity.title || !newActivity.duration || newActivity.duration <= 0
                  ? "opacity-50 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            >
              Save Activity
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivityTracker; 