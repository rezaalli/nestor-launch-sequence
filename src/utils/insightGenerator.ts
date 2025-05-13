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
 * Detected correlation between two health metrics
 */
interface HealthCorrelation {
  primaryFactor: string;
  secondaryFactor: string;
  relationship: 'positive' | 'negative'; // positive means they move together, negative means inverse
  strength: 'strong' | 'moderate' | 'weak';
  description: string;
}

/**
 * Generate a holistic wellness summary based on a week of assessment data
 * Produces 3-5 sentences about general health trends with correlation analysis
 */
export function generateWeeklyWellnessSummary(
  weeklyAssessments: AssessmentHistory[]
): string {
  // If no assessments, return a default message
  if (!weeklyAssessments || weeklyAssessments.length === 0) {
    return "Complete your daily assessments to receive personalized weekly wellness insights. Regular logging helps identify patterns and trends that can support your health journey. The more consistently you track, the more valuable your insights will become.";
  }

  const assessmentCount = weeklyAssessments.length;
  
  // First, analyze trends across various health domains
  const trends = analyzeWeeklyTrends(weeklyAssessments);
  
  // Then, detect correlations between different health metrics
  const correlations = detectHealthCorrelations(weeklyAssessments);
  
  // Build our insight paragraph with 3-5 sentences
  
  // Sentence 1: General wellness overview
  let summary = generateWellnessOverview(trends, assessmentCount);
  
  // Sentence 2: Reference a meaningful correlation or pattern
  if (correlations.length > 0) {
    // We have correlations to highlight
    summary += " " + generateCorrelationInsight(correlations[0]);
  } else {
    // Default to behavioral patterns if no correlations found
    summary += " " + generateBehavioralPatternInsight(trends, weeklyAssessments);
  }
  
  // Sentence 3: Flag any significant events or changes
  const significantEvent = identifySignificantEvent(weeklyAssessments, trends);
  if (significantEvent) {
    summary += " " + significantEvent;
  }
  
  // Sentence 4: Offer a behavioral insight or additional correlation
  if (correlations.length > 1) {
    summary += " " + generateSecondaryCorrelationInsight(correlations[1]);
  } else if (Object.keys(trends).filter(key => 
    key !== 'overall' && 
    key !== 'readinessScoreTrend' && 
    key !== 'symptomsPresent' &&
    trends[key as keyof typeof trends] !== 'unknown'
  ).length > 2) {
    summary += " " + generateSecondaryBehavioralInsight(trends);
  }
  
  // Sentence 5 (optional): Actionable suggestion with transition word
  summary += " " + generatePersonalizedRecommendation(trends, correlations, weeklyAssessments);
  
  return summary;
}

/**
 * Generate an overview of the user's wellness for the week
 */
function generateWellnessOverview(
  trends: ReturnType<typeof analyzeWeeklyTrends>,
  assessmentCount: number
): string {
  const trackingQuality = assessmentCount >= 5 
    ? "Your consistent tracking this week reveals" 
    : "Based on your partial week tracking,";
    
  // Overall wellness statements based on trends
  if (trends.overall === 'improving') {
    return `${trackingQuality} a positive trend in your wellness patterns, with gradual improvements in your readiness scores.`;
  } else if (trends.overall === 'declining') {
    if (trends.stressLevel === 'high') {
      return `${trackingQuality} elevated stress levels appear to be influencing your overall wellness this week, with your body showing signs of increased recovery needs.`;
    } else if (trends.sleepQuality === 'poor') {
      return `${trackingQuality} sleep inconsistencies seem to be affecting your recovery patterns this week, with potential impacts on your daily energy balance.`;
    } else {
      return `${trackingQuality} your body is showing some signs of strain this week, with your wellness metrics indicating a need for additional recovery support.`;
    }
  } else if (trends.overall === 'mixed') {
    return `${trackingQuality} your wellness appears to fluctuate throughout the week, with varying patterns of recovery and strain.`;
  } else {
    // Stable trend
    if (trends.readinessScoreTrend > 0) {
      return `${trackingQuality} a relatively stable wellness pattern this week, with your body maintaining consistent recovery capabilities.`;
    } else {
      return `${trackingQuality} your wellness measures are holding relatively steady, with your body maintaining a consistent baseline.`;
    }
  }
}

/**
 * Identify a significant event or change from the week
 */
function identifySignificantEvent(
  assessments: AssessmentHistory[],
  trends: ReturnType<typeof analyzeWeeklyTrends>
): string | null {
  // Look for peak stress day
  if (trends.stressLevel === 'high' && assessments.length >= 3) {
    const stressedDays = assessments.filter(a => 
      a.data.selectedOptions[12]?.includes("stressed")
    );
    
    if (stressedDays.length >= 1 && stressedDays.length < assessments.length) {
      const dayPosition = stressedDays.length > 1 ? 'Multiple days' : 'Mid-week';
      return `${dayPosition} showed elevated stress responses that may have influenced your recovery capacity.`;
    }
  }
  
  // Look for disrupted sleep pattern
  if (trends.sleepQuality === 'poor' && assessments.length >= 3) {
    const poorSleepDays = assessments.filter(a => 
      a.data.selectedOptions[2]?.includes("poorly_rested")
    );
    
    if (poorSleepDays.length >= 1 && poorSleepDays.length < assessments.length) {
      return `Your sleep patterns showed some disruption, which typically affects next-day energy and recovery.`;
    }
  }
  
  // Look for symptom flare-up
  if (trends.symptomsPresent && assessments.length >= 3) {
    const symptomDays = assessments.filter(a => 
      a.data.selectedOptions[1]?.includes("not_good") ||
      a.data.selectedOptions[7]?.includes("yes")
    );
    
    if (symptomDays.length >= 1 && symptomDays.length <= 3) {
      return `There were some days with reported symptoms that may have temporarily affected your wellness balance.`;
    }
  }
  
  // Look for good recovery days
  if (assessments.length >= 5) {
    const highReadinessDays = assessments.filter(a => 
      a.readinessScore !== undefined && a.readinessScore > 80
    );
    
    if (highReadinessDays.length >= 2 && highReadinessDays.length < assessments.length) {
      return `You experienced several days of excellent recovery, demonstrating your body's capacity for resilience when supported by consistent lifestyle factors.`;
    }
  }
  
  // No significant events identified
  return null;
}

/**
 * Detect correlations between different health metrics
 */
function detectHealthCorrelations(
  assessments: AssessmentHistory[]
): HealthCorrelation[] {
  if (assessments.length < 3) return [];
  
  const correlations: HealthCorrelation[] = [];
  
  // Check for caffeine and sleep correlations
  const caffeineSleepCorrelation = detectCaffeineSleepCorrelation(assessments);
  if (caffeineSleepCorrelation) correlations.push(caffeineSleepCorrelation);
  
  // Check for exercise and stress correlations
  const exerciseStressCorrelation = detectExerciseStressCorrelation(assessments);
  if (exerciseStressCorrelation) correlations.push(exerciseStressCorrelation);
  
  // Check for hydration and symptom correlations
  const hydrationSymptomCorrelation = detectHydrationSymptomCorrelation(assessments);
  if (hydrationSymptomCorrelation) correlations.push(hydrationSymptomCorrelation);
  
  // Check for alcohol and next-day wellness correlations
  const alcoholWellnessCorrelation = detectAlcoholWellnessCorrelation(assessments);
  if (alcoholWellnessCorrelation) correlations.push(alcoholWellnessCorrelation);
  
  // Check for nutrition and energy correlations
  const nutritionEnergyCorrelation = detectNutritionEnergyCorrelation(assessments);
  if (nutritionEnergyCorrelation) correlations.push(nutritionEnergyCorrelation);
  
  // Check for heart rate variability and stress correlation
  const hrvStressCorrelation = detectHrvStressCorrelation(assessments);
  if (hrvStressCorrelation) correlations.push(hrvStressCorrelation);
  
  // Check for sleep and next-day activity correlation
  const sleepActivityCorrelation = detectSleepActivityCorrelation(assessments);
  if (sleepActivityCorrelation) correlations.push(sleepActivityCorrelation);
  
  return correlations;
}

/**
 * Detect correlation between HRV and stress levels
 */
function detectHrvStressCorrelation(
  assessments: AssessmentHistory[]
): HealthCorrelation | null {
  // This would require HRV data which might not be present in current implementation
  // For now, return null, but could be implemented when HRV data is available
  return null;
}

/**
 * Detect correlation between sleep quality and next day's activity level
 */
function detectSleepActivityCorrelation(
  assessments: AssessmentHistory[]
): HealthCorrelation | null {
  if (assessments.length < 4) return null;
  
  let goodSleepActiveNext = 0;
  let goodSleepInactiveNext = 0;
  let totalGoodSleep = 0;
  
  let poorSleepActiveNext = 0;
  let poorSleepInactiveNext = 0;
  let totalPoorSleep = 0;
  
  // Analyze each day's data and the following day
  for (let i = 0; i < assessments.length - 1; i++) {
    const todayData = assessments[i].data;
    const tomorrowData = assessments[i + 1]?.data;
    
    if (!tomorrowData) continue;
    
    // Check sleep quality today
    const goodSleep = todayData.selectedOptions[2]?.includes("well_rested");
    const poorSleep = todayData.selectedOptions[2]?.includes("poorly_rested");
    
    // Check activity level tomorrow
    const activeNextDay = tomorrowData.selectedOptions[4]?.includes("yes");
    
    if (goodSleep) {
      totalGoodSleep++;
      if (activeNextDay) goodSleepActiveNext++;
      else goodSleepInactiveNext++;
    } else if (poorSleep) {
      totalPoorSleep++;
      if (activeNextDay) poorSleepActiveNext++;
      else poorSleepInactiveNext++;
    }
  }
  
  // Only proceed if we have enough data
  if (totalGoodSleep < 2 || totalPoorSleep < 2) return null;
  
  // Calculate percentages
  const goodSleepActiveRate = goodSleepActiveNext / totalGoodSleep;
  const poorSleepActiveRate = poorSleepActiveNext / totalPoorSleep;
  
  // Check if there's a notable difference
  const difference = goodSleepActiveRate - poorSleepActiveRate;
  
  if (Math.abs(difference) < 0.3) return null; // Not significant
  
  // Higher activity rate after good sleep indicates positive correlation
  if (difference > 0) {
    return {
      primaryFactor: 'Sleep Quality',
      secondaryFactor: 'Physical Activity',
      relationship: 'positive',
      strength: difference > 0.5 ? 'strong' : 'moderate',
      description: 'Better sleep quality appears to support higher activity levels the following day'
    };
  }
  
  // Unusual case: more active after poor sleep
  return null;
}

/**
 * Detect correlation between caffeine intake and sleep quality
 */
function detectCaffeineSleepCorrelation(
  assessments: AssessmentHistory[]
): HealthCorrelation | null {
  // Count days with high caffeine + poor sleep vs. high caffeine + good sleep
  let highCaffeinePoorSleep = 0;
  let highCaffeineGoodSleep = 0;
  let totalHighCaffeine = 0;
  
  // Count days with low/no caffeine + poor sleep vs. low/no caffeine + good sleep
  let lowCaffeinePoorSleep = 0;
  let lowCaffeineGoodSleep = 0;
  let totalLowCaffeine = 0;
  
  // Analyze each day's data
  for (let i = 0; i < assessments.length - 1; i++) {
    const todayData = assessments[i].data;
    const tomorrowData = assessments[i + 1]?.data;
    
    if (!tomorrowData) continue;
    
    // Check caffeine today
    const highCaffeine = todayData.selectedOptions[3]?.includes("yes") &&
      (todayData.selectedOptions[3.1]?.includes("3_plus_cups") || 
       todayData.selectedOptions[3.2]?.includes("evening"));
    
    // Check next day's sleep
    const poorSleep = tomorrowData.selectedOptions[2]?.includes("poorly_rested");
    
    if (highCaffeine) {
      totalHighCaffeine++;
      if (poorSleep) highCaffeinePoorSleep++;
      else highCaffeineGoodSleep++;
    } else {
      totalLowCaffeine++;
      if (poorSleep) lowCaffeinePoorSleep++;
      else lowCaffeineGoodSleep++;
    }
  }
  
  // Only proceed if we have enough data
  if (totalHighCaffeine < 2 || totalLowCaffeine < 2) return null;
  
  // Calculate percentages
  const highCaffeinePoorSleepRate = highCaffeinePoorSleep / totalHighCaffeine;
  const lowCaffeinePoorSleepRate = lowCaffeinePoorSleep / totalLowCaffeine;
  
  // Check if there's a notable difference
  const difference = highCaffeinePoorSleepRate - lowCaffeinePoorSleepRate;
  
  if (Math.abs(difference) < 0.2) return null; // Not significant
  
  // Higher rate of poor sleep with high caffeine indicates negative correlation
  if (difference > 0) {
    return {
      primaryFactor: 'Caffeine',
      secondaryFactor: 'Sleep',
      relationship: 'negative',
      strength: difference > 0.5 ? 'strong' : (difference > 0.3 ? 'moderate' : 'weak'),
      description: 'Higher caffeine intake appears to be associated with poorer sleep quality'
    };
  }
  
  // Otherwise, surprisingly, caffeine might not be disrupting sleep
  return {
    primaryFactor: 'Caffeine',
    secondaryFactor: 'Sleep',
    relationship: 'positive',
    strength: 'weak',
    description: 'Your caffeine consumption doesn\'t appear to significantly disrupt sleep patterns'
  };
}

/**
 * Detect correlation between exercise and stress levels
 */
function detectExerciseStressCorrelation(
  assessments: AssessmentHistory[]
): HealthCorrelation | null {
  if (assessments.length < 3) return null;
  
  let exerciseLowStress = 0;
  let exerciseHighStress = 0;
  let totalExerciseDays = 0;
  
  let noExerciseLowStress = 0;
  let noExerciseHighStress = 0;
  let totalNoExerciseDays = 0;
  
  // Analyze each day's data
  for (const assessment of assessments) {
    const data = assessment.data;
    
    // Check exercise
    const didExercise = data.selectedOptions[4]?.includes("yes");
    
    // Check stress
    const highStress = data.selectedOptions[12]?.includes("stressed");
    
    if (didExercise) {
      totalExerciseDays++;
      if (highStress) exerciseHighStress++;
      else exerciseLowStress++;
    } else {
      totalNoExerciseDays++;
      if (highStress) noExerciseHighStress++;
      else noExerciseLowStress++;
    }
  }
  
  // Only proceed if we have enough data
  if (totalExerciseDays < 2 || totalNoExerciseDays < 2) return null;
  
  // Calculate percentages
  const exerciseHighStressRate = exerciseHighStress / totalExerciseDays;
  const noExerciseHighStressRate = noExerciseHighStress / totalNoExerciseDays;
  
  // Check if there's a notable difference
  const difference = noExerciseHighStressRate - exerciseHighStressRate;
  
  if (Math.abs(difference) < 0.2) return null; // Not significant
  
  // Higher rate of stress on non-exercise days indicates negative correlation
  if (difference > 0) {
    return {
      primaryFactor: 'Physical Activity',
      secondaryFactor: 'Stress',
      relationship: 'negative',
      strength: difference > 0.5 ? 'strong' : (difference > 0.3 ? 'moderate' : 'weak'),
      description: 'Days with physical activity tend to show lower reported stress levels'
    };
  }
  
  // If exercise correlates with higher stress (unusual), report it
  return {
    primaryFactor: 'Physical Activity',
    secondaryFactor: 'Stress',
    relationship: 'positive',
    strength: Math.abs(difference) > 0.5 ? 'moderate' : 'weak',
    description: 'Your exercise days surprisingly correlate with higher stress levels'
  };
}

/**
 * Detect correlation between hydration and symptoms
 */
function detectHydrationSymptomCorrelation(
  assessments: AssessmentHistory[]
): HealthCorrelation | null {
  if (assessments.length < 3) return null;
  
  let dehydratedWithSymptoms = 0;
  let dehydratedNoSymptoms = 0;
  let totalDehydratedDays = 0;
  
  let hydratedWithSymptoms = 0;
  let hydratedNoSymptoms = 0;
  let totalHydratedDays = 0;
  
  // Analyze each day's data
  for (const assessment of assessments) {
    const data = assessment.data;
    
    // Check hydration (using urination as proxy)
    const dehydrated = data.selectedOptions[5]?.includes("decreased");
    
    // Check symptoms
    const hasSymptoms = data.selectedOptions[1]?.includes("not_good") || 
                        (data.selectedOptions[7]?.includes("yes"));
    
    if (dehydrated) {
      totalDehydratedDays++;
      if (hasSymptoms) dehydratedWithSymptoms++;
      else dehydratedNoSymptoms++;
    } else {
      totalHydratedDays++;
      if (hasSymptoms) hydratedWithSymptoms++;
      else hydratedNoSymptoms++;
    }
  }
  
  // Only proceed if we have enough data
  if (totalDehydratedDays < 2 || totalHydratedDays < 2) return null;
  
  // Calculate percentages
  const dehydratedWithSymptomsRate = dehydratedWithSymptoms / totalDehydratedDays;
  const hydratedWithSymptomsRate = hydratedWithSymptoms / totalHydratedDays;
  
  // Check if there's a notable difference
  const difference = dehydratedWithSymptomsRate - hydratedWithSymptomsRate;
  
  if (Math.abs(difference) < 0.2) return null; // Not significant
  
  // More symptoms when dehydrated indicates correlation
  if (difference > 0) {
    return {
      primaryFactor: 'Hydration',
      secondaryFactor: 'Physical Symptoms',
      relationship: 'negative',
      strength: difference > 0.5 ? 'strong' : (difference > 0.3 ? 'moderate' : 'weak'),
      description: 'Days with signs of reduced hydration tend to coincide with more physical symptoms'
    };
  }
  
  return null; // Unlikely to have reverse correlation
}

/**
 * Detect correlation between alcohol consumption and next-day wellness
 */
function detectAlcoholWellnessCorrelation(
  assessments: AssessmentHistory[]
): HealthCorrelation | null {
  if (assessments.length < 3) return null;
  
  let alcoholPoorNextDay = 0;
  let alcoholGoodNextDay = 0;
  let totalAlcoholDays = 0;
  
  // Analyze each day's data
  for (let i = 0; i < assessments.length - 1; i++) {
    const todayData = assessments[i].data;
    const tomorrowData = assessments[i + 1]?.data;
    
    if (!tomorrowData) continue;
    
    // Check alcohol today
    const drankAlcohol = todayData.selectedOptions[9]?.includes("yes");
    
    if (!drankAlcohol) continue;
    
    totalAlcoholDays++;
    
    // Check next day's overall feeling
    const nextDayPoor = tomorrowData.selectedOptions[1]?.includes("not_good") || 
                         tomorrowData.selectedOptions[2]?.includes("poorly_rested");
    
    if (nextDayPoor) alcoholPoorNextDay++;
    else alcoholGoodNextDay++;
  }
  
  // Only proceed if we have enough data
  if (totalAlcoholDays < 2) return null;
  
  // Calculate percentage
  const alcoholPoorNextDayRate = alcoholPoorNextDay / totalAlcoholDays;
  
  // If alcohol consumption often leads to poorer next-day wellness
  if (alcoholPoorNextDayRate > 0.5) {
    return {
      primaryFactor: 'Alcohol',
      secondaryFactor: 'Next-Day Wellness',
      relationship: 'negative',
      strength: alcoholPoorNextDayRate > 0.7 ? 'strong' : 'moderate',
      description: 'Alcohol consumption appears to negatively impact how you feel the following day'
    };
  }
  
  return null; // Not significant or not enough data
}

