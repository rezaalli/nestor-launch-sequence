/**
 * Centralized error monitoring service
 * This utility provides functions for logging and monitoring errors throughout the application.
 * In a production environment, you would integrate this with a service like Sentry, LogRocket, etc.
 */

// Environment-specific configuration
const isDev = import.meta.env.DEV;

interface ErrorDetails {
  message: string;
  stack?: string;
  componentName?: string;
  additionalInfo?: Record<string, unknown>;
  userId?: string;
}

/**
 * Log an error to the console in development and to a service in production
 */
export function logError(error: Error | unknown, componentName?: string, additionalInfo?: Record<string, unknown>): void {
  // Extract error details
  const errorObj = error instanceof Error ? error : new Error(String(error));
  
  const errorDetails: ErrorDetails = {
    message: errorObj.message,
    stack: errorObj.stack,
    componentName,
    additionalInfo,
  };

  // In development, log to console
  if (isDev) {
    console.group('Application Error');
    console.error('Error:', errorObj);
    if (componentName) console.error('Component:', componentName);
    if (additionalInfo) console.error('Additional Info:', additionalInfo);
    console.groupEnd();
  } else {
    // In production, would send to an error monitoring service
    // Example integration with a service like Sentry:
    // Sentry.captureException(errorObj, { 
    //   extra: { componentName, ...additionalInfo } 
    // });
    
    // For now, just log to console in a cleaner format in production
    console.error(
      `[ERROR] ${errorDetails.message}${componentName ? ` in ${componentName}` : ''}`
    );
  }
}

/**
 * Handle unexpected promise rejections
 */
export function handlePromiseRejection(promise: Promise<unknown>, componentName?: string): Promise<unknown> {
  return promise.catch(error => {
    logError(error, componentName);
    throw error; // Re-throw to allow component-level handling
  });
}

/**
 * Record user feedback about an error
 */
export function recordUserFeedback(errorId: string, feedback: string, userId?: string): void {
  // In production, would send to an error monitoring service
  // Example: Sentry.captureUserFeedback({ errorId, feedback, userId });
  
  console.info(`User feedback for error ${errorId}:`, feedback, userId ? `from user ${userId}` : '');
}

/**
 * Initialize error monitoring
 * Call this once at application startup
 */
export function initErrorMonitoring(): void {
  // Set up global handlers
  window.addEventListener('error', (event) => {
    logError(event.error || new Error(event.message), 'global');
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    logError(event.reason, 'unhandledPromiseRejection');
  });
  
  // In production, would initialize your error monitoring service
  // Example: Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN });
  
  console.info('Error monitoring initialized');
} 