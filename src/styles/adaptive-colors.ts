// adaptive-colors.ts
// A dynamic color system that adapts to time of day and device conditions

import { useState, useEffect } from 'react';

// Color modes
export enum ColorMode {
  LIGHT = 'light',
  DARK = 'dark',
  MORNING = 'morning',
  DAY = 'day',
  EVENING = 'evening',
  NIGHT = 'night',
  AUTO = 'auto'
}

// Color palettes for different times of day
export const colorPalettes = {
  // Base palettes
  light: {
    background: 'hsl(0, 0%, 100%)',
    foreground: 'hsl(222.2, 84%, 4.9%)',
    muted: 'hsl(210, 40%, 96.1%)',
    mutedForeground: 'hsl(215.4, 16.3%, 46.9%)',
    border: 'hsl(214.3, 31.8%, 91.4%)',
    primary: 'hsl(222.2, 47.4%, 11.2%)',
    cardBg: 'hsl(0, 0%, 100%)',
    shadowColor: 'rgba(0, 0, 0, 0.08)',
  },
  dark: {
    background: 'hsl(222.2, 84%, 4.9%)',
    foreground: 'hsl(210, 40%, 98%)',
    muted: 'hsl(217.2, 32.6%, 17.5%)',
    mutedForeground: 'hsl(215, 20.2%, 65.1%)',
    border: 'hsl(217.2, 32.6%, 17.5%)',
    primary: 'hsl(210, 40%, 98%)',
    cardBg: 'hsl(222.2, 84%, 7%)',
    shadowColor: 'rgba(0, 0, 0, 0.25)',
  },
  // Time of day variants
  morning: {
    background: 'hsl(48, 100%, 97%)',
    foreground: 'hsl(222.2, 84%, 4.9%)',
    muted: 'hsl(48, 50%, 94%)',
    mutedForeground: 'hsl(215.4, 16.3%, 46.9%)',
    border: 'hsl(48, 30%, 90%)',
    primary: 'hsl(24, 85%, 40%)',
    cardBg: 'hsl(0, 0%, 100%)',
    shadowColor: 'rgba(245, 166, 35, 0.08)',
  },
  day: {
    background: 'hsl(210, 100%, 98%)',
    foreground: 'hsl(222.2, 84%, 4.9%)',
    muted: 'hsl(210, 50%, 95%)',
    mutedForeground: 'hsl(215.4, 16.3%, 46.9%)',
    border: 'hsl(214.3, 31.8%, 91.4%)',
    primary: 'hsl(210, 85%, 40%)',
    cardBg: 'hsl(0, 0%, 100%)',
    shadowColor: 'rgba(30, 136, 229, 0.08)',
  },
  evening: {
    background: 'hsl(261, 50%, 98%)',
    foreground: 'hsl(222.2, 84%, 4.9%)',
    muted: 'hsl(261, 20%, 95%)',
    mutedForeground: 'hsl(215.4, 16.3%, 46.9%)',
    border: 'hsl(261, 20%, 91%)',
    primary: 'hsl(261, 70%, 40%)',
    cardBg: 'hsl(0, 0%, 100%)',
    shadowColor: 'rgba(124, 77, 255, 0.08)',
  },
  night: {
    background: 'hsl(222.2, 20%, 7%)',
    foreground: 'hsl(210, 30%, 90%)',
    muted: 'hsl(217.2, 32.6%, 14%)',
    mutedForeground: 'hsl(215, 20.2%, 65.1%)',
    border: 'hsl(217.2, 32.6%, 14%)',
    primary: 'hsl(220, 60%, 65%)',
    cardBg: 'hsl(222.2, 20%, 10%)',
    shadowColor: 'rgba(0, 0, 0, 0.3)',
  },
};

// Get time of day based on current hour
export const getTimeOfDay = (): 'morning' | 'day' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

// Get system color scheme preference
export const getSystemColorScheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches 
    ? 'dark' 
    : 'light';
};

// Check if device has an ambient light sensor
export const hasAmbientLightSensor = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'AmbientLightSensor' in window || 'DeviceLightEvent' in window;
};

// Custom hook for adaptive colors
export const useAdaptiveColors = (
  mode: ColorMode = ColorMode.AUTO,
  manualTimeOfDay?: 'morning' | 'day' | 'evening' | 'night'
) => {
  const [colorMode, setColorMode] = useState<string>('light');
  const [colors, setColors] = useState(colorPalettes.light);
  
  useEffect(() => {
    // Function to update colors based on mode and conditions
    const updateColors = () => {
      let newColorMode: string;

      switch (mode) {
        case ColorMode.LIGHT:
          newColorMode = 'light';
          break;
        case ColorMode.DARK:
          newColorMode = 'dark';
          break;
        case ColorMode.MORNING:
          newColorMode = 'morning';
          break;
        case ColorMode.DAY:
          newColorMode = 'day';
          break;
        case ColorMode.EVENING:
          newColorMode = 'evening';
          break;
        case ColorMode.NIGHT:
          newColorMode = 'night';
          break;
        case ColorMode.AUTO:
        default:
          // Auto mode - determine based on time and system preference
          const timeOfDay = manualTimeOfDay || getTimeOfDay();
          const systemScheme = getSystemColorScheme();
          
          if (systemScheme === 'dark') {
            newColorMode = 'night';
          } else {
            newColorMode = timeOfDay;
          }
          break;
      }
      
      setColorMode(newColorMode);
      // @ts-ignore - We know the colorMode is valid
      setColors(colorPalettes[newColorMode]);
    };

    // Update colors immediately
    updateColors();
    
    // Set up event listeners for changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', updateColors);
    
    // Set up interval to check time of day (every minute)
    const timeInterval = setInterval(updateColors, 60 * 1000);
    
    return () => {
      mediaQuery.removeEventListener('change', updateColors);
      clearInterval(timeInterval);
    };
  }, [mode, manualTimeOfDay]);
  
  return { colors, colorMode };
};

// Helper function to apply CSS variables to document root
export const applyAdaptiveColors = (colorSet: any) => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Set CSS variables
  Object.entries(colorSet).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value as string);
  });
};

// Export a ready-to-use context provider component
export const adaptColorsToTimeOfDay = () => {
  const timeOfDay = getTimeOfDay();
  const systemScheme = getSystemColorScheme();
  let colorSet;
  
  if (systemScheme === 'dark') {
    colorSet = colorPalettes.night;
  } else {
    colorSet = colorPalettes[timeOfDay];
  }
  
  applyAdaptiveColors(colorSet);
  return timeOfDay;
}; 