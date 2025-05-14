import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Index from './pages/Index';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Log from './pages/Log';
import TrendsAndInsights from './pages/TrendsAndInsights';
import DailyAssessment from './pages/DailyAssessment';
import LifestyleCheckIn from './pages/LifestyleCheckIn';
import Reports from './pages/Reports';
import NotFound from './pages/NotFound';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from './contexts/UserContext';
import { AssessmentProvider } from './contexts/AssessmentContext';
import { NutritionProvider } from './contexts/NutritionContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import StatusBar from './components/StatusBar';
import BottomNavbar from './components/BottomNavbar';
import Notifications from './pages/Notifications';
import Onboarding from './components/Onboarding';
import AuthScreen from './screens/AuthScreen';

// Private route component to protect routes that require authentication
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  // Show loading indicator while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useAuth();

  // If user is logged in and navigates to auth page, redirect to dashboard
  const handleAuthRedirect = () => {
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    return <AuthScreen />;
  };

  return (
    <Router>
      <div className="app-container">
        {showOnboarding ? (
          <Onboarding onComplete={() => setShowOnboarding(false)} />
        ) : (
          <>
            <Routes>
              <Route path="/auth" element={handleAuthRedirect()} />
              
              {/* Protected routes */}
              <Route 
                path="/" 
                element={
                  <PrivateRoute>
                    <StatusBar />
                    <Index />
                    <BottomNavbar />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/dashboard" 
                element={
                  <PrivateRoute>
                    <StatusBar />
                    <Dashboard />
                    <BottomNavbar />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <PrivateRoute>
                    <StatusBar />
                    <Profile 
                      onShowOnboarding={() => setShowOnboarding(true)} 
                    />
                    <BottomNavbar />
                  </PrivateRoute>
                } 
              />
              
              <Route 
                path="/log" 
                element={
                  <PrivateRoute>
                    <StatusBar />
                    <Log />
                    <BottomNavbar />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/trends" 
                element={
                  <PrivateRoute>
                    <StatusBar />
                    <TrendsAndInsights />
                    <BottomNavbar />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/daily-assessment" 
                element={
                  <PrivateRoute>
                    <StatusBar />
                    <DailyAssessment />
                    <BottomNavbar />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/lifestyle-check-in" 
                element={
                  <PrivateRoute>
                    <StatusBar />
                    <LifestyleCheckIn />
                    <BottomNavbar />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/reports" 
                element={
                  <PrivateRoute>
                    <StatusBar />
                    <Reports />
                    <BottomNavbar />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/notifications" 
                element={
                  <PrivateRoute>
                    <StatusBar />
                    <Notifications />
                    <BottomNavbar />
                  </PrivateRoute>
                } 
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </>
        )}
      </div>
      <Toaster />
    </Router>
  );
}

export default App;
