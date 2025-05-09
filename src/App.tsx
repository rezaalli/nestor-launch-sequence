
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
import ConnectionLostPage from "./screens/ConnectionLostPage";
import DeviceReconnectedScreen from "./screens/DeviceReconnectedScreen";
import ConnectionStateManager from "./components/ConnectionStateManager";
import HealthAlertsManager from "./components/HealthAlertsManager";
import FlashLogManager from "./components/FlashLogManager";
import { useDeviceConnection } from "./hooks/useDeviceConnection";

const queryClient = new QueryClient();

const App = () => {
  const { connectionState, attemptReconnection, continueWithoutDevice } = useDeviceConnection();

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
                <Route path="/history" element={<History />} />
                <Route path="/lifestyle-checkin" element={<LifestyleCheckIn />} />
                <Route path="/trends" element={<TrendsAndInsights />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/connection-lost" element={<ConnectionLostPage />} />
                <Route path="/device-reconnected" element={<DeviceReconnectedScreen />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              
              {/* Only show connection screens if not on the connection-lost or device-reconnected routes */}
              {!window.location.pathname.includes('connection-lost') && 
               !window.location.pathname.includes('device-reconnected') && (
                <ConnectionStateManager
                  connectionState={connectionState}
                  onRetryConnection={attemptReconnection}
                  onContinueWithoutDevice={continueWithoutDevice}
                />
              )}
              
              {/* Health Alerts Component */}
              <HealthAlertsManager />
              
              {/* Flash Log Upload Component */}
              <FlashLogManager />
            </BrowserRouter>
          </TooltipProvider>
        </UserProvider>
      </NotificationsProvider>
    </QueryClientProvider>
  );
};

export default App;
