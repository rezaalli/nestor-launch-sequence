
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
