// Design Tokens for Nestor Health App

/**
 * TYPOGRAPHY SYSTEM
 * Implements a hierarchical scale with consistent weights for better hierarchy
 */
export const typography = {
  // Font Families
  fontFamily: {
    sans: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, monospace',
  },
  
  // Font Weights
  fontWeight: {
    regular: 400,
    medium: 500, 
    semibold: 600,
    bold: 700,
  },
  
  // Font Sizes (in rem)
  fontSize: {
    '2xs': '0.625rem',   // 10px
    xs: '0.75rem',       // 12px
    sm: '0.875rem',      // 14px
    base: '1rem',        // 16px
    lg: '1.125rem',      // 18px
    xl: '1.25rem',       // 20px
    '2xl': '1.5rem',     // 24px
    '3xl': '1.875rem',   // 30px
    '4xl': '2.25rem',    // 36px
  },
  
  // Line Heights
  lineHeight: {
    extraTight: 1.1,
    tight: 1.2,
    snug: 1.35,
    normal: 1.5,
    relaxed: 1.625,
  },
  
  // Letter Spacing
  letterSpacing: {
    tight: '-0.01em',
    normal: '0',
    wide: '0.01em',
  },
  
  // Text Style Presets
  styles: {
    h1: {
      fontSize: '1.5rem',      // 24px
      fontWeight: 600,        // semibold
      lineHeight: 1.2,        // tight
      letterSpacing: '-0.01em', // tight
    },
    h2: {
      fontSize: '1.25rem',     // 20px
      fontWeight: 600,        // semibold
      lineHeight: 1.25,       // between tight and snug
      letterSpacing: '-0.01em', // tight
    },
    h3: {
      fontSize: '1.125rem',    // 18px
      fontWeight: 500,        // medium
      lineHeight: 1.3,        // just under snug
      letterSpacing: '-0.005em',
    },
    h4: {
      fontSize: '1rem',        // 16px
      fontWeight: 500,        // medium
      lineHeight: 1.35,       // snug
      letterSpacing: '0',
    },
    body: {
      fontSize: '1rem',        // 16px
      fontWeight: 400,        // regular
      lineHeight: 1.5,        // normal
      letterSpacing: '-0.01em',
    },
    bodySmall: {
      fontSize: '0.875rem',    // 14px
      fontWeight: 400,        // regular
      lineHeight: 1.5,        // normal
      letterSpacing: '0',
    },
    caption: {
      fontSize: '0.875rem',    // 14px
      fontWeight: 500,        // medium
      lineHeight: 1.4,        // between snug and normal
      letterSpacing: '0',
    },
    captionSmall: {
      fontSize: '0.75rem',     // 12px
      fontWeight: 500,        // medium
      lineHeight: 1.35,       // snug
      letterSpacing: '0',
    },
    metric: {
      fontSize: '1.125rem',    // 18px
      fontWeight: 600,        // semibold
      lineHeight: 1.2,        // tight
      letterSpacing: '-0.01em',
    },
    metricSmall: {
      fontSize: '1rem',        // 16px
      fontWeight: 600,        // semibold
      lineHeight: 1.2,        // tight
      letterSpacing: '-0.01em',
    },
  },
};

/**
 * COLOR SYSTEM
 * 60% neutral, 30% brand, 10% status indicators
 */
export const colors = {
  // Base neutrals (60% of color system)
  neutral: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#0a0c10',
  },
  
  // Brand colors (30% of color system)
  brand: {
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a', // Main nestor blue
      950: '#172554',
    },
    teal: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6',
      600: '#0d9488',
      700: '#0f766e',
      800: '#115e59',
      900: '#134e4a',
      950: '#042f2e',
    },
  },
  
  // Status colors (10% of color system)
  status: {
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Main success
      600: '#16a34a',
      700: '#15803d',
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b', // Main warning
      600: '#d97706',
      700: '#b45309',
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Main error
      600: '#dc2626',
      700: '#b91c1c',
    },
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main info
      600: '#2563eb',
      700: '#1d4ed8',
    },
  },
};

/**
 * SPACING SYSTEM
 * For consistent layout spacing
 */
export const spacing = {
  0: '0',
  0.5: '0.125rem', // 2px
  1: '0.25rem',    // 4px
  1.5: '0.375rem', // 6px
  2: '0.5rem',     // 8px
  2.5: '0.625rem', // 10px
  3: '0.75rem',    // 12px
  3.5: '0.875rem', // 14px
  4: '1rem',       // 16px
  5: '1.25rem',    // 20px
  6: '1.5rem',     // 24px
  7: '1.75rem',    // 28px
  8: '2rem',       // 32px
  9: '2.25rem',    // 36px
  10: '2.5rem',    // 40px
  11: '2.75rem',   // 44px
  12: '3rem',      // 48px
  14: '3.5rem',    // 56px
  16: '4rem',      // 64px
  20: '5rem',      // 80px
  24: '6rem',      // 96px
  28: '7rem',      // 112px
  32: '8rem',      // 128px
};

/**
 * SHADOWS
 * For consistent elevation system
 */
export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: 'none',
};

/**
 * BORDER RADIUS
 * For consistent component shapes
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem',  // 2px
  DEFAULT: '0.25rem', // 4px  
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  '3xl': '1.5rem', // 24px
  full: '9999px',
};

/**
 * ANIMATION TIMING
 * For consistent motion design
 */
export const animation = {
  durations: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  },
};

/**
 * Z-INDEX
 * For consistent layering
 */
export const zIndex = {
  0: '0',
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  auto: 'auto',
  dropdown: '1000',
  sticky: '1020',
  fixed: '1030',
  modalBackdrop: '1040',
  modal: '1050',
  popover: '1060',
  tooltip: '1070',
}; 