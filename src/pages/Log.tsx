import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { 
  ArrowLeft, 
  Calendar,
  Plus, 
  Activity, 
  Dumbbell, 
  Bike, 
  Utensils,
  ClipboardList,
  Edit,
  AlertCircle,
  Check,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import StatusBar from "@/components/StatusBar";
import BottomNavbar from "@/components/BottomNavbar";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorBoundary from "@/components/ErrorBoundary";
import AddMealModal from "@/components/AddMealModal";
import AddActivityModal from "@/components/AddActivityModal";
import DailyAssessmentModal from "@/components/DailyAssessmentModal";
import { useToast } from "@/hooks/use-toast";
import { useAssessment } from "@/contexts/AssessmentContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn } from "@/lib/utils";

// Types
interface ActivityData {
  id: number;
  type: string;
  title: string;
  time: string;
  description?: string;
  distance?: string;
  duration?: string;
  intensity?: string;
  notes?: string;
}

interface MealData {
  id: number;
  type: string;
  title: string;
  time: string;
  description: string;
  image?: string;
}

// Mock data
const ACTIVITIES: ActivityData[] = [
  {
    id: 1,
    type: "run",
    title: "Morning Run",
    time: "8:30 AM",
    description: "5.2 km • 32 min"
  },
  {
    id: 2,
    type: "strength",
    title: "Strength Training",
    time: "10:15 AM",
    description: "Upper body workout • 45 min"
  },
  {
    id: 3,
    type: "cycle",
    title: "Evening Ride",
    time: "6:45 PM",
    description: "12.8 km • 52 min"
  }
];

const MEALS: MealData[] = [
  {
    id: 1,
    type: "breakfast",
    title: "Breakfast",
    time: "7:30 AM",
    description: "Oatmeal with berries and honey",
    image: "https://storage.googleapis.com/uxpilot-auth.appspot.com/08e9b93b0b-967156ea3c04be097bbc.png"
  },
  {
    id: 2,
    type: "lunch",
    title: "Lunch",
    time: "12:45 PM",
    description: "Grilled chicken salad with avocado"
  },
  {
    id: 3,
    type: "dinner",
    title: "Dinner",
    time: "7:15 PM",
    description: "Salmon with roasted vegetables and quinoa"
  }
];

// Helper functions
const getActivityIcon = (type: string) => {
  switch (type) {
    case "run":
      return <Activity className="text-green-600" size={20} />;
    case "strength":
      return <Dumbbell className="text-purple-600" size={20} />;
    case "cycle":
      return <Bike className="text-blue-600" size={20} />;
    default:
      return <Activity className="text-green-600" size={20} />;
  }
};

const getActivityColorClass = (type: string) => {
  switch (type) {
    case "run":
      return "bg-green-100";
    case "strength":
      return "bg-purple-100";
    case "cycle":
      return "bg-blue-100";
    default:
      return "bg-green-100";
  }
};

// Function to extract activity details from description
const extractActivityDetails = (description: string): { distance: string, duration: string } => {
  const parts = description.split('•').map(part => part.trim());
  let distance = '0';
  let duration = '00:00';
  
  parts.forEach(part => {
    if (part.includes('km')) {
      distance = part.replace('km', '').trim();
    } else if (part.includes('min')) {
      duration = part.replace('min', '').trim() + ':00';
    }
  });
  
  return { distance, duration };
};

// Calculate pace from distance and duration
const calculatePace = (distance: string, duration: string): string => {
  const distanceNum = parseFloat(distance);
  const durationParts = duration.split(':');
  const durationMinutes = parseInt(durationParts[0]);
  
  if (distanceNum <= 0 || isNaN(durationMinutes)) return "0:00/km";
  
  const paceMinutes = Math.floor(durationMinutes / distanceNum);
  const paceSeconds = Math.floor((durationMinutes / distanceNum - paceMinutes) * 60);
  
  return `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}/km`;
};

// Calculate speed from distance and duration
const calculateSpeed = (distance: string, duration: string): string => {
  const distanceNum = parseFloat(distance);
  const durationParts = duration.split(':');
  const durationHours = parseInt(durationParts[0]) / 60;
  
  if (distanceNum <= 0 || durationHours <= 0) return "0.0 km/h";
  
  const speed = distanceNum / durationHours;
  return `${speed.toFixed(1)} km/h`;
};

const renderActivityStats = (activity: ActivityData) => {
  // Extract distance and duration from description
  const { distance, duration } = extractActivityDetails(activity.description || '');
  
  // Convert duration format (e.g., "45:00") to just minutes for display (e.g., "45 min")
  const durationMinutes = duration.split(':')[0];
  
  switch(activity.type) {
    case "run":
      return (
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Distance</span>
            <p className="font-medium text-gray-900">{distance} km</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Duration</span>
            <p className="font-medium text-gray-900">{durationMinutes} min</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Pace</span>
            <p className="font-medium text-gray-900">{calculatePace(distance, duration)}</p>
                    </div>
          {activity.notes && (
            <div className="text-sm col-span-3 mt-2">
              <span className="text-gray-500">Notes</span>
              <p className="font-medium text-gray-900">{activity.notes}</p>
                  </div>
          )}
                </div>
      );
    case "strength":
      // For strength training, we'll display the description and notes if available
      return (
                  <div className="mt-2">
          <p className="text-sm text-gray-600">{activity.description}</p>
          {activity.notes && (
            <div className="text-sm mt-2">
              <span className="text-gray-500">Notes</span>
              <p className="font-medium text-gray-900">{activity.notes}</p>
                  </div>
          )}
                </div>
      );
    case "cycle":
      return (
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Distance</span>
            <p className="font-medium text-gray-900">{distance} km</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Duration</span>
            <p className="font-medium text-gray-900">{durationMinutes} min</p>
                    </div>
                    <div className="text-sm">
            <span className="text-gray-500">Speed</span>
            <p className="font-medium text-gray-900">{calculateSpeed(distance, duration)}</p>
                    </div>
          {activity.notes && (
            <div className="text-sm col-span-3 mt-2">
              <span className="text-gray-500">Notes</span>
              <p className="font-medium text-gray-900">{activity.notes}</p>
                  </div>
          )}
                </div>
      );
    default:
      // For other activities, display a generic stats layout with distance, duration and notes
      return (
        <div className="mt-2">
          <div className="grid grid-cols-2 gap-4 mb-2">
            <div className="text-sm">
              <span className="text-gray-500">Distance</span>
              <p className="font-medium text-gray-900">{distance} km</p>
              </div>
            <div className="text-sm">
              <span className="text-gray-500">Duration</span>
              <p className="font-medium text-gray-900">{durationMinutes} min</p>
            </div>
          </div>
          {activity.notes && (
            <div className="text-sm mt-2">
              <span className="text-gray-500">Notes</span>
              <p className="font-medium text-gray-900">{activity.notes}</p>
        </div>
          )}
          </div>
      );
  }
};
          
// Component for a single activity item
const ActivityItem = ({ activity }: { activity: ActivityData }) => {
  return (
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-start">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${getActivityColorClass(activity.type)}`}>
          {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">{activity.title}</h4>
            <span className="text-sm text-gray-500">{activity.time}</span>
                  </div>
          {renderActivityStats(activity)}
                </div>
              </div>
            </div>
  );
};
            
// Component for a single meal item
const MealItem = ({ meal }: { meal: MealData }) => {
  return (
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                  <Utensils className="text-orange-600" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">{meal.title}</h4>
            <span className="text-sm text-gray-500">{meal.time}</span>
                  </div>
          <p className="text-sm text-gray-600 mb-3">{meal.description}</p>
          {meal.image && (
                  <div className="relative h-32 w-full rounded-lg overflow-hidden">
              <img
                src={meal.image}
                alt={`${meal.title}`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
                  </div>
          )}
                </div>
              </div>
            </div>
  );
};
            
// Loading component
const LoadingItem = () => (
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-start">
      <Skeleton className="w-10 h-10 rounded-full mr-3" />
      <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-16" />
                  </div>
        <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
);

// Main Log page component
const Log = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    isAssessmentCompletedForDate, 
    getAssessmentForDate, 
    completedAssessments
  } = useAssessment();
  
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [meals, setMeals] = useState<MealData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  
  // State to track the activity being edited
  const [editingActivity, setEditingActivity] = useState<ActivityData | null>(null);
  
  // Track most recent activity types
  const [recentActivityTypes, setRecentActivityTypes] = useState<string[]>(['run', 'cycle', 'strength']);
  const [selectedActivityType, setSelectedActivityType] = useState<string | null>(null);
  
  // Assessment state
  const [assessmentCompleted, setAssessmentCompleted] = useState(false);
  const [readinessScore, setReadinessScore] = useState<number | null>(null);
  const [assessmentSummary, setAssessmentSummary] = useState<Record<string, any>>({});

  // Load recent activity types from localStorage on mount
  useEffect(() => {
    const savedRecentActivityTypes = localStorage.getItem('recentActivityTypes');
    if (savedRecentActivityTypes) {
      try {
        setRecentActivityTypes(JSON.parse(savedRecentActivityTypes));
      } catch (error) {
        console.error('Failed to parse recent activity types', error);
      }
    }
  }, []);

  // Check if assessment is completed for current date
  useEffect(() => {
    const isCompleted = isAssessmentCompletedForDate(currentDate);
    setAssessmentCompleted(isCompleted);
    
    if (isCompleted) {
      const assessment = getAssessmentForDate(currentDate);
      if (assessment) {
        setReadinessScore(assessment.readinessScore || null);
        
        // Extract assessment summary
        const summary: Record<string, any> = {};
        
        if (assessment.data) {
          // Use type assertion to safely access responses
          const responses = (assessment.data as any).responses;
          if (responses) {
            // Get general wellness
            const generalWellness = responses[1]?.[0] || "unknown";
            summary.feeling = generalWellness === "good" ? "Good" : "Not Good";
            
            // Get sleep quality
            const sleepQuality = responses[2]?.[0] || "unknown";
            summary.sleep = sleepQuality === "well_rested" ? "Well Rested" : "Poorly Rested";
            
            // Get mental state
            const mentalState = responses[12]?.[0] || "unknown";
            summary.mental = mentalState === "good" ? "Good/Stable" : "Stressed/Anxious";
          }
        }
        
        setAssessmentSummary(summary);
      }
    } else {
      setReadinessScore(null);
      setAssessmentSummary({});
    }
  }, [currentDate, isAssessmentCompletedForDate, getAssessmentForDate, completedAssessments]);

  // Simulate fetching data
  useEffect(() => {
    setLoading(true);
    
    // Track when the data loading started
    const startTime = Date.now();
    
    // Simulate API delay - minimum display time of 500ms for better UX
    const timer = setTimeout(() => {
      setActivities(ACTIVITIES);
      setMeals(MEALS);
      
      // Calculate how much time has passed
      const elapsedTime = Date.now() - startTime;
      
      // Ensure loading state shows for at least 500ms to avoid flickering
      if (elapsedTime < 500) {
        setTimeout(() => setLoading(false), 500 - elapsedTime);
      } else {
        setLoading(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [currentDate]);

  const handleDateChange = (date?: Date) => {
    if (date) {
      setCurrentDate(date);
      
      // Show toast when date is changed
      toast({
        title: "Date Updated",
        description: `Viewing logs for ${format(date, "MMMM d, yyyy")}`,
        variant: "default",
      });
    }
  };
  
  const handleAddMeal = (mealData: any) => {
    // In a real app, this would save to an API or global state
    console.log("Adding meal:", mealData);
    
    // Add the new meal to the list
    const newMeal: MealData = {
      id: meals.length + 1,
      type: mealData.type,
      title: mealData.type,
      time: format(new Date(), "h:mm a"),
      description: "Custom meal entry"
    };
    
    setMeals([...meals, newMeal]);
    setShowAddMealModal(false);
    
    // Show success toast
    toast({
      title: "Meal Added",
      description: `${mealData.type} has been added to your log`,
      variant: "success",
    });
  };

  const handleAddActivity = (activityData: any) => {
    // In a real app, this would save to an API or global state
    console.log("Adding activity:", activityData);
    
    // Generate title based on the activity type
    let title = '';
    
    // Map activity types to more descriptive titles
    const activityTitles: {[key: string]: string} = {
      run: "Running",
      cycle: "Cycling",
      strength: "Strength Training",
      walk: "Walking",
      swim: "Swimming",
      hike: "Hiking",
      yoga: "Yoga",
      pilates: "Pilates", 
      hiit: "HIIT Workout",
      tennis: "Tennis",
      badminton: "Badminton",
      squash: "Squash",
      racquetball: "Racquetball",
      table_tennis: "Table Tennis",
      pickleball: "Pickleball",
      basketball: "Basketball",
      soccer: "Soccer",
      football: "Football",
      baseball: "Baseball",
      golf: "Golf",
      rowing: "Rowing",
      virtual_row: "Virtual Rowing",
      crossfit: "CrossFit",
      dance: "Dance",
      climbing: "Climbing",
      skating: "Skating",
      skiing: "Skiing",
      surfing: "Surfing",
      paddling: "Paddling",
      meditation: "Meditation"
    };
    
    // Get the title from our mapping or use a generic title
    title = activityTitles[activityData.type] || "Custom Activity";
    
    // Add descriptive information to the title if available
    if (activityData.notes && activityData.notes.trim()) {
      const shortNotes = activityData.notes.trim().substring(0, 20);
      title += `: ${shortNotes}${activityData.notes.length > 20 ? '...' : ''}`;
    }
    
    const activity: ActivityData = {
      id: editingActivity ? editingActivity.id : activities.length + 1,
      type: activityData.type,
      title: title,
      time: format(new Date(), "h:mm a"),
      description: `${activityData.distance} km • ${activityData.duration}`,
      notes: activityData.notes // Save notes to the activity object
    };

    if (editingActivity) {
      // Update existing activity
      setActivities(activities.map(a => a.id === editingActivity.id ? activity : a));
      setEditingActivity(null);
    } else {
      // Add new activity
      setActivities([...activities, activity]);
    }
    
    setShowAddActivityModal(false);
    
    // Set selected activity type
    setSelectedActivityType(activityData.type);
    
    // Update recent activity types (add to front, remove any duplicates, keep only top 3)
    const updatedRecentTypes = [
      activityData.type,
      ...recentActivityTypes.filter(type => type !== activityData.type)
    ].slice(0, 3);
    
    setRecentActivityTypes(updatedRecentTypes);
    
    // Save to localStorage
    localStorage.setItem('recentActivityTypes', JSON.stringify(updatedRecentTypes));
    
    // Show success toast
    toast({
      title: editingActivity ? "Activity Updated" : "Activity Added",
      description: `${title} has been ${editingActivity ? 'updated' : 'added'} to your log`,
      variant: "success",
    });
  };

  // Function to handle swiping between days
  const handlePreviousDay = () => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(previousDay.getDate() - 1);
    setCurrentDate(previousDay);
    
    toast({
      title: "Previous Day",
      description: `Viewing logs for ${format(previousDay, "MMMM d, yyyy")}`,
      variant: "default",
    });
  };
  
  const handleNextDay = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() + 1);
    setCurrentDate(nextDay);
    
    toast({
      title: "Next Day",
      description: `Viewing logs for ${format(nextDay, "MMMM d, yyyy")}`,
      variant: "default",
    });
  };

  // Function to delete an activity 
  const handleDeleteActivity = (id: number) => {
    setActivities(activities.filter(activity => activity.id !== id));
    
    toast({
      title: "Activity Removed",
      description: "The activity has been removed from your log",
      variant: "destructive",
    });
  };
  
  // Function to delete a meal
  const handleDeleteMeal = (id: number) => {
    setMeals(meals.filter(meal => meal.id !== id));
    
    toast({
      title: "Meal Removed",
      description: "The meal has been removed from your log",
      variant: "destructive",
    });
  };

  // Handle navigating to Daily Assessment
  const handleDailyAssessment = () => {
    setShowDailyAssessmentModal(true);
    
    toast({
      title: assessmentCompleted ? "Edit Assessment" : "Complete Assessment",
      description: assessmentCompleted ? 
        "You can review and update your daily assessment." : 
        "Please complete your daily wellness assessment.",
      variant: "default",
    });
  };

  // Add state for the modal
  const [showDailyAssessmentModal, setShowDailyAssessmentModal] = useState(false);

  // Enhanced ActivityItem component with edit and delete functionality
  const ActivityItemWithActions = ({ activity }: { activity: ActivityData }) => {
    const [showActions, setShowActions] = useState(false);
    
    const handleEdit = () => {
      // Extract distance and duration from description
      const { distance, duration } = extractActivityDetails(activity.description || '');
      
      // Set the activity to edit with appropriate format
      setEditingActivity({
        ...activity,
        // Add any additional fields needed for editing
        distance,
        duration,
        notes: activity.notes || '' // Pass notes for editing
      });
      
      setShowAddActivityModal(true);
      setShowActions(false);
    };
    
    return (
          <div className="p-4 bg-white border border-gray-200 rounded-xl">
        <div className="flex items-start">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${getActivityColorClass(activity.type)}`}>
            {getActivityIcon(activity.type)}
          </div>
          <div className="flex-1">
                  <div className="flex items-center justify-between">
              <h4 className="font-medium text-gray-900">{activity.title}</h4>
                    <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">{activity.time}</span>
                <button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowActions(!showActions)}
                >
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
                    </div>
                  </div>
            {renderActivityStats(activity)}
            
            {/* Actions menu */}
            {showActions && (
              <div className="mt-3 flex justify-end space-x-2">
                <button 
                  className="px-3 py-1 text-sm text-white bg-blue-600 rounded"
                  onClick={handleEdit}
                >
                  Edit
                </button>
                <button 
                  className="px-3 py-1 text-sm text-white bg-red-500 rounded"
                  onClick={() => handleDeleteActivity(activity.id)}
                >
                  Delete
                </button>
                    </div>
            )}
                  </div>
                </div>
              </div>
    );
  };

  return (
    <div id="log-page" className="min-h-screen bg-white pb-16">
      <StatusBar />
      
      {/* Header */}
      <div id="header-log" className="px-6 pt-4 pb-2 flex items-center justify-between">
        <button 
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" 
          onClick={() => navigate('/dashboard')}
        >
          <i className="fa-solid fa-arrow-left text-gray-700"></i>
        </button>
        <h2 className="text-lg font-medium text-gray-900">Daily Logs</h2>
        
        {/* Calendar Button with Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <i className="fa-regular fa-calendar text-gray-700"></i>
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent 
              mode="single" 
              selected={currentDate} 
              onSelect={handleDateChange} 
              initialFocus 
              className="p-3 pointer-events-auto" 
            />
          </PopoverContent>
        </Popover>
                  </div>
                  
      {/* Date Selector */}
      <div id="date-selector" className="px-6 mt-4">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          <button className="flex-shrink-0 px-4 py-2 rounded-full bg-blue-900 text-white text-sm">
            {format(currentDate, "MMM d") === format(new Date(), "MMM d") ? "Today" : format(currentDate, "MMM d")}
          </button>
          <button 
            className="flex-shrink-0 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm" 
            onClick={handlePreviousDay}
          >
            Yesterday
          </button>
          <button 
            className="flex-shrink-0 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm" 
            onClick={() => {
          const twoDaysAgo = new Date();
          twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
          setCurrentDate(twoDaysAgo);
              
              toast({
                title: "Date Updated",
                description: `Viewing logs for ${format(twoDaysAgo, "MMMM d, yyyy")}`,
                variant: "default",
              });
            }}
          >
            {format(new Date(new Date().setDate(new Date().getDate() - 2)), "MMM d")}
          </button>
          <button 
            className="flex-shrink-0 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm" 
            onClick={() => {
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          setCurrentDate(threeDaysAgo);
              
              toast({
                title: "Date Updated",
                description: `Viewing logs for ${format(threeDaysAgo, "MMMM d, yyyy")}`,
                variant: "default",
              });
            }}
          >
            {format(new Date(new Date().setDate(new Date().getDate() - 3)), "MMM d")}
          </button>
                    </div>
                  </div>
                  
      {/* Log Categories */}
      <div id="log-categories" className="px-6 mt-6">
        {/* Activity Log */}
        <ErrorBoundary section="Activity Log">
          <div id="activity-log" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">ACTIVITY LOG</h3>
              <button 
                className="text-sm text-blue-900 font-medium flex items-center" 
                onClick={() => setShowAddActivityModal(true)}
              >
                <i className="fa-solid fa-plus mr-1"></i>
              Add Activity
            </button>
                    </div>
          
            <div className="space-y-3">
              {loading ? (
                <>
                  <LoadingItem />
                  <LoadingItem />
                </>
              ) : activities.length > 0 ? (
                <>
                  {/* List of activities */}
                  {activities.map(activity => (
                    <ActivityItemWithActions key={activity.id} activity={activity} />
                  ))}
                </>
              ) : (
                <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Activity className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-gray-500">No activities recorded for this date</p>
                  
                  <button 
                    className="mt-3 text-sm text-blue-900 font-medium"
                    onClick={() => setShowAddActivityModal(true)}
                  >
                    Add your first activity
                  </button>
                  </div>
              )}
                </div>
              </div>
        </ErrorBoundary>

        {/* Meal Log */}
        <ErrorBoundary section="Meal Log">
          <div id="meal-log" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">MEAL LOG</h3>
              <button 
                className="text-sm text-blue-900 font-medium flex items-center" 
                onClick={() => setShowAddMealModal(true)}
              >
                <i className="fa-solid fa-plus mr-1"></i>
              Add Meal
            </button>
                  </div>
                  
          <div className="space-y-3">
              {loading ? (
                <>
                  <LoadingItem />
                  <LoadingItem />
                </>
              ) : meals.length > 0 ? (
                meals.map(meal => (
                  <MealItem key={meal.id} meal={meal} />
                ))
              ) : (
                <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <Utensils className="mx-auto text-gray-400 mb-2" size={24} />
                  <p className="text-gray-500">No meals recorded for this date</p>
                  <button 
                    className="mt-3 text-sm text-blue-900 font-medium"
                    onClick={() => setShowAddMealModal(true)}
                  >
                    Add your first meal
                  </button>
                    </div>
              )}
                  </div>
                </div>
        </ErrorBoundary>

        {/* Daily Assessment */}
        <ErrorBoundary section="Daily Assessment">
          <div id="daily-assessment" className="mb-6">
          <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">DAILY ASSESSMENT</h3>
              {assessmentCompleted ? (
              <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">Completed</span>
            ) : (
                <button 
                  className="text-sm text-blue-900 font-medium flex items-center" 
                  onClick={handleDailyAssessment}
                >
                  <i className="fa-solid fa-plus mr-1"></i>
                  Complete
                </button>
            )}
              </div>
              
            {loading ? (
          <div className="p-4 bg-white border border-gray-200 rounded-xl">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <Skeleton className="w-8 h-8 rounded-full mr-2" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                    <Skeleton className="w-10 h-10 rounded-full" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <Skeleton className="w-6 h-6 mr-2" />
                      <Skeleton className="h-4 w-16" />
              </div>
                    <Skeleton className="h-3 w-24" />
              </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <Skeleton className="w-6 h-6 mr-2" />
                      <Skeleton className="h-4 w-16" />
              </div>
                    <Skeleton className="h-3 w-24" />
            </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <Skeleton className="w-6 h-6 mr-2" />
                      <Skeleton className="h-4 w-16" />
          </div>
                    <Skeleton className="h-3 w-24" />
        </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <Skeleton className="w-6 h-6 mr-2" />
                      <Skeleton className="h-4 w-16" />
      </div>
                    <Skeleton className="h-3 w-24" />
          </div>
            </div>
                <Skeleton className="h-12 w-full mt-4" />
              </div>
            ) : assessmentCompleted ? (
              <div className="p-4 bg-white border border-gray-200 rounded-xl">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Wellness Assessment</h4>
                    <span className="text-sm text-gray-500">{format(currentDate, "MMM d")}</span>
          </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                        <i className="fa-solid fa-clipboard-check text-blue-900 text-sm"></i>
                  </div>
                      <span className="text-sm text-gray-600">14 questions answered</span>
                </div>
                    <div className="relative w-10 h-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="transform -rotate-90 w-10 h-10">
                        <circle cx="20" cy="20" r="16" strokeWidth="4" fill="none" className="stroke-gray-200"/>
                        <circle cx="20" cy="20" r="16" strokeWidth="4" fill="none" className="stroke-blue-900" 
                          style={{ 
                            strokeDasharray: `${2 * Math.PI * 16}`, 
                            strokeDashoffset: `${2 * Math.PI * 16 * (1 - 1)}` 
                          }} 
                        />
                      </svg>
                      <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-blue-900">100%</span>
                  </div>
                </div>
              </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <i className="fa-regular fa-face-smile text-blue-900 text-xl mr-2"></i>
                      <span className="text-sm font-medium text-gray-900">
                        {assessmentSummary.feeling || "Good"}
                      </span>
                  </div>
                    <p className="text-xs text-gray-500">General feeling</p>
                </div>
              
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <i className="fa-solid fa-bed text-blue-900 text-lg mr-2"></i>
                      <span className="text-sm font-medium text-gray-900">
                        {assessmentSummary.sleep === "Well Rested" ? "7/10" : "4/10"}
                      </span>
                  </div>
                    <p className="text-xs text-gray-500">Sleep quality</p>
              </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <i className="fa-solid fa-bolt text-blue-900 text-lg mr-2"></i>
                      <span className="text-sm font-medium text-gray-900">
                        {assessmentSummary.mental === "Good/Stable" ? "8/10" : "5/10"}
                      </span>
                  </div>
                    <p className="text-xs text-gray-500">Energy level</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <i className="fa-solid fa-brain text-blue-900 text-lg mr-2"></i>
                      <span className="text-sm font-medium text-gray-900">
                        {assessmentSummary.mental === "Good/Stable" ? "Stable" : "Stressed"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">Mental state</p>
                </div>
              </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <span className="text-sm text-gray-600">Caffeine</span>
                      {true ? (
                        <i className="fa-solid fa-check text-green-500 ml-auto"></i>
                      ) : (
                        <i className="fa-solid fa-xmark text-gray-400 ml-auto"></i>
                      )}
                </div>
                    <p className="text-xs text-gray-500">Had coffee today</p>
              </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <span className="text-sm text-gray-600">Alcohol</span>
                      {false ? (
                        <i className="fa-solid fa-check text-green-500 ml-auto"></i>
                      ) : (
                        <i className="fa-solid fa-xmark text-gray-400 ml-auto"></i>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">No alcohol consumed</p>
            </div>
          </div>

                {readinessScore !== null && (
                  <div className="mb-4 bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-blue-700">Readiness Score</span>
                      <span className="text-sm font-medium text-blue-700">{readinessScore}/100</span>
                </div>
                    <div className="w-full h-2 bg-blue-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          readinessScore > 80 ? "bg-green-500" : 
                          readinessScore > 60 ? "bg-blue-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${readinessScore}%` }}
                      ></div>
              </div>
            </div>
                )}
                
                <div className="bg-gray-50 p-3 rounded-lg mt-3">
                  <span className="text-sm font-medium text-gray-700">Notes</span>
                  <p className="mt-1 text-sm text-gray-600">Feeling energetic after morning workout. Good focus throughout the day.</p>
          </div>
              
                <button 
                  className="w-full mt-4 px-4 py-3 bg-white border border-blue-900 text-blue-900 rounded-lg text-sm font-medium flex items-center justify-center"
                  onClick={handleDailyAssessment}
                >
                  <i className="fa-solid fa-edit mr-2"></i>
                      Edit Assessment
            </button>
              </div>
            ) : (
              <div className="p-6 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <div className="flex-col items-center justify-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-blue-100 flex items-center justify-center">
                    <i className="fa-solid fa-clipboard-check text-blue-900 text-xl"></i>
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-1">Daily Wellness Assessment</h4>
                  <p className="text-gray-500 mb-5">Track your daily wellness to improve health insights</p>
                  <button 
                    className="mx-auto px-6 py-3 bg-blue-900 text-white rounded-lg text-sm font-medium flex items-center justify-center"
                    onClick={handleDailyAssessment}
                  >
                    Complete Today's Assessment
                    <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
          </div>
              </div>
            )}
          </div>
        </ErrorBoundary>
          </div>

      {/* Add Meal Modal */}
      <AddMealModal
        isOpen={showAddMealModal}
        onClose={() => setShowAddMealModal(false)}
        onSave={handleAddMeal}
      />
      
      {/* Add Activity Modal */}
      <AddActivityModal
        isOpen={showAddActivityModal}
        onClose={() => {
          setShowAddActivityModal(false);
          setEditingActivity(null);
        }}
        onSave={handleAddActivity}
        initialActivityType={editingActivity ? editingActivity.type : (selectedActivityType || 'run')}
        activityToEdit={editingActivity ? {
          type: editingActivity.type,
          duration: extractActivityDetails(editingActivity.description || '').duration,
          distance: extractActivityDetails(editingActivity.description || '').distance,
          intensity: editingActivity.intensity || 'Moderate', // Default if not stored
          notes: editingActivity.notes || '',  // Pass the notes from the activity being edited
          startTime: editingActivity.time ? editingActivity.time.replace(' AM', '').replace(' PM', '') : undefined
        } : undefined}
      />
      
      {/* Daily Assessment Modal */}
      <DailyAssessmentModal
        isOpen={showDailyAssessmentModal}
        onClose={() => setShowDailyAssessmentModal(false)}
        onSave={(assessmentData) => {
          // Refresh assessment data
          setCurrentDate(new Date());
        }}
      />
      
      <BottomNavbar />
    </div>
  );
};

export default Log;

