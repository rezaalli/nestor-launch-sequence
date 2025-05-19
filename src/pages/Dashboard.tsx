import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Bell, ArrowUp, ClipboardList, ChevronDown, ChevronRight, Grid3x3, RefreshCw, Move, Cog, Brain, Zap, Activity, TrendingUp, Award, Signal, Heart, Moon, Sun, Utensils, Flame, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useUser } from "@/contexts/UserContext";
import { useML } from "@/hooks/useML";
import { useCloudSync } from "@/hooks/useCloudSync";
import { mlModelSync, syncAllData } from "@/utils/mlSyncUtils";
import { HealthDataSeries } from "@/lib/ml/feature-extraction/AdvancedInsightsEngine";
import { networkStatus } from "@/utils/networkUtils";
import StatusBar from '@/components/StatusBar';
import BottomNavbar from '@/components/BottomNavbar';
import EcgAlertDialog from '@/components/EcgAlertDialog';
import HeartRateAlertDialog from '@/components/HeartRateAlertDialog';
import HealthMetrics from '@/components/HealthMetrics';
import ReadinessScore from '@/components/ReadinessScore';
import WeeklyTrendChart from '@/components/WeeklyTrendChart';
import DeviceStatus from '@/components/DeviceStatus';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleSkeletonLoader as Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { connectToDevice, startFlashLogUpload, isFlashLogUploadInProgress } from '@/utils/bleUtils';
import { formatTemperature } from '@/utils/formatUtils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import DailyAssessmentModal from '@/components/DailyAssessmentModal';

// Import our new components
import TriMetricSystem, { MetricDetail } from '@/components/TriMetricSystem';
import DailyStatusCard from '@/components/DailyStatusCard';
import { InteractiveMetricCard } from '@/components/ui/interactive-metric-card';
import { MacroNutritionCard } from '@/components/ui/macro-nutrition-card';
import { CircularProgress } from '@/components/ui/circular-progress';
import { OfflineIndicator } from '@/components/ui/offline-indicator';