/**
 * Detect correlation between nutrition quality and energy levels
 */
function detectNutritionEnergyCorrelation(
  assessments: AssessmentHistory[]
): HealthCorrelation | null {
  if (assessments.length < 3) return null;
  
  let goodNutritionGoodEnergy = 0;
  let goodNutritionPoorEnergy = 0;
  let totalGoodNutrition = 0;
  
  let poorNutritionGoodEnergy = 0;
  let poorNutritionPoorEnergy = 0;
  let totalPoorNutrition = 0;
  
  // Analyze each day's data
  for (const assessment of assessments) {
    const data = assessment.data;
    
    // Check nutrition
    const goodNutrition = data.selectedOptions[11]?.includes("balanced");
    const poorNutrition = data.selectedOptions[11]?.includes("poor") || 
                        data.selectedOptions[11]?.includes("skipped");
    
    // Check energy/fatigue
    const poorEnergy = data.selectedOptions[1.2]?.includes("fatigue") ||
                       data.selectedOptions[12.2]?.includes("fatigue");
    
    if (goodNutrition) {
      totalGoodNutrition++;
      if (poorEnergy) goodNutritionPoorEnergy++;
      else goodNutritionGoodEnergy++;
    } else if (poorNutrition) {
      totalPoorNutrition++;
      if (poorEnergy) poorNutritionPoorEnergy++;
      else poorNutritionGoodEnergy++;
    }
  }
  
  // Only proceed if we have enough data
  if (totalGoodNutrition < 2 || totalPoorNutrition < 2) return null;
  
  // Calculate percentages
  const goodNutritionPoorEnergyRate = goodNutritionPoorEnergy / totalGoodNutrition;
  const poorNutritionPoorEnergyRate = poorNutritionPoorEnergy / totalPoorNutrition;
  
  // Check if there's a notable difference
  const difference = poorNutritionPoorEnergyRate - goodNutritionPoorEnergyRate;
  
  if (Math.abs(difference) < 0.2) return null; // Not significant
  
  // More fatigue with poor nutrition indicates correlation
  if (difference > 0) {
    return {
      primaryFactor: 'Nutrition',
      secondaryFactor: 'Energy Levels',
      relationship: 'positive',
      strength: difference > 0.5 ? 'strong' : (difference > 0.3 ? 'moderate' : 'weak'),
      description: 'Better nutrition quality appears to positively impact your energy levels'
    };
  }
  
  return null; // Unlikely to have reverse correlation
}

/**
 * Generate correlation insight text
 */
function generateCorrelationInsight(correlation: HealthCorrelation): string {
  const strengthText = correlation.strength === 'strong' 
    ? 'consistently' 
    : (correlation.strength === 'moderate' ? 'often' : 'sometimes');
  
  if (correlation.relationship === 'positive') {
    return `Your data ${strengthText} shows that better ${correlation.primaryFactor.toLowerCase()} corresponds with improved ${correlation.secondaryFactor.toLowerCase()}.`;
  } else {
    // For negative relationships
    if (correlation.primaryFactor === 'Alcohol' || correlation.primaryFactor === 'Caffeine') {
      return `Your ${correlation.primaryFactor.toLowerCase()} consumption ${strengthText} appears to affect your ${correlation.secondaryFactor.toLowerCase()} in the following period.`;
    } else if (correlation.primaryFactor === 'Hydration') {
      return `Days with lower ${correlation.primaryFactor.toLowerCase()} levels ${strengthText} coincided with increased ${correlation.secondaryFactor.toLowerCase()}.`;
    } else {
      return `Lower ${correlation.primaryFactor.toLowerCase()} ${strengthText} aligned with reduced ${correlation.secondaryFactor.toLowerCase()}.`;
    }
  }
}

