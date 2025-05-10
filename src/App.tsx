
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NotificationsProvider } from "./contexts/NotificationsContext";
import { UserProvider } from "./contexts/UserContext";
import { AssessmentProvider } from "./contexts/AssessmentContext";
import { NutritionProvider } from "./contexts/NutritionContext";
import Onboarding from "./components/Onboarding";
import Dashboard from "./pages/Dashboard";
import DailyAssessment from "./pages/DailyAssessment";
import TrendsAndInsights from "./pages/TrendsAndInsights";
import Notifications from "./pages/Notifications";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import HealthAlertsManager from "./components/HealthAlertsManager";
import FlashLogManager from "./components/FlashLogManager";
import Log from "./pages/Log";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <NotificationsProvider>
        <UserProvider>
          <AssessmentProvider>
            <NutritionProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Onboarding />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/dailyassessment" element={<DailyAssessment />} />
                    <Route path="/trends" element={<TrendsAndInsights />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/log" element={<Log />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  
                  <HealthAlertsManager />
                  <FlashLogManager />
                </BrowserRouter>
              </TooltipProvider>
            </NutritionProvider>
          </AssessmentProvider>
        </UserProvider>
      </NotificationsProvider>
    </QueryClientProvider>
  );
};

export default App;
