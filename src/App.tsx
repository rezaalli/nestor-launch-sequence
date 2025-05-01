import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { UserProvider } from "./contexts/UserContext";
import Onboarding from "./components/Onboarding";
import Dashboard from "./pages/Dashboard";
import LifestyleCheckIn from "./pages/LifestyleCheckIn";
import TrendsAndInsights from "./pages/TrendsAndInsights";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import DeviceConnectionLostScreen from "./screens/DeviceConnectionLostScreen";
import DeviceReconnectedScreen from "./screens/DeviceReconnectedScreen";
import { detectLowSpO2, analyzeSpO2 } from "./utils/healthUtils";
import { useState, useEffect } from "react";
import SpO2AlertDialog from "./components/SpO2AlertDialog";

const queryClient = new QueryClient();

const App = () => {
  const [showSpO2Alert, setShowSpO2Alert] = useState(false);
  const [spO2Level, setSpO2Level] = useState(92);

  // Simulate a low SpO2 detection occasionally
  useEffect(() => {
    const checkSpO2 = () => {
      const { detected, spO2Level: level } = detectLowSpO2();
      if (detected) {
        setSpO2Level(level);
        setShowSpO2Alert(true);
      }
    };

    // Check every 30 seconds (for demo purposes)
    const timer = setInterval(checkSpO2, 30000);
    
    // Initial check after 15 seconds
    const initialTimer = setTimeout(checkSpO2, 15000);

    return () => {
      clearInterval(timer);
      clearTimeout(initialTimer);
    };
  }, []);

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
            </BrowserRouter>
          </TooltipProvider>
        </UserProvider>
      </NotificationsProvider>
    </QueryClientProvider>
  );
};

export default App;
