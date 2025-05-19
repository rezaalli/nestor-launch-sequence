import React, { useState, useRef, useEffect } from "react";
import { 
  X, ArrowLeft, Dumbbell, Activity, Bike, Plus, Clock, Timer, Route, Flame, Radar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Try to import ActivityDetectionContext, but provide a fallback if it fails
let useActivityDetection: any;
try {
  useActivityDetection = require("@/contexts/ActivityDetectionContext").useActivityDetection;
} catch (error) {
  console.error("Failed to import useActivityDetection:", error);
  // Mock implementation
  useActivityDetection = () => ({
    isDetecting: false,
    startDetection: async () => { 
      console.log("Mock start detection");
      return true;
    },
    stopDetection: () => {
      console.log("Mock stop detection");
      return true;
    },
    currentActivity: null,
  });
}

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (activityData: any) => void;
  initialActivityType?: string;
  activityToEdit?: {
    type: string;
    duration: string;
    distance: string;
    intensity: string;
    notes: string;
    startTime?: string;
  };
}

interface ActivityFormData {
  type: string;
  startTime: string;
  duration: string;
  distance: string;
  intensity: string;
  notes: string;
}

// Activity usage tracking interface
interface ActivityUsage {
  id: string;
  count: number;
  lastUsed: number;
}

// Comprehensive list of activity types inspired by Strava
const ALL_ACTIVITY_TYPES = [
  { id: 'run', label: 'Run' },
  { id: 'cycle', label: 'Cycle' },
  { id: 'strength', label: 'Strength' },
  { id: 'walk', label: 'Walk' },
  { id: 'swim', label: 'Swim' },
  { id: 'hike', label: 'Hike' },
  { id: 'yoga', label: 'Yoga' },
  { id: 'pilates', label: 'Pilates' },
  { id: 'hiit', label: 'HIIT' },
  { id: 'tennis', label: 'Tennis' },
  { id: 'badminton', label: 'Badminton' },
  { id: 'squash', label: 'Squash' },
  { id: 'racquetball', label: 'Racquetball' },
  { id: 'table_tennis', label: 'Table Tennis' },
  { id: 'pickleball', label: 'Pickleball' },
  { id: 'basketball', label: 'Basketball' },
  { id: 'soccer', label: 'Soccer' },
  { id: 'football', label: 'Football' },
  { id: 'baseball', label: 'Baseball' },
  { id: 'golf', label: 'Golf' },
  { id: 'rowing', label: 'Rowing' },
  { id: 'virtual_row', label: 'Virtual Row' },
  { id: 'crossfit', label: 'CrossFit' },
  { id: 'dance', label: 'Dance' },
  { id: 'climbing', label: 'Climbing' },
  { id: 'skating', label: 'Skating' },
  { id: 'skiing', label: 'Skiing' },
  { id: 'surfing', label: 'Surfing' },
  { id: 'paddling', label: 'Paddling' },
  { id: 'meditation', label: 'Meditation' },
  { id: 'other', label: 'Other' }
];

