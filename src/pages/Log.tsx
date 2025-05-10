
import React, { useState } from "react";
import { 
  ArrowLeft, Plus, Calendar, Bike, Dumbbell, Utensils, 
  Check, X, Activity, Walk, Hike, Swim, Canoe, Yoga,
  Snowboard, Skateboard, Golf, Workout, Run
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatusBar from "@/components/StatusBar";

const Log = () => {
  const navigate = useNavigate();
  const [showActivityModal, setShowActivityModal] = useState(false);
  
  // Activities data based on the provided list
  const activities = [
    { name: "Run", icon: Run },
    { name: "Trail Run", icon: Run },
    { name: "Walk", icon: Walk },
    { name: "Hike", icon: Hike },
    { name: "Virtual Run", icon: Run },
    { name: "Ride", icon: Bike },
    { name: "Mountain Bike Ride", icon: Bike },
    { name: "Gravel Ride", icon: Bike },
    { name: "E-Bike Ride", icon: Bike },
    { name: "E-Mountain Bike Ride", icon: Bike },
    { name: "Velomobile", icon: Bike },
    { name: "Virtual Ride", icon: Bike },
    { name: "Alpine Ski", icon: Activity },
    { name: "Backcountry Ski", icon: Activity },
    { name: "Nordic Ski", icon: Activity },
    { name: "Snowboard", icon: Snowboard },
    { name: "Snowshoe", icon: Activity },
    { name: "Ice Skate", icon: Activity },
    { name: "Swim", icon: Swim },
    { name: "Canoe", icon: Canoe },
    { name: "Kayak", icon: Activity },
    { name: "Rowing", icon: Activity },
    { name: "Stand Up Paddling", icon: Activity },
    { name: "Surf", icon: Activity },
    { name: "Windsurf", icon: Activity },
    { name: "Kitesurf", icon: Activity },
    { name: "Sail", icon: Activity },
    { name: "Workout", icon: Workout },
    { name: "Weight Training", icon: Dumbbell },
    { name: "Crossfit", icon: Dumbbell },
    { name: "HIIT", icon: Workout },
    { name: "Pilates", icon: Yoga },
    { name: "Yoga", icon: Yoga },
    { name: "Elliptical", icon: Activity },
    { name: "Stair Stepper", icon: Activity },
    { name: "Tennis", icon: Activity },
    { name: "Pickleball", icon: Activity },
    { name: "Badminton", icon: Activity },
    { name: "Squash", icon: Activity },
    { name: "Racquetball", icon: Activity },
    { name: "Table Tennis", icon: Activity },
    { name: "Soccer", icon: Activity },
    { name: "Golf", icon: Golf },
    { name: "Skateboard", icon: Skateboard },
    { name: "Inline Skate", icon: Activity },
    { name: "Roller Ski", icon: Activity },
    { name: "Rock Climb", icon: Activity },
    { name: "Handcycle", icon: Activity },
    { name: "Wheelchair", icon: Activity },
    { name: "Virtual Row", icon: Activity }
  ];
  
  return (
    <div className="min-h-screen bg-white">
      <StatusBar />
      
      {/* Header */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <button 
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={() => navigate(-1)}
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
            </div>
          </div>
        </div>
      </div>

      {/* Add Activity Modal */}
      {showActivityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="absolute bottom-0 w-full bg-white rounded-t-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Add Activity</h3>
              <button 
                className="text-gray-400"
                onClick={() => setShowActivityModal(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mb-6 max-h-[400px] overflow-y-auto">
              {activities.map((activity, index) => (
                <button 
                  key={index} 
                  className="p-4 border border-gray-200 rounded-xl flex flex-col items-center"
                >
                  <activity.icon className="text-blue-900 mb-2" size={24} />
                  <span className="text-sm text-gray-900 text-center">{activity.name}</span>
                </button>
              ))}
            </div>
            
            <button className="w-full py-4 bg-blue-900 text-white font-medium rounded-lg">
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Log;
