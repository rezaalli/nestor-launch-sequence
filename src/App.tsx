
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Onboarding from "./components/Onboarding";
import Dashboard from "./pages/Dashboard";
import LifestyleCheckIn from "./pages/LifestyleCheckIn";
import TrendsAndInsights from "./pages/TrendsAndInsights";
import NotFound from "./pages/NotFound";
import DeviceConnectionLostScreen from "./screens/DeviceConnectionLostScreen";
import DeviceReconnectedScreen from "./screens/DeviceReconnectedScreen";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lifestyle-checkin" element={<LifestyleCheckIn />} />
          <Route path="/trends" element={<TrendsAndInsights />} />
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
