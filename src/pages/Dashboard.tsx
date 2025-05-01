
import React, { useEffect, useState } from 'react';
import { Bell, Star, ArrowUp, ClipboardList, ChevronDown, Grid3x3 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationsContext";
import StatusBar from '@/components/StatusBar';
import BottomNavbar from '@/components/BottomNavbar';
import EcgAlertDialog from '@/components/EcgAlertDialog';
import { detectIrregularEcg } from '@/utils/ecgUtils';

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { showEcgAlert } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [showEcgDialog, setShowEcgDialog] = useState(false);
  const [gridLayout, setGridLayout] = useState<'3x2' | '2x3'>(() => {
    // Check if the user has a saved preference
    const savedLayout = localStorage.getItem('metricsLayout');
    return (savedLayout === '3x2' ? '3x2' : '2x3') as '3x2' | '2x3';
  });
  
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
    
    // Simulate ECG anomaly detection after some time
    const ecgTimer = setTimeout(() => {
      const hasAnomaly = detectIrregularEcg();
      if (hasAnomaly) {
        setShowEcgDialog(true);
      }
    }, 15000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(ecgTimer);
    };
  }, [toast]);
  
  const toggleGridLayout = () => {
    const newLayout = gridLayout === '2x3' ? '3x2' : '2x3';
    setGridLayout(newLayout);
    localStorage.setItem('metricsLayout', newLayout);
  };
  
  const handleLifestyleCheckIn = () => {
    navigate("/lifestyle-checkin");
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
    
    // Add to notifications even if dismissed from dialog
    showEcgAlert();
  };
  
  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  const handleViewAllTrends = () => {
    navigate('/trends');
  };
  
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
    <>
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
          <button 
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            onClick={handleNotificationsClick}
          >
            <Bell className="text-nestor-gray-700" size={18} />
          </button>
        </div>
        
        {/* Daily Summary Card */}
        <div className="mx-6 mt-4 p-5 bg-blue-50 rounded-xl">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <Star className="text-blue-900" size={18} />
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
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-nestor-gray-500">REAL-TIME METRICS</h3>
            <button 
              className="text-xs text-blue-900 font-medium flex items-center"
              onClick={toggleGridLayout}
            >
              <i className="fa-solid fa-grip-vertical mr-1"></i>
              Customize {gridLayout === '2x3' ? '(2×3)' : '(3×2)'}
            </button>
          </div>
          <div className={`grid ${gridLayout === '2x3' ? 'grid-cols-3' : 'grid-cols-2'} gap-3`}>
            <div id="heart-rate-card" className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center mb-2">
                <i className="fa-solid fa-heart-pulse text-red-500 mr-2"></i>
                <span className="text-xs text-gray-600">Heart Rate</span>
              </div>
              <div className="flex items-end">
                <span className="text-2xl font-semibold text-gray-900">72</span>
                <span className="text-sm text-gray-600 ml-1 mb-0.5">bpm</span>
              </div>
              <div className="mt-2 h-8">
                <div className="relative h-full">
                  <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between space-x-1">
                    <div className="w-1 bg-red-200 rounded-t h-2"></div>
                    <div className="w-1 bg-red-200 rounded-t h-3"></div>
                    <div className="w-1 bg-red-300 rounded-t h-4"></div>
                    <div className="w-1 bg-red-400 rounded-t h-5"></div>
                    <div className="w-1 bg-red-500 rounded-t h-7"></div>
                    <div className="w-1 bg-red-400 rounded-t h-5"></div>
                    <div className="w-1 bg-red-300 rounded-t h-3"></div>
                    <div className="w-1 bg-red-200 rounded-t h-2"></div>
                    <div className="w-1 bg-red-200 rounded-t h-1"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div id="steps-card" className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center mb-2">
                <i className="fa-solid fa-shoe-prints text-green-500 mr-2"></i>
                <span className="text-xs text-gray-600">Steps</span>
              </div>
              <div className="flex items-end">
                <span className="text-2xl font-semibold text-gray-900">8,742</span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">Goal: 10k</span>
                </div>
              </div>
            </div>

            <div id="activity-card" className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center mb-2">
                <i className="fa-solid fa-fire text-orange-500 mr-2"></i>
                <span className="text-xs text-gray-600">Activity</span>
              </div>
              <div className="flex items-end">
                <span className="text-2xl font-semibold text-gray-900">487</span>
                <span className="text-sm text-gray-600 ml-1 mb-0.5">cal</span>
              </div>
              <div className="mt-2 flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <span className="text-xs text-green-500 ml-2">Active</span>
              </div>
            </div>

            <div id="oxygen-card" className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center mb-2">
                <i className="fa-solid fa-droplet text-blue-500 mr-2"></i>
                <span className="text-xs text-gray-600">SpO₂</span>
              </div>
              <div className="flex items-end">
                <span className="text-2xl font-semibold text-gray-900">98</span>
                <span className="text-sm text-gray-600 ml-1 mb-0.5">%</span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '98%' }}></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">90</span>
                  <span className="text-xs text-gray-500">100</span>
                </div>
              </div>
            </div>
            
            <div id="ecg-card" className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center mb-2">
                <i className="fa-solid fa-wave-square text-purple-500 mr-2"></i>
                <span className="text-xs text-gray-600">ECG</span>
              </div>
              <div className="text-sm text-gray-900 font-medium">Normal Sinus</div>
              <div className="mt-2 h-10">
                <div className="relative h-full flex items-center">
                  <div className="absolute inset-0">
                    <svg viewBox="0 0 100 30" className="w-full h-full">
                      <path d="M0,15 L10,15 L15,5 L20,25 L25,15 L30,15 L35,15 L40,5 L45,25 L50,15 L55,15 L60,15 L65,5 L70,25 L75,15 L80,15 L85,15 L90,5 L95,25 L100,15" fill="none" stroke="#a855f7" strokeWidth="1.5"></path>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div id="temperature-card" className="p-4 bg-white border border-gray-200 rounded-xl">
              <div className="flex items-center mb-2">
                <i className="fa-solid fa-temperature-half text-orange-500 mr-2"></i>
                <span className="text-xs text-gray-600 truncate">Temp</span>
              </div>
              <div className="flex items-end">
                <span className="text-2xl font-semibold text-gray-900">36.7</span>
                <span className="text-sm text-gray-600 ml-1 mb-0.5">°C</span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">35.5</span>
                  <span className="text-xs text-gray-500">37.5</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Lifestyle Check-In Button */}
        <button 
          className="mx-6 mt-6 py-3.5 bg-blue-900 text-white font-medium rounded-lg flex items-center justify-center"
          onClick={handleLifestyleCheckIn}
        >
          <ClipboardList className="mr-2" size={18} />
          Log Lifestyle Check-In
        </button>
        
        {/* Trends Preview */}
        <div className="px-6 mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-nestor-gray-500">WEEKLY TRENDS</h3>
            <span 
              className="text-xs text-blue-900 font-medium cursor-pointer"
              onClick={handleViewAllTrends}
            >
              View All
            </span>
          </div>
          
          <div className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Heart Rate</h4>
              <div className="text-xs flex items-center text-gray-600">
                <span>Last 7 days</span>
                <ChevronDown className="ml-1" size={12} />
              </div>
            </div>
            
            <div className="h-32 mb-2">
              <div className="h-full flex items-end justify-between">
                <div className="flex flex-col items-center">
                  <div className="h-14 w-6 bg-blue-100 rounded-t-md relative">
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-900 rounded-t-md h-10"></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">Mon</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-20 w-6 bg-blue-100 rounded-t-md relative">
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-900 rounded-t-md h-16"></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">Tue</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-24 w-6 bg-blue-100 rounded-t-md relative">
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-900 rounded-t-md h-14"></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">Wed</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-18 w-6 bg-blue-100 rounded-t-md relative">
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-900 rounded-t-md h-12"></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">Thu</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-16 w-6 bg-blue-100 rounded-t-md relative">
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-900 rounded-t-md h-8"></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">Fri</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-22 w-6 bg-blue-100 rounded-t-md relative">
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-900 rounded-t-md h-18"></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">Sat</span>
                </div>
                <div className="flex flex-col items-center">
                  <div className="h-28 w-6 bg-blue-100 rounded-t-md relative">
                    <div className="absolute bottom-0 left-0 right-0 bg-blue-900 rounded-t-md h-20"></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">Sun</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-xs text-gray-600">
              <div>Avg: <span className="font-medium">72 bpm</span></div>
              <div>Peak: <span className="font-medium">118 bpm</span></div>
              <div>Rest: <span className="font-medium">58 bpm</span></div>
            </div>
          </div>
        </div>
        
        <BottomNavbar />
      </div>
      
      {/* ECG Alert Dialog */}
      <EcgAlertDialog
        open={showEcgDialog}
        onOpenChange={setShowEcgDialog}
        onTakeEcg={handleTakeEcg}
        onDismiss={handleDismissEcg}
      />
    </>
  );
};

export default Dashboard;