// Daily goals interface
interface DailyGoals {
  steps: {
    target: number;
    current: number;
  };
  water: {
    target: number;
    current: number;
  };
  sleep: {
    target: number;
    current: number;
  };
  activity: {
    target: number;
    current: number;
  };
}

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addNotification, showEcgAlert } = useNotifications();
  const { user } = useUser();
  const { predict, isLoading: mlLoading, generateAdvancedInsights } = useML();
  const { 
    sync, 
    isSyncing, 
    lastSyncTime, 
    connectionQuality,
    connectionQualityLabel,
    enableAutoSync, 
    disableAutoSync, 
    autoSyncEnabled,
    autoSyncInterval,
    offlineMode,
    offlineDataSize,
    sync: syncData
  } = useCloudSync();
  
  const [loading, setLoading] = useState(true);
  const [showEcgDialog, setShowEcgDialog] = useState(false);
  const [showHeartRateDialog, setShowHeartRateDialog] = useState(false);
  const [currentHeartRate, setCurrentHeartRate] = useState(72);
  const [gridLayout, setGridLayout] = useState<'3x2' | '2x3'>(() => {
    // Check if the user has a saved preference
    const savedLayout = localStorage.getItem('metricsLayout');
    return (savedLayout === '3x2' ? '3x2' : '2x3') as '3x2' | '2x3';
  });
  const [customizeMode, setCustomizeMode] = useState(false);
  const [showMetricsDialog, setShowMetricsDialog] = useState(false);
  const [availableMetrics, setAvailableMetrics] = useState({
    heartRate: true,
    spo2: true,
    ecg: true,
    temperature: true,
    // Additional metrics that can be added
    hrv: false,
    respiratoryRate: false,
    steps: false,
    caloriesBurned: false,
    macronutrients: false // Added new macronutrients metric option
  });
  
  const [dailyGoals, setDailyGoals] = useState<DailyGoals>({
    steps: { target: 10000, current: 7230 },
    water: { target: 8, current: 5 },
    sleep: { target: 8, current: 7.2 },
    activity: { target: 30, current: 15 }
  });
  
  // New state for ML sync status
  const [mlSyncStatus, setMlSyncStatus] = useState({
    availableUpdates: 0,
    lastSyncTime: null as Date | null,
    syncInProgress: false
  });
  
  // Sample data for tri-metric system
  const [triMetricData, setTriMetricData] = useState({
    overall: {
      label: "Health",
      value: 80,
      changePercent: 2,
      changeDirection: 'up' as const,
      status: 'success' as const,
      icon: <Activity className="h-4 w-4 text-blue-600" />,
      details: [
        { label: "Vital Signs", value: "Excellent", info: "Blood pressure, heart rate, etc." },
        { label: "Physical Wellness", value: "85/100", info: "Overall physical condition" },
        { label: "Mental Wellness", value: "78/100", info: "Mental and cognitive health" },
        { label: "Metabolic Health", value: "Good", info: "Metabolic markers and functionality" },
      ],
    },
    recovery: {
      label: "Recovery",
      value: 78,
      changePercent: 3,
      changeDirection: 'up' as const,
      status: 'info' as const,
      icon: <Heart className="h-4 w-4 text-red-600" />,
      details: [
        { label: "Resting HR", value: "58 bpm", info: "Average resting heart rate" },
        { label: "HRV", value: "65 ms", info: "Heart rate variability" },
        { label: "Recovery rate", value: "Good", info: "Your body's recovery state" },
        { label: "Readiness", value: "78/100", info: "Overall readiness score" },
      ],
    },
    activity: {
      label: "Activity",
      value: 65,
      changePercent: 8,
      changeDirection: 'down' as const,
      status: 'warning' as const,
      icon: <Zap className="h-4 w-4 text-amber-600" />,
      details: [
        { label: "Steps", value: "7,230", info: "Total steps today" },
        { label: "Active minutes", value: "45 min", info: "Minutes of activity" },
        { label: "Calories", value: "320 kcal", info: "Active calories burned" },
        { label: "Target", value: "65%", info: "Percent of daily goal" },
      ],
    }
  });
  
  // Simulated real-time metrics for updates
  const [realtimeMetrics, setRealtimeMetrics] = useState({
    heartRate: {
      current: 68,
      previous: 64,
      trend: 'up' as const
    },
    temperature: {
      current: 98.6,
      previous: 98.4,
      trend: 'up' as const
    },
    spo2: {
      current: 98,
      previous: 98,
      trend: 'flat' as const
    },
    hrv: {
      current: 65,
      previous: 63,
      trend: 'up' as const
    },
    // New metrics added
    respiratoryRate: {
      current: 16,
      previous: 15,
      trend: 'up' as const
    },
    steps: {
      current: 7230,
      previous: 6980,
      trend: 'up' as const
    },
    caloriesBurned: {
      current: 320,
      previous: 305,
      trend: 'up' as const
    },
    macronutrients: {
      current: 75,
      previous: 70,
      trend: 'up' as const
    },
    ecg: {
      current: "Normal",
      previous: "Normal",
      trend: 'flat' as const
    }
  });
  
  // Sample nutrition data for the combined macros and calories card
  const [nutritionData, setNutritionData] = useState({
    calories: {
      consumed: 1542,
      target: 2000
    },
    protein: {
      consumed: 78,
      target: 120
    },
    carbs: {
      consumed: 165,
      target: 200
    },
    fat: {
      consumed: 42,
      target: 65
    }
  });
  
  // Flag to show when a metric has been updated
  const [updatedMetric, setUpdatedMetric] = useState<string | null>(null);
  
  // Create a ref for the metrics container
  const metricsGridRef = useRef<HTMLDivElement>(null);

  // Active metrics to show (filtered from availableMetrics)
  const [activeMetrics, setActiveMetrics] = useState<string[]>([]);
  
  // Add new state for Daily Assessment modal
  const [showDailyAssessmentModal, setShowDailyAssessmentModal] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Simulate real-time metric updates
  useEffect(() => {
    // Only start the simulation after the component is loaded
    if (loading) return;
    
    const simulateMetricUpdate = () => {
      // Choose a random metric to update from all possible metrics
      const metrics = Object.keys(realtimeMetrics);
      const randomMetric = metrics[Math.floor(Math.random() * metrics.length)];
      
      // Update the chosen metric with a small random change
      setRealtimeMetrics(prev => {
        const current = prev[randomMetric as keyof typeof prev];
        
        // Generate a small random change
        let change = 0;
        switch (randomMetric) {
          case 'heartRate':
            change = Math.floor(Math.random() * 5) - 2; // -2 to +2
            break;
          case 'temperature':
            change = Math.round((Math.random() * 0.4 - 0.2) * 10) / 10; // -0.2 to +0.2
            break;
          case 'spo2':
            change = Math.floor(Math.random() * 3) - 1; // -1 to +1
            break;
          case 'hrv':
            change = Math.floor(Math.random() * 7) - 3; // -3 to +3
            break;
          case 'respiratoryRate':
            change = Math.floor(Math.random() * 3) - 1; // -1 to +1
            break;
          case 'steps':
            change = Math.floor(Math.random() * 300) - 100; // -100 to +200
            break;
          case 'caloriesBurned':
            change = Math.floor(Math.random() * 20) - 5; // -5 to +15
            break;
          case 'macronutrients':
            change = Math.floor(Math.random() * 10) - 3; // -3 to +7
            break;
          case 'ecg':
            // For ECG, we'll just keep it as "Normal" most of the time
            return prev; // No change for ECG
        }
        
        // Handle string/number types for current property
        if (typeof current.current === 'string') {
          // For string values like ECG, we don't change them randomly
          return prev;
        }
        
        // Calculate new value and determine trend
        const newValue = 
          randomMetric === 'temperature' 
            ? Math.round((current.current as number + change) * 10) / 10 
            : Math.round((current.current as number) + change);
        
        const trend = 
          newValue > (current.current as number)
            ? 'up' as const 
            : newValue < (current.current as number)
              ? 'down' as const 
              : 'flat' as const;
        
        // Update the metric
        return {
          ...prev,
          [randomMetric]: {
            previous: current.current,
            current: newValue,
            trend
          }
        };
      });
      
      // Set the updated metric to trigger animations
      setUpdatedMetric(randomMetric);
      
      // Clear the updated metric flag after animation completes
      setTimeout(() => {
        setUpdatedMetric(null);
      }, 2000);
    };
    
    // Simulate updates every 10-30 seconds
    const intervalTime = Math.floor(Math.random() * 20000) + 10000;
    const intervalId = setInterval(simulateMetricUpdate, intervalTime);
    
    return () => clearInterval(intervalId);
  }, [loading]);

  // Load metrics preferences - load only once on component mount
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem('metricsPreferences');
      if (savedPreferences) {
        const parsedMetrics = JSON.parse(savedPreferences);
        setAvailableMetrics(prev => ({
          ...prev,
          ...parsedMetrics
        }));
      }
    } catch (e) {
      console.error('Error loading metrics preferences:', e);
    }
  }, []); // Empty dependency array = only run once on mount
  
  // Update activeMetrics whenever availableMetrics changes
  useEffect(() => {
    const enabledMetrics = Object.entries(availableMetrics)
      .filter(([_, enabled]) => enabled)
      .map(([key]) => key);
    setActiveMetrics(enabledMetrics);
  }, [availableMetrics]);
  
  // Toggle customize mode for metrics
  const toggleCustomizeMode = () => {
    setCustomizeMode(prev => !prev);
  };
  
  // Handle health alerts
  const handleHealthAlert = (type: 'ecg' | 'heartRate' | 'spo2' | 'temperature', data?: any) => {
    if (type === 'ecg') {
      setShowEcgDialog(true);
    } else if (type === 'heartRate') {
      setCurrentHeartRate(data?.value || 72);
      setShowHeartRateDialog(true);
    }
  };
  
  const handleDailyAssessment = () => {
    // Open the modal directly instead of navigating to a separate page
    setShowDailyAssessmentModal(true);
    
    toast({
      title: "Daily Assessment",
      description: "Complete your daily wellness assessment.",
      variant: "default",
      duration: 5000 // Auto-dismiss after 5 seconds
    });
  };
  
  const handleTakeEcg = () => {
    // Logic to initiate ECG reading
    toast({
      title: "ECG Recording Started",
      description: "Please keep your fingers on the electrodes for 30 seconds.",
      duration: 5000 // Auto-dismiss after 5 seconds
    });
    setShowEcgDialog(false);
  };
  
  const handleDismissEcg = () => {
    setShowEcgDialog(false);
  };

  const handleMonitorHeartRate = () => {
    // Logic to initiate continuous heart rate monitoring
    toast({
      title: "Heart Rate Monitoring Started",
      description: "We'll notify you if your heart rate goes above or below your normal range.",
      duration: 5000 // Auto-dismiss after 5 seconds
    });
    setShowHeartRateDialog(false);
  };
  
  const handleDismissHeartRate = () => {
    setShowHeartRateDialog(false);
  };
  
  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  // Handle sync
  const handleSyncNow = async () => {
    if (isSyncing) return;
    
    toast({
      title: "Syncing Data",
      description: "Your health data is being synchronized with the cloud.",
      duration: 5000 // Auto-dismiss after 5 seconds
    });
    
    try {
      // Use syncData (renamed from sync in the destructuring)
      await syncData();
      
      // Also sync ML models
      setMlSyncStatus(prev => ({ ...prev, syncInProgress: true }));
      await syncAllData();
      
      const updateStatus = await mlModelSync.checkForUpdates();
      setMlSyncStatus({
        availableUpdates: updateStatus.modelCount,
        lastSyncTime: new Date(),
        syncInProgress: false
      });
      
      toast({
        title: "Sync Complete",
        description: "Your data has been successfully synchronized.",
        variant: "default",
        duration: 5000 // Auto-dismiss after 5 seconds
      });
    } catch (error) {
      console.error("Sync error:", error);
      
      toast({
        title: "Sync Failed",
        description: "There was an error synchronizing your data. Please try again later.",
        variant: "destructive",
        duration: 5000 // Auto-dismiss after 5 seconds
      });
      
      setMlSyncStatus(prev => ({ ...prev, syncInProgress: false }));
    }
  };
  
  // Save metrics preferences
  const saveMetricsPreferences = () => {
    try {
      localStorage.setItem('metricsPreferences', JSON.stringify(availableMetrics));
      setShowMetricsDialog(false);
      
      // Update the active metrics immediately after saving
      const enabledMetrics = Object.entries(availableMetrics)
        .filter(([_, enabled]) => enabled)
        .map(([key]) => key);
      setActiveMetrics(enabledMetrics);
      
      toast({
        title: "Preferences Saved",
        description: "Your dashboard metrics preferences have been updated.",
        variant: "default",
        duration: 5000 // Auto-dismiss after 5 seconds
      });
    } catch (e) {
      console.error('Error saving metrics preferences:', e);
      
      toast({
        title: "Save Failed",
        description: "There was an error saving your preferences.",
        variant: "destructive",
        duration: 5000 // Auto-dismiss after 5 seconds
      });
    }
  };
  
  // Check for ML model updates
  useEffect(() => {
    const checkForModelUpdates = async () => {
      try {
        const updateStatus = await mlModelSync.checkForUpdates();
        setMlSyncStatus(prev => ({
          ...prev,
          availableUpdates: updateStatus.modelCount,
          lastSyncTime: mlModelSync.getModelSyncStatus().lastSyncTime
        }));
      } catch (error) {
        console.error('Error checking for ML model updates:', error);
      }
    };
    
    // Check for updates on mount
    checkForModelUpdates();
    
    // Set up an interval to check for updates periodically
    const updateCheckInterval = setInterval(checkForModelUpdates, 3600000); // Every hour
    
    return () => {
      clearInterval(updateCheckInterval);
    };
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-24 h-24 mb-8">
          <img 
            className="w-full h-full" 
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/58cdf9e9fa-b129f3f632a0845a007d.png" 
            alt="Nestor logo" 
          />
        </div>
      </div>
    );
  }

  // Helper function for temperature conversion
  const formatTempWithUserPref = (celsius: number): { value: string, unit: string } => {
    const unitPreference = user?.unitPreference || 'imperial';
    return formatTemperature(celsius, unitPreference);
  };

  // Get formatted temperature for display
  const tempDisplay = formatTempWithUserPref(36.7);

  // Calculate goal progress
  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  // Function to render metrics with appropriate icons and units
  const renderMetricCard = (metric: string) => {
    // Special case for combined calories and macros
    if (metric === 'macronutrients' || metric === 'caloriesBurned') {
      if (activeMetrics.includes('macronutrients') && activeMetrics.includes('caloriesBurned')) {
        // We only want to render this once when both metrics are active
        if (metric === 'macronutrients') {
          return (
            <MacroNutritionCard
              key="nutrition-combined"
              className="col-span-2" // Take up full width
              calories={nutritionData.calories}
              protein={nutritionData.protein}
              carbs={nutritionData.carbs}
              fat={nutritionData.fat}
              isNew={true}
              updated={updatedMetric === 'macronutrients' || updatedMetric === 'caloriesBurned'}
            />
          );
        } else {
          // Skip rendering caloriesBurned separately as it's included in the combined card
          return null;
        }
      }
    }

    const metricData = realtimeMetrics[metric as keyof typeof realtimeMetrics];
    
    // Set defaults based on metric type
    let icon = <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />;
    let title = metric.charAt(0).toUpperCase() + metric.slice(1);
    let unit = "";
    let trendLabel = "";
    let status: "neutral" | "success" | "warning" | "error" | "info" = "neutral";
    let isExpandable = false;
    let isNew = false;
    
    // Configure based on metric type
    switch(metric) {
      case 'heartRate':
        title = "Heart Rate";
        icon = <Heart className="h-4 w-4 text-red-600 dark:text-red-400" />;
        unit = "bpm";
        trendLabel = "bpm";
        status = "warning";
        isExpandable = true;
        break;
      case 'temperature':
        title = "Temperature";
        icon = <Sun className="h-4 w-4 text-amber-600" />;
        unit = "°F";
        trendLabel = "°F";
        status = "neutral";
        isExpandable = true;
        break;
      case 'spo2':
        title = "Blood Oxygen";
        icon = <Activity className="h-4 w-4 text-blue-600" />;
        unit = "%";
        trendLabel = "%";
        status = "success";
        isExpandable = true;
        break;
      case 'hrv':
        title = "HRV";
        icon = <TrendingUp className="h-4 w-4 text-purple-600" />;
        unit = "ms";
        trendLabel = "ms";
        status = "success";
        isNew = true;
        break;
      case 'respiratoryRate':
        title = "Respiratory Rate";
        icon = <Activity className="h-4 w-4 text-green-600" />;
        unit = "bpm";
        trendLabel = "bpm";
        status = "info";
        isNew = true;
        break;
      case 'steps':
        title = "Steps";
        icon = <Zap className="h-4 w-4 text-blue-600" />;
        unit = "";
        trendLabel = "";
        status = "success";
        break;
      case 'caloriesBurned':
        title = "Calories";
        icon = <Flame className="h-4 w-4 text-amber-600" />;
        unit = "kcal";
        trendLabel = "kcal";
        status = "info";
        break;
      case 'macronutrients':
        title = "Nutrition";
        icon = <Utensils className="h-4 w-4 text-purple-600" />;
        unit = "%";
        trendLabel = "%";
        status = "neutral";
        isNew = true;
        break;
      case 'ecg':
        title = "ECG Status";
        icon = <Heart className="h-4 w-4 text-red-600" />;
        status = "neutral";
        isExpandable = true;
        break;
    }
    
    // Calculate trend value safely
    let trendValue = "±0";
    // Only do math operations if both values are numbers
    if (typeof metricData.current === 'number' && typeof metricData.previous === 'number') {
      const diff = Math.abs(metricData.current - metricData.previous);
      // Format differently based on metric type
      if (metric === 'temperature') {
        trendValue = `${metricData.trend === 'flat' ? '±' : metricData.trend === 'up' ? '+' : '-'}${diff.toFixed(1)}`;
      } else {
        trendValue = `${metricData.trend === 'flat' ? '±' : metricData.trend === 'up' ? '+' : '-'}${diff}`;
      }
    }
    
    return (
      <InteractiveMetricCard
        key={metric}
        title={title}
        value={metricData.current}
        previousValue={updatedMetric === metric ? metricData.previous : undefined}
        icon={icon}
        trend={metricData.trend}
        trendValue={trendValue}
        trendLabel={trendLabel}
        unit={unit}
        status={status}
        updated={updatedMetric === metric}
        isExpandable={isExpandable}
        isNew={isNew}
        onExpand={() => {
          if (isExpandable) {
            handleHealthAlert(metric as 'ecg' | 'heartRate' | 'spo2' | 'temperature', 
              { value: metricData.current });
          }
        }}
      />
    );
  };

  return (
    <>
      <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-slate-950">
        <StatusBar />
        
        {/* Header */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm relative z-10">
          <div className="flex items-center">
            {user ? (
              <Avatar className="w-10 h-10 mr-3 border-2 border-white dark:border-slate-800 shadow-sm">
                {user.avatar ? (
                  <AvatarImage src={user.avatar} alt={user.name || 'User'} />
                ) : (
                  <AvatarFallback className="bg-brand-blue-100 text-brand-blue-700 dark:bg-slate-800 dark:text-slate-300">
                    {user.name ? user.name.substring(0, 2).toUpperCase() : 'U'}
                  </AvatarFallback>
                )}
              </Avatar>
            ) : (
              <Avatar className="w-10 h-10 mr-3 border-2 border-white dark:border-slate-800 shadow-sm">
                <AvatarFallback className="bg-brand-blue-100 text-brand-blue-700 dark:bg-slate-800 dark:text-slate-300">?</AvatarFallback>
              </Avatar>
            )}
            <div>
              <h2 className="text-lg font-medium text-nestor-gray-900 dark:text-slate-200">
                {user ? `Hi, ${user.name || 'User'}` : 'Welcome'}
              </h2>
              <DeviceStatus compact={true} />
            </div>
          </div>
          <button 
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
            onClick={handleNotificationsClick}
          >
            <Bell className="text-nestor-gray-700 dark:text-slate-300" size={18} />
          </button>
        </div>
        
        {/* Daily Wellness Assessment Button - Prominently displayed */}
        <div className="px-6 pt-4 pb-4">
          <Button 
            className="w-full py-6 shadow-sm flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white"
            onClick={handleDailyAssessment}
          >
            <ClipboardList size={18} />
            Daily Wellness Assessment
          </Button>
        </div>
        
        {/* Offline Mode banner */}
        {offlineMode && (
          <div className="px-4 py-2 mb-2">
            <OfflineIndicator
              offlineMode={offlineMode}
              connectionQuality={connectionQuality}
              offlineDataSize={offlineDataSize}
              onSyncNow={handleSyncNow}
              className="w-full"
            />
          </div>
        )}
        
        {/* Sync Button */}
        <div className="px-6 py-3 bg-white dark:bg-slate-900 border-t border-neutral-100 dark:border-slate-800 shadow-sm">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 border-neutral-200 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            onClick={handleSyncNow}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
        
        {/* Main Dashboard Content */}
        <div className="flex-1 p-4 pb-20 space-y-5">
          {/* Tri-Metric System */}
          <TriMetricSystem 
            metrics={triMetricData}
          />
          
          {/* Daily Status Card with Insights Preview */}
          <DailyStatusCard 
            onViewAllClick={() => navigate('/insights')}
          />
          
          {/* Interactive Real-time Metrics */}
          <div>
          <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-neutral-500 dark:text-slate-400">REAL-TIME METRICS</h3>
            <button 
                className={`flex items-center text-xs gap-1 font-medium py-1 px-2 rounded ${
                  customizeMode ? 
                  'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300' : 
                  'bg-brand-blue-50 text-brand-blue-600 dark:bg-brand-blue-900 dark:text-brand-blue-300'
                }`}
              onClick={customizeMode ? toggleCustomizeMode : () => setShowMetricsDialog(true)}
            >
              {customizeMode ? (
                <>Done</>
              ) : (
                  <>
                    <Cog size={12} />
                    Customize
                  </>
              )}
            </button>
          </div>
          
            <div className="grid grid-cols-2 gap-3" ref={metricsGridRef}>
              {activeMetrics.map((metric) => renderMetricCard(metric))}
            </div>
        </div>
        
        {/* Weekly Trends Preview */}
        <div>
        <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-neutral-500 dark:text-slate-400">WEEKLY TRENDS</h3>
        </div>
        
        {/* WeeklyTrendChart with key to force re-render when needed */}
          <Card variant="default">
            <CardContent className="pt-4">
      <WeeklyTrendChart 
        key="dashboard-trend-chart"
        dataType="heartRate" 
        days={7} 
        allowMetricChange={true}
      />
          </CardContent>
        </Card>
        </div>
      </div>
      
      <BottomNavbar />
    </div>
    
    {/* Dialog Modal Customizations - Dark mode enhancements */}
    <Dialog open={showMetricsDialog} onOpenChange={setShowMetricsDialog}>
      <DialogContent className="sm:max-w-[425px] dark:bg-slate-900 dark:border-slate-800">
        <DialogHeader>
          <DialogTitle className="dark:text-slate-200">Customize Metrics</DialogTitle>
          <DialogDescription className="dark:text-slate-400">
            Select which metrics you want to display on your dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-4">
            {Object.entries(availableMetrics).map(([key, value]) => (
              <div className="flex items-center space-x-2" key={key}>
                <Checkbox 
                  id={`metric-${key}`}
                  checked={value}
                  onCheckedChange={(checked) => {
                    setAvailableMetrics(prev => ({
                      ...prev,
                      [key]: checked === true
                    }));
                  }}
                />
                <label
                  htmlFor={`metric-${key}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-slate-300"
                >
                  {key === 'heartRate' ? 'Heart Rate' : 
                   key === 'spo2' ? 'Blood Oxygen (SpO₂)' : 
                   key === 'ecg' ? 'ECG' : 
                   key === 'hrv' ? 'Heart Rate Variability' :
                   key === 'respiratoryRate' ? 'Respiratory Rate' :
                   key === 'steps' ? 'Steps' :
                   key === 'caloriesBurned' ? 'Calories Burned' :
                   key === 'macronutrients' ? 'Macronutrients' :
                   key === 'temperature' ? 'Temperature' : key}
                </label>
              </div>
            ))}
            
            {/* Note about combined view */}
            {availableMetrics.caloriesBurned && availableMetrics.macronutrients && (
              <div className="mt-4 text-xs bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                <div className="flex items-start">
                  <Info className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span>
                    Calories and Macronutrients will be displayed together in a combined nutrition card.
                  </span>
                </div>
          </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" 
            onClick={() => setShowMetricsDialog(false)}
            className="dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button onClick={saveMetricsPreferences} className="dark:bg-brand-blue-700 dark:hover:bg-brand-blue-600">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    
    {/* ECG Alert Dialog */}
    <EcgAlertDialog
      open={showEcgDialog}
      onDismiss={handleDismissEcg} 
      onTakeEcg={handleTakeEcg}
      onOpenChange={setShowEcgDialog}
    />

    {/* Heart Rate Alert Dialog */}
    <HeartRateAlertDialog
      open={showHeartRateDialog}
      onDismiss={handleDismissHeartRate}
      onMonitor={handleMonitorHeartRate}
      heartRate={currentHeartRate}
      onOpenChange={setShowHeartRateDialog}
    />

    {/* Daily Assessment Modal */}
    <DailyAssessmentModal
      isOpen={showDailyAssessmentModal}
      onClose={() => setShowDailyAssessmentModal(false)}
      onSave={(assessmentData) => {
        // Refresh dashboard data after assessment
        setShowDailyAssessmentModal(false);
        
        // Show success toast
        toast({
          title: "Assessment Completed",
          description: "Your daily assessment has been saved.",
          variant: "success",
          duration: 5000 // Auto-dismiss after 5 seconds
        });
      }}
    />
  </>
);
};

// For demo purposes - would normally come from the backend
const readinessScore = 78;

export default Dashboard;
