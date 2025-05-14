
import React, { useEffect, useState, useRef } from 'react';
import { Bell, ArrowUp, ClipboardList, ChevronDown, Grid3x3, RefreshCw, Move, Cog } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useUser } from "@/contexts/UserContext";
import StatusBar from '@/components/StatusBar';
import BottomNavbar from '@/components/BottomNavbar';
import EcgAlertDialog from '@/components/EcgAlertDialog';
import HeartRateAlertDialog from '@/components/HeartRateAlertDialog';
import HealthMetrics from '@/components/HealthMetrics';
import ReadinessScore from '@/components/ReadinessScore';
import WeeklyTrendChart from '@/components/WeeklyTrendChart';
import DeviceStatus from '@/components/DeviceStatus';
import { Button } from '@/components/ui/button';
import { connectToDevice, startFlashLogUpload, isFlashLogUploadInProgress } from '@/utils/bleUtils';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addNotification, showEcgAlert } = useNotifications();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [showEcgDialog, setShowEcgDialog] = useState(false);
  const [showHeartRateDialog, setShowHeartRateDialog] = useState(false);
  const [currentHeartRate, setCurrentHeartRate] = useState(72);
  const [gridLayout, setGridLayout] = useState<'3x2' | '2x3'>(() => {
    // Check if the user has a saved preference
    const savedLayout = localStorage.getItem('metricsLayout');
    return (savedLayout === '3x2' ? '3x2' : '2x3') as '3x2' | '2x3';
  });
  const [isSyncing, setIsSyncing] = useState(false);
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
  
  // Create a ref for the metrics container
  const metricsGridRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Remove welcome toast - as per user request
    // Simulate loading splash screen
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [toast]);
  
  // Toggle customize mode instead of grid layout
  const toggleCustomizeMode = () => {
    const newMode = !customizeMode;
    setCustomizeMode(newMode);
    
    if (newMode) {
      toast({
        title: "Customize Mode",
        description: "Drag and drop metrics to rearrange them",
      });
    } else {
      toast({
        title: "Changes Saved",
        description: "Your metrics layout has been updated",
      });
    }
  };
  
  // Function to handle health alerts - only to be triggered by actual data events
  // NOT manually triggered for testing purposes anymore
  const handleHealthAlert = (type: 'ecg' | 'heartRate' | 'spo2' | 'temperature', data?: any) => {
    if (type === 'ecg') {
      setShowEcgDialog(true);
    } else if (type === 'heartRate') {
      setCurrentHeartRate(data?.heartRate || Math.floor(Math.random() * 30) + 100);
      setShowHeartRateDialog(true);
    }
    // For other types, we'd dispatch custom events that would be caught by HealthAlertsManager
  };
  
  const handleLifestyleCheckIn = () => {
    navigate("/dailyassessment");
  };
  
  const handleTakeEcg = () => {
    // This would navigate to an ECG recording screen in a real app
    toast({
      title: "ECG Recording",
      description: "Navigating to ECG recording screen...",
    });
    setShowEcgDialog(false);
  };
  
  const handleDismissEcg = () => {
    setShowEcgDialog(false);
  };

  const handleMonitorHeartRate = () => {
    // This would navigate to a heart rate monitoring screen in a real app
    toast({
      title: "Heart Rate Monitoring",
      description: "Navigating to heart rate monitoring screen...",
    });
    setShowHeartRateDialog(false);
  };
  
  const handleDismissHeartRate = () => {
    setShowHeartRateDialog(false);
  };
  
  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  const handleViewAllTrends = () => {
    navigate('/trends');
  };
  
  const handleSyncNow = async () => {
    if (isFlashLogUploadInProgress() || isSyncing) {
      toast({
        title: "Sync in progress",
        description: "Please wait for the current sync to complete",
      });
      return;
    }
    
    setIsSyncing(true);
    
    try {
      // First reconnect to the device if necessary
      const connected = await connectToDevice();
      
      if (connected) {
        // Then start the flash log upload
        const result = await startFlashLogUpload();
        
        if (result) {
          toast({
            title: "Sync started",
            description: "Your device is syncing new data",
          });
        } else {
          toast({
            title: "Sync failed",
            description: "Could not start syncing data from your device",
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Connection failed",
          description: "Unable to connect to your Nestor device",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync error",
        description: "An error occurred while syncing",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };
  
  // Save metrics preferences
  const saveMetricsPreferences = () => {
    localStorage.setItem('metricsPreferences', JSON.stringify(availableMetrics));
    setShowMetricsDialog(false);
    
    toast({
      title: "Metrics Updated",
      description: "Your metrics preferences have been saved",
    });
  };
  
  // Load saved metrics preferences
  useEffect(() => {
    const savedMetrics = localStorage.getItem('metricsPreferences');
    if (savedMetrics) {
      try {
        const parsedMetrics = JSON.parse(savedMetrics);
        setAvailableMetrics(prevMetrics => ({
          ...prevMetrics,
          ...parsedMetrics
        }));
      } catch (e) {
        console.error('Error loading metrics preferences:', e);
      }
    }
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
  const formatTemperature = (celsius: number): { value: string, unit: string } => {
    if (user.unitPreference === 'imperial') {
      const fahrenheit = (celsius * 9/5) + 32;
      return { value: fahrenheit.toFixed(1), unit: '°F' };
    }
    return { value: celsius.toString(), unit: '°C' };
  };

  // Get formatted temperature for display
  const tempDisplay = formatTemperature(36.7);

  return (
    <>
      <div className="min-h-screen flex flex-col bg-white">
        <StatusBar />
        
        {/* Header */}
        <div className="px-6 pt-4 pb-2 flex items-center justify-between">
          <div className="flex items-center">
            <img 
              src={user.avatar} 
              alt="Profile" 
              className="w-10 h-10 rounded-full mr-3" 
            />
            <div>
              <h2 className="text-lg font-medium text-nestor-gray-900">Hi, {user.name}</h2>
              <DeviceStatus compact={true} />
            </div>
          </div>
          <button 
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            onClick={handleNotificationsClick}
          >
            <Bell className="text-nestor-gray-700" size={18} />
          </button>
        </div>
        
        {/* Sync Button */}
        <div className="px-6 mt-2">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
            onClick={handleSyncNow}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
        
        {/* Enhanced Readiness Score Card */}
        <ReadinessScore className="mx-6 mt-4" />
        
        {/* Real-time Metrics */}
        <div className="px-6 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-nestor-gray-500">REAL-TIME METRICS</h3>
            <button 
              className={`w-8 h-8 flex items-center justify-center rounded-full ${customizeMode ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-blue-900'}`}
              onClick={customizeMode ? toggleCustomizeMode : () => setShowMetricsDialog(true)}
            >
              {customizeMode ? (
                <>Done</>
              ) : (
                <Cog size={16} />
              )}
            </button>
          </div>
          
          {/* Health Metrics component */}
          <HealthMetrics 
            customizeMode={customizeMode} 
            availableMetrics={availableMetrics}
          />
        </div>
        
        {/* Daily Wellness Survey Button */}
        <button 
          className="mx-6 mt-6 py-3.5 bg-blue-900 text-white font-medium rounded-lg flex items-center justify-center"
          onClick={handleLifestyleCheckIn}
        >
          <ClipboardList className="mr-2" size={18} />
          Daily Wellness Assessment
        </button>
        
        {/* Trends Preview */}
        <div className="px-6 mt-6 pb-20">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-nestor-gray-500">WEEKLY TRENDS</h3>
            <span 
              className="text-xs text-blue-900 font-medium cursor-pointer"
              onClick={handleViewAllTrends}
            >
              View All
            </span>
          </div>
          
          {/* WeeklyTrendChart with key to force re-render when needed */}
          <WeeklyTrendChart 
            key="dashboard-trend-chart"
            dataType="heartRate" 
            days={7} 
            onViewAllClick={handleViewAllTrends}
            allowMetricChange={true}
          />
        </div>
        
        <BottomNavbar />
      </div>
      
      {/* Metrics Configuration Dialog */}
      <Dialog open={showMetricsDialog} onOpenChange={setShowMetricsDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Customize Metrics</DialogTitle>
            <DialogDescription>
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
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {key === 'heartRate' ? 'Heart Rate' : 
                     key === 'spo2' ? 'Blood Oxygen (SpO₂)' : 
                     key === 'ecg' ? 'ECG' : 
                     key === 'temperature' ? 'Temperature' :
                     key === 'hrv' ? 'Heart Rate Variability' :
                     key === 'respiratoryRate' ? 'Respiratory Rate' :
                     key === 'steps' ? 'Steps' :
                     key === 'macronutrients' ? 'Nutrition & Macronutrients' :
                     key === 'caloriesBurned' ? 'Calories Burned' : key}
                  </label>
                </div>
              ))}
            </div>
            
            <div className="pt-2">
              <p className="text-sm text-muted-foreground">
                {customizeMode ? "Exit customize mode to save changes" : "You can drag and drop metrics to rearrange them by entering customize mode."}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMetricsDialog(false)}>
              Cancel
            </Button>
            <Button onClick={saveMetricsPreferences}>
              Save Changes
            </Button>
            {!customizeMode && (
              <Button variant="secondary" onClick={() => {
                setShowMetricsDialog(false);
                toggleCustomizeMode();
              }}>
                Rearrange Metrics
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Alert Dialogs */}
      <EcgAlertDialog
        open={showEcgDialog}
        onOpenChange={setShowEcgDialog}
        onTakeEcg={handleTakeEcg}
        onDismiss={handleDismissEcg}
      />

      <HeartRateAlertDialog
        open={showHeartRateDialog}
        onOpenChange={setShowHeartRateDialog}
        heartRate={currentHeartRate}
        onDismiss={handleDismissHeartRate}
        onMonitor={handleMonitorHeartRate}
      />
    </>
  );
};

export default Dashboard;
