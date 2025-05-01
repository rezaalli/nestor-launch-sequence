
import React, { useEffect, useState } from 'react';
import { Bell, Star, ArrowUp, ClipboardList } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import StatusBar from '@/components/StatusBar';
import HealthMetrics from '@/components/HealthMetrics';
import WeeklyTrend from '@/components/WeeklyTrend';
import BottomNavbar from '@/components/BottomNavbar';

const Dashboard = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Show welcome toast
    toast({
      title: "Welcome to Nestor",
      description: "Your device is now connected and ready to use.",
    });
    
    // Simulate loading splash screen
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [toast]);
  
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <StatusBar />
      
      {/* Header */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center">
          <img 
            src="https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg" 
            alt="Profile" 
            className="w-10 h-10 rounded-full mr-3" 
          />
          <div>
            <h2 className="text-lg font-medium text-nestor-gray-900">Hi, Emma</h2>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></div>
              <span className="text-xs text-nestor-gray-600">Rolex Datejust • Connected</span>
            </div>
          </div>
        </div>
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <Bell className="text-nestor-gray-700" size={18} />
        </button>
      </div>
      
      {/* Daily Summary Card */}
      <div className="mx-6 mt-4 p-5 bg-blue-50 rounded-xl">
        <div className="flex items-center mb-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <Star className="text-nestor-blue" size={18} />
          </div>
          <div>
            <h3 className="font-medium text-nestor-gray-900">Wellness Score</h3>
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-900 mr-1">82</span>
              <span className="text-xs text-nestor-gray-600">/ 100</span>
            </div>
          </div>
          <div className="ml-auto flex items-center text-green-600 text-xs font-medium">
            <ArrowUp className="mr-1" size={14} />
            <span>4%</span>
          </div>
        </div>
        <p className="text-sm text-nestor-gray-700">Your sleep quality improved, but heart rate variability is slightly lower today.</p>
      </div>
      
      {/* Real-time Metrics */}
      <div className="px-6 mt-5">
        <h3 className="text-sm font-medium text-nestor-gray-500 mb-3">REAL-TIME METRICS</h3>
        <HealthMetrics />
      </div>
      
      {/* Lifestyle Check-In Button */}
      <button className="mx-6 mt-6 py-3.5 bg-nestor-blue text-white font-medium rounded-lg flex items-center justify-center">
        <ClipboardList className="mr-2" size={18} />
        Log Lifestyle Check-In
      </button>
      
      {/* Trends Preview */}
      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-nestor-gray-500">WEEKLY TRENDS</h3>
          <span className="text-xs text-blue-900 font-medium">View All</span>
        </div>
        <WeeklyTrend />
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default Dashboard;
