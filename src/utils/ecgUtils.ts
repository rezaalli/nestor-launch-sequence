
// Simulate an irregular ECG pattern detection
export const detectIrregularEcg = (): boolean => {
  // In a real app, this would contain logic to analyze ECG data
  // For demo purposes, we'll randomly determine if there's an anomaly
  return Math.random() < 0.3; // 30% chance of detecting an anomaly
};

// Simulate getting ECG data
export const getEcgData = () => {
  // In a real app, this would fetch real ECG data from the device
  // For demo purposes, we'll generate random data
  const baseValue = 70;
  const numberOfPoints = 100;
  const data = [];
  
  for (let i = 0; i < numberOfPoints; i++) {
    // Normal ECG pattern with random variation
    let value = baseValue + Math.sin(i * 0.2) * 20 + (Math.random() * 10 - 5);
    
    // Occasionally add some irregularity
    if (i % 15 === 0 && Math.random() > 0.5) {
      value += (Math.random() * 30) - 15;
    }
    
    data.push({
      time: i,
      value: value
    });
  }
  
  return data;
};

// Function to analyze ECG and determine if medical attention is needed
export const analyzeEcg = (data: Array<{ time: number, value: number }>) => {
  // This would contain complex logic in a real app
  // For demo purposes, we'll use a simple heuristic
  
  // Count "irregular" beats (ones that deviate significantly from the baseline)
  let irregularCount = 0;
  const baselineValue = 70;
  
  data.forEach(point => {
    if (Math.abs(point.value - baselineValue) > 25) {
      irregularCount++;
    }
  });
  
  return {
    irregularBeats: irregularCount,
    requiresAttention: irregularCount > 5,
    severity: irregularCount > 10 ? 'high' : 'moderate'
  };
};
