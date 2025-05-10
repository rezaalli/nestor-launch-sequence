import React, { useState, useEffect } from "react";
import { 
  ArrowLeft, Plus, Calendar, Activity, Dumbbell, 
  Utensils, Check, X, Edit, Bike, Route,
  Clock, Hourglass, Flame, Radar
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusBar from "@/components/StatusBar";
import BottomNavbar from "@/components/BottomNavbar";
import { Dialog, DialogContentWithoutCloseButton, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Log = () => {
  const navigate = useNavigate();
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [activityType, setActivityType] = useState<string>("Run");
  const [startTime, setStartTime] = useState<string>("09:30");
  const [duration, setDuration] = useState<string>("45:00");
  const [distance, setDistance] = useState<string>("5.2");
  const [intensity, setIntensity] = useState<string>("Moderate");
  const [notes, setNotes] = useState<string>("");
  const [autoDetection, setAutoDetection] = useState<boolean>(true);
  
  // Activities data sorted by popularity (most popular first)
  const activities = [
    "Run",
    "Walk",
    "Ride",
    "Hike",
    "Weight Training",
    "Yoga",
    "Workout",
    "HIIT",
    "Swim",
    "Trail Run",
    "Crossfit",
    "Virtual Run",
    "Mountain Bike Ride",
    "Pilates",
    "Elliptical",
    "Stair Stepper",
    "Tennis",
    "Soccer",
    "Golf",
    "Gravel Ride",
    "E-Bike Ride",
    "E-Mountain Bike Ride",
    "Alpine Ski",
    "Snowboard",
    "Backcountry Ski",
    "Nordic Ski",
    "Snowshoe",
    "Ice Skate",
    "Canoe",
    "Kayak",
    "Rowing",
    "Stand Up Paddling",
    "Surf",
    "Windsurf",
    "Kitesurf",
    "Sail",
    "Velomobile",
    "Virtual Ride",
    "Pickleball",
    "Badminton",
    "Squash",
    "Racquetball",
    "Table Tennis",
    "Skateboard",
    "Inline Skate",
    "Roller Ski",
    "Rock Climb",
    "Handcycle",
    "Wheelchair",
    "Virtual Row"
  ];
  
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
    setActivityType(type);
  };

  const handleEditWellnessSurvey = () => {
    // Navigate to the lifestyle check-in page
    navigate("/lifestyle-checkin");
  };
  
  // Handle back button click to navigate to dashboard
  const handleBackClick = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="min-h-screen bg-white">
      <StatusBar />
      
      {/* Header */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <button 
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={handleBackClick}
        >
          <ArrowLeft className="text-gray-700" size={18} />
        </button>
        <h2 className="text-lg font-medium text-gray-900">Daily Logs</h2>
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <Calendar className="text-gray-700" size={18} />
        </button>
      </div>

      {/* Date Selector */}
      <div className="px-6 mt-4">
        <div className="flex space-x-4 overflow-x-auto pb-2">
          <button className="flex-shrink-0 px-4 py-2 rounded-full bg-blue-900 text-white text-sm">Today</button>
          <button className="flex-shrink-0 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm">Yesterday</button>
          <button className="flex-shrink-0 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm">May 8</button>
          <button className="flex-shrink-0 px-4 py-2 rounded-full bg-gray-100 text-gray-600 text-sm">May 7</button>
        </div>
      </div>

      {/* Log Categories */}
      <div className="px-6 mt-6">
        {/* Activity Log */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">ACTIVITY LOG</h3>
            <button 
              className="text-sm text-blue-900 font-medium flex items-center"
              onClick={() => setShowActivityModal(true)}
            >
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
          </div>
        </div>

        {/* Meal Log */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">MEAL LOG</h3>
            <button className="text-sm text-blue-900 font-medium flex items-center">
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
                    <img 
                      className="w-full h-full object-cover" 
                      src="https://storage.googleapis.com/uxpilot-auth.appspot.com/08e9b93b0b-967156ea3c04be097bbc.png" 
                      alt="Oatmeal breakfast bowl with berries and honey" 
                    />
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
          </div>
        </div>

        {/* Daily Wellness Survey */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-500">DAILY WELLNESS SURVEY</h3>
            <span className="px-2 py-1 bg-green-100 text-green-600 text-xs font-medium rounded">Completed</span>
          </div>
          
          <div className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mood</span>
                <div className="flex items-center">
                  {/* Using a generic happy face emoji for now */}
                  <span className="text-blue-900 text-xl">😊</span>
                  <span className="ml-2 text-sm font-medium text-gray-900">Good</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sleep Quality</span>
                <span className="text-sm font-medium text-gray-900">7/10</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Energy Level</span>
                <span className="text-sm font-medium text-gray-900">8/10</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Caffeine</span>
                <Check className="text-green-500" size={16} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Alcohol</span>
                <X className="text-gray-400" size={16} />
              </div>
              
              <div className="pt-2">
                <span className="text-sm text-gray-600">Notes</span>
                <p className="mt-1 text-sm text-gray-900">Feeling energetic after morning workout. Good focus throughout the day.</p>
              </div>

              {/* Edit button */}
              <div className="pt-3">
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center text-blue-900 border-blue-900 hover:bg-blue-50"
                  onClick={handleEditWellnessSurvey}
                >
                  <Edit size={16} className="mr-2" />
                  Edit Survey
                </Button>
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
            <button 
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              onClick={handleCloseActivityModal}
            >
              <X className="text-gray-700" size={18} />
            </button>
            <h2 className="text-lg font-medium text-gray-900">Add Activity</h2>
            <button 
              className="text-sm font-medium text-blue-900"
              onClick={handleSaveActivity}
            >
              Save
            </button>
          </div>

          {/* Activity Type Selector - Simplified without RunningIcon */}
          <div className="px-6 mt-4">
            <label className="text-sm font-medium text-gray-500">ACTIVITY TYPE</label>
            <div className="mt-3 grid grid-cols-4 gap-3">
              <button 
                className={`p-3 ${activityType === 'Run' ? 'bg-blue-900' : 'border border-gray-200'} rounded-xl flex flex-col items-center`}
                onClick={() => handleSelectActivityType('Run')}
              >
                <Activity className={`${activityType === 'Run' ? 'text-white' : 'text-gray-600'} mb-1`} size={21} />
                <span className={`text-xs ${activityType === 'Run' ? 'text-white' : 'text-gray-600'}`}>Run</span>
              </button>
              
              <button 
                className={`p-3 ${activityType === 'Cycle' ? 'bg-blue-900' : 'border border-gray-200'} rounded-xl flex flex-col items-center`}
                onClick={() => handleSelectActivityType('Cycle')}
              >
                <Bike className={`${activityType === 'Cycle' ? 'text-white' : 'text-gray-600'} mb-1`} size={21} />
                <span className={`text-xs ${activityType === 'Cycle' ? 'text-white' : 'text-gray-600'}`}>Cycle</span>
              </button>
              
              <button 
                className={`p-3 ${activityType === 'Strength' ? 'bg-blue-900' : 'border border-gray-200'} rounded-xl flex flex-col items-center`}
                onClick={() => handleSelectActivityType('Strength')}
              >
                <Dumbbell className={`${activityType === 'Strength' ? 'text-white' : 'text-gray-600'} mb-1`} size={21} />
                <span className={`text-xs ${activityType === 'Strength' ? 'text-white' : 'text-gray-600'}`}>Strength</span>
              </button>
              
              <button 
                className="p-3 border border-gray-200 rounded-xl flex flex-col items-center"
                onClick={() => handleSelectActivityType('More')}
              >
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
                    <input 
                      type="time" 
                      className="w-full text-gray-900 bg-transparent" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-500">DURATION</label>
                  <div className="mt-2 flex items-center p-3 border border-gray-200 rounded-lg">
                    <Hourglass className="text-gray-400 mr-2" size={18} />
                    <input 
                      type="text" 
                      className="w-full text-gray-900 bg-transparent" 
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Distance & Intensity */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-500">DISTANCE (KM)</label>
                  <div className="mt-2 flex items-center p-3 border border-gray-200 rounded-lg">
                    <Route className="text-gray-400 mr-2" size={18} />
                    <input 
                      type="number" 
                      className="w-full text-gray-900 bg-transparent" 
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-sm font-medium text-gray-500">INTENSITY</label>
                  <div className="mt-2 flex items-center p-3 border border-gray-200 rounded-lg">
                    <Flame className="text-gray-400 mr-2" size={18} />
                    <select 
                      className="w-full text-gray-900 bg-transparent"
                      value={intensity}
                      onChange={(e) => setIntensity(e.target.value)}
                    >
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
                  <textarea 
                    className="w-full p-3 border border-gray-200 rounded-lg text-gray-900 h-24" 
                    placeholder="Add notes about your activity..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  ></textarea>
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
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={autoDetection}
                  onChange={(e) => setAutoDetection(e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
              </label>
            </div>
          </div>
        </DialogContentWithoutCloseButton>
      </Dialog>

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
    </div>
  );
};

export default Log;
