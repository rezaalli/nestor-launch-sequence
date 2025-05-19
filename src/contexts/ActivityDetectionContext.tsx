import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { sensorDataService, DetectedActivity } from '@/services/SensorDataService';
import { useToast } from '@/hooks/use-toast';

interface ActivityDetectionContextType {
  isDetecting: boolean;
  currentActivity: DetectedActivity | null;
  startDetection: () => Promise<boolean>;
  stopDetection: () => boolean;
  detectedActivities: DetectedActivity[];
  clearDetectedActivities: () => void;
}

// Default context with mock implementation for development
const defaultContext: ActivityDetectionContextType = {
  isDetecting: false,
  currentActivity: null,
  startDetection: async () => false,
  stopDetection: () => false,
  detectedActivities: [],
  clearDetectedActivities: () => {}
};

const ActivityDetectionContext = createContext<ActivityDetectionContextType>(defaultContext);

interface ActivityDetectionProviderProps {
  children: ReactNode;
}

export const ActivityDetectionProvider: React.FC<ActivityDetectionProviderProps> = ({ children }) => {
  const [isDetecting, setIsDetecting] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<DetectedActivity | null>(null);
  const [detectedActivities, setDetectedActivities] = useState<DetectedActivity[]>([]);
  const { toast } = useToast();

  // Initialize sensor service
  useEffect(() => {
    const initService = async () => {
      try {
        const initialized = await sensorDataService.initialize();
        console.log('Sensor service initialized:', initialized);
      } catch (error) {
        console.error('Failed to initialize sensor service:', error);
      }
    };

    initService();

    // Clean up on unmount
    return () => {
      sensorDataService.stopTracking();
    };
  }, []);

  // Set up event listeners for activity detection
  useEffect(() => {
    if (!sensorDataService.on) {
      console.error('SensorDataService is missing the "on" method');
      return;
    }
    
    const handleActivityDetected = (activity: DetectedActivity) => {
      setCurrentActivity(activity);
      
      toast({
        title: "Activity Detected",
        description: `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} detected with ${Math.round(activity.confidence * 100)}% confidence.`,
        variant: "default"
      });
    };

    const handleActivityUpdated = (activity: DetectedActivity) => {
      setCurrentActivity(activity);
    };

    const handleActivityCompleted = (activity: DetectedActivity) => {
      setCurrentActivity(null);
      
      // Add to detected activities
      setDetectedActivities(prev => [...prev, activity]);
      
      toast({
        title: "Activity Completed",
        description: `${activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} completed. Duration: ${formatDuration(activity.duration)}.`,
        variant: "default"
      });
    };

    // Subscribe to events with error handling
    try {
      const unsubscribeDetected = sensorDataService.on('activity-detected', handleActivityDetected);
      const unsubscribeUpdated = sensorDataService.on('activity-updated', handleActivityUpdated);
      const unsubscribeCompleted = sensorDataService.on('activity-completed', handleActivityCompleted);

      return () => {
        // Unsubscribe from events
        unsubscribeDetected();
        unsubscribeUpdated();
        unsubscribeCompleted();
      };
    } catch (error) {
      console.error('Error setting up event listeners:', error);
      return undefined;
    }
  }, [toast]);

  const startDetection = async (): Promise<boolean> => {
    try {
      const success = await sensorDataService.startTracking();
      setIsDetecting(success);
      
      if (success) {
        toast({
          title: "Auto-Detection Enabled",
          description: "Your device will now automatically detect and log your activities.",
          variant: "default"
        });
      }
      
      return success;
    } catch (error) {
      console.error('Failed to start activity detection:', error);
      return false;
    }
  };

  const stopDetection = (): boolean => {
    try {
      const success = sensorDataService.stopTracking();
      setIsDetecting(false);
      setCurrentActivity(null);
      
      if (success) {
        toast({
          title: "Auto-Detection Disabled",
          description: "Activity auto-detection has been turned off.",
          variant: "default"
        });
      }
      
      return success;
    } catch (error) {
      console.error('Failed to stop activity detection:', error);
      return false;
    }
  };

  const clearDetectedActivities = () => {
    setDetectedActivities([]);
  };

  // Helper function to format duration in milliseconds to "X min Y sec"
  const formatDuration = (durationMs: number): string => {
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes === 0) {
      return `${remainingSeconds} sec`;
    }
    
    return `${minutes} min${remainingSeconds > 0 ? ` ${remainingSeconds} sec` : ''}`;
  };

  return (
    <ActivityDetectionContext.Provider
      value={{
        isDetecting,
        currentActivity,
        startDetection,
        stopDetection,
        detectedActivities,
        clearDetectedActivities
      }}
    >
      {children}
    </ActivityDetectionContext.Provider>
  );
};

export const useActivityDetection = (): ActivityDetectionContextType => {
  const context = useContext(ActivityDetectionContext);
  return context;
}; 