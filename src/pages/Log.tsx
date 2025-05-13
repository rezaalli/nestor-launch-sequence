import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Calendar, Activity, Dumbbell, Utensils, Check, X, Edit, Bike, Route, Clock, Hourglass, Flame, Radar, Heart, Moon, Coffee, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import StatusBar from "@/components/StatusBar";
import BottomNavbar from "@/components/BottomNavbar";
import { Dialog, DialogContentWithoutCloseButton, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import AddMealModalWrapper from "@/components/AddMealModalWrapper";
import { useToast } from "@/hooks/use-toast";
import { useAssessment } from "@/contexts/AssessmentContext";

const Log = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAssessmentCompletedForDate } = useAssessment();
  
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [activityType, setActivityType] = useState<string>("Run");
  const [startTime, setStartTime] = useState<string>("09:30");
  const [duration, setDuration] = useState<string>("45:00");
  const [distance, setDistance] = useState<string>("5.2");
  const [intensity, setIntensity] = useState<string>("Moderate");
  const [notes, setNotes] = useState<string>("");
  const [autoDetection, setAutoDetection] = useState<boolean>(true);
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Activities data sorted by popularity (most popular first)
  const activities = ["Run", "Walk", "Ride", "Hike", "Weight Training", "Yoga", "Workout", "HIIT", "Swim", "Trail Run", "Crossfit", "Virtual Run", "Mountain Bike Ride", "Pilates", "Elliptical", "Stair Stepper", "Tennis", "Soccer", "Golf", "Gravel Ride", "E-Bike Ride", "E-Mountain Bike Ride", "Alpine Ski", "Snowboard", "Backcountry Ski", "Nordic Ski", "Snowshoe", "Ice Skate", "Canoe", "Kayak", "Rowing", "Stand Up Paddling", "Surf", "Windsurf", "Kitesurf", "Sail", "Velomobile", "Virtual Ride", "Pickleball", "Badminton", "Squash", "Racquetball", "Table Tennis", "Skateboard", "Inline Skate", "Roller Ski", "Rock Climb", "Handcycle", "Wheelchair", "Virtual Row"];
  
  const handleCloseActivityModal = () => {
    setShowActivityModal(false);
  };
  const handleSaveActivity = () => {
    // Here you would typically handle saving the activity data
    console.log({
      activityType,
      startTime,
      duration,
      distance,
      intensity,
      notes,
      autoDetection
    });
    setShowActivityModal(false);
  };
  const handleSelectActivityType = (type: string) => {
    if (type === 'More') {
      setShowActivityPicker(true);
    } else {
      setActivityType(type);
    }
  };
  const handleSelectActivityFromPicker = (type: string) => {
    setActivityType(type);
    setShowActivityPicker(false);
  };
  
  // Check if assessment is completed for the current date
  const isAssessmentCompleted = isAssessmentCompletedForDate(currentDate);

  const handleEditWellnessSurvey = () => {
    // Navigate to the daily assessment page
    navigate("/dailyassessment");
  };

  // Handle back button click to navigate to dashboard
  const handleBackClick = () => {
    navigate('/dashboard');
  };
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      // Here you would typically fetch data for the selected date
      toast({
        title: "Date Selected",
        description: `Viewing logs for ${format(date, "MMMM d, yyyy")}`
      });
    }
  };
  
  return <div className="min-h-screen pb-20 bg-white">
      <StatusBar />
      
      {/* Header */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" onClick={handleBackClick}>
          <ArrowLeft className="text-gray-700" size={18} />
        </button>
        <h2 className="text-lg font-medium text-gray-900">Daily Logs</h2>
        
        {/* Calendar Button with Popover */}
        <Popover>
          <PopoverTrigger asChild>
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <Calendar className="text-gray-700" size={18} />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent mode="single" selected={currentDate} onSelect={handleDateChange} initialFocus className="p-3 pointer-events-auto" />
          </PopoverContent>
        </Popover>
      </div>

      {/* Date Selector */}
      <div className="px-6 mt-4">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          <button className="flex-shrink-0 px-4 py-2 rounded-full bg-blue-900 text-white text-sm">
            {format(currentDate, "MMM d") === format(new Date(), "MMM d") ? "Today" : format(currentDate, "MMM d")}
          </button>
          <button className="flex-shrink-0 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm" onClick={() => {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          setCurrentDate(yesterday);
        }}>
            Yesterday
          </button>
          <button className="flex-shrink-0 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm" onClick={() => {
          const twoDaysAgo = new Date();
          twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
          setCurrentDate(twoDaysAgo);
        }}>
            {format(new Date(new Date().setDate(new Date().getDate() - 2)), "MMM d")}
          </button>
          <button className="flex-shrink-0 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm" onClick={() => {
          const threeDaysAgo = new Date();
          threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
          setCurrentDate(threeDaysAgo);
        }}>
            {format(new Date(new Date().setDate(new Date().getDate() - 3)), "MMM d")}
          </button>
        </div>
      </div>

      {/* Log Categories */}
      <div className="px-6 mt-6">
        {/* Activity Log */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">ACTIVITY LOG</h3>
            <button className="text-sm text-blue-900 font-medium flex items-center" onClick={() => setShowActivityModal(true)}>
              <Plus className="mr-1" size={16} />
              Add Activity
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <Activity className="text-green-600" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Morning Run</h4>
                    <span className="text-sm text-gray-500">8:30 AM</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Distance</span>
                      <p className="font-medium text-gray-900">5.2 km</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Duration</span>
                      <p className="font-medium text-gray-900">32 min</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Pace</span>
                      <p className="font-medium text-gray-900">6:09/km</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                  <Dumbbell className="text-purple-600" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Strength Training</h4>
                    <span className="text-sm text-gray-500">10:15 AM</span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Upper body workout • 45 min</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional activity item */}
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <Bike className="text-blue-600" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Evening Ride</h4>
                    <span className="text-sm text-gray-500">6:45 PM</span>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-4">
                    <div className="text-sm">
                      <span className="text-gray-500">Distance</span>
                      <p className="font-medium text-gray-900">12.8 km</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Duration</span>
                      <p className="font-medium text-gray-900">52 min</p>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-500">Avg. Speed</span>
                      <p className="font-medium text-gray-900">14.7 km/h</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Meal Log */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">MEAL LOG</h3>
            <button className="text-sm text-blue-900 font-medium flex items-center" onClick={() => setShowAddMealModal(true)}>
              <Plus className="mr-1" size={16} />
              Add Meal
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                  <Utensils className="text-orange-600" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Breakfast</h4>
                    <span className="text-sm text-gray-500">7:30 AM</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Oatmeal with berries and honey</p>
                  <div className="relative h-32 w-full rounded-lg overflow-hidden">
                    <img className="w-full h-full object-cover" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/08e9b93b0b-967156ea3c04be097bbc.png" alt="Oatmeal breakfast bowl with berries and honey" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                  <Utensils className="text-orange-600" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Lunch</h4>
                    <span className="text-sm text-gray-500">12:45 PM</span>
                  </div>
                  <p className="text-sm text-gray-600">Grilled chicken salad with avocado</p>
                </div>
              </div>
            </div>
            
            {/* Additional meal item */}
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                  <Utensils className="text-orange-600" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">Dinner</h4>
                    <span className="text-sm text-gray-500">7:15 PM</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Salmon with roasted vegetables and quinoa</p>
                  <div className="relative h-32 w-full rounded-lg overflow-hidden">
                    <img className="w-full h-full object-cover" src="/lovable-uploads/987f368f-d87f-420a-94e9-c096b6fb0cf9.png" alt="Daily wellness assessment" />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Snack item */}
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                  <Utensils className="text-orange-600" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Afternoon Snack</h4>
                    <span className="text-sm text-gray-500">3:30 PM</span>
                  </div>
                  <p className="text-sm text-gray-600">Greek yogurt with berries and honey</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Daily Wellness Survey - Updated to reflect assessment structure */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">DAILY WELLNESS ASSESSMENT</h3>
            {isAssessmentCompleted ? (
              <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">Completed</span>
            ) : (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs font-medium rounded">Pending</span>
            )}
          </div>
          
          <div className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="space-y-5">
              {/* General Wellness */}
              <div className="pb-3 border-b border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">General Wellness</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Heart className="mr-2 text-blue-900" size={16} />
                      <span className="text-sm text-gray-600">How do you feel today?</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Good</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Moon className="mr-2 text-blue-900" size={16} />
                      <span className="text-sm text-gray-600">Sleep quality</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Well rested</span>
                  </div>
                </div>
              </div>
              
              {/* Consumption */}
              <div className="pb-3 border-b border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Consumption</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Coffee className="mr-2 text-blue-900" size={16} />
                      <span className="text-sm text-gray-600">Caffeine</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">1-2 cups (morning)</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Utensils className="mr-2 text-blue-900" size={16} />
                      <span className="text-sm text-gray-600">Meals</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Balanced</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-2 text-blue-900 text-sm">🍷</span>
                      <span className="text-sm text-gray-600">Alcohol</span>
                    </div>
                    <X className="text-gray-400" size={16} />
                  </div>
                </div>
              </div>
              
              {/* Physical Health */}
              <div className="pb-3 border-b border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Physical Health</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Activity className="mr-2 text-blue-900" size={16} />
                      <span className="text-sm text-gray-600">Exercise</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Cardio (Moderate)</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="mr-2 text-blue-900 text-sm">💧</span>
                      <span className="text-sm text-gray-600">Hydration</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Normal</span>
                  </div>
                </div>
              </div>
              
              {/* Mental Health */}
              <div className="pb-3 border-b border-gray-100">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Mental Health</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Brain className="mr-2 text-blue-900" size={16} />
                      <span className="text-sm text-gray-600">Mental State</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">Good/Stable</span>
                  </div>
                </div>
              </div>
              
              {/* Notes */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                <p className="text-sm text-gray-600">Feeling energetic after morning workout. Good focus throughout the day.</p>
              </div>

              {/* Edit button - changes based on completion status */}
              <div className="pt-3">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center text-blue-900 border-blue-900 hover:bg-blue-50" 
                  onClick={handleEditWellnessSurvey}
                >
                  {isAssessmentCompleted ? (
                    <>
                      <Edit size={16} className="mr-2" />
                      Edit Assessment
                    </>
                  ) : (
                    <>
                      <Edit size={16} className="mr-2" />
                      Complete Today's Assessment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Health Metrics Section - New section to increase scroll length */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">HEALTH METRICS</h3>
          </div>
          
          <div className="space-y-3">
            {/* Heart Rate Card */}
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                  <Heart className="text-red-500" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Heart Rate</h4>
                    <span className="text-sm text-gray-500">Last updated: 30m ago</span>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex items-end">
                      <span className="text-2xl font-semibold">68</span>
                      <span className="ml-1 text-gray-500 text-sm mb-1">bpm</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Resting: 62 bpm • Max today: 142 bpm</p>
                    
                    {/* Simple line chart visualization */}
                    <div className="mt-3 h-16 flex items-end space-x-1">
                      {[20, 35, 25, 40, 30, 45, 55, 65, 60, 50, 58, 62].map((value, i) => (
                        <div 
                          key={i} 
                          className="flex-1 bg-red-100 rounded-t"
                          style={{ height: `${value}%` }}
                        ></div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>6 AM</span>
                      <span>12 PM</span>
                      <span>6 PM</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Sleep Card */}
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                  <Moon className="text-indigo-600" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Sleep</h4>
                  </div>
                  
                  <div className="mt-3">
                    <div className="flex items-end">
                      <span className="text-2xl font-semibold">7h 45m</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">11:15 PM - 7:00 AM</p>
                    
                    {/* Sleep phases visualization */}
                    <div className="mt-3 h-8 flex rounded-lg overflow-hidden">
                      <div className="bg-indigo-800 w-[15%]" title="Deep sleep"></div>
                      <div className="bg-indigo-600 w-[30%]" title="REM sleep"></div>
                      <div className="bg-indigo-400 w-[40%]" title="Light sleep"></div>
                      <div className="bg-indigo-200 w-[15%]" title="Awake"></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <div>
                        <span className="inline-block w-3 h-3 bg-indigo-800 rounded-sm mr-1"></span>
                        <span>Deep: 1h 10m</span>
                      </div>
                      <div>
                        <span className="inline-block w-3 h-3 bg-indigo-600 rounded-sm mr-1"></span>
                        <span>REM: 2h 20m</span>
                      </div>
                      <div>
                        <span className="inline-block w-3 h-3 bg-indigo-400 rounded-sm mr-1"></span>
                        <span>Light: 3h 10m</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Goals Section - New section to increase scroll length */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">TODAY'S GOALS</h3>
            <button className="text-sm text-blue-900 font-medium flex items-center">
              <Plus className="mr-1" size={16} />
              Add Goal
            </button>
          </div>
          
          <div className="space-y-3">
            {/* Steps Goal */}
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <span className="text-green-600 text-sm">👣</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Steps</h4>
                    <span className="text-sm text-green-600 font-medium">8,547 / 10,000</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Water Goal */}
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-sm">💧</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Water Intake</h4>
                    <span className="text-sm text-blue-600 font-medium">1.2L / 2.5L</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '48%' }}></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Active Minutes Goal */}
            <div className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                  <Activity className="text-orange-600" size={20} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">Active Minutes</h4>
                    <span className="text-sm text-orange-600 font-medium">45 / 60 min</span>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-2 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Activity Dialog */}
      <Dialog open={showActivityModal} onOpenChange={setShowActivityModal}>
        <DialogContentWithoutCloseButton className="max-w-md p-0 gap-0 rounded-xl">
          <DialogHeader>
            <DialogTitle className="sr-only">Add Activity</DialogTitle>
          </DialogHeader>
          {/* Header */}
          <div className="px-6 pt-4 pb-2 flex items-center justify-between">
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" onClick={handleCloseActivityModal}>
              <X className="text-gray-700" size={18} />
            </button>
            <h2 className="text-lg font-medium text-gray-900">Add Activity</h2>
            <button className="text-sm font-medium text-blue-900" onClick={handleSaveActivity}>
              Save
            </button>
          </div>

          {/* Activity Type Selector - Simplified without RunningIcon */}
          <div className="px-6 mt-4">
            <label className="text-sm font-medium text-gray-500">ACTIVITY TYPE</label>
            <div className="mt-3 grid grid-cols-4 gap-3">
              <button className={`p-3 ${activityType === 'Run' ? 'bg-blue-900' : 'border border-gray-200'} rounded-xl flex flex-col items-center`} onClick={() => handleSelectActivityType('Run')}>
                <Activity className={`${activityType === 'Run' ? 'text-white' : 'text-gray-600'} mb-1`} size={21} />
                <span className={`text-xs ${activityType === 'Run' ? 'text-white' : 'text-gray-600'}`}>Run</span>
              </button>
              
              <button className={`p-3 ${activityType === 'Cycle' ? 'bg-blue-900' : 'border border-gray-200'} rounded-xl flex flex-col items-center`} onClick={() => handleSelectActivityType('Cycle')}>
                <Bike className={`${activityType === 'Cycle' ? 'text-white' : 'text-gray-600'} mb-1`} size={21} />
                <span className={`text-xs ${activityType === 'Cycle' ? 'text-white' : 'text-gray-600'}`}>Cycle</span>
              </button>
              
              <button className={`p-3 ${activityType === 'Strength' ? 'bg-blue-900' : 'border border-gray-200'} rounded-xl flex flex-col items-center`} onClick={() => handleSelectActivityType('Strength')}>
                <Dumbbell className={`${activityType === 'Strength' ? 'text-white' : 'text-gray-600'} mb-1`} size={21} />
                <span className={`text-xs ${activityType === 'Strength' ? 'text-white' : 'text-gray-600'}`}>Strength</span>
              </button>
              
              <button className="p-3 border border-gray-200 rounded-xl flex flex-col items-center" onClick={() => handleSelectActivityType('More')}>
                <Plus className="text-gray-600 mb-1" size={21} />
                <span className="text-xs text-gray-600">More</span>
              </button>
            </div>
          </div>

          {/* Activity Details Form */}
          <div className="px-6 mt-6 overflow-auto max-h-[60vh]">
            <div className="space-y-5">
              {/* Time & Duration */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-500">START TIME</label>
                  <div className="mt-2 flex items-center p-3 border border-gray-200 rounded-lg">
                    <Clock className="text-gray-400 mr-2" size={18} />
                    <input type="time" className="w-full text-gray-900 bg-transparent" value={startTime} onChange={e => setStartTime(e.target.value)} />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-500">DURATION</label>
                  <div className="mt-2 flex items-center p-3 border border-gray-200 rounded-lg">
                    <Hourglass className="text-gray-400 mr-2" size={18} />
                    <input type="text" className="w-full text-gray-900 bg-transparent" value={duration} onChange={e => setDuration(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Distance & Intensity */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-500">DISTANCE (KM)</label>
                  <div className="mt-2 flex items-center p-3 border border-gray-200 rounded-lg">
                    <Route className="text-gray-400 mr-2" size={18} />
                    <input type="number" className="w-full text-gray-900 bg-transparent" value={distance} onChange={e => setDistance(e.target.value)} />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-500">INTENSITY</label>
                  <div className="mt-2 flex items-center p-3 border border-gray-200 rounded-lg">
                    <Flame className="text-gray-400 mr-2" size={18} />
                    <select className="w-full text-gray-900 bg-transparent" value={intensity} onChange={e => setIntensity(e.target.value)}>
                      <option>Moderate</option>
                      <option>Light</option>
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

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-500">NOTES</label>
                <div className="mt-2">
                  <textarea className="w-full p-3 border border-gray-200 rounded-lg text-gray-900 h-24" placeholder="Add notes about your activity..." value={notes} onChange={e => setNotes(e.target.value)}></textarea>
                </div>
              </div>
            </div>
          </div>

          {/* Auto-Detection Notice */}
          <div className="mt-6 bg-gray-50 border-t border-gray-200">
            <div className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center">
                <Radar className="text-blue-900 mr-3" size={21} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Auto-Detection</p>
                  <p className="text-xs text-gray-500">Device will automatically detect your activities</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={autoDetection} onChange={e => setAutoDetection(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
              </label>
            </div>
          </div>
        </DialogContentWithoutCloseButton>
      </Dialog>

      {/* Activity Type Picker Dialog */}
      <Dialog open={showActivityPicker} onOpenChange={setShowActivityPicker}>
        <DialogContentWithoutCloseButton className="max-w-md p-0 gap-0 rounded-xl">
          <div className="px-6 pt-4 pb-2 flex items-center justify-between">
            <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center" onClick={() => setShowActivityPicker(false)}>
              <X className="text-gray-700" size={18} />
            </button>
            <h2 className="text-lg font-medium text-gray-900">Select Activity</h2>
            <button className="text-sm font-medium text-blue-900" onClick={() => setShowActivityPicker(false)}>
              Done
            </button>
          </div>

          {/* Activity Picker Wheel */}
          <div className="relative">
            {/* Highlight for selected item */}
            <div className="absolute left-0 right-0 h-12 bg-gray-50 border-y border-gray-200 top-1/2 -mt-6 pointer-events-none"></div>
            
            <ScrollArea className="h-[240px] px-6">
              <div className="py-[88px] space-y-1">
                {activities.map(activity => <button key={activity} className={`block w-full text-left py-3 px-4 rounded-lg ${activityType === activity ? "text-blue-900 font-semibold text-base" : "text-gray-600 text-sm"}`} onClick={() => handleSelectActivityFromPicker(activity)}>
                    {activity}
                  </button>)}
              </div>
            </ScrollArea>
          </div>
        </DialogContentWithoutCloseButton>
      </Dialog>

      {/* Updated AddMeal Modal */}
      <AddMealModalWrapper open={showAddMealModal} onOpenChange={setShowAddMealModal} />

      {/* Add BottomNavbar component */}
      <BottomNavbar />

      {/* Styles for scrollbar hiding */}
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
    </div>;
};

export default Log;
