// profile-tokens.ts
// Design tokens specific to the profile/settings screens
import { spacing, inset } from './golden-ratio-spacing';
import { colorPalettes } from './adaptive-colors';

// Profile layout spacing
export const profileSpacing = {
  // Layout
  containerPadding: {
    mobile: spacing.lg,
    tablet: spacing.xl,
    desktop: spacing.xl,
  },
  containerMaxWidth: '1200px',
  
  // Component spacing
  sectionGap: spacing['2xl'],
  cardGap: spacing.xl,
  cardPadding: {
    mobile: spacing.lg,
    tablet: spacing.xl,
    desktop: spacing.xl,
  },
  
  // Tab navigation
  tabsMarginBottom: spacing.xl,
  tabsHeight: '48px',
  tabsPadding: spacing.md,
  
  // Cards
  cardRadius: '12px',
  cardShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  cardBorderWidth: '1px',
};

// Typography
export const profileTypography = {
  pageTitle: {
    fontSize: '24px',
    fontWeight: '700',
    lineHeight: '32px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    lineHeight: '28px',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '24px',
  },
  tabLabel: {
    fontSize: '14px',
    fontWeight: '500',
    lineHeight: '20px',
  },
};

// Colors
export const profileColors = {
  tabs: {
    background: 'var(--background)',
    activeBackground: 'var(--card)',
    hoverBackground: 'rgba(0, 0, 0, 0.03)',
    border: 'var(--border)',
    activeText: 'var(--foreground)',
    inactiveText: 'var(--muted-foreground)',
  },
  section: {
    divider: 'var(--border)',
  },
  card: {
    background: 'var(--card)',
    border: 'var(--border)',
    headerBackground: 'rgba(0, 0, 0, 0.02)',
  },
};

// Responsive breakpoints
export const profileBreakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wideDesktop: '1280px',
};

// Media query templates
export const mediaQueries = {
  mobile: `@media (max-width: ${profileBreakpoints.tablet})`,
  tablet: `@media (min-width: ${profileBreakpoints.tablet}) and (max-width: ${profileBreakpoints.desktop})`,
  desktop: `@media (min-width: ${profileBreakpoints.desktop})`,
  wideDesktop: `@media (min-width: ${profileBreakpoints.wideDesktop})`,
};

// Animation tokens
export const profileAnimations = {
  tabTransition: 'all 0.2s ease-in-out',
  cardTransition: 'all 0.3s ease-in-out',
  contentFadeIn: 'fade-in 0.3s ease-out',
};

// Z-index layers
export const profileZIndex = {
  tabsSticky: 10,
  pageHeader: 5,
  cardHover: 2,
}; 