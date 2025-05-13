
import { format, subDays, parseISO } from "date-fns";
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
    recommendedActions.push('Try going to bed 30 minutes earlier tonight');
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
    recommendedActions.push('Practice a 5-minute breathing exercise to reduce stress');
  }
  
  // Analyze caffeine intake
  if (latestAssessment.data.selectedOptions[3]?.includes("yes")) {
    if (latestAssessment.data.selectedOptions[3.1]?.includes("3_plus_cups")) {
      factors.push({
        category: 'Caffeine',
        impact: 'negative',
        description: 'High caffeine intake'
      });
      recommendedActions.push('Try reducing caffeine consumption by one cup tomorrow');
    }
    if (latestAssessment.data.selectedOptions[3.2]?.includes("evening")) {
      factors.push({
        category: 'Caffeine',
        impact: 'negative',
        description: 'Evening caffeine consumption'
      });
      recommendedActions.push('Avoid caffeine after 2pm for better sleep quality');
    }
  } else {
    factors.push({
      category: 'Caffeine',
      impact: 'positive',
      description: 'Moderate caffeine intake'
    });
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
    recommendedActions.push('Try to include at least a 10-minute walk in your day');
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
  } else {
    factors.push({
      category: 'Alcohol',
      impact: 'positive',
      description: 'Limited alcohol consumption'
    });
  }
  
  // Analyze hydration based on urination frequency
  if (latestAssessment.data.selectedOptions[5]?.includes("normal")) {
    factors.push({
      category: 'Hydration',
      impact: 'positive',
      description: 'Good hydration levels'
    });
  } else if (latestAssessment.data.selectedOptions[5]?.includes("decreased")) {
    factors.push({
      category: 'Hydration',
      impact: 'negative',
      description: 'Signs of dehydration'
    });
    recommendedActions.push('Increase your water intake throughout the day');
  }
  
  // Analyze meal quality
  if (latestAssessment.data.selectedOptions[11]?.includes("poor")) {
    factors.push({
      category: 'Nutrition',
      impact: 'negative',
      description: 'Poor nutrition quality'
    });
    recommendedActions.push('Try to include more whole foods in your next meals');
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
    if (positiveFactors.length >= 2) {
      const factor1 = positiveFactors[0].category.toLowerCase();
      const factor2 = positiveFactors[1].category.toLowerCase();
      summary = `Your excellent readiness is supported by good ${factor1} and ${factor2}.`;
    } else if (positiveFactors.length === 1) {
      summary = `Your excellent readiness is highlighted by good ${positiveFactors[0].category.toLowerCase()}.`;
    } else {
      summary = "Your readiness score is excellent today.";
    }
  } else if (currentScore >= 70) {
    if (positiveFactors.length > 0 && negativeFactors.length > 0) {
      summary = `Good ${positiveFactors[0].category.toLowerCase()} is supporting your recovery, but ${negativeFactors[0].category.toLowerCase()} may be limiting your potential.`;
    } else if (positiveFactors.length > 0) {
      summary = `Your good readiness is supported by ${positiveFactors[0].category.toLowerCase()}.`;
    } else if (negativeFactors.length > 0) {
      summary = `Consider improving your ${negativeFactors[0].category.toLowerCase()} to increase your readiness further.`;
    } else {
      summary = "Your readiness score is good today.";
    }
  } else if (currentScore >= 50) {
    if (negativeFactors.length >= 2) {
      const factor1 = negativeFactors[0].category.toLowerCase();
      const factor2 = negativeFactors[1].category.toLowerCase();
      summary = `Your ${factor1} and ${factor2} are negatively affecting your recovery today.`;
    } else if (negativeFactors.length === 1) {
      summary = `Your ${negativeFactors[0].category.toLowerCase()} is limiting your overall readiness.`;
    } else {
      summary = "Your readiness score is moderate today.";
    }
  } else {
    if (negativeFactors.length > 0) {
      const mainFactor = negativeFactors[0].category.toLowerCase();
      summary = `Your readiness needs attention, primarily due to your ${mainFactor}.`;
    } else {
      summary = "Your readiness is low today and requires attention.";
    }
  }
  
  // Add weekly trend if we have previous scores
  if (previousScore !== undefined) {
    const scoreDiff = currentScore - previousScore;
    if (scoreDiff > 5) {
      summary += ` Your readiness has improved ${Math.abs(scoreDiff).toFixed(0)}% from yesterday.`;
    } else if (scoreDiff < -5) {
      summary += ` Your readiness has decreased ${Math.abs(scoreDiff).toFixed(0)}% from yesterday.`;
    }
  }
  
  // Limit actions to 3 max
  const limitedActions = recommendedActions.slice(0, 3);
  
  return {
    summary,
    factors,
    recommendedActions: limitedActions.length > 0 
      ? limitedActions 
      : ["Maintain your current healthy routines to support recovery"]
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
      category: "Hydration",
      score: calculateHydrationScore(selectedOptions),
      impact: calculateHydrationScore(selectedOptions) > 70 ? 'positive' : 'negative' as 'positive' | 'negative'
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

/**
 * Generate a holistic wellness summary based on a week of assessment data
 * Produces 2-3 sentences about general health trends without specific metrics
 */
export function generateWeeklyWellnessSummary(
  weeklyAssessments: AssessmentHistory[]
): string {
  // If no assessments, return a default message
  if (!weeklyAssessments || weeklyAssessments.length === 0) {
    return "Complete your daily assessments to receive personalized weekly wellness insights. Regular logging helps identify patterns and trends that can support your health journey.";
  }

  // Analyze trends across various health domains
  const trends = analyzeWeeklyTrends(weeklyAssessments);
  
  // Generate main wellness statement
  let summary = generateWellnessStatement(trends, weeklyAssessments.length);
  
  // Add issue-specific insight
  summary += " " + generateFocusAreaInsight(trends);
  
  // Add encouragement or recommendation
  summary += " " + generateRecommendation(trends);
  
  return summary;
}

/**
 * Analyze weekly trends across multiple health domains
 */
function analyzeWeeklyTrends(assessments: AssessmentHistory[]): {
  overall: 'improving' | 'declining' | 'stable' | 'mixed';
  stressLevel: 'high' | 'moderate' | 'low' | 'unknown';
  activityConsistency: 'high' | 'moderate' | 'low' | 'unknown';
  sleepQuality: 'good' | 'moderate' | 'poor' | 'unknown';
  hydration: 'good' | 'moderate' | 'poor' | 'unknown';
  nutrition: 'good' | 'moderate' | 'poor' | 'unknown';
  substanceUse: 'concerning' | 'moderate' | 'minimal' | 'unknown';
  symptomsPresent: boolean;
  readinessScoreTrend: number; // Average change between days
} {
  // Default values
  let result = {
    overall: 'stable' as 'improving' | 'declining' | 'stable' | 'mixed',
    stressLevel: 'unknown' as 'high' | 'moderate' | 'low' | 'unknown',
    activityConsistency: 'unknown' as 'high' | 'moderate' | 'low' | 'unknown',
    sleepQuality: 'unknown' as 'good' | 'moderate' | 'poor' | 'unknown', 
    hydration: 'unknown' as 'good' | 'moderate' | 'poor' | 'unknown',
    nutrition: 'unknown' as 'good' | 'moderate' | 'poor' | 'unknown',
    substanceUse: 'unknown' as 'concerning' | 'moderate' | 'minimal' | 'unknown',
    symptomsPresent: false,
    readinessScoreTrend: 0
  };
  
  if (assessments.length < 2) {
    return result;
  }
  
  // Sort assessments by date (oldest first)
  const sortedAssessments = [...assessments].sort((a, b) => 
    parseISO(a.date).getTime() - parseISO(b.date).getTime()
  );
  
  // Track readiness score changes
  const readinessScores = sortedAssessments
    .map(a => a.readinessScore)
    .filter(score => score !== undefined) as number[];
  
  let scoreDiffs = 0;
  let diffCount = 0;
  
  if (readinessScores.length >= 2) {
    for (let i = 1; i < readinessScores.length; i++) {
      scoreDiffs += readinessScores[i] - readinessScores[i-1];
      diffCount++;
    }
    
    result.readinessScoreTrend = diffCount > 0 ? scoreDiffs / diffCount : 0;
    
    if (result.readinessScoreTrend > 2) {
      result.overall = 'improving';
    } else if (result.readinessScoreTrend < -2) {
      result.overall = 'declining';
    } else {
      result.overall = 'stable';
    }
  }
  
  // Analyze stress levels across assessments
  const stressedCount = assessments.filter(a => 
    a.data.selectedOptions[12]?.includes("stressed")
  ).length;
  
  if (stressedCount / assessments.length > 0.5) {
    result.stressLevel = 'high';
  } else if (stressedCount / assessments.length > 0.25) {
    result.stressLevel = 'moderate';
  } else {
    result.stressLevel = 'low';
  }
  
  // Analyze activity consistency
  const exerciseDays = assessments.filter(a => 
    a.data.selectedOptions[4]?.includes("yes")
  ).length;
  
  if (exerciseDays / assessments.length > 0.65) {
    result.activityConsistency = 'high';
  } else if (exerciseDays / assessments.length > 0.3) {
    result.activityConsistency = 'moderate';
  } else {
    result.activityConsistency = 'low';
  }
  
  // Analyze sleep quality
  const poorSleepDays = assessments.filter(a => 
    a.data.selectedOptions[2]?.includes("poorly_rested")
  ).length;
  
  if (poorSleepDays / assessments.length > 0.5) {
    result.sleepQuality = 'poor';
  } else if (poorSleepDays / assessments.length > 0.25) {
    result.sleepQuality = 'moderate';
  } else {
    result.sleepQuality = 'good';
  }
  
  // Analyze hydration (based on urination)
  const dehydrationDays = assessments.filter(a => 
    a.data.selectedOptions[5]?.includes("decreased")
  ).length;
  
  if (dehydrationDays / assessments.length > 0.4) {
    result.hydration = 'poor';
  } else if (dehydrationDays / assessments.length > 0.2) {
    result.hydration = 'moderate';
  } else {
    result.hydration = 'good';
  }
  
  // Analyze nutrition quality
  const poorNutritionDays = assessments.filter(a => 
    a.data.selectedOptions[11]?.includes("poor") || a.data.selectedOptions[11]?.includes("skipped")
  ).length;
  
  if (poorNutritionDays / assessments.length > 0.5) {
    result.nutrition = 'poor';
  } else if (poorNutritionDays / assessments.length > 0.25) {
    result.nutrition = 'moderate';
  } else {
    result.nutrition = 'good';
  }
  
  // Analyze substance use (alcohol, caffeine)
  const highSubstanceDays = assessments.filter(a => 
    (a.data.selectedOptions[9]?.includes("yes") && 
      (a.data.selectedOptions[9.2]?.includes("more_than_three") || 
       a.data.selectedOptions[9.2]?.includes("binge"))) ||
    (a.data.selectedOptions[3]?.includes("yes") && 
      a.data.selectedOptions[3.1]?.includes("3_plus_cups") && 
      a.data.selectedOptions[3.2]?.includes("evening")) ||
    a.data.selectedOptions[10]?.includes("yes")
  ).length;
  
  if (highSubstanceDays / assessments.length > 0.4) {
    result.substanceUse = 'concerning';
  } else if (highSubstanceDays / assessments.length > 0.2) {
    result.substanceUse = 'moderate';
  } else {
    result.substanceUse = 'minimal';
  }
  
  // Check if symptoms were present
  result.symptomsPresent = assessments.some(a => 
    a.data.selectedOptions[1]?.includes("not_good") ||
    a.data.selectedOptions[7]?.includes("yes")
  );
  
  return result;
}

/**
 * Generate the main wellness statement based on trends
 */
function generateWellnessStatement(
  trends: ReturnType<typeof analyzeWeeklyTrends>,
  assessmentCount: number
): string {
  const consistencyPhrase = assessmentCount >= 5 
    ? "consistent tracking reveals" 
    : "partial week tracking suggests";
    
  // General wellness statements
  if (trends.overall === 'improving') {
    return `Your ${consistencyPhrase} a positive trend in overall wellness this week, with improvements in your readiness scores.`;
  } else if (trends.overall === 'declining') {
    if (trends.stressLevel === 'high') {
      return `Your ${consistencyPhrase} elevated stress levels may be impacting your wellness this week, with declining readiness scores.`;
    } else {
      return `Your ${consistencyPhrase} some challenges in your wellness patterns this week, with declining readiness scores.`;
    }
  } else {
    // Stable trend
    if (trends.readinessScoreTrend > 0) {
      return `Your ${consistencyPhrase} a relatively stable wellness pattern this week, with slightly improving readiness.`;
    } else {
      return `Your ${consistencyPhrase} a relatively stable wellness pattern this week, with consistent readiness levels.`;
    }
  }
}

/**
 * Generate insights about specific health areas
 */
function generateFocusAreaInsight(
  trends: ReturnType<typeof analyzeWeeklyTrends>
): string {
  // Identify areas of concern
  const concerns = [];
  
  if (trends.sleepQuality === 'poor') concerns.push("sleep quality");
  if (trends.stressLevel === 'high') concerns.push("stress levels");
  if (trends.activityConsistency === 'low') concerns.push("physical activity");
  if (trends.hydration === 'poor') concerns.push("hydration");
  if (trends.nutrition === 'poor') concerns.push("nutrition");
  if (trends.substanceUse === 'concerning') concerns.push("substance intake");
  
  // Identify strengths
  const strengths = [];
  
  if (trends.sleepQuality === 'good') strengths.push("sleep quality");
  if (trends.stressLevel === 'low') strengths.push("stress management");
  if (trends.activityConsistency === 'high') strengths.push("physical activity");
  if (trends.hydration === 'good') strengths.push("hydration");
  if (trends.nutrition === 'good') strengths.push("nutrition");
  if (trends.substanceUse === 'minimal') strengths.push("lifestyle balance");
  
  if (concerns.length >= 2) {
    return `Paying closer attention to your ${concerns[0]} and ${concerns[1]} may help improve your wellness outcomes.`;
  } else if (concerns.length === 1) {
    if (strengths.length >= 1) {
      return `Your good ${strengths[0]} is supporting your wellness, though focusing on ${concerns[0]} could further enhance your readiness.`;
    } else {
      return `Focusing on your ${concerns[0]} could help improve your overall wellness and recovery.`;
    }
  } else if (strengths.length >= 2) {
    return `Your consistent ${strengths[0]} and ${strengths[1]} are positively contributing to your wellness this week.`;
  } else if (strengths.length === 1) {
    return `Your ${strengths[0]} stands out as a positive factor in your wellness this week.`;
  } else {
    return `Multiple factors are influencing your wellness this week, with no single dominant pattern emerging.`;
  }
}

/**
 * Generate a recommendation based on trends
 */
function generateRecommendation(
  trends: ReturnType<typeof analyzeWeeklyTrends>
): string {
  // Choose recommendation based on primary concern
  if (trends.sleepQuality === 'poor') {
    return "Consider implementing a consistent sleep routine to support recovery and overall wellness.";
  } else if (trends.stressLevel === 'high') {
    return "Adding brief stress-reduction practices to your daily routine may help improve your wellness outcomes.";
  } else if (trends.activityConsistency === 'low') {
    return "Introducing even short periods of movement throughout your day could positively impact your wellness measures.";
  } else if (trends.hydration === 'poor') {
    return "Increasing your daily water intake could help support your body's recovery processes.";
  } else if (trends.nutrition === 'poor') {
    return "Focusing on balanced nutrition may help improve your overall energy and recovery patterns.";
  } else if (trends.substanceUse === 'concerning') {
    return "Moderating your substance intake could potentially enhance your recovery and daily wellness.";
  } else if (trends.symptomsPresent) {
    return "Continue monitoring your symptoms as you maintain your wellness tracking routine.";
  } else {
    return "Keep maintaining your current healthy routines, as they appear to be supporting your wellness effectively.";
  }
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

function calculateHydrationScore(selectedOptions: Record<number, string[]>): number {
  let score = 80; // Baseline - assume decent hydration
  
  // Use urination as a proxy for hydration (Question 5)
  if (selectedOptions[5]?.includes("decreased")) {
    score -= 30; // Likely dehydrated
  } else if (selectedOptions[5]?.includes("increased")) {
    score += 10; // Likely well hydrated
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
