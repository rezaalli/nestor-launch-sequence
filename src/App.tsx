import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { UserProvider } from "./contexts/UserContext";
import Onboarding from "./components/Onboarding";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import LifestyleCheckIn from "./pages/LifestyleCheckIn";
import TrendsAndInsights from "./pages/TrendsAndInsights";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import DeviceConnectionLostScreen from "./screens/DeviceConnectionLostScreen";
import DeviceReconnectedScreen from "./screens/DeviceReconnectedScreen";
import { detectLowSpO2, analyzeSpO2, detectAbnormalTemperature } from "./utils/healthUtils";
import { useState, useEffect } from "react";
import SpO2AlertDialog from "./components/SpO2AlertDialog";
import TemperatureAlertDialog from "./components/TemperatureAlertDialog";
import { connectToDevice, isDeviceConnected, getLastReading, handleReconnection, isBleAvailable, requestBlePermissions } from "./utils/bleUtils";
import FlashLogUpload from "./components/FlashLogUpload";
import { BleClient } from '@capacitor-community/bluetooth-le';

const queryClient = new QueryClient();

const App = () => {
  const [showSpO2Alert, setShowSpO2Alert] = useState(false);
  const [spO2Level, setSpO2Level] = useState(92);
  const [showTempAlert, setShowTempAlert] = useState(false);
  const [tempData, setTempData] = useState({ temperature: 38.4, type: 'high' as 'high' | 'low' });
  const [connectionState, setConnectionState] = useState<'connected' | 'disconnected' | 'reconnecting'>('connected');
  const [lastVitalUpdate, setLastVitalUpdate] = useState<number>(Date.now());
  const [showFlashLogPrompt, setShowFlashLogPrompt] = useState(false);

  // Initialize BLE connection on app start
  useEffect(() => {
    const initializeConnection = async () => {
      try {
        // First check if BLE is available
        const bleAvailable = await isBleAvailable();
        
        if (!bleAvailable) {
          console.log('Bluetooth LE is not available on this device');
          setConnectionState('disconnected');
          return;
        }
        
        // Request permissions
        const hasPermissions = await requestBlePermissions();
        
        if (!hasPermissions) {
          console.log('Bluetooth permissions not granted');
          setConnectionState('disconnected');
          return;
        }
        
        // Initialize BLE client
        await BleClient.initialize();
        
        // Try to connect
        const connected = await connectToDevice();
        setConnectionState(connected ? 'connected' : 'disconnected');
      } catch (error) {
        console.error('Failed to initialize BLE connection:', error);
        setConnectionState('disconnected');
      }
    };
    
    initializeConnection();
    
    // Listen for Nestor vital updates
    const handleVitalUpdate = (event: Event) => {
      const vitalData = (event as CustomEvent).detail;
      setLastVitalUpdate(Date.now());
      
      // Update SpO2 if needed
      if (vitalData.spo2 < 92) {
        setSpO2Level(vitalData.spo2);
        setShowSpO2Alert(true);
      }
    };
    
    // Listen for fever alerts
    const handleFeverAlert = (event: Event) => {
      const feverData = (event as CustomEvent).detail;
      setTempData({
        temperature: feverData.temperature,
        type: feverData.type
      });
      setShowTempAlert(true);
    };
    
    // Listen for flash log data availability
    const handleFlashDataAvailable = () => {
      setShowFlashLogPrompt(true);
    };
    
    // Add event listeners
    window.addEventListener('nestor-vital-update', handleVitalUpdate);
    window.addEventListener('nestor-fever-alert', handleFeverAlert);
    window.addEventListener('nestor-flash-data-available', handleFlashDataAvailable);
    
    // Check connection status periodically
    const connectionCheckInterval = setInterval(() => {
      const connected = isDeviceConnected();
      const wasDisconnected = connectionState === 'disconnected' || connectionState === 'reconnecting';
      
      if (connected && wasDisconnected) {
        // Device was disconnected but now reconnected
        setConnectionState('connected');
        handleReconnection();
      } else if (connected) {
        setConnectionState('connected');
      } else if (!connected && connectionState === 'connected') {
        // Device just disconnected
        setConnectionState('reconnecting');
      } else if (!connected && connectionState === 'reconnecting' && Date.now() - lastVitalUpdate > 30000) {
        // Device has been disconnected for more than 30 seconds
        setConnectionState('disconnected');
      }
      
      // If we haven't received data in 30 seconds, try to reconnect
      if (connected && Date.now() - lastVitalUpdate > 30000) {
        connectToDevice().then(success => {
          if (!success) {
            setConnectionState('disconnected');
          }
        });
      }
    }, 15000); // Check every 15 seconds
    
    // Simulate SpO2 and temperature alerts for demo purposes
    const checkSpO2 = () => {
      const { detected, spO2Level: level } = detectLowSpO2();
      if (detected) {
        setSpO2Level(level);
        setShowSpO2Alert(true);
      }
    };
    
    const checkTemperature = () => {
      const { detected, temperature, type } = detectAbnormalTemperature();
      if (detected && (type === 'high' || type === 'low')) {
        setTempData({ temperature, type });
        setShowTempAlert(true);
      }
    };

    // For demo purposes, check SpO2 and temp occasionally
    const spO2Timer = setInterval(checkSpO2, 30000);
    const tempTimer = setInterval(checkTemperature, 45000);
    
    // Initial checks after a delay for demo purposes
    const initialSpO2Timer = setTimeout(checkSpO2, 15000);
    const initialTempTimer = setTimeout(checkTemperature, 25000);
    
    // Clean up on unmount
    return () => {
      window.removeEventListener('nestor-vital-update', handleVitalUpdate);
      window.removeEventListener('nestor-fever-alert', handleFeverAlert);
      window.removeEventListener('nestor-flash-data-available', handleFlashDataAvailable);
      clearInterval(connectionCheckInterval);
      clearInterval(spO2Timer);
      clearInterval(tempTimer);
      clearTimeout(initialSpO2Timer);
      clearTimeout(initialTempTimer);
    };
  }, [lastVitalUpdate, connectionState]);

  // Determine which screen to show based on connection state
  const renderConnectionScreen = () => {
    if (connectionState === 'disconnected') {
      return <DeviceConnectionLostScreen 
        onRetry={() => {
          connectToDevice().then(connected => {
            setConnectionState(connected ? 'connected' : 'disconnected');
          });
        }} 
        onContinueWithoutDevice={() => window.location.href = '/dashboard'} 
      />;
    } else if (connectionState === 'reconnecting') {
      return <DeviceReconnectedScreen />;
    }
    return null;
  };

  return (
    <QueryClientProvider client={queryClient}>
      <NotificationsProvider>
        <UserProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Onboarding />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/history" element={<History />} /> {/* Add History route */}
                <Route path="/lifestyle-checkin" element={<LifestyleCheckIn />} />
                <Route path="/trends" element={<TrendsAndInsights />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/profile" element={<Profile />} />
                <Route 
                  path="/connection-lost" 
                  element={
                    <DeviceConnectionLostScreen 
                      onRetry={() => window.location.href = '/dashboard'} 
                      onContinueWithoutDevice={() => window.location.href = '/dashboard'} 
                    />
                  } 
                />
                <Route 
                  path="/device-reconnected" 
                  element={
                    <DeviceReconnectedScreen />
                  } 
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Only show connection screens if not on the connection-lost or device-reconnected routes */}
              {!window.location.pathname.includes('connection-lost') && 
               !window.location.pathname.includes('device-reconnected') && 
               renderConnectionScreen()}
              
              <SpO2AlertDialog 
                open={showSpO2Alert} 
                onOpenChange={setShowSpO2Alert} 
                spO2Level={spO2Level}
                onDismiss={() => setShowSpO2Alert(false)}
                onTakeReading={() => {
                  // Simulate taking a new reading
                  const newLevel = Math.floor(Math.random() * 6) + 95; // Generate a normal reading after "taking" a new one
                  setSpO2Level(newLevel);
                  setTimeout(() => setShowSpO2Alert(false), 2000);
                }}
              />
              
              <TemperatureAlertDialog 
                open={showTempAlert}
                onOpenChange={setShowTempAlert}
                temperature={tempData.temperature}
                temperatureType={tempData.type}
                onDismiss={() => setShowTempAlert(false)}
                onMonitor={() => {
                  // Simulate taking a new reading
                  setTimeout(() => setShowTempAlert(false), 2000);
                }}
              />
              
              {/* Flash Log Upload Dialog */}
              <FlashLogUpload
                open={showFlashLogPrompt}
                onOpenChange={setShowFlashLogPrompt}
              />
            </BrowserRouter>
          </TooltipProvider>
        </UserProvider>
      </NotificationsProvider>
    </QueryClientProvider>
  );
};

export default App;
