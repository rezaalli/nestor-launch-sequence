import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Heart, Activity, Thermometer, Clock, 
         Droplet, Moon, Apple, Check, ArrowRight, 
         ChevronDown, ChevronUp, Brain, Sparkles, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Tooltip } from '@/components/ui/tooltip';
import { adaptColorsToTimeOfDay, ColorMode, colorPalettes } from '@/styles/adaptive-colors';
import { variants, presets as motionPresets, durations, easings, stagger } from '@/styles/motion';
import { inset, spacing } from '@/styles/golden-ratio-spacing';

// Define metric categories and their items
interface MetricItem {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isNew?: boolean; // Flag for newly available metrics
  isPremium?: boolean; // Flag for premium-only metrics
}

interface MetricCategory {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: React.ReactNode;
  metrics: MetricItem[];
}

// Preset configurations
interface Preset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  metrics: string[];
}

// Define categories
const metricCategories: MetricCategory[] = [
  {
    id: 'cardiac',
    name: 'Cardiac Health',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    icon: <Heart className="w-4 h-4" />,
    metrics: [
      { id: 'heartRate', name: 'Heart Rate', description: 'Tracks your average heart rate throughout the day', icon: <Heart className="w-4 h-4 text-rose-600" /> },
      { id: 'hrv', name: 'Heart Rate Variability', description: 'Measures the variation in time between heartbeats', icon: <Activity className="w-4 h-4 text-rose-500" />, isNew: true },
      { id: 'ecg', name: 'ECG', description: 'Electrocardiogram readings from your device', icon: <Activity className="w-4 h-4 text-rose-700" /> },
    ]
  },
  {
    id: 'respiratory',
    name: 'Respiratory',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: <Droplet className="w-4 h-4" />,
    metrics: [
      { id: 'spo2', name: 'Blood Oxygen (SpO₂)', description: 'Measures the oxygen saturation level in your blood', icon: <Droplet className="w-4 h-4 text-blue-600" /> },
      { id: 'respiratoryRate', name: 'Respiratory Rate', description: 'Tracks your breathing rate', icon: <Activity className="w-4 h-4 text-blue-500" /> },
    ]
  },
  {
    id: 'activity',
    name: 'Physical Activity',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: <Activity className="w-4 h-4" />,
    metrics: [
      { id: 'steps', name: 'Steps', description: 'Daily step count', icon: <Activity className="w-4 h-4 text-green-600" /> },
      { id: 'caloriesBurned', name: 'Calories Burned', description: 'Estimated calories burned throughout the day', icon: <Activity className="w-4 h-4 text-green-500" /> },
      { id: 'activeMinutes', name: 'Active Minutes', description: 'Time spent being physically active', icon: <Clock className="w-4 h-4 text-green-500" />, isPremium: true },
    ]
  },
  {
    id: 'nutrition',
    name: 'Nutrition',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    icon: <Apple className="w-4 h-4" />,
    metrics: [
      { id: 'macronutrients', name: 'Macronutrients', description: 'Track your protein, carbohydrates, and fat intake', icon: <Apple className="w-4 h-4 text-amber-600" /> },
      { id: 'waterIntake', name: 'Water Intake', description: 'Monitor your daily hydration levels', icon: <Droplet className="w-4 h-4 text-amber-500" />, isPremium: true },
      { id: 'caloriesConsumed', name: 'Calories Consumed', description: 'Total calories consumed', icon: <Apple className="w-4 h-4 text-amber-500" />, isPremium: true },
    ]
  },
  {
    id: 'rest',
    name: 'Rest & Recovery',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: <Moon className="w-4 h-4" />,
    metrics: [
      { id: 'sleep', name: 'Sleep Duration', description: 'How long you sleep each night', icon: <Moon className="w-4 h-4 text-purple-600" /> },
      { id: 'sleepStages', name: 'Sleep Stages', description: 'Time spent in light, deep, and REM sleep', icon: <Moon className="w-4 h-4 text-purple-500" />, isPremium: true },
      { id: 'temperature', name: 'Temperature', description: 'Body temperature measurements', icon: <Thermometer className="w-4 h-4 text-purple-500" /> },
    ]
  },
  {
    id: 'cognitive',
    name: 'Cognitive Health',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    icon: <Brain className="w-4 h-4" />,
    metrics: [
      { id: 'stressLevel', name: 'Stress Level', description: 'Measured stress levels throughout the day', icon: <Brain className="w-4 h-4 text-indigo-600" />, isNew: true },
      { id: 'focusScore', name: 'Focus Score', description: 'Your ability to maintain concentration', icon: <Brain className="w-4 h-4 text-indigo-500" />, isPremium: true, isNew: true },
    ]
  },
];

