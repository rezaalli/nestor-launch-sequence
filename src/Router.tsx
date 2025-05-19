import { useState, lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StatusBar from '@/components/StatusBar';
import BottomNavbar from '@/components/BottomNavbar';
import Onboarding from '@/components/Onboarding';
import LoadingScreen from '@/components/LoadingScreen';
import SwipeNavigation from '@/components/SwipeNavigation';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useAuth } from '@/contexts/AuthContext';

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

// Development mode toggle to allow navigation without authentication
// In production, this should always be false
const DEV_MODE = import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_MODE === 'true';

// Define main navigation routes for swipe navigation
const MAIN_NAVIGATION_ROUTES = ['/dashboard', '/log', '/trends', '/profile'];

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

const Router = () => {
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
    <ErrorBoundary>
      <div className="app-container">
        {showOnboarding ? (
          <Onboarding onComplete={() => setShowOnboarding(false)} />
        ) : (
          <>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/auth" element={handleAuthRedirect()} />
                
                {/* Protected routes */}
                <Route 
                  path="/" 
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <Index />
                      </MainLayout>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <Dashboard />
                      </MainLayout>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <Profile 
                          onShowOnboarding={() => setShowOnboarding(true)} 
                        />
                      </MainLayout>
                    </PrivateRoute>
                  } 
                />
                
                <Route 
                  path="/log" 
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <Log />
                      </MainLayout>
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/insights" 
                  element={
                    <PrivateRoute>
                      <MainLayout>
                        <Insights />
                      </MainLayout>
                    </PrivateRoute>
                  } 
                />
                <Route
                  path="/trends"
                  element={<Navigate to="/insights" replace />}
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
                <Route 
                  path="/examples" 
                  element={
                    <PrivateRoute>
                      <StatusBar />
                      <Examples />
                      <BottomNavbar />
                    </PrivateRoute>
                  } 
                />
                {/* New data explorer route */}
                <Route 
                  path="/data-explorer" 
                  element={
                    <PrivateRoute>
                      <StatusBar />
                      <DataExplorer />
                      <BottomNavbar />
                    </PrivateRoute>
                  } 
                />
                {/* New tracker page route */}
                <Route 
                  path="/tracker" 
                  element={
                    <PrivateRoute>
                      <StatusBar />
                      <TrackerPage />
                      <BottomNavbar />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/ml-demo" 
                  element={
                    <PrivateRoute>
                      <StatusBar />
                      <MLDemo />
                      <BottomNavbar />
                    </PrivateRoute>
                  } 
                />
                <Route 
                  path="/advanced-insights" 
                  element={<Navigate to="/insights" replace />}
                />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Router; 