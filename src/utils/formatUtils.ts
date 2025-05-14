
/**
 * Formats temperature values based on user preference (metric or imperial)
 * @param tempCelsius Temperature in Celsius (can be provided directly or as a number * 10)
 * @param unitPreference User's unit preference ('metric' or 'imperial')
 * @param isDivided Whether the input temperature is already divided by 10 (for some components)
 * @returns Object containing formatted value and unit symbol
 */
export const formatTemperature = (
  tempCelsius: number,
  unitPreference: 'metric' | 'imperial' | null | undefined = 'imperial',
  isDivided = false
): { value: string, unit: string } => {
  // Some components pass temperature as celsius * 10 (367 instead of 36.7)
  // Handle both cases with the isDivided parameter
  const normalizedTemp = isDivided ? tempCelsius : tempCelsius / 10;
  
  // Use imperial as default if unitPreference is null or undefined
  const effectivePreference = unitPreference || 'imperial';
  
  if (effectivePreference === 'imperial') {
    const fahrenheit = (normalizedTemp * 9/5) + 32;
    return { value: fahrenheit.toFixed(1), unit: '°F' };
  }
  
  return { value: normalizedTemp.toFixed(1), unit: '°C' };
};

/**
 * Formats weight values based on user preference
 * @param weightKg Weight in kilograms
 * @param unitPreference User's unit preference ('metric' or 'imperial')
 * @returns Object containing formatted value and unit symbol
 */
export const formatWeight = (
  weightKg: number,
  unitPreference: 'metric' | 'imperial' | null | undefined = 'imperial'
): { value: string, unit: string } => {
  // Use imperial as default if unitPreference is null or undefined
  const effectivePreference = unitPreference || 'imperial';
  
  if (effectivePreference === 'imperial') {
    const pounds = weightKg * 2.20462;
    return { value: pounds.toFixed(1), unit: 'lbs' };
  }
  
  return { value: weightKg.toFixed(1), unit: 'kg' };
};

/**
 * Formats distance values based on user preference
 * @param distanceKm Distance in kilometers
 * @param unitPreference User's unit preference ('metric' or 'imperial')
 * @returns Object containing formatted value and unit symbol
 */
export const formatDistance = (
  distanceKm: number, 
  unitPreference: 'metric' | 'imperial' | null | undefined = 'imperial'
): { value: string, unit: string } => {
  // Use imperial as default if unitPreference is null or undefined
  const effectivePreference = unitPreference || 'imperial';
  
  if (effectivePreference === 'imperial') {
    const miles = distanceKm * 0.621371;
    return { value: miles.toFixed(1), unit: 'mi' };
  }
  
  return { value: distanceKm.toFixed(1), unit: 'km' };
};
