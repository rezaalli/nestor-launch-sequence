
// Simulate detecting a high heart rate
export const detectHighHeartRate = (): { detected: boolean, heartRate: number } => {
  // In a real app, this would contain logic to analyze heart rate data
  // For demo purposes, we'll randomly determine if there's a high heart rate
  const detected = Math.random() < 0.3; // 30% chance of detecting high heart rate
  const heartRate = detected ? Math.floor(Math.random() * 30) + 100 : 72; // Random between 100-130 if detected
  
  return { detected, heartRate };
};

// Function to analyze heart rate and determine if medical attention is needed
export const analyzeHeartRate = (heartRate: number) => {
  // This would contain complex logic in a real app
  // For demo purposes, we'll use a simple threshold
  
  const riskLevel = heartRate > 120 ? 'high' : heartRate > 100 ? 'moderate' : 'low';
  
  return {
    riskLevel,
    requiresAttention: heartRate > 100,
    recommendation: heartRate > 120 
      ? 'Consider contacting your healthcare provider'
      : 'Rest and monitor your heart rate'
  };
};

// Simulate detecting abnormal body temperature
export const detectAbnormalTemperature = (): { detected: boolean, temperature: number, type: 'high' | 'low' | 'normal' } => {
  // In a real app, this would contain logic to analyze temperature data
  // For demo purposes, we'll randomly determine if there's an abnormal temperature
  const randomValue = Math.random();
  
  if (randomValue < 0.15) { // 15% chance of high temperature
    // Generate temperature between 38.0°C and 39.5°C for high temperature
    const temperature = 38.0 + (Math.random() * 1.5);
    return { detected: true, temperature: parseFloat(temperature.toFixed(1)), type: 'high' };
  } 
  else if (randomValue < 0.25) { // 10% chance of low temperature
    // Generate temperature between 35.0°C and 35.9°C for low temperature
    const temperature = 35.0 + (Math.random() * 0.9);
    return { detected: true, temperature: parseFloat(temperature.toFixed(1)), type: 'low' };
  } 
  else {
    // Normal temperature between 36.1°C and 37.2°C
    const temperature = 36.1 + (Math.random() * 1.1);
    return { detected: false, temperature: parseFloat(temperature.toFixed(1)), type: 'normal' };
  }
};

// Function to analyze temperature and determine if medical attention is needed
export const analyzeTemperature = (temperature: number) => {
  // For demo purposes using standard medical thresholds
  const isHigh = temperature >= 38.0;
  const isLow = temperature < 36.0;
  const type = isHigh ? 'high' : isLow ? 'low' : 'normal';
  
  let riskLevel = 'low';
  let recommendation = 'Normal temperature. No action needed.';
  
  if (isHigh) {
    riskLevel = temperature >= 39.5 ? 'high' : 'moderate';
    recommendation = temperature >= 39.5 
      ? 'High fever detected. Seek medical attention.'
      : 'Fever detected. Rest, hydrate, and monitor for changes.';
  } else if (isLow) {
    riskLevel = temperature <= 35.0 ? 'high' : 'moderate';
    recommendation = temperature <= 35.0
      ? 'Significant hypothermia detected. Seek immediate medical attention.'
      : 'Mild hypothermia detected. Warm up gradually and monitor.';
  }
  
  return {
    type,
    riskLevel,
    requiresAttention: isHigh || isLow,
    recommendation
  };
};