// Enhanced preset configurations with descriptions
const presets: Preset[] = [
  { 
    id: 'heart-health', 
    name: 'Heart Health', 
    description: 'Focus on cardiac metrics for monitoring heart health',
    icon: <Heart className="w-4 h-4" />,
    metrics: ['heartRate', 'hrv', 'ecg', 'spo2']
  },
  { 
    id: 'fitness', 
    name: 'Fitness Focus', 
    description: 'Track activity metrics to optimize your fitness routine',
    icon: <Activity className="w-4 h-4" />,
    metrics: ['steps', 'caloriesBurned', 'activeMinutes', 'heartRate']
  },
  { 
    id: 'sleep', 
    name: 'Sleep Optimization', 
    description: 'Monitor sleep patterns and recovery metrics',
    icon: <Moon className="w-4 h-4" />,
    metrics: ['sleep', 'sleepStages', 'temperature', 'hrv']
  },
];

// Get all metrics in a flat array
const allMetrics = metricCategories.flatMap(category => 
  category.metrics.map(metric => ({
    ...metric,
    categoryId: category.id,
    categoryName: category.name,
    categoryColor: category.color,
    categoryBgColor: category.bgColor,
    categoryBorderColor: category.borderColor,
    categoryIcon: category.icon
  }))
);

interface MetricCustomizationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSelectedMetrics?: string[];
  onSave: (selectedMetrics: string[]) => void;
}