/**
 * Generate additional correlation insight text (more concise)
 */
function generateSecondaryCorrelationInsight(correlation: HealthCorrelation): string {
  if (correlation.relationship === 'positive') {
    return `Additionally, your body appears to respond well when your ${correlation.primaryFactor.toLowerCase()} supports your ${correlation.secondaryFactor.toLowerCase()}.`;
  } else {
    return `Your tracking also reveals a connection between ${correlation.primaryFactor.toLowerCase()} patterns and changes in your ${correlation.secondaryFactor.toLowerCase()}.`;
  }
}

/**
 * Generate behavioral pattern insight based on trends
 */
function generateBehavioralPatternInsight(
  trends: ReturnType<typeof analyzeWeeklyTrends>,
  assessments: AssessmentHistory[]
): string {
  // Find the most significant behavioral patterns
  const patterns = [];
  
  if (trends.sleepQuality !== 'unknown') {
    const sleepPattern = trends.sleepQuality === 'poor' 
      ? "inconsistent sleep patterns appear to be affecting your recovery capacity" 
      : (trends.sleepQuality === 'good' ? "your consistent sleep schedule is supporting your recovery processes" : "your moderately consistent sleep provides some stability for recovery");
    patterns.push(sleepPattern);
  }
  
  if (trends.hydration !== 'unknown') {
    const hydrationPattern = trends.hydration === 'poor' 
      ? "days with signs of lower hydration often aligned with reduced energy levels" 
      : (trends.hydration === 'good' ? "consistent hydration appears to support your physiological balance" : "your varying hydration levels may be influencing your daily energy fluctuations");
    patterns.push(hydrationPattern);
  }
  
  if (trends.activityConsistency !== 'unknown') {
    const activityPattern = trends.activityConsistency === 'low' 
      ? "incorporating more movement throughout your day might support your recovery systems" 
      : (trends.activityConsistency === 'high' ? "regular physical activity appears to be a supportive pattern in your wellness routine" : "your intermittent activity provides some support for your body's recovery processes");
    patterns.push(activityPattern);
  }
  
  if (patterns.length === 0) {
    // If we don't have specific patterns, provide a general observation
    return "Your weekly patterns show varying influences on your recovery capacity, which could benefit from more consistent tracking to identify clear trends.";
  }
  
  // Pick 1-2 most important patterns
  return `The data suggests that ${patterns[0]}${patterns.length > 1 ? ", while " + patterns[1] : ""}.`;
}

/**
 * Generate secondary behavioral insight
 */
function generateSecondaryBehavioralInsight(
  trends: ReturnType<typeof analyzeWeeklyTrends>
): string {
  // Check if stress is significant
  if (trends.stressLevel === 'high') {
    return "Recovery appears to be challenged on days with higher reported stress, suggesting a connection between your mental state and physical resilience.";
  }
  
  // Check if substance use is significant
  if (trends.substanceUse === 'concerning') {
    return "Your recovery patterns show sensitivity to substance intake timing and quantity, suggesting an opportunity to optimize your consumption habits.";
  }
  
  // Check sleep and activity relationship
  if (trends.sleepQuality !== 'unknown' && trends.activityConsistency !== 'unknown') {
    if (trends.sleepQuality === 'good' && trends.activityConsistency === 'high') {
      return "Your body appears to benefit from the positive cycle of quality sleep supporting activity, which in turn promotes better recovery.";
    } else if (trends.sleepQuality === 'poor' && trends.activityConsistency === 'low') {
      return "The relationship between sleep quality and movement appears significant in your data, with potential for mutual improvement.";
    }
  }
  
  // Default to a general progress statement
  return "Your body's patterns reveal subtle connections between daily choices and wellness outcomes that will become clearer with consistent tracking.";
}

/**
 * Generate personalized recommendation based on trends
 */
function generatePersonalizedRecommendation(
  trends: ReturnType<typeof analyzeWeeklyTrends>,
  correlations: HealthCorrelation[],
  assessments: AssessmentHistory[]
): string {
  // Use correlations for targeted recommendations if available
  if (correlations.length > 0) {
    const correlation = correlations[0];
    
    if (correlation.primaryFactor === 'Caffeine' && correlation.relationship === 'negative') {
      return "Looking ahead, experimenting with reducing afternoon caffeine might support your sleep quality and recovery processes.";
    }
    
    if (correlation.primaryFactor === 'Physical Activity' && correlation.relationship === 'negative') {
      return "Going forward, consider front-loading your day with movement, even briefly, which may help manage your stress levels throughout the day.";
    }
    
    if (correlation.primaryFactor === 'Hydration' && correlation.relationship === 'negative') {
      return "Moving forward, setting regular hydration reminders could help maintain consistent fluid intake and potentially reduce symptom occurrences.";
    }
    
    if (correlation.primaryFactor === 'Alcohol' && correlation.relationship === 'negative') {
      return "Looking ahead, planning alcohol-free days between consumption might support better recovery and daily energy levels.";
    }
    
    if (correlation.primaryFactor === 'Nutrition' && correlation.relationship === 'positive') {
      return "Consider continuing to prioritize balanced nutrition earlier in the day to maintain consistent energy levels throughout your activities.";
    }
    
    if (correlation.primaryFactor === 'Sleep Quality' && correlation.relationship === 'positive') {
      return "Moving forward, protecting your sleep environment and pre-sleep routine could further enhance your daytime energy and recovery capacity.";
    }
  }
  
  // Fall back to trend-based recommendations
  if (trends.sleepQuality === 'poor') {
    return "Going forward, establishing a more consistent sleep schedule, even on weekends, could help improve your recovery patterns.";
  }
  
  if (trends.activityConsistency === 'low') {
    return "Looking ahead, incorporating brief movement breaks throughout your day, rather than single longer sessions, might better support your overall wellness.";
  }
  
  if (trends.hydration === 'poor') {
    return "Moving forward, starting your day with hydration and maintaining it throughout could help stabilize your energy and recovery patterns.";
  }
  
  if (trends.stressLevel === 'high') {
    return "Consider adding short breathing exercises at transition points in your day to help manage stress response and support recovery.";
  }
  
  // If no specific issues, offer a maintenance recommendation
  return "Going forward, continuing to track consistently while maintaining your current approach to balanced lifestyle factors will help identify further opportunities for optimization.";
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
 * Generates a condensed wellness summary for the dashboard view
 * @param assessments Array of user assessments from the past week
 * @returns A 1-2 sentence condensed summary of the user's weekly wellness
 */
export const generateCondensedWellnessSummary = (assessments: any[]): string => {
  if (!assessments || assessments.length === 0) {
    return "";
  }

  // Get the most significant patterns from the data
  const patterns = analyzeWeeklyTrends(assessments);
  
  // Choose the top pattern to highlight
  const topPattern = patterns[0];
  
  // Generate condensed insights (1-2 sentences max)
  let summary = "";
  
  if (topPattern && topPattern.strength > 0.6) {
    // Strong correlation found
    summary = `This week, ${topPattern.description.toLowerCase()}`;
    
    // If we have a second pattern that's complementary, add it
    if (patterns.length > 1 && patterns[1].strength > 0.5 && 
        patterns[1].category !== topPattern.category) {
      summary += ` while ${patterns[1].description.toLowerCase()}`;
    }
    
    // Add period if needed
    if (!summary.endsWith('.')) {
      summary += '.';
    }
  } else {
    // No strong patterns - use generic summary
    const hasGoodMetrics = assessments.some(a => 
      a.readinessScore > 80 || (a.data && a.data.sleepQuality > 7)
    );
    
    if (hasGoodMetrics) {
      summary = "Your wellness metrics show positive trends with good recovery on consistent days.";
    } else {
      summary = "This week shows moderate wellness stability with room for improvement in your daily routines.";
    }
  }
  
  return summary;
};
