import React, { useEffect, useState, useRef } from 'react';
import { Bell, Star, ArrowUp, ClipboardList, ChevronDown, Grid3x3 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/contexts/NotificationsContext";
import { useUser } from "@/contexts/UserContext";
import StatusBar from '@/components/StatusBar';
import BottomNavbar from '@/components/BottomNavbar';
import EcgAlertDialog from '@/components/EcgAlertDialog';
import HeartRateAlertDialog from '@/components/HeartRateAlertDialog';
import { detectIrregularEcg } from '@/utils/ecgUtils';
import { detectHighHeartRate } from '@/utils/healthUtils';
import HealthMetrics from '@/components/HealthMetrics';

const Dashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { showEcgAlert, addNotification } = useNotifications();
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
  
  // Create a ref for the metrics container
  const metricsGridRef = useRef<HTMLDivElement>(null);
  
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

    // Simulate heart rate alert detection after some time
    const heartRateTimer = setTimeout(() => {
      const { detected, heartRate } = detectHighHeartRate();
      if (detected) {
        setCurrentHeartRate(heartRate);
        setShowHeartRateDialog(true);
      }
    }, 8000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(ecgTimer);
      clearTimeout(heartRateTimer);
    };
  }, [toast]);
  
  // Effect for setting up drag-and-drop functionality
  useEffect(() => {
    if (loading || !metricsGridRef.current) return;

    let dragSrcEl: HTMLElement | null = null;
    
    const handleDragStart = (e: DragEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      
      dragSrcEl = e.target.closest('.metric-card');
      if (!dragSrcEl) return;
      
      e.dataTransfer?.setData('text/plain', ''); // Required for Firefox
      
      setTimeout(() => {
        if (dragSrcEl) dragSrcEl.classList.add('opacity-50');
      }, 0);
    };
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };
    
    const handleDragEnter = (e: DragEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      
      const targetCard = e.target.closest('.metric-card');
      if (targetCard) {
        targetCard.classList.add('bg-gray-100');
      }
    };
    
    const handleDragLeave = (e: DragEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      
      const targetCard = e.target.closest('.metric-card');
      if (targetCard) {
        targetCard.classList.remove('bg-gray-100');
      }
    };
    
    const handleDrop = (e: DragEvent) => {
      e.stopPropagation();
      
      if (!(e.target instanceof HTMLElement) || !dragSrcEl) return;
      
      const targetCard = e.target.closest('.metric-card');
      
      if (targetCard && dragSrcEl !== targetCard) {
        // Get the container and all cards
        const container = metricsGridRef.current;
        if (!container) return;
        
        // Determine if we're inserting before or after the target
        const rect = targetCard.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        const midY = rect.top + rect.height / 2;
        
        // If pointer is before the middle of the card, insert before, otherwise insert after
        if (e.clientX < midX && e.clientY < midY) {
          container.insertBefore(dragSrcEl, targetCard);
        } else {
          container.insertBefore(dragSrcEl, targetCard.nextSibling);
        }
        
        // Store the new order in localStorage
        saveCardOrder();
      }
      
      // Clean up
      if (targetCard) targetCard.classList.remove('bg-gray-100');
      dragSrcEl.classList.remove('opacity-50');
      
      return false;
    };
    
    const handleDragEnd = (e: DragEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      
      const cards = metricsGridRef.current?.querySelectorAll('.metric-card');
      if (cards) {
        cards.forEach(card => {
          (card as HTMLElement).classList.remove('bg-gray-100', 'opacity-50');
        });
      }
    };
    
    // Save the card order to localStorage
    const saveCardOrder = () => {
      const cards = metricsGridRef.current?.querySelectorAll('.metric-card');
      if (!cards) return;
      
      const order = Array.from(cards).map(card => card.id);
      localStorage.setItem('metricsOrder', JSON.stringify(order));
    };
    
    // Load saved order
    const loadCardOrder = () => {
      const container = metricsGridRef.current;
      if (!container) return;
      
      const savedOrder = localStorage.getItem('metricsOrder');
      if (!savedOrder) return;
      
      try {
        const order = JSON.parse(savedOrder);
        // Get all current cards
        const cards = Array.from(container.querySelectorAll('.metric-card'));
        
        // Reorder cards according to saved order
        order.forEach((id: string) => {
          const card = cards.find(card => card.id === id);
          if (card) container.appendChild(card);
        });
      } catch (e) {
        console.error('Error loading card order:', e);
      }
    };
    
    // Add event listeners to all cards
    const cards = metricsGridRef.current.querySelectorAll('.metric-card');
    cards.forEach(card => {
      card.setAttribute('draggable', 'true');
      card.addEventListener('dragstart', handleDragStart);
      card.addEventListener('dragover', handleDragOver);
      card.addEventListener('dragenter', handleDragEnter);
      card.addEventListener('dragleave', handleDragLeave);
      card.addEventListener('drop', handleDrop);
      card.addEventListener('dragend', handleDragEnd);
    });
    
    // Load saved card order on mount
    loadCardOrder();
    
    // Cleanup event listeners on component unmount
    return () => {
      if (!metricsGridRef.current) return;
      
      const cards = metricsGridRef.current.querySelectorAll('.metric-card');
      cards.forEach(card => {
        card.removeEventListener('dragstart', handleDragStart);
        card.removeEventListener('dragover', handleDragOver);
        card.removeEventListener('dragenter', handleDragEnter);
        card.removeEventListener('dragleave', handleDragLeave);
        card.removeEventListener('drop', handleDrop);
        card.removeEventListener('dragend', handleDragEnd);
      });
    };
  }, [loading]);
  
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
              <Grid3x3 className="mr-1" size={14} />
              Customize
            </button>
          </div>
          
          {/* Replace the grid with the HealthMetrics component */}
          <HealthMetrics />
          
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

      {/* Heart Rate Alert Dialog */}
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