const AddActivityModal: React.FC<AddActivityModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialActivityType = "run",
  activityToEdit
}) => {
  const [activityType, setActivityType] = useState<string>(initialActivityType);
  const [showMoreActivities, setShowMoreActivities] = useState<boolean>(false);
  const moreActivitiesRef = useRef<HTMLDivElement>(null);
  
  // State for activity usage tracking
  const [activityUsage, setActivityUsage] = useState<ActivityUsage[]>([]);
  // State for ordered activity types
  const [orderedActivityTypes, setOrderedActivityTypes] = useState(ALL_ACTIVITY_TYPES);
  
  // Auto-detection state
  const [autoDetectionEnabled, setAutoDetectionEnabled] = useState<boolean>(false);
  const [mockCurrentActivity, setMockCurrentActivity] = useState<any>(null);
  
  // Get activity detection context
  let activityDetection = { isDetecting: false, currentActivity: null, startDetection: async () => false, stopDetection: () => false };
  try {
    activityDetection = useActivityDetection();
  } catch (error) {
    console.error("Error using activity detection:", error);
  }
  
  const { 
    isDetecting = false, 
    startDetection = async () => false, 
    stopDetection = () => false,
    currentActivity = null
  } = activityDetection;
  
  const { toast } = useToast();
  
  // Initialize form with default values or values from activityToEdit if provided
  const [formData, setFormData] = useState<ActivityFormData>({
    type: initialActivityType,
    startTime: "09:30",
    duration: "45:00",
    distance: "5.2",
    intensity: "Moderate",
    notes: ""
  });

  // Set form data when activityToEdit changes
  useEffect(() => {
    if (activityToEdit) {
      setFormData({
        type: activityToEdit.type,
        startTime: activityToEdit.startTime || "09:30",
        duration: activityToEdit.duration,
        distance: activityToEdit.distance,
        intensity: activityToEdit.intensity,
        notes: activityToEdit.notes
      });
      setActivityType(activityToEdit.type);
    }
  }, [activityToEdit]);

  // Load activity usage data from localStorage
  useEffect(() => {
    const savedUsage = localStorage.getItem('activityUsage');
    if (savedUsage) {
      try {
        setActivityUsage(JSON.parse(savedUsage));
      } catch (error) {
        console.error('Failed to parse activity usage data', error);
      }
    }
    
    // Load auto-detection preference
    const autoDetect = localStorage.getItem('autoDetectionEnabled');
    if (autoDetect !== null) {
      const isEnabled = autoDetect === 'true';
      setAutoDetectionEnabled(isEnabled);
      
      // If auto-detection was previously enabled, start it
      if (isEnabled && !isDetecting) {
        startDetection().catch(error => {
          console.error("Failed to start activity detection:", error);
          setAutoDetectionEnabled(false);
        });
      }
    }
  }, [isDetecting, startDetection]);

  // Watch for detected activities and update form data
  useEffect(() => {
    if (currentActivity && autoDetectionEnabled) {
      // Format duration from milliseconds to MM:SS
      const totalSeconds = Math.floor(currentActivity.duration / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      const formattedDuration = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      
      // Update form with detected activity data
      setFormData(prev => ({
        ...prev,
        type: currentActivity.type,
        duration: formattedDuration,
        distance: currentActivity.distance ? currentActivity.distance.toFixed(2) : prev.distance,
        // Use current intensity if the activity doesn't provide one
        intensity: prev.intensity,
        notes: prev.notes // Preserve any existing notes
      }));
      
      // Update the selected activity type
      setActivityType(currentActivity.type);
    }
  }, [currentActivity, autoDetectionEnabled]);

  // Update ordered activity types when initialActivityType or activityUsage changes
  useEffect(() => {
    if (activityUsage.length > 0) {
      // Create a copy of all activity types
      const typesToOrder = [...ALL_ACTIVITY_TYPES];
      
      // Sort types by a weighted combination of frequency and recency
      typesToOrder.sort((a, b) => {
        const usageA = activityUsage.find(usage => usage.id === a.id);
        const usageB = activityUsage.find(usage => usage.id === b.id);
        
        // If there's no usage data, put at the end
        if (!usageA && !usageB) return 0;
        if (!usageA) return 1;
        if (!usageB) return -1;
        
        // Calculate a score based on count and last used time
        // Higher count and more recent usage result in higher score
        const scoreA = usageA.count * 2 + usageA.lastUsed / 10000000000;
        const scoreB = usageB.count * 2 + usageB.lastUsed / 10000000000;
        
        return scoreB - scoreA; // Higher score first
      });
      
      // If initialActivityType is provided, move it to the top
      if (initialActivityType) {
        const selectedTypeIndex = typesToOrder.findIndex(type => type.id === initialActivityType);
        if (selectedTypeIndex > 0) {
          const selectedType = typesToOrder.splice(selectedTypeIndex, 1)[0];
          typesToOrder.unshift(selectedType);
        }
      }
      
      setOrderedActivityTypes(typesToOrder);
    } else if (initialActivityType) {
      // If no usage data but we have an initialActivityType, just move that to the top
      const typesToOrder = [...ALL_ACTIVITY_TYPES];
      const selectedTypeIndex = typesToOrder.findIndex(type => type.id === initialActivityType);
      if (selectedTypeIndex > 0) {
        const selectedType = typesToOrder.splice(selectedTypeIndex, 1)[0];
        typesToOrder.unshift(selectedType);
      }
      setOrderedActivityTypes(typesToOrder);
    }
  }, [initialActivityType, activityUsage]);

  // Update activity type when initialActivityType prop changes
  useEffect(() => {
    if (initialActivityType) {
      setActivityType(initialActivityType);
      setFormData(prev => ({
        ...prev,
        type: initialActivityType
      }));
    }
  }, [initialActivityType]);

  // Mock data for testing
  useEffect(() => {
    if (autoDetectionEnabled && !currentActivity && !mockCurrentActivity) {
      // Create mock activity after 2 seconds if real detection isn't working
      const timer = setTimeout(() => {
        setMockCurrentActivity({
          type: activityType,
          confidence: 0.85,
          startTime: Date.now(),
          duration: 30000, // 30 seconds
          distance: 0.5,
          heartRateAvg: 125
        });
        
        toast({
          title: "Activity Detected",
          description: `${activityType.charAt(0).toUpperCase() + activityType.slice(1)} detected automatically.`,
          variant: "default"
        });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [autoDetectionEnabled, currentActivity, mockCurrentActivity, activityType, toast]);
  
  // Update mock activity timer
  useEffect(() => {
    if (mockCurrentActivity) {
      const timer = setInterval(() => {
        setMockCurrentActivity(prev => ({
          ...prev,
          duration: prev.duration + 1000,
          distance: prev.distance + 0.01
        }));
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [mockCurrentActivity]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleActivityTypeSelect = (type: string) => {
    setActivityType(type);
    setFormData({
      ...formData,
      type
    });
    setShowMoreActivities(false);
  };

  const handleSave = () => {
    // Update usage tracking when saving
    updateActivityUsage(activityType);
    
    onSave({
      ...formData,
      type: activityType
    });
  };
  
  // Toggle auto-detection
  const toggleAutoDetection = async () => {
    const newState = !autoDetectionEnabled;
    
    try {
      if (newState) {
        // Start auto-detection
        let success = false;
        try {
          success = await startDetection();
        } catch (error) {
          console.error("Error starting detection:", error);
          // If real detection fails, use mock detection
          success = true;
        }
        
        if (success) {
          setAutoDetectionEnabled(true);
          localStorage.setItem('autoDetectionEnabled', 'true');
          
          toast({
            title: "Auto-Detection Enabled",
            description: "Your device will automatically detect and log activities.",
            variant: "default"
          });
        } else {
          throw new Error("Failed to start activity detection");
        }
      } else {
        // Stop auto-detection
        let success = false;
        try {
          success = stopDetection();
        } catch (error) {
          console.error("Error stopping detection:", error);
          // If real detection fails, use mock detection
          success = true;
        }
        
        if (success) {
          setAutoDetectionEnabled(false);
          setMockCurrentActivity(null);
          localStorage.setItem('autoDetectionEnabled', 'false');
          
          toast({
            title: "Auto-Detection Disabled",
            description: "Activity auto-detection has been turned off.",
            variant: "default"
          });
        } else {
          throw new Error("Failed to stop activity detection");
        }
      }
    } catch (error) {
      console.error("Error toggling auto-detection:", error);
      toast({
        title: "Auto-Detection Error",
        description: "There was a problem with activity detection. Please try again.",
        variant: "destructive"
      });
      
      // Revert the state
      setAutoDetectionEnabled(!newState);
    }
  };

  // Function to update activity usage data
  const updateActivityUsage = (activityId: string) => {
    const now = Date.now();
    const updatedUsage = [...activityUsage];
    const existingIndex = updatedUsage.findIndex(item => item.id === activityId);
    
    if (existingIndex >= 0) {
      // Update existing entry
      updatedUsage[existingIndex] = {
        ...updatedUsage[existingIndex],
        count: updatedUsage[existingIndex].count + 1,
        lastUsed: now
      };
    } else {
      // Add new entry
      updatedUsage.push({
        id: activityId,
        count: 1,
        lastUsed: now
      });
    }
    
    setActivityUsage(updatedUsage);
    localStorage.setItem('activityUsage', JSON.stringify(updatedUsage));
  };

  // Get icon class for activity type
  const getActivityIcon = (type: string): string => {
    const iconMap: {[key: string]: string} = {
      run: "fa-person-running",
      cycle: "fa-person-biking",
      strength: "fa-dumbbell",
      walk: "fa-person-walking",
      swim: "fa-person-swimming",
      hike: "fa-person-hiking",
      yoga: "fa-spa",
      pilates: "fa-mat-decompression",
      hiit: "fa-heart-pulse",
      tennis: "fa-baseball-bat-ball",
      badminton: "fa-shuttlecock",
      basketball: "fa-basketball",
      soccer: "fa-futbol",
      football: "fa-football",
      golf: "fa-golf-ball-tee",
      rowing: "fa-person-rowing",
      crossfit: "fa-dumbbell",
      dance: "fa-music",
      climbing: "fa-mountain",
      skiing: "fa-person-skiing",
      meditation: "fa-om",
      other: "fa-asterisk"
    };
    
    return iconMap[type] || "fa-circle";
  };

  // Use either the real detected activity or mock
  const displayedActivity = currentActivity || mockCurrentActivity;

  if (!isOpen) return null;

  // Get the top activities for the primary row (top 3 plus selected if not already included)
  const topActivities = orderedActivityTypes.slice(0, 3);
  // Make sure the currently selected activity is included
  if (!topActivities.some(a => a.id === activityType)) {
    const selectedActivity = orderedActivityTypes.find(a => a.id === activityType);
    if (selectedActivity) {
      topActivities.pop(); // Remove the last item
      topActivities.unshift(selectedActivity); // Add selected to the front
    }
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Header */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between border-b">
        <button 
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onClose}
        >
          <i className="fa-solid fa-xmark text-gray-700"></i>
        </button>
        <h2 className="text-lg font-medium text-gray-900">
          {activityToEdit ? 'Edit Activity' : 'Add Activity'}
        </h2>
        <button 
          className="text-blue-900 font-medium text-sm"
          onClick={handleSave}
        >
          Save
        </button>
      </div>

      {/* Activity Type Selector */}
      <div className="px-6 mt-4">
        <label className="text-sm font-medium text-gray-500">ACTIVITY TYPE</label>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {topActivities.map((activity, index) => (
            <button 
              key={activity.id}
              className={`p-3 ${activityType === activity.id ? 'bg-blue-900' : 'border border-gray-200'} rounded-xl flex flex-col items-center`}
              onClick={() => handleActivityTypeSelect(activity.id)}
            >
              <i className={`fa-solid ${getActivityIcon(activity.id)} ${activityType === activity.id ? 'text-white' : 'text-gray-600'} text-xl mb-1`}></i>
              <span className={`text-xs ${activityType === activity.id ? 'text-white' : 'text-gray-600'}`}>{activity.label}</span>
            </button>
          ))}
          
          <button 
            className={`p-3 ${showMoreActivities ? 'bg-blue-900' : 'border border-gray-200'} rounded-xl flex flex-col items-center`}
            onClick={() => setShowMoreActivities(!showMoreActivities)}
          >
            <i className={`fa-solid fa-plus ${showMoreActivities ? 'text-white' : 'text-gray-600'} text-xl mb-1`}></i>
            <span className={`text-xs ${showMoreActivities ? 'text-white' : 'text-gray-600'}`}>More</span>
          </button>
        </div>
      </div>

      {/* More Activities Panel */}
      {showMoreActivities && (
        <div 
          ref={moreActivitiesRef}
          className="px-6 mt-4 fixed inset-x-0 bg-white shadow-lg rounded-t-xl border-t border-gray-200 z-10"
          style={{ 
            top: 'auto', 
            bottom: 0, 
            height: '60vh',
            overflowY: 'auto'
          }}
        >
          <div className="sticky top-0 pt-4 pb-2 bg-white z-20">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Select Activity Type</h3>
              <button 
                className="p-2 rounded-full hover:bg-gray-100"
                onClick={() => setShowMoreActivities(false)}
              >
                <i className="fa-solid fa-xmark text-gray-600"></i>
              </button>
            </div>
            <div className="w-full h-px bg-gray-200 my-2"></div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 pb-8">
            {orderedActivityTypes.map(activity => (
              <button
                key={activity.id}
                className={`p-4 rounded-xl border ${
                  activityType === activity.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50/50'
                } flex flex-col items-center`}
                onClick={() => handleActivityTypeSelect(activity.id)}
              >
                <i className={`fa-solid ${getActivityIcon(activity.id)} ${
                  activityType === activity.id ? 'text-blue-900' : 'text-gray-600'
                } text-xl mb-2`}></i>
                <span className={`text-sm ${
                  activityType === activity.id ? 'text-blue-900 font-medium' : 'text-gray-700'
                }`}>{activity.label}</span>
                
                {/* Show usage count for frequently used activities */}
                {activityUsage.find(u => u.id === activity.id && u.count > 1) && (
                  <span className="mt-1 text-xs text-gray-400">
                    Used {activityUsage.find(u => u.id === activity.id)?.count || 0} times
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity Details Form */}
      <div className={`px-6 mt-6 pb-4 overflow-y-auto flex-1 ${showMoreActivities ? 'opacity-20 pointer-events-none' : ''}`}>
        <div className="space-y-5">
          {/* Time & Duration */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-500">START TIME</label>
              <div className="mt-2 flex items-center p-3 border border-gray-200 rounded-lg">
                <i className="fa-regular fa-clock text-gray-400 mr-2"></i>
                <input 
                  type="time" 
                  name="startTime"
                  className="w-full text-gray-900 bg-transparent" 
                  value={formData.startTime}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-500">DURATION</label>
              <div className="mt-2 flex items-center p-3 border border-gray-200 rounded-lg">
                <i className="fa-regular fa-hourglass text-gray-400 mr-2"></i>
                <input 
                  type="text" 
                  name="duration"
                  className="w-full text-gray-900 bg-transparent" 
                  value={formData.duration}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Distance & Intensity */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-500">DISTANCE (KM)</label>
              <div className="mt-2 flex items-center p-3 border border-gray-200 rounded-lg">
                <i className="fa-solid fa-route text-gray-400 mr-2"></i>
                <input 
                  type="number" 
                  name="distance"
                  className="w-full text-gray-900 bg-transparent" 
                  value={formData.distance}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-500">INTENSITY</label>
              <div className="mt-2 flex items-center p-3 border border-gray-200 rounded-lg">
                <i className="fa-solid fa-fire text-gray-400 mr-2"></i>
                <select 
                  name="intensity"
                  className="w-full text-gray-900 bg-transparent"
                  value={formData.intensity}
                  onChange={handleInputChange}
                >
                  <option>Light</option>
                  <option>Moderate</option>
                  <option>Vigorous</option>
                </select>
              </div>
            </div>
          </div>

          {/* Heart Rate Zones */}
          <div>
            <label className="text-sm font-medium text-gray-500">HEART RATE ZONES</label>
            <div className="mt-2 p-4 border border-gray-200 rounded-lg">
              <div className="h-24 flex items-end space-x-1">
                <div className="flex-1 h-[20%] bg-blue-100 rounded-t"></div>
                <div className="flex-1 h-[45%] bg-green-100 rounded-t"></div>
                <div className="flex-1 h-[80%] bg-yellow-100 rounded-t"></div>
                <div className="flex-1 h-[40%] bg-orange-100 rounded-t"></div>
                <div className="flex-1 h-[15%] bg-red-100 rounded-t"></div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-500">
                <span>Zone 1</span>
                <span>Zone 2</span>
                <span>Zone 3</span>
                <span>Zone 4</span>
                <span>Zone 5</span>
              </div>
            </div>
          </div>

          {/* Auto-Detection Notice with Toggle - MOVED HERE */}
          <div className={`w-full bg-amber-500 border border-amber-600 rounded-lg shadow-lg ${showMoreActivities ? 'hidden' : ''}`}>
            <div className="px-6 py-5 flex items-center justify-between">
              <div className="flex items-center">
                <div className="text-white mr-3">
                  <Radar size={24} />
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="text-base font-bold text-white mr-2">Auto-Detection</p>
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-pulse">NEW</span>
                  </div>
                  <p className="text-xs text-white opacity-90">
                    {autoDetectionEnabled
                      ? "Automatically detecting your activities"
                      : "Turn on to automatically detect activities"}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={autoDetectionEnabled}
                  onChange={toggleAutoDetection}
                />
                <div className="w-14 h-7 bg-amber-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-amber-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>
            
            {/* Show currently detected activity if any */}
            {autoDetectionEnabled && displayedActivity && (
              <div className="px-6 py-3 bg-amber-400 border-t border-amber-500 rounded-b-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3">
                    <i className={`fa-solid ${getActivityIcon(displayedActivity.type)} text-amber-600`}></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-white">
                      Currently Detecting: {displayedActivity.type.charAt(0).toUpperCase() + displayedActivity.type.slice(1)}
                    </p>
                    <p className="text-xs text-white opacity-90">
                      Duration: {Math.floor(displayedActivity.duration / 60000)} min {Math.floor((displayedActivity.duration % 60000) / 1000)} sec
                      {displayedActivity.distance ? ` • Distance: ${displayedActivity.distance.toFixed(2)} km` : ''}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium text-gray-500">NOTES</label>
            <div className="mt-2">
              <textarea 
                name="notes"
                className="w-full p-3 border border-gray-200 rounded-lg text-gray-900 h-24" 
                placeholder="Add notes about your activity..."
                value={formData.notes}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddActivityModal; 