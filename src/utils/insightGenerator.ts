
import { format, subDays } from "date-fns";
import { AssessmentData } from "./readinessScoring";

type AssessmentHistory = {
  date: string;
  data: AssessmentData;
  completedAt: string;
  readinessScore?: number;
};

interface InsightFactor {
  category: string;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

/**
 * Generate dynamic insights based on assessment data
 */
export function generateReadinessInsights(
  recentAssessments: AssessmentHistory[],
  currentScore: number,
  previousScore?: number
): {
  summary: string;
  factors: InsightFactor[];
  recommendedActions: string[];
} {
  if (recentAssessments.length === 0) {
    return {
      summary: "Complete your daily assessment to receive personalized insights.",
      factors: [],
      recommendedActions: ["Take your first assessment to establish a baseline"]
    };
  }

  const latestAssessment = recentAssessments[0];
  const factors: InsightFactor[] = [];
  const recommendedActions: string[] = [];
  
  // Analyze sleep quality
  if (latestAssessment.data.selectedOptions[2]?.includes("poorly_rested")) {
    factors.push({
      category: 'Sleep',
      impact: 'negative',
      description: 'Poor sleep quality'
    });
    recommendedActions.push('Consider going to bed 30 minutes earlier tonight');
  } else if (latestAssessment.data.selectedOptions[2]?.includes("well_rested")) {
    factors.push({
      category: 'Sleep',
      impact: 'positive',
      description: 'Good sleep quality'
    });
  }
  
  // Analyze stress levels
  if (latestAssessment.data.selectedOptions[12]?.includes("stressed")) {
    factors.push({
      category: 'Mental Health',
      impact: 'negative',
      description: 'Elevated stress levels'
    });
    recommendedActions.push('Try a 5-minute breathing exercise to reduce stress');
  }
  
  // Analyze caffeine intake
  if (latestAssessment.data.selectedOptions[3]?.includes("yes")) {
    if (latestAssessment.data.selectedOptions[3.1]?.includes("3_plus_cups")) {
      factors.push({
        category: 'Caffeine',
        impact: 'negative',
        description: 'High caffeine intake'
      });
      recommendedActions.push('Consider reducing caffeine consumption');
    }
    if (latestAssessment.data.selectedOptions[3.2]?.includes("evening")) {
      factors.push({
        category: 'Caffeine',
        impact: 'negative',
        description: 'Evening caffeine consumption'
      });
      recommendedActions.push('Avoid caffeine after 2pm for better sleep');
    }
  }

  // Analyze exercise
  if (latestAssessment.data.selectedOptions[4]?.includes("yes")) {
    factors.push({
      category: 'Physical Activity',
      impact: 'positive',
      description: 'Regular physical activity'
    });
  } else {
    factors.push({
      category: 'Physical Activity',
      impact: 'negative',
      description: 'Limited physical activity'
    });
    recommendedActions.push('Try to include a short walk in your day');
  }
  
  // Analyze alcohol consumption
  if (latestAssessment.data.selectedOptions[9]?.includes("yes")) {
    if (latestAssessment.data.selectedOptions[9.2]?.includes("more_than_three") || 
        latestAssessment.data.selectedOptions[9.2]?.includes("binge")) {
      factors.push({
        category: 'Alcohol',
        impact: 'negative',
        description: 'Elevated alcohol consumption'
      });
      recommendedActions.push('Consider reducing alcohol intake to improve recovery');
    }
  }
  
  // Analyze meal quality
  if (latestAssessment.data.selectedOptions[11]?.includes("poor")) {
    factors.push({
      category: 'Nutrition',
      impact: 'negative',
      description: 'Poor nutrition quality'
    });
    recommendedActions.push('Try to include more whole foods in your meals');
  } else if (latestAssessment.data.selectedOptions[11]?.includes("balanced")) {
    factors.push({
      category: 'Nutrition',
      impact: 'positive',
      description: 'Balanced nutrition'
    });
  }
  
  // Generate summary based on factors and score
  const positiveFactors = factors.filter(f => f.impact === 'positive');
  const negativeFactors = factors.filter(f => f.impact === 'negative');
  
  let summary = "";
  
  if (currentScore >= 85) {
    summary = "Your readiness is excellent! ";
    if (positiveFactors.length > 0) {
      summary += `Contributing factors include ${positiveFactors.map(f => f.description.toLowerCase()).join(' and ')}.`;
    }
  } else if (currentScore >= 70) {
    summary = "Your readiness is good. ";
    if (positiveFactors.length > 0 && negativeFactors.length > 0) {
      summary += `${positiveFactors[0].description} is supporting your recovery, but ${negativeFactors[0].description.toLowerCase()} may be limiting your potential.`;
    } else if (positiveFactors.length > 0) {
      summary += `${positiveFactors.map(f => f.description).join(' and ')} are supporting your recovery.`;
    }
  } else if (currentScore >= 50) {
    summary = "Your readiness is moderate. ";
    if (negativeFactors.length > 0) {
      summary += `Consider addressing ${negativeFactors.map(f => f.description.toLowerCase()).join(' and ')} to improve recovery.`;
    }
  } else {
    summary = "Your readiness needs attention. ";
    if (negativeFactors.length > 0) {
      summary += `Focus on improving ${negativeFactors.map(f => f.description.toLowerCase()).join(' and ')} to enhance recovery.`;
    }
  }
  
  // Add weekly trend if we have previous scores
  if (previousScore !== undefined) {
    const scoreDiff = currentScore - previousScore;
    if (scoreDiff > 5) {
      summary += ` Your readiness has improved ${Math.abs(scoreDiff).toFixed(0)}% from yesterday.`;
    } else if (scoreDiff < -5) {
      summary += ` Your readiness has decreased ${Math.abs(scoreDiff).toFixed(0)}% from yesterday.`;
    } else {
      summary += " Your readiness has remained stable compared to yesterday.";
    }
  }
  
  return {
    summary,
    factors,
    recommendedActions: recommendedActions.length > 0 ? recommendedActions : ["Keep up your current routine to maintain readiness"]
  };
}

/**
 * Get the top contributing categories from assessment data
 */
export function getTopContributingCategories(assessmentData: AssessmentData): {
  category: string;
  score: number;
  impact: 'positive' | 'negative' | 'neutral';
}[] {
  // Calculate scores for each category
  const { selectedOptions } = assessmentData;
  
  const categories = [
    {
      category: "Sleep Quality",
      score: calculateSleepScore(selectedOptions),
      impact: calculateSleepScore(selectedOptions) > 70 ? 'positive' : 'negative' as 'positive' | 'negative'
    },
    {
      category: "Mental Health",
      score: calculateMentalHealthScore(selectedOptions),
      impact: calculateMentalHealthScore(selectedOptions) > 70 ? 'positive' : 'negative' as 'positive' | 'negative'
    },
    {
      category: "Physical Activity",
      score: calculateActivityScore(selectedOptions),
      impact: calculateActivityScore(selectedOptions) > 70 ? 'positive' : 'negative' as 'positive' | 'negative'
    },
    {
      category: "Nutrition",
      score: calculateNutritionScore(selectedOptions),
      impact: calculateNutritionScore(selectedOptions) > 70 ? 'positive' : 'negative' as 'positive' | 'negative'
    },
    {
      category: "Substance Use",
      score: calculateSubstanceScore(selectedOptions),
      impact: calculateSubstanceScore(selectedOptions) > 70 ? 'positive' : 'negative' as 'positive' | 'negative'
    },
    {
      category: "Symptoms",
      score: calculateSymptomScore(selectedOptions),
      impact: calculateSymptomScore(selectedOptions) > 70 ? 'positive' : 'negative' as 'positive' | 'negative'
    }
  ];
  
  // Sort by absolute impact (most impactful first)
  return categories.sort((a, b) => Math.abs(a.score - 70) > Math.abs(b.score - 70) ? -1 : 1);
}

// Helper functions to calculate category scores
function calculateSleepScore(selectedOptions: Record<number, string[]>): number {
  let score = 100;
  
  if (selectedOptions[2]?.includes("poorly_rested")) {
    score -= 30;
  }
  
  const sleepReasons = selectedOptions[2.1] || [];
  if (sleepReasons.includes("insomnia")) score -= 10;
  if (sleepReasons.includes("nightmares")) score -= 5;
  if (sleepReasons.includes("sleep_apnea")) score -= 15;
  if (sleepReasons.includes("restless_leg")) score -= 10;
  
  return Math.max(0, score);
}

function calculateMentalHealthScore(selectedOptions: Record<number, string[]>): number {
  let score = 100;
  
  // Mental health (Question 12)
  if (selectedOptions[12]?.includes("stressed")) {
    score -= 20;
    
    // Mental health symptoms (Question 12.2)
    const mentalSymptoms = selectedOptions[12.2] || [];
    if (mentalSymptoms.includes("racing_thoughts")) score -= 10;
    if (mentalSymptoms.includes("mood_swings")) score -= 15;
  }
  
  return Math.max(0, score);
}

function calculateActivityScore(selectedOptions: Record<number, string[]>): number {
  let score = 70; // baseline
  
  // Exercise (Question 4)
  if (selectedOptions[4]?.includes("yes")) {
    score += 30;
    
    // Exercise intensity (Question 4.2)
    if (selectedOptions[4.2]?.includes("light")) {
      score -= 10;
    } else if (selectedOptions[4.2]?.includes("intense")) {
      // High intensity can be good but not excessive
      score += 5;
    }
  } else {
    score -= 30;
  }
  
  return Math.max(0, Math.min(100, score));
}

function calculateNutritionScore(selectedOptions: Record<number, string[]>): number {
  let score = 70; // baseline
  
  // Meal quality (Question 11)
  if (selectedOptions[11]?.includes("balanced")) {
    score += 30;
  } else if (selectedOptions[11]?.includes("poor")) {
    score -= 30;
  } else if (selectedOptions[11]?.includes("skipped")) {
    score -= 20;
  }
  
  return Math.max(0, Math.min(100, score));
}

function calculateSubstanceScore(selectedOptions: Record<number, string[]>): number {
  let score = 100; // start perfect and subtract
  
  // Caffeine intake (Question 3)
  if (selectedOptions[3]?.includes("yes")) {
    if (selectedOptions[3.1]?.includes("3_plus_cups")) {
      score -= 15;
    }
    if (selectedOptions[3.2]?.includes("evening")) {
      score -= 20;
    }
  }
  
  // Alcohol consumption (Question 9)
  if (selectedOptions[9]?.includes("yes")) {
    score -= 15;
    
    if (selectedOptions[9.2]?.includes("more_than_three")) {
      score -= 15;
    }
    if (selectedOptions[9.2]?.includes("binge")) {
      score -= 30;
    }
  }
  
  // Substance use (Question 10)
  if (selectedOptions[10]?.includes("yes")) {
    score -= 30;
    
    if (selectedOptions[10.2]?.includes("heavy")) {
      score -= 20;
    }
  }
  
  return Math.max(0, score);
}

function calculateSymptomScore(selectedOptions: Record<number, string[]>): number {
  let score = 100; // start perfect and subtract
  
  // General feeling (Question 1)
  if (selectedOptions[1]?.includes("not_good")) {
    score -= 20;
  }
  
  // Symptoms (Question 1.2)
  const symptoms = selectedOptions[1.2] || [];
  if (symptoms.includes("headache")) score -= 10;
  if (symptoms.includes("fatigue")) score -= 15;
  if (symptoms.includes("nausea")) score -= 20;
  if (symptoms.includes("chest_pain")) score -= 30;
  if (symptoms.includes("shortness_of_breath")) score -= 25;
  
  // Aches or pains (Question 7)
  if (selectedOptions[7]?.includes("yes")) {
    score -= 10;
    
    const painLocations = selectedOptions[7.1] || [];
    if (painLocations.includes("joint")) score -= 10;
    if (painLocations.includes("chest")) score -= 30;
    if (painLocations.includes("headache")) score -= 10;
    if (painLocations.includes("migraines")) score -= 15;
  }
  
  return Math.max(0, score);
}
