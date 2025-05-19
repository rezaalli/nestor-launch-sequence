import { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from './contexts/UserContext';
import { AssessmentProvider } from './contexts/AssessmentContext';
import { NutritionProvider } from './contexts/NutritionContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { useAuth } from './contexts/AuthContext';
import StatusBar from './components/StatusBar';
import BottomNavbar from './components/BottomNavbar';
import Onboarding from './components/Onboarding';
import ErrorBoundary from './components/ErrorBoundary';
import SwipeNavigation from './components/SwipeNavigation';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ActivityDetectionProvider } from '@/contexts/ActivityDetectionContext';
import Router from '@/Router';

// Lazy load components for better performance
const Index = lazy(() => import('./pages/Index'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile = lazy(() => import('./pages/Profile'));
const Log = lazy(() => import('./pages/Log'));
const Insights = lazy(() => import('./pages/Insights'));
const DailyAssessment = lazy(() => import('./pages/DailyAssessment'));
const LifestyleCheckIn = lazy(() => import('./pages/LifestyleCheckIn'));
const Reports = lazy(() => import('./pages/Reports'));
const Notifications = lazy(() => import('./pages/Notifications'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AuthScreen = lazy(() => import('./screens/AuthScreen'));
const Examples = lazy(() => import('./pages/Examples'));
// New enhanced data visualization page
const DataExplorer = lazy(() => import('./pages/DataExplorer'));
// New tracker page with Activity and Meal tracking
const TrackerPage = lazy(() => import('./pages/TrackerPage'));
// ML Demo page
const MLDemo = lazy(() => import('./pages/MLDemo'));
// AdvancedInsights page now integrated into main Insights page
const AdvancedInsights = lazy(() => import('./pages/AdvancedInsights'));

// Development mode toggle to allow navigation without authentication
// In production, this should always be false
const DEV_MODE = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_MODE === 'true';

// Define main navigation routes for swipe navigation
const MAIN_NAVIGATION_ROUTES = ['/dashboard', '/log', '/trends', '/profile'];

// Loading component for suspense fallback
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

// Private route component to protect routes that require authentication
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  // Show loading indicator while checking authentication
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  // Allow bypassing authentication in development mode
  if (DEV_MODE) {
    console.warn('Authentication bypassed in development mode');
    return <>{children}</>;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Layout component for main navigation pages
const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SwipeNavigation routes={MAIN_NAVIGATION_ROUTES}>
      <StatusBar />
      {children}
      <BottomNavbar />
    </SwipeNavigation>
  );
};

function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { user } = useAuth();

  // If user is logged in and navigates to auth page, redirect to dashboard
  const handleAuthRedirect = () => {
    // In DEV_MODE, bypass authentication redirect
    if (DEV_MODE) {
      console.warn('Authentication redirect bypassed in development mode');
      return <AuthScreen />;
    }
    
    if (user) {
      return <Navigate to="/dashboard" replace />;
    }
    return <AuthScreen />;
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <UserProvider>
          <NotificationsProvider>
            <AssessmentProvider>
              <NutritionProvider>
                <ActivityDetectionProvider>
                  <Router />
                  <Toaster />
                </ActivityDetectionProvider>
              </NutritionProvider>
            </AssessmentProvider>
          </NotificationsProvider>
        </UserProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
