import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import "./index.css";
import "./components/trends/fonts.css";
import "./styles/globals.css";
import "./styles/design-system.css";
import "./styles/accessibility.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { initializeDatabase } from "./lib/database/db";
import { MLManager } from "./lib/ml/core/MLManager";
import { adaptColorsToTimeOfDay } from "./styles/adaptive-colors";
import { UserProvider } from "./contexts/UserContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import mlService from './services/ml';
import { AssessmentProvider } from './contexts/AssessmentContext.tsx';

// Add Inter font link to document head
const interFontLink = document.createElement('link');
interFontLink.rel = 'stylesheet';
interFontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;500;600;700;800;900&display=swap';
document.head.appendChild(interFontLink);

// Initialize the database
initializeDatabase()
  .then(success => {
    if (success) {
      console.log('Database initialized successfully');
    } else {
      console.error('Failed to initialize database');
    }
  })
  .catch(error => {
    console.error('Error initializing database:', error);
  });

// Initialize the ML infrastructure
MLManager.getInstance().initialize()
  .then(success => {
    if (success) {
      console.log('ML infrastructure initialized successfully');
    } else {
      console.error('Failed to initialize ML infrastructure');
    }
  })
  .catch(error => {
    console.error('Error initializing ML infrastructure:', error);
  });

// Initialize ML service
mlService.initialize().then((success) => {
  if (success) {
    console.log('ML service initialized successfully');
  } else {
    console.warn('ML service initialization failed, some features may not work properly');
  }
});

// Apply adaptive colors based on time of day
adaptColorsToTimeOfDay();

// Enable React developer tools if in development mode
if (import.meta.env.DEV) {
  console.info('Application started in development mode');
}

// Create query client for React Query
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <ThemeProvider>
            <BrowserRouter>
              <AssessmentProvider>
                <App />
                <Toaster />
              </AssessmentProvider>
            </BrowserRouter>
          </ThemeProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