const MetricCustomizationModal: React.FC<MetricCustomizationModalProps> = ({
  open,
  onOpenChange,
  initialSelectedMetrics = [],
  onSave
}) => {
  // Determine the time of day for color styling
  const timeOfDay = adaptColorsToTimeOfDay();
  
  // State management
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(initialSelectedMetrics);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(metricCategories.map(c => c.id));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('categories'); // 'categories' or 'preview'
  const [draggedMetric, setDraggedMetric] = useState<string | null>(null);
  const [metricOrder, setMetricOrder] = useState<string[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  
  // Load saved order on mount
  useEffect(() => {
    if (initialSelectedMetrics.length > 0) {
      setMetricOrder([...initialSelectedMetrics]);
      
      // Check if the initial selection matches any preset
      checkForMatchingPreset(initialSelectedMetrics);
    }
  }, [initialSelectedMetrics]);
  
  // Check if current selection matches a preset
  const checkForMatchingPreset = (selected: string[]) => {
    const matchingPreset = presets.find(preset => 
      preset.metrics.length === selected.length && 
      preset.metrics.every(id => selected.includes(id))
    );
    
    setActivePreset(matchingPreset?.id || null);
  };
  
  // Handle metric selection toggle
  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev => {
      let newSelected;
      if (prev.includes(metricId)) {
        // Remove metric
        newSelected = prev.filter(id => id !== metricId);
      } else {
        // Add metric and update order
        newSelected = [...prev, metricId];
        setMetricOrder(current => {
          if (!current.includes(metricId)) {
            return [...current, metricId];
          }
          return current;
        });
      }
      
      // Check if selection matches a preset
      checkForMatchingPreset(newSelected);
      return newSelected;
    });
  };
  
  // Handle category expansion toggle
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };
  
  // Handle selecting all metrics in a category
  const selectAllInCategory = (categoryId: string) => {
    const categoryMetricIds = metricCategories
      .find(c => c.id === categoryId)
      ?.metrics.map(m => m.id) || [];
      
    setSelectedMetrics(prev => {
      const currentSelected = new Set(prev);
      categoryMetricIds.forEach(id => {
        if (!currentSelected.has(id)) {
          // Add to order if newly selected
          setMetricOrder(current => [...current, id]);
        }
        currentSelected.add(id);
      });
      
      const newSelected = Array.from(currentSelected);
      // Check if selection matches a preset
      checkForMatchingPreset(newSelected);
      return newSelected;
    });
  };
  
  // Handle deselecting all metrics in a category
  const deselectAllInCategory = (categoryId: string) => {
    const categoryMetricIds = new Set(
      metricCategories
        .find(c => c.id === categoryId)
        ?.metrics.map(m => m.id) || []
    );
    
    setSelectedMetrics(prev => {
      const newSelected = prev.filter(id => !categoryMetricIds.has(id));
      // Check if selection matches a preset
      checkForMatchingPreset(newSelected);
      return newSelected;
    });
  };
  
  // Handle selecting/deselecting all metrics
  const selectAll = () => {
    const allIds = allMetrics.map(m => m.id);
    setSelectedMetrics(allIds);
    setMetricOrder(allIds);
    // Reset active preset since this is a manual selection
    setActivePreset(null);
  };
  
  const deselectAll = () => {
    setSelectedMetrics([]);
    // Reset active preset
    setActivePreset(null);
  };
  
  // Apply preset configuration
  const applyPreset = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setSelectedMetrics(preset.metrics);
      setMetricOrder(preset.metrics);
      setActivePreset(presetId);
    }
  };
  
  // Handle drag and drop for reordering
  const handleDragStart = (metricId: string) => {
    setDraggedMetric(metricId);
  };
  
  const handleDragOver = (e: React.DragEvent, metricId: string) => {
    e.preventDefault();
    if (!draggedMetric || draggedMetric === metricId) return;
    
    // Reorder metrics in preview
    setMetricOrder(current => {
      const newOrder = [...current];
      const draggedIndex = newOrder.indexOf(draggedMetric);
      const targetIndex = newOrder.indexOf(metricId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        newOrder.splice(draggedIndex, 1);
        newOrder.splice(targetIndex, 0, draggedMetric);
      }
      
      return newOrder;
    });
  };
  
  const handleDragEnd = () => {
    setDraggedMetric(null);
    
    // Check if current order matches a preset
    const orderedSelection = metricOrder.filter(id => selectedMetrics.includes(id));
    checkForMatchingPreset(orderedSelection);
  };
  
  // Filter metrics based on search query
  const filteredCategories = searchQuery
    ? metricCategories.map(category => ({
        ...category,
        metrics: category.metrics.filter(metric =>
          metric.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          metric.description.toLowerCase().includes(searchQuery.toLowerCase())
        )
      })).filter(category => category.metrics.length > 0)
    : metricCategories;
    
  // Get ordered metrics for preview
  const orderedMetrics = metricOrder
    .filter(id => selectedMetrics.includes(id))
    .map(id => allMetrics.find(m => m.id === id))
    .filter(Boolean);
    
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 shadow-xl border-0">
        <motion.div
          initial="initial"
          animate="animate"
          exit="exit"
          variants={variants.scale}
          transition={{ 
            duration: 0.3,
            ease: easings.spring.out
          }}
          className="flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 bg-opacity-90 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-semibold text-slate-800 dark:text-slate-100">Customize Metrics</DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
                onClick={() => onOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Select which metrics you want to display on your dashboard
            </DialogDescription>
          </DialogHeader>
          
          {/* Search and Tabs */}
          <div className="px-6 pt-4 pb-2 flex flex-col gap-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Search metrics..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200"
              />
            </div>
            
            <div className="flex">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-100 dark:bg-slate-800 p-0.5">
                  <TabsTrigger value="categories" className="text-xs py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                    Categories
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="text-xs py-1.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700">
                    Preview
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Presets Section with Cards */}
            <div className="flex gap-2 overflow-x-auto py-1 pb-2 scrollbar-hide">
              {presets.map(preset => (
                <motion.div
                  key={preset.id}
                  onClick={() => applyPreset(preset.id)}
                  onMouseEnter={() => setShowTooltip(preset.id)}
                  onMouseLeave={() => setShowTooltip(null)}
                  className={`
                    flex flex-col items-center gap-1 px-3 py-2 rounded-lg shadow-sm
                    border border-slate-200 dark:border-slate-700
                    ${activePreset === preset.id 
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800' 
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700'}
                    cursor-pointer min-w-[80px] relative
                  `}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className={`
                    p-1.5 rounded-full 
                    ${activePreset === preset.id 
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}
                  `}>
                    {preset.icon}
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300 text-center">
                    {preset.name}
                  </span>
                  
                  {/* Tooltip */}
                  {showTooltip === preset.id && (
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 z-10 w-48">
                      <div className="bg-slate-800 text-white p-2 rounded-md text-xs shadow-lg">
                        {preset.description}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-slate-800"></div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
              
              {/* Selection controls */}
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <motion.button
                  onClick={selectAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Check className="w-3 h-3" />
                  Select All
                </motion.button>
                <motion.button
                  onClick={deselectAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full whitespace-nowrap"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <X className="w-3 h-3" />
                  Clear All
                </motion.button>
              </div>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} className="h-full">
              <TabsContent value="categories" className="mt-0 h-full overflow-auto">
                <div className="px-6 py-4 h-[320px] overflow-y-auto space-y-3">
                  {filteredCategories.length === 0 ? (
                    <div className="py-8 text-center">
                      <p className="text-slate-500 dark:text-slate-400 text-sm">No metrics found matching "{searchQuery}"</p>
                    </div>
                  ) : (
                    <motion.div
                      initial="hidden"
                      animate="show"
                      variants={stagger.container}
                      className="space-y-3"
                    >
                      {filteredCategories.map(category => (
                        <motion.div 
                          key={category.id} 
                          variants={stagger.item}
                          className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-sm"
                        >
                          <motion.div 
                            className="flex items-center justify-between cursor-pointer py-3 px-4"
                            onClick={() => toggleCategory(category.id)}
                            whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                            transition={{ duration: 0.2 }}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-md ${category.bgColor} dark:bg-opacity-20 dark:text-opacity-90`}>
                                {category.icon}
                              </div>
                              <h3 className="font-medium text-slate-800 dark:text-slate-200">{category.name}</h3>
                              <Badge variant="outline" className="ml-1 text-xs bg-slate-100 dark:bg-slate-700">
                                {category.metrics.filter(m => selectedMetrics.includes(m.id)).length}/
                                {category.metrics.length}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    selectAllInCategory(category.id);
                                  }}
                                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  All
                                </button>
                                <span className="text-slate-300 dark:text-slate-600">|</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deselectAllInCategory(category.id);
                                  }}
                                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                                >
                                  None
                                </button>
                              </div>
                              {expandedCategories.includes(category.id) ? (
                                <ChevronUp className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                              )}
                            </div>
                          </motion.div>
                          
                          <AnimatePresence>
                            {expandedCategories.includes(category.id) && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: easings.standard.easeInOut }}
                                className="px-4 pb-3 space-y-2 bg-slate-50 dark:bg-slate-800/50"
                              >
                                {category.metrics.map(metric => (
                                  <motion.div 
                                    key={metric.id}
                                    initial={{ x: -5, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className="relative"
                                  >
                                    <motion.div 
                                      className={`
                                        flex items-start p-3 rounded-md cursor-pointer group
                                        ${selectedMetrics.includes(metric.id) 
                                          ? 'bg-white dark:bg-slate-700 shadow-sm' 
                                          : 'hover:bg-white dark:hover:bg-slate-700'}
                                        border border-transparent hover:border-slate-200 dark:hover:border-slate-600
                                        transition-all duration-200
                                      `}
                                    >
                                      <Switch
                                        checked={selectedMetrics.includes(metric.id)}
                                        onCheckedChange={() => toggleMetric(metric.id)}
                                        className="mt-0.5 mr-3"
                                      />
                                      <div className={`mr-3 p-2 rounded-full flex-shrink-0 ${
                                        selectedMetrics.includes(metric.id) 
                                          ? category.bgColor 
                                          : 'bg-slate-100 dark:bg-slate-800'
                                      }`}>
                                        {metric.icon}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                            {metric.name}
                                          </span>
                                          {metric.isNew && (
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 text-[10px] px-1 py-0">NEW</Badge>
                                          )}
                                          {metric.isPremium && (
                                            <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800 text-[10px] px-1 py-0 flex items-center gap-0.5">
                                              <Sparkles className="w-2.5 h-2.5" />
                                              PREMIUM
                                            </Badge>
                                          )}
                                        </div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                                          {metric.description}
                                        </span>
                                      </div>
                                    </motion.div>
                                  </motion.div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="mt-0 h-full overflow-auto">
                <div className="px-6 py-4 h-[320px] overflow-y-auto">
                  <motion.div
                    className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-850 rounded-lg p-5 border border-slate-200 dark:border-slate-700 shadow-inner"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Dashboard Preview</h3>
                      {activePreset && (
                        <Badge 
                          className="bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 flex items-center gap-1"
                        >
                          {presets.find(p => p.id === activePreset)?.icon}
                          <span>{presets.find(p => p.id === activePreset)?.name} Preset</span>
                        </Badge>
                      )}
                    </div>
                    
                    {selectedMetrics.length === 0 ? (
                      <div className="py-10 text-center">
                        <div className="flex justify-center">
                          <Info className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">No metrics selected</p>
                        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Your dashboard will be empty</p>
                      </div>
                    ) : (
                      <motion.div 
                        className="grid grid-cols-2 gap-3"
                        variants={stagger.container}
                        initial="hidden"
                        animate="show"
                      >
                        {orderedMetrics.map((metric) => {
                          if (!metric) return null;
                          
                          return (
                            <motion.div 
                              key={metric.id}
                              className={`
                                border rounded-md p-3 bg-white dark:bg-slate-800 flex items-center gap-3
                                hover:shadow-md transition-all cursor-move relative
                                ${draggedMetric === metric.id ? 'opacity-50 ring-2 ring-blue-500' : ''}
                                border-slate-200 dark:border-slate-700
                              `}
                              draggable
                              onDragStart={() => handleDragStart(metric.id)}
                              onDragOver={(e) => handleDragOver(e, metric.id)}
                              onDragEnd={handleDragEnd}
                              whileHover={{ y: -3, boxShadow: '0 4px 12px -1px rgba(0, 0, 0, 0.1)' }}
                              variants={stagger.item}
                            >
                              <div className={`p-2.5 rounded-full ${metric.categoryBgColor} dark:bg-opacity-20`}>
                                {metric.icon}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">{metric.name}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">{metric.categoryName}</div>
                              </div>
                              {metric.isNew && (
                                <Badge variant="outline" className="absolute top-1 right-1 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800 text-[10px] px-1 py-0">NEW</Badge>
                              )}
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                    
                    <div className="mt-4 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Activity className="w-3 h-3" />
                      <p>Drag and drop metrics to rearrange them on your dashboard</p>
                    </div>
                  </motion.div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800 dark:to-slate-900 flex justify-between items-center">
            <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700">
                {selectedMetrics.length} metrics selected
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="h-9 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </Button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  onClick={() => {
                    // Save both selection and order
                    const orderedSelection = metricOrder.filter(id => selectedMetrics.includes(id));
                    onSave(orderedSelection);
                    onOpenChange(false);
                  }}
                  className="flex items-center gap-2 h-9 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium px-5 shadow-md hover:shadow-lg dark:shadow-blue-900/20 rounded-md relative overflow-hidden"
                >
                  <span className="relative z-10">Save Changes</span>
                  <ArrowRight className="w-3.5 h-3.5 relative z-10" />
                  <motion.div
                    className="absolute inset-0 bg-white opacity-0"
                    whileHover={{ opacity: 0.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default MetricCustomizationModal; 