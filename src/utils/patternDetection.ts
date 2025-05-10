
import { AssessmentData } from "./readinessScoring";
import { format, subDays } from "date-fns";

/**
 * Interface for detected health patterns
 */
export interface HealthPattern {
  id: string;
  type: string;
  description: string;
  riskLevel: 'low' | 'moderate' | 'high';
  recommendation: string;
  detectedDate: string;
}

/**
 * Interface for assessment history over time
 */
export interface AssessmentHistory {
  date: string;
  data: AssessmentData;
  completedAt: string;
  readinessScore?: number;
}

/**
 * Detect sleep-related patterns from assessment data
 */
export function detectSleepPatterns(
  recentAssessments: AssessmentHistory[]
): HealthPattern[] {
  const patterns: HealthPattern[] = [];
  
  if (recentAssessments.length < 3) return patterns;
  
  // Check for consecutive days with poor sleep
  let poorSleepCount = 0;
  for (const assessment of recentAssessments.slice(0, 3)) {
    const selectedOptions = assessment.data.selectedOptions;
    if (selectedOptions[2]?.includes("poorly_rested")) {
      poorSleepCount++;
    }
  }
  
  if (poorSleepCount >= 2) {
    patterns.push({
      id: `sleep-pattern-${new Date().getTime()}`,
      type: 'Sleep Disruption',
      description: 'Multiple days with reported poor sleep quality',
      riskLevel: poorSleepCount >= 3 ? 'high' : 'moderate',
      recommendation: 'Consider reviewing your sleep habits and environment',
      detectedDate: new Date().toISOString()
    });
  }
  
  // Check for insomnia patterns
  const insomniaCount = recentAssessments
    .slice(0, 5)
    .filter(assessment => 
      assessment.data.selectedOptions[2.1]?.includes("insomnia")
    ).length;
  
  if (insomniaCount >= 2) {
    patterns.push({
      id: `insomnia-pattern-${new Date().getTime()}`,
      type: 'Insomnia Pattern',
      description: 'Recurring reports of insomnia detected',
      riskLevel: insomniaCount >= 3 ? 'high' : 'moderate',
      recommendation: 'Consider reducing screen time and caffeine before bed',
      detectedDate: new Date().toISOString()
    });
  }
  
  return patterns;
}

/**
 * Detect lifestyle-related patterns from assessment data
 */
export function detectLifestylePatterns(
  recentAssessments: AssessmentHistory[]
): HealthPattern[] {
  const patterns: HealthPattern[] = [];
  
  if (recentAssessments.length < 3) return patterns;
  
  // Check for exercise patterns
  const noExerciseDays = recentAssessments
    .slice(0, 7)
    .filter(assessment => 
      assessment.data.selectedOptions[4]?.includes("no")
    ).length;
  
  if (noExerciseDays >= 5) {
    patterns.push({
      id: `exercise-pattern-${new Date().getTime()}`,
      type: 'Low Activity Pattern',
      description: 'Insufficient physical activity detected',
      riskLevel: noExerciseDays >= 6 ? 'high' : 'moderate',
      recommendation: 'Try to incorporate light exercise into your daily routine',
      detectedDate: new Date().toISOString()
    });
  }
  
  // Check for high alcohol consumption
  const highAlcoholDays = recentAssessments
    .slice(0, 7)
    .filter(assessment => {
      const selectedOptions = assessment.data.selectedOptions;
      return selectedOptions[9]?.includes("yes") && 
        (selectedOptions[9.2]?.includes("more_than_three") || 
         selectedOptions[9.2]?.includes("binge"));
    }).length;
  
  if (highAlcoholDays >= 2) {
    patterns.push({
      id: `alcohol-pattern-${new Date().getTime()}`,
      type: 'Alcohol Consumption',
      description: 'Frequent high alcohol consumption detected',
      riskLevel: highAlcoholDays >= 3 ? 'high' : 'moderate',
      recommendation: 'Consider reducing alcohol intake and tracking how it affects your sleep',
      detectedDate: new Date().toISOString()
    });
  }
  
  return patterns;
}

/**
 * Detect health-related patterns from assessment data
 */
export function detectHealthPatterns(
  recentAssessments: AssessmentHistory[]
): HealthPattern[] {
  const patterns: HealthPattern[] = [];
  
  if (recentAssessments.length < 2) return patterns;
  
  // Check for recurring pain patterns
  const painTypes: Record<string, number> = {};
  
  for (const assessment of recentAssessments.slice(0, 5)) {
    const painLocations = assessment.data.selectedOptions[7.1] || [];
    
    for (const pain of painLocations) {
      painTypes[pain] = (painTypes[pain] || 0) + 1;
    }
  }
  
  for (const [painType, count] of Object.entries(painTypes)) {
    if (count >= 3) {
      let painName = painType;
      switch (painType) {
        case 'joint': painName = 'Joint pain'; break;
        case 'muscle': painName = 'Muscle pain'; break;
        case 'headache': painName = 'Headaches'; break;
        case 'abdominal': painName = 'Abdominal pain'; break;
        case 'back': painName = 'Back pain'; break;
        case 'chest': painName = 'Chest pain'; break;
        case 'migraines': painName = 'Migraines'; break;
      }
      
      patterns.push({
        id: `pain-pattern-${painType}-${new Date().getTime()}`,
        type: 'Recurring Pain',
        description: `Frequent ${painName} reported`,
        riskLevel: painType === 'chest' ? 'high' : count >= 4 ? 'moderate' : 'low',
        recommendation: painType === 'chest' ? 'Consider consulting a healthcare provider about chest pain' : 'Monitor pain patterns and consider consulting a healthcare provider',
        detectedDate: new Date().toISOString()
      });
    }
  }
  
  // Check for stress patterns
  const stressDays = recentAssessments
    .slice(0, 7)
    .filter(assessment => 
      assessment.data.selectedOptions[12]?.includes("stressed")
    ).length;
  
  if (stressDays >= 4) {
    patterns.push({
      id: `stress-pattern-${new Date().getTime()}`,
      type: 'Chronic Stress',
      description: 'Persistent stress or anxiety detected',
      riskLevel: stressDays >= 6 ? 'high' : 'moderate',
      recommendation: 'Consider stress management techniques like meditation or physical activity',
      detectedDate: new Date().toISOString()
    });
  }
  
  return patterns;
}

/**
 * Detect all health patterns from assessment data
 */
export function detectAllPatterns(
  recentAssessments: AssessmentHistory[]
): HealthPattern[] {
  const sleepPatterns = detectSleepPatterns(recentAssessments);
  const lifestylePatterns = detectLifestylePatterns(recentAssessments);
  const healthPatterns = detectHealthPatterns(recentAssessments);
  
  return [...sleepPatterns, ...lifestylePatterns, ...healthPatterns];
}

/**
 * Filter patterns by recency (last N days)
 */
export function getRecentPatterns(
  patterns: HealthPattern[],
  days: number = 7
): HealthPattern[] {
  const cutoffDate = subDays(new Date(), days);
  
  return patterns.filter(pattern => {
    const detectedDate = new Date(pattern.detectedDate);
    return detectedDate >= cutoffDate;
  });
}
