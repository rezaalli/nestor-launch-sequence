
import { format } from "date-fns";

/**
 * Interface for assessment data structure
 */
export interface AssessmentData {
  selectedOptions: Record<number, string[]>;
  notes: Record<number, string>;
  customInputs: Record<number, Record<string, string>>;
  timestamp: string;
}

/**
 * Calculates the physiological stability score based on assessment responses
 * Lower score is better (will be subtracted from 100)
 */
export function calculatePhysiologicalStability(assessmentData: AssessmentData): number {
  let score = 0;
  const { selectedOptions } = assessmentData;

  // Sleep quality (Question 2)
  if (selectedOptions[2]?.includes("poorly_rested")) {
    score += 5;
  }

  // Sleep reasons (Question 2.1)
  const sleepReasons = selectedOptions[2.1] || [];
  if (sleepReasons.includes("insomnia")) score += 5;
  if (sleepReasons.includes("nightmares")) score += 3;
  if (sleepReasons.includes("sleep_apnea")) score += 7;
  if (sleepReasons.includes("restless_leg")) score += 4;

  // General feeling (Question 1)
  if (selectedOptions[1]?.includes("not_good")) {
    score += 5;
  }

  // Symptoms (Question 1.2)
  const symptoms = selectedOptions[1.2] || [];
  if (symptoms.includes("headache")) score += 3;
  if (symptoms.includes("fatigue")) score += 4;
  if (symptoms.includes("nausea")) score += 5;
  if (symptoms.includes("chest_pain")) score += 10;
  if (symptoms.includes("shortness_of_breath")) score += 8;

  // Urination (Question 5)
  if (selectedOptions[5]?.includes("increased") || selectedOptions[5]?.includes("decreased")) {
    score += 3;
  }

  // Bowel movements (Question 6)
  if (selectedOptions[6]?.includes("constipation")) score += 3;
  if (selectedOptions[6]?.includes("diarrhea")) score += 5;
  if (selectedOptions[6]?.includes("bloody")) score += 15;

  return score;
}

/**
 * Calculates the lifestyle consistency score based on assessment responses
 * Lower score is better (will be subtracted from 100)
 */
export function calculateLifestyleConsistency(assessmentData: AssessmentData): number {
  let score = 0;
  const { selectedOptions } = assessmentData;

  // Exercise (Question 4)
  if (selectedOptions[4]?.includes("no")) {
    score += 5;
  } else if (selectedOptions[4]?.includes("yes")) {
    // Exercise intensity (Question 4.2)
    if (selectedOptions[4.2]?.includes("intense")) {
      score += 2; // Some intensity is good
    }
  }

  // Caffeine intake (Question 3)
  if (selectedOptions[3]?.includes("yes")) {
    if (selectedOptions[3.1]?.includes("3_plus_cups")) {
      score += 3;
    }
    if (selectedOptions[3.2]?.includes("evening")) {
      score += 5;
    }
  }

  // Alcohol consumption (Question 9)
  if (selectedOptions[9]?.includes("yes")) {
    if (selectedOptions[9.2]?.includes("more_than_three")) {
      score += 8;
    }
    if (selectedOptions[9.2]?.includes("binge")) {
      score += 15;
    }
  }

  // Substance use (Question 10)
  if (selectedOptions[10]?.includes("yes")) {
    score += 10;
    if (selectedOptions[10.2]?.includes("heavy")) {
      score += 5;
    }
  }

  // Meal quality (Question 11)
  if (selectedOptions[11]?.includes("poor")) {
    score += 5;
  }
  
  return score;
}

/**
 * Calculates the self-reported health score based on assessment responses
 * Lower score is better (will be subtracted from 100)
 */
export function calculateSelfReportedHealth(assessmentData: AssessmentData): number {
  let score = 0;
  const { selectedOptions } = assessmentData;

  // Aches or pains (Question 7)
  if (selectedOptions[7]?.includes("yes")) {
    score += 3;
    
    // Pain locations (Question 7.1)
    const painLocations = selectedOptions[7.1] || [];
    if (painLocations.includes("joint")) score += 2;
    if (painLocations.includes("chest")) score += 10;
    if (painLocations.includes("headache")) score += 3;
    if (painLocations.includes("migraines")) score += 5;
  }

  // Chronic conditions (Question 8)
  if (selectedOptions[8]?.includes("yes")) {
    score += 5;
    
    // Specific conditions (Question 8.1)
    const conditions = selectedOptions[8.1] || [];
    if (conditions.includes("hypertension")) score += 3;
    if (conditions.includes("diabetes")) score += 4;
    if (conditions.includes("heart_disease")) score += 7;
    if (conditions.includes("respiratory")) score += 5;
  }

  // Mental health (Question 12)
  if (selectedOptions[12]?.includes("stressed")) {
    score += 7;
    
    // Mental health symptoms (Question 12.2)
    const mentalSymptoms = selectedOptions[12.2] || [];
    if (mentalSymptoms.includes("racing_thoughts")) score += 2;
    if (mentalSymptoms.includes("mood_swings")) score += 3;
  }

  // Noticed changes (Question 13)
  if (selectedOptions[13]?.includes("yes")) {
    score += 3;
  }

  return score;
}

/**
 * Calculate the overall readiness score from assessment data
 * Higher score (0-100) is better
 */
export function calculateReadinessScore(assessmentData: AssessmentData): number {
  const physiologicalScore = calculatePhysiologicalStability(assessmentData);
  const lifestyleScore = calculateLifestyleConsistency(assessmentData);
  const selfReportedScore = calculateSelfReportedHealth(assessmentData);
  
  // Calculate raw score by subtracting penalties from 100
  const rawScore = 100 - (physiologicalScore + lifestyleScore + selfReportedScore);
  
  // Clamp between 0-100
  return Math.max(0, Math.min(100, rawScore));
}

/**
 * Get the readiness score grade based on numeric value
 */
export function getReadinessGrade(score: number): {
  grade: string;
  color: string;
} {
  if (score >= 85) {
    return { grade: 'Optimal', color: 'text-green-600' };
  } else if (score >= 70) {
    return { grade: 'Good', color: 'text-blue-600' };
  } else if (score >= 50) {
    return { grade: 'Moderate', color: 'text-yellow-600' };
  } else {
    return { grade: 'Low', color: 'text-red-600' };
  }
}

/**
 * Get contributing factors that make up the readiness score
 */
export function getContributingFactors(assessmentData: AssessmentData): {
  name: string;
  percentage: number;
}[] {
  const physiologicalScore = calculatePhysiologicalStability(assessmentData);
  const lifestyleScore = calculateLifestyleConsistency(assessmentData);
  const selfReportedScore = calculateSelfReportedHealth(assessmentData);
  
  // Calculate maximum possible deduction for each category
  const maxPhysiological = 50;
  const maxLifestyle = 50;
  const maxSelfReported = 50;
  
  // Calculate remaining percentage (higher is better)
  const physiologicalPercentage = 100 - (physiologicalScore / maxPhysiological * 100);
  const lifestylePercentage = 100 - (lifestyleScore / maxLifestyle * 100);
  const selfReportedPercentage = 100 - (selfReportedScore / maxSelfReported * 100);
  
  return [
    { name: 'Physiological Metrics', percentage: Math.round(physiologicalPercentage) },
    { name: 'Lifestyle Consistency', percentage: Math.round(lifestylePercentage) },
    { name: 'Self-Reported Health', percentage: Math.round(selfReportedPercentage) }
  ];
}
