// motion.ts
// A comprehensive motion system for consistent animations across the app

// Durations based on animation complexity
export const durations = {
  instant: '0ms',
  ultraFast: '100ms',
  fast: '200ms',
  normal: '300ms',
  slow: '500ms',
  verySlow: '800ms',
};

// Easing functions organized by animation purpose
export const easings = {
  // Standard easings
  standard: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  },
  // Emphasis easings for attention-grabbing animations
  emphasis: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.6, 1)',
    accelerate: 'cubic-bezier(0.3, 0, 0.8, 0.15)',
    decelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
  },
  // Bounce effect for playful animations
  bounce: {
    out: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    in: 'cubic-bezier(0.22, -0.28, 0.7, 1.56)',
  },
  // Spring effect for natural-feeling motions
  spring: {
    out: 'cubic-bezier(0.08, 0.82, 0.17, 1)',
    in: 'cubic-bezier(0.5, 1.5, 0.8, 0.7)',
  },
};

// Animation variants for common component transitions
export const variants = {
  // Fade transitions
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  // Scale transitions
  scale: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
  },
  // Slide transitions
  slideFromRight: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 20, opacity: 0 },
  },
  slideFromLeft: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
  },
  slideFromTop: {
    initial: { y: -20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  },
  slideFromBottom: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 20, opacity: 0 },
  },
};

// The motion presets combine duration, easing, and variants
// for common animations and can be used directly in components
export const presets = {
  // Page transitions
  pageTransition: {
    transition: { 
      duration: 0.3, 
      ease: easings.standard.easeInOut 
    },
    variants: variants.fade,
  },
  
  // Component transitions
  componentEnter: {
    transition: { 
      duration: 0.2, 
      ease: easings.standard.easeOut 
    },
    variants: variants.scale,
  },
  
  // Button feedback
  buttonPress: {
    transition: { 
      duration: 0.1, 
      ease: easings.standard.easeInOut 
    },
    scale: 0.97,
  },
  
  // Card hover effect
  cardHover: {
    transition: { 
      duration: 0.2, 
      ease: easings.standard.easeOut 
    },
    scale: 1.02,
    y: -2,
  },
  
  // Notification appearance
  notificationEnter: {
    transition: { 
      duration: 0.3, 
      ease: easings.bounce.out 
    },
    variants: variants.slideFromTop,
  },
};

// Staggered animation helper
export const stagger = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  },
};

// Helper function to create CSS transition string
export const createTransition = (
  properties: string[] = ['all'],
  duration: string = durations.normal,
  easing: string = easings.standard.easeInOut
): string => {
  return properties
    .map((property) => `${property} ${duration} ${easing}`)
    .join(', ');
}; 