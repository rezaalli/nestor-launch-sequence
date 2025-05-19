import React, { createContext, useContext, useEffect, useState } from 'react';
import { ColorMode, adaptColorsToTimeOfDay, useAdaptiveColors, applyAdaptiveColors, getTimeOfDay } from '../styles/adaptive-colors';
import { createTransition, durations, easings } from '../styles/motion';

// Define the theme context type
type ThemeContextType = {
  colorMode: string;
  setColorMode: (mode: ColorMode) => void;
  timeOfDay: 'morning' | 'day' | 'evening' | 'night';
  toggleDarkMode: () => void;
  // Motion helpers
  createTransition: typeof createTransition;
  // User preferences
  animationsEnabled: boolean;
  setAnimationsEnabled: (enabled: boolean) => void;
  reducedMotion: boolean;
};

// Create the context with initial values
const ThemeContext = createContext<ThemeContextType>({
  colorMode: ColorMode.AUTO,
  setColorMode: () => {},
  timeOfDay: 'day',
  toggleDarkMode: () => {},
  createTransition,
  animationsEnabled: true,
  setAnimationsEnabled: () => {},
  reducedMotion: false,
});

// Provider component that wraps the app
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colorModeState, setColorModeState] = useState<ColorMode>(ColorMode.AUTO);
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(true);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'day' | 'evening' | 'night'>(getTimeOfDay());

  // Use our adaptive colors hook to manage colors
  const { colors, colorMode } = useAdaptiveColors(colorModeState);

  // Set color mode
  const setColorMode = (mode: ColorMode) => {
    setColorModeState(mode);
    localStorage.setItem('nestor-color-mode', mode);
  };

  // Toggle between light/dark mode
  const toggleDarkMode = () => {
    const newMode = colorMode === 'dark' || colorMode === 'night' 
      ? ColorMode.LIGHT 
      : ColorMode.DARK;
    setColorMode(newMode);
  };

  // Apply colors to CSS variables
  useEffect(() => {
    applyAdaptiveColors(colors);
  }, [colors]);

  // Check user preferences on mount
  useEffect(() => {
    // Check for saved color mode preference
    const savedColorMode = localStorage.getItem('nestor-color-mode');
    if (savedColorMode) {
      setColorModeState(savedColorMode as ColorMode);
    }

    // Check for saved animation preference
    const savedAnimationPref = localStorage.getItem('nestor-animations-enabled');
    if (savedAnimationPref !== null) {
      setAnimationsEnabled(savedAnimationPref === 'true');
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setReducedMotion(prefersReducedMotion);

    // Update time of day
    const currentTimeOfDay = getTimeOfDay();
    setTimeOfDay(currentTimeOfDay);

    // Set up interval to check time of day
    const timeInterval = setInterval(() => {
      const newTimeOfDay = getTimeOfDay();
      if (newTimeOfDay !== timeOfDay) {
        setTimeOfDay(newTimeOfDay);
        // Reapply colors if using AUTO mode
        if (colorModeState === ColorMode.AUTO) {
          adaptColorsToTimeOfDay();
        }
      }
    }, 60 * 1000); // Check every minute

    // Apply animations class based on user preference
    if (!animationsEnabled || prefersReducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }

    return () => {
      clearInterval(timeInterval);
    };
  }, [colorModeState, animationsEnabled, timeOfDay]);

  // Save animation preference when it changes
  useEffect(() => {
    localStorage.setItem('nestor-animations-enabled', animationsEnabled.toString());
    
    if (!animationsEnabled || reducedMotion) {
      document.documentElement.classList.add('reduce-motion');
    } else {
      document.documentElement.classList.remove('reduce-motion');
    }
  }, [animationsEnabled, reducedMotion]);

  const value = {
    colorMode,
    setColorMode,
    timeOfDay,
    toggleDarkMode,
    createTransition,
    animationsEnabled,
    setAnimationsEnabled,
    reducedMotion,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);

// Create CSS classes to implement reduced motion
export const createReducedMotionStyles = (): string => `
  .reduce-motion * {
    transition-duration: 0.075s !important;
    animation-duration: 0.075s !important;
    transition-timing-function: ease !important;
    animation-timing-function: ease !important;
  }
  
  @media (prefers-reduced-motion: reduce) {
    * {
      transition-duration: 0.075s !important;
      animation-duration: 0.075s !important;
      transition-timing-function: ease !important;
      animation-timing-function: ease !important;
    }
  }
`;

export default ThemeContext; 