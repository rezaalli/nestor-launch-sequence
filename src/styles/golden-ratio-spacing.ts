// golden-ratio-spacing.ts
// A spacing system based on the golden ratio (φ = 1.618...)

// The golden ratio
export const PHI = 1.618033988749895;

// Base spacing unit in pixels
export const BASE_UNIT = 8;

// Calculate sizes based on golden ratio
// We use a base unit of 8px and calculate values that grow and shrink by PHI
export const createGoldenSpacing = (baseUnit: number = BASE_UNIT): Record<string, string> => {
  // Create negative powers for smaller values
  // and positive powers for larger values
  const spacingScale: Record<string, string> = {};
  
  // Create a range of values from -3 to 10 power of PHI
  for (let i = -3; i <= 10; i++) {
    const size = baseUnit * Math.pow(PHI, i);
    const roundedSize = Math.round(size * 100) / 100; // Round to 2 decimal places
    
    if (i < 0) {
      // Handle fractional units for small values
      spacingScale[`${Math.abs(i)}`] = `${roundedSize}px`;
    } else {
      spacingScale[i] = `${roundedSize}px`;
    }
  }
  
  // Add special values
  spacingScale['px'] = '1px';
  spacingScale['0'] = '0px';
  spacingScale['full'] = '100%';
  
  return spacingScale;
};

// Generate the actual spacing values
export const goldenSpacing = createGoldenSpacing();

// Convert golden spacing to Tailwind format
export const tailwindGoldenSpacing = (): Record<string, string> => {
  const scale: Record<string, string> = {};

  // Tailwind uses numeric scales with a different naming convention
  Object.entries(goldenSpacing).forEach(([key, value]) => {
    if (key === 'px' || key === '0' || key === 'full') {
      scale[key] = value;
    } else if (parseInt(key) < 0) {
      // For negative values, use standard tailwind convention
      scale[key] = value;
    } else {
      // For positive powers, convert to a more tailwind-friendly scale
      // where 1=4px, 2=8px, etc., but using golden ratio progression
      const intKey = parseInt(key);
      const tailwindKey = intKey * 2;
      scale[tailwindKey.toString()] = value;
    }
  });

  return scale;
};

// Common spacing tokens based on the golden ratio
export const spacing = {
  // Using powers of PHI
  xs: goldenSpacing['3'],     // ~3px (PHI^-3)
  sm: goldenSpacing['2'],     // ~5px (PHI^-2)
  md: goldenSpacing['1'],     // ~8px (PHI^-1)
  base: goldenSpacing[0],     // 8px (base)
  lg: goldenSpacing[1],       // ~13px (PHI^1)
  xl: goldenSpacing[2],       // ~21px (PHI^2)
  '2xl': goldenSpacing[3],    // ~34px (PHI^3)
  '3xl': goldenSpacing[4],    // ~55px (PHI^4)
  '4xl': goldenSpacing[5],    // ~89px (PHI^5)
  '5xl': goldenSpacing[6],    // ~144px (PHI^6)
  '6xl': goldenSpacing[7],    // ~233px (PHI^7)
  '7xl': goldenSpacing[8],    // ~377px (PHI^8)
  '8xl': goldenSpacing[9],    // ~610px (PHI^9)
  '9xl': goldenSpacing[10],   // ~987px (PHI^10)
};

// Create size multipliers for different device sizes
export const deviceScale = {
  mobile: 0.875,      // Scale down slightly for mobile
  tablet: 1,          // Standard scale
  desktop: 1.125,     // Scale up slightly for desktop
  tv: 1.25,           // Scale up more for TV/large displays
};

// Spacing helpers for component styling
export const inset = {
  none: spacing.base,          // Base inset
  xs: spacing.sm,              // Extra small inset
  sm: spacing.md,              // Small inset
  md: spacing.lg,              // Medium inset
  lg: spacing.xl,              // Large inset
  xl: spacing['2xl'],          // Extra large inset
  '2xl': spacing['3xl'],       // 2x extra large inset
};

// Generate spacing for margin/padding
export const margin = {
  ...spacing,
  auto: 'auto',
};

export const padding = {
  ...spacing
};

// Generate compound spacings for specific UI patterns
export const spacingPatterns = {
  card: {
    padding: spacing.lg,
    gap: spacing.md,
    header: {
      marginBottom: spacing.md,
    },
    footer: {
      marginTop: spacing.lg,
    }
  },
  form: {
    gap: spacing.lg,
    fieldGap: spacing.md,
    labelGap: spacing.sm,
  },
  button: {
    paddingX: spacing.lg,
    paddingY: spacing.md,
    gap: spacing.sm,
  },
  listItem: {
    paddingY: spacing.md,
    gap: spacing.md,
  },
  modal: {
    padding: spacing.xl,
    gap: spacing.lg,
  },
  section: {
    marginY: spacing['2xl'],
    gap: spacing.xl,
  }
}; 