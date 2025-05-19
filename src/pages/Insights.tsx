import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { ArrowLeft, Calendar, MoreVertical, Brain, Activity, Zap, Award, TrendingUp, ExternalLink, CloudSun, Clock, Search, Filter, ArrowUpDown, ThumbsUp, ThumbsDown, LineChart, HelpCircle, Moon, Sun, Sparkles, ArrowRight } from 'lucide-react';
import StatusBar from '@/components/StatusBar';
import { useNavigate, Link } from 'react-router-dom';
import { getLastReading } from '@/utils/bleUtils';
import BottomNavbar from '@/components/BottomNavbar';
import { useAssessment } from '@/contexts/AssessmentContext';
import WeeklyTrendChart, { ReadingType } from '@/components/WeeklyTrendChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ReadinessScore from '@/components/ReadinessScore';
import { useML } from '@/hooks/useML';
import { cn } from '@/lib/utils';
import { format, subDays, subWeeks, subMonths, parseISO } from 'date-fns';
import { generateReadinessInsights, generateWeeklyWellnessSummary } from '@/utils/insightGenerator';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import ErrorBoundary from '@/components/ErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { useTheme } from '@/contexts/ThemeContext';
import { SimpleSkeletonLoader as Skeleton, TextSkeleton, CardSkeleton } from '@/components/ui/skeleton';

// Import ML functionality
import activityClassifier, { ActivityType, AccelerometerData, ActivityClassification, ENABLE_ACTIVITY_CLASSIFICATION } from '@/lib/ml/models/activityClassifier';

// Import our advanced visualization components
import CorrelationPlot, { DataPoint, MetricType as CorrMetricType } from '@/components/visualizations/CorrelationPlot';
import HeatMapCalendar, { DayData, MetricType as HeatMapMetricType } from '@/components/visualizations/HeatMapCalendar';
import ComparativeAnalysis, { 
  ComparisonData, 
  MetricType as CompMetricType, 
  TimeRangeType 
} from '@/components/visualizations/ComparativeAnalysis';

// Import Phase 4 components
import InsightCard, { InsightPriority, InsightAction, InsightSource } from '@/components/insights/InsightCard';
import InsightHistory, { HistoricalInsight } from '@/components/insights/InsightHistory';
import GoalVisualization, { GoalMetric } from '@/components/insights/GoalVisualization';
import GoalCustomizationModal from '@/components/insights/GoalCustomizationModal';

// Define necessary types
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'all-day';
export type InsightCategory = 'sleep' | 'activity' | 'nutrition' | 'stress' | 'heart' | 'energy' | 'goals' | 'health';

// User preferences interface
export interface UserPreferences {
  categories: {
    [key in InsightCategory]: {
      enabled: boolean;
      priority: number;
    };
  };
  display: {
    detailLevel: 'minimal' | 'moderate' | 'detailed';
    layout: 'cards' | 'timeline' | 'focused' | 'compact';
    showContextual: boolean;
    darkMode: boolean;
    compactView: boolean;
    autoHideTimeIrrelevant: boolean;
    priorityThreshold: 'all' | 'medium-up' | 'high-up' | 'critical-only';
  };
  notifications: {
    enabled: boolean;
    criticalOnly: boolean;
    timeRanges: TimeOfDay[];
    doNotDisturb: boolean;
  };
  timeContext: {
    useAutomaticTimeContext: boolean;
    manualTimeOfDay: TimeOfDay;
    showTimeRelevantContentFirst: boolean;
  };
}

// Define time range labels
const timeRangeLabels: Record<TimeRangeType, string> = {
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly',
  year: 'Yearly',
  custom: 'Custom'
};

// Define interface for ML insights (copied from Dashboard.tsx)
interface MLInsights {
  sleep: {
    score: number;
    message: string;
    recommendation: string;
    priority?: 'critical' | 'high' | 'medium' | 'low' | 'info';
    sources?: string[];
    context?: string;
    actions?: {
      label: string;
      description: string;
      timeframe: 'now' | 'today' | 'week' | 'long-term';
      impact: 'high' | 'medium' | 'low';
      url?: string;
    }[];
    relatedInsights?: string[];
  };
  activity: {
    score: number;
    message: string;
    recommendation: string;
    priority?: 'critical' | 'high' | 'medium' | 'low' | 'info';
    sources?: string[];
    context?: string;
    actions?: {
      label: string;
      description: string;
      timeframe: 'now' | 'today' | 'week' | 'long-term';
      impact: 'high' | 'medium' | 'low';
      url?: string;
    }[];
    relatedInsights?: string[];
  };
  stress: {
    score: number;
    message: string;
    recommendation: string;
    priority?: 'critical' | 'high' | 'medium' | 'low' | 'info';
    sources?: string[];
    context?: string;
    actions?: {
      label: string;
      description: string;
      timeframe: 'now' | 'today' | 'week' | 'long-term';
      impact: 'high' | 'medium' | 'low';
      url?: string;
    }[];
    relatedInsights?: string[];
  };
  nutrition: {
    score: number;
    message: string;
    recommendation: string;
    priority?: 'critical' | 'high' | 'medium' | 'low' | 'info';
    sources?: string[];
    context?: string;
    actions?: {
      label: string;
      description: string;
      timeframe: 'now' | 'today' | 'week' | 'long-term';
      impact: 'high' | 'medium' | 'low';
      url?: string;
    }[];
    relatedInsights?: string[];
  };
  forecast?: {
    today?: {
      summary: string;
      predictions?: {
        metric: string;
        value: number;
        confidence: number;
      }[];
    };
    week?: {
      summary: string;
      predictions?: {
        metric: string;
        value: number;
        confidence: number;
        day: string;
      }[];
    };
  };
  healthTrends: {
    heart: {
      status: 'improving' | 'declining' | 'stable';
      message: string;
      priority?: 'critical' | 'high' | 'medium' | 'low' | 'info';
      sources?: string[];
      context?: string;
      relatedInsights?: string[];
    };
    energy: {
      status: 'improving' | 'declining' | 'stable';
      message: string;
      priority?: 'critical' | 'high' | 'medium' | 'low' | 'info';
      sources?: string[];
      context?: string;
      relatedInsights?: string[];
    };
    sleep: {
      status: 'improving' | 'declining' | 'stable';
      message: string;
      priority?: 'critical' | 'high' | 'medium' | 'low' | 'info';
      sources?: string[];
      context?: string;
      relatedInsights?: string[];
    };
    // Add activity recognition trend
    activityRecognition?: {
      status: 'improving' | 'declining' | 'stable';
      message: string;
      priority?: 'critical' | 'high' | 'medium' | 'low' | 'info';
      sources?: string[];
      context?: string;
      relatedInsights?: string[];
      classification?: ActivityClassification;
      recentActivities?: ActivityClassification[];
    };
  };
  dailyRecommendation: string;
  insights?: {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: 'critical' | 'high' | 'medium' | 'low' | 'info';
    timestamp: Date;
    sources?: {
      name: string;
      type: 'wearable' | 'manual' | 'assessment' | 'calculated';
      lastUpdated?: Date;
      confidence?: number;
    }[];
    context?: string;
    actions?: {
      label: string;
      description: string;
      timeframe: 'now' | 'today' | 'week' | 'long-term';
      impact: 'high' | 'medium' | 'low';
      url?: string;
    }[];
    relatedInsights?: string[];
    timeRelevance?: TimeOfDay[];
    correlationStrength?: number; 
    visualData?: any;
  }[];
  goals?: {
    id: string;
    name: string;
    currentValue: number;
    targetValue: number;
    startValue: number;
    unit: string;
    timeframe: 'daily' | 'weekly' | 'monthly' | 'custom';
    category: string;
    startDate: Date;
    endDate?: Date;
    milestones?: {
      value: number;
      label: string;
      reached: boolean;
    }[];
    relatedInsights?: string[];
    trendDirection?: 'up' | 'down' | 'neutral';
    trendPercentage?: number;
    metricId: string; // Make this required
  }[];
  insightHistory?: {
    id: string;
    title: string;
    description: string;
    category: string;
    timestamp: Date;
    priority: 'critical' | 'high' | 'medium' | 'low' | 'info';
    isValid: boolean;
    isHelpful?: boolean;
    feedback?: string;
    feedbackTimestamp?: Date;
    improvementScore?: number;
    wasActionTaken?: boolean;
    actionTaken?: string;
    actionTimestamp?: Date;
  }[];
}

// Add a function to determine the current time of day
function getCurrentTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

const Insights = () => {
  const navigate = useNavigate();
  const lastReading = getLastReading();
  const [selectedMetric, setSelectedMetric] = useState<ReadingType>('heartRate');
  const { healthPatterns } = useAssessment();
  const { generateAdvancedInsights } = useML();
  const [insights, setInsights] = useState<MLInsights | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const { colorMode } = useTheme();
  
  // Progressive loading states for different sections
  const [loadingStates, setLoadingStates] = useState({
    readinessScore: true,
    healthPlan: true,
    goalProgress: true,
    insights: true,
    trends: true
  });
  
  // Staggered loading times for progressive appearance
  useEffect(() => {
    if (isLoadingInsights) {
      // Start loading sequence
      const timers = [
        setTimeout(() => setLoadingStates(prev => ({ ...prev, readinessScore: false })), 300),
        setTimeout(() => setLoadingStates(prev => ({ ...prev, healthPlan: false })), 800),
        setTimeout(() => setLoadingStates(prev => ({ ...prev, goalProgress: false })), 1400),
        setTimeout(() => setLoadingStates(prev => ({ ...prev, insights: false })), 1800),
        setTimeout(() => setLoadingStates(prev => ({ ...prev, trends: false })), 2200)
      ];
      
      return () => {
        // Clean up timers
        timers.forEach(timer => clearTimeout(timer));
      };
    } else {
      // Reset loading states when data is loaded
      setLoadingStates({
        readinessScore: false,
        healthPlan: false,
        goalProgress: false,
        insights: false,
        trends: false
      });
    }
  }, [isLoadingInsights]);
  
  // State for advanced visualizations
  const [xMetric, setXMetric] = useState<CorrMetricType>('heartRate');
  const [yMetric, setYMetric] = useState<CorrMetricType>('readiness');
  const [heatMapMetric, setHeatMapMetric] = useState<HeatMapMetricType>('recovery');
  const [compareMetric, setCompareMetric] = useState<CompMetricType>('heartRate');
  const [timeRange, setTimeRange] = useState<TimeRangeType>('week');
  
  // Enhancement 1: Collapsible sections that remember user preferences
  const [sectionStates, setSectionStates] = useLocalStorage<Record<string, boolean>>('insight_section_states', {
    'healthPlan': true,
    'goalProgress': true,
    'personalizedInsights': true,
    'healthTrends': true
  });

  // Toggle section state and save to localStorage
  const toggleSection = (sectionId: string) => {
    setSectionStates(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };
  
  // Phase 4: Add state for insight tracking
  const [selectedInsightId, setSelectedInsightId] = useState<string | null>(null);
  const [insightHistory, setInsightHistory] = useState<HistoricalInsight[]>([]);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<string, boolean>>({});
  
  // Activity classification state
  const [activityModelInitialized, setActivityModelInitialized] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<ActivityClassification | null>(null);
  const [activityHistory, setActivityHistory] = useState<ActivityClassification[]>([]);
  const [isClassifying, setIsClassifying] = useState(false);
  
  // New state for user preferences
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    categories: {
      sleep: { enabled: true, priority: 5 },
      activity: { enabled: true, priority: 4 },
      nutrition: { enabled: true, priority: 3 },
      stress: { enabled: true, priority: 5 },
      heart: { enabled: true, priority: 5 },
      energy: { enabled: true, priority: 4 },
      goals: { enabled: true, priority: 3 },
      health: { enabled: true, priority: 4 }
    },
    display: {
      detailLevel: 'moderate',
      layout: 'cards',
      showContextual: true,
      darkMode: false,
      compactView: false,
      autoHideTimeIrrelevant: true,
      priorityThreshold: 'all'
    },
    notifications: {
      enabled: true,
      criticalOnly: false,
      timeRanges: ['morning', 'afternoon', 'evening'],
      doNotDisturb: false
    },
    timeContext: {
      useAutomaticTimeContext: true,
      manualTimeOfDay: 'morning',
      showTimeRelevantContentFirst: true
    }
  });
  
  // Current time of day - either from system time or user preference
  const [currentTimeOfDay, setCurrentTimeOfDay] = useState<TimeOfDay>(getCurrentTimeOfDay());
  
  // Update time of day periodically
  useEffect(() => {
    if (userPreferences.timeContext.useAutomaticTimeContext) {
      setCurrentTimeOfDay(getCurrentTimeOfDay());
      
      // Update every hour
      const intervalId = setInterval(() => {
        setCurrentTimeOfDay(getCurrentTimeOfDay());
      }, 60 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    } else {
      setCurrentTimeOfDay(userPreferences.timeContext.manualTimeOfDay);
    }
  }, [userPreferences.timeContext.useAutomaticTimeContext, userPreferences.timeContext.manualTimeOfDay]);
  
  // Handle user preference changes
  const handlePreferencesChange = (newPreferences: UserPreferences) => {
    setUserPreferences(newPreferences);
    
    // Apply dark mode if selected
    if (newPreferences.display.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  // Handle saving preferences
  const handleSavePreferences = () => {
    console.log('Preferences saved:', userPreferences);
    // In a real app, we'd save these to localStorage or a backend
  };
  
  // Filter insights based on user preferences
  const getFilteredInsights = useCallback(() => {
    if (!insights?.insights) return [];
    
    // Filter by category and priority
    return insights.insights
      .filter(insight => {
        // Skip disabled categories
        const category = insight.category.toLowerCase() as InsightCategory;
        if (userPreferences.categories[category] && !userPreferences.categories[category].enabled) {
          return false;
        }
        
        // Filter by priority threshold
        if (userPreferences.display.priorityThreshold === 'critical-only' && insight.priority !== 'critical') {
          return false;
        }
        if (userPreferences.display.priorityThreshold === 'high-up' && 
            insight.priority !== 'critical' && insight.priority !== 'high') {
          return false;
        }
        if (userPreferences.display.priorityThreshold === 'medium-up' && 
            (insight.priority === 'low' || insight.priority === 'info')) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        // First sort by time relevance if enabled
        if (userPreferences.timeContext.showTimeRelevantContentFirst) {
          const aTimeRelevant = a.timeRelevance?.includes(currentTimeOfDay) || a.timeRelevance?.includes('all-day');
          const bTimeRelevant = b.timeRelevance?.includes(currentTimeOfDay) || b.timeRelevance?.includes('all-day');
          
          if (aTimeRelevant && !bTimeRelevant) return -1;
          if (!aTimeRelevant && bTimeRelevant) return 1;
        }
        
        // Then sort by priority
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
        const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder];
        const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder];
        
        if (aPriority !== bPriority) {
          return aPriority - bPriority;
        }
        
        // Finally sort by category priority from user preferences
        const aCategory = a.category.toLowerCase() as InsightCategory;
        const bCategory = b.category.toLowerCase() as InsightCategory;
        
        const aCategoryPriority = userPreferences.categories[aCategory]?.priority || 0;
        const bCategoryPriority = userPreferences.categories[bCategory]?.priority || 0;
        
        return bCategoryPriority - aCategoryPriority;
      });
  }, [insights, userPreferences, currentTimeOfDay]);
  
  // Initialize the activity classifier
  useEffect(() => {
    let mounted = true;
    
    const initActivityClassifier = async () => {
      try {
        if (!activityModelInitialized && mounted) {
          console.log('Initializing activity classifier...');
          
          // Add delay to ensure client-side only execution and prevent hydration issues
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const success = await activityClassifier.initialize();
          if (mounted) {
            setActivityModelInitialized(success);
            
            if (success) {
              console.log('Activity classifier initialized successfully');
              
              // Only generate a sample classification after initialization with delay
              setTimeout(() => {
                if (mounted) {
                  classifyCurrentActivity();
                }
              }, 1000); // Larger delay to prevent race conditions
            }
          }
        }
      } catch (error) {
        console.error("Error initializing activity classifier:", error);
      }
    };
    
    // Delay initialization to prevent hydration issues
    const timer = setTimeout(() => {
      initActivityClassifier();
    }, 500);
    
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);
  
  // Function to generate mock accelerometer data (for demo purposes)
  const generateMockAccData = useCallback((): AccelerometerData[] => {
    const data: AccelerometerData[] = [];
    const now = Date.now();
    
    // Generate 3 random data points
    for (let i = 0; i < 3; i++) {
      const activityType = Math.floor(Math.random() * 4) as ActivityType;
      let x, y, z;
      
      switch (activityType) {
        case ActivityType.STATIONARY:
          x = Math.random() * 0.3 - 0.15;
          y = Math.random() * 0.3 - 0.15;
          z = 9.8 + (Math.random() * 0.3 - 0.15);
          break;
        case ActivityType.WALKING:
          x = Math.sin(i) * 2 + (Math.random() * 0.5 - 0.25);
          y = Math.cos(i) * 2 + (Math.random() * 0.5 - 0.25);
          z = 9.8 + Math.sin(i) * 1.5;
          break;
        case ActivityType.RUNNING:
          x = Math.sin(i * 2) * 4 + (Math.random() * 1 - 0.5);
          y = Math.cos(i * 2) * 4 + (Math.random() * 1 - 0.5);
          z = 9.8 + Math.sin(i * 2) * 3;
          break;
        case ActivityType.CYCLING:
          x = Math.sin(i * 1.5) * 3 + (Math.random() * 0.7 - 0.35);
          y = Math.cos(i * 1.5) * 1 + (Math.random() * 0.7 - 0.35);
          z = 9.8 + Math.sin(i * 0.5) * 0.7;
          break;
        default:
          x = Math.random() * 2 - 1;
          y = Math.random() * 2 - 1;
          z = 9.8 + (Math.random() * 2 - 1);
          break;
      }
      
      data.push({
        x,
        y,
        z,
        timestamp: now + (i * 100) // 100ms intervals
      });
    }
    
    return data;
  }, []);
  
  // Function to classify current activity using mock accelerometer data
  const classifyCurrentActivity = useCallback(async () => {
    if (!activityModelInitialized) {
      console.log('Activity classifier not initialized');
      return;
    }
    
    setIsClassifying(true);
    try {
      console.log('Generating mock data for classification');
      const mockData = generateMockAccData();
      const result = await activityClassifier.classifyActivity(mockData);
      
      if (result) {
        console.log('Classification result:', result);
        setCurrentActivity(result);
        setActivityHistory(prev => {
          // Keep only the last 5 classifications
          const updatedHistory = [result, ...prev].slice(0, 5);
          return updatedHistory;
        });
      }
    } catch (error) {
      console.error("Error classifying activity:", error);
    } finally {
      setIsClassifying(false);
    }
  }, [activityModelInitialized, generateMockAccData]);
  
  // Handle correlation metrics change
  const handleCorrelationMetricsChange = (x: CorrMetricType, y: CorrMetricType) => {
    setXMetric(x);
    setYMetric(y);
  };
  
  // Handle insight feedback
  const handleInsightFeedback = (id: string, isHelpful: boolean, comment?: string) => {
    // In a real app, this would send feedback to the server
    console.log(`Feedback for insight ${id}: ${isHelpful ? 'Helpful' : 'Not Helpful'}`, comment);
    
    // Update the feedback status
    setFeedbackSubmitted(prev => ({ ...prev, [id]: true }));
    
    // Update insight history
    setInsightHistory(prevHistory => {
      return prevHistory.map(item => {
        if (item.id === id) {
          return {
            ...item,
            isHelpful,
            feedback: comment,
            feedbackTimestamp: new Date()
          };
        }
        return item;
      });
    });
  };
  
  // Handle action taken
  const handleActionTaken = (id: string, actionLabel: string) => {
    // In a real app, this would log the action and possibly trigger a workflow
    console.log(`Action taken for insight ${id}: ${actionLabel}`);
    
    // Update insight history
    setInsightHistory(prevHistory => {
      return prevHistory.map(item => {
        if (item.id === id) {
          return {
            ...item,
            wasActionTaken: true,
            actionTaken: actionLabel,
            actionTimestamp: new Date()
          };
        }
        return item;
      });
    });
  };
  
  // Handle viewing insight details
  const handleViewInsightDetails = (id: string) => {
    setSelectedInsightId(id);
  };
  
  // Handle viewing goal details
  const handleViewGoalDetails = (id: string) => {
    // In a real app, this would navigate to a detailed goal page or open a modal
    console.log(`Viewing goal details: ${id}`);
  };
  
  // Handle clicking on a related insight
  const handleRelatedInsightClick = (id: string) => {
    setSelectedInsightId(id);
  };
  
  // Handle saving updated goals
  const handleSaveGoals = (updatedGoals: GoalMetric[]) => {
    // In a real app, this would send the updated goals to the server
    console.log('Saving updated goals:', updatedGoals);
    
    // Update the insights state with the new goals
    if (insights) {
      setInsights({
        ...insights,
        goals: updatedGoals
      });
    }
  };
  
  // Function to update goal values based on their metrics
  const updateGoalValues = useCallback(() => {
    if (!insights?.goals || insights.goals.length === 0) return;

    // Get latest readings
    const lastReading = getLastReading();
    if (!lastReading) return;

    const updatedGoals = insights.goals.map(goal => {
      if (!goal.metricId) return goal;

      let newCurrentValue = goal.currentValue;

      // Update based on metricId
      switch (goal.metricId) {
        case 'steps':
          if (lastReading.steps) {
            newCurrentValue = lastReading.steps;
          }
          break;
        case 'resting_heart_rate':
          if (lastReading.heartRate) {
            newCurrentValue = lastReading.heartRate;
          }
          break;
        case 'spo2':
          if (lastReading.spo2) {
            newCurrentValue = lastReading.spo2;
          }
          break;
        case 'body_temperature':
          if (lastReading.temp) {
            // Convert from tenths of Celsius to Fahrenheit
            const tempC = lastReading.temp / 10;
            newCurrentValue = (tempC * 9/5) + 32; // Convert to Fahrenheit
          }
          break;
        case 'readiness_score':
          if (lastReading.readiness) {
            newCurrentValue = lastReading.readiness;
          }
          break;
        case 'calories':
          if (lastReading.calories) {
            newCurrentValue = lastReading.calories;
          }
          break;
      }

      // Only update if there's a change
      if (newCurrentValue !== goal.currentValue) {
        return {
          ...goal,
          currentValue: newCurrentValue
        };
      }
      
      return goal;
    });

    // Only update if there's a change
    if (JSON.stringify(updatedGoals) !== JSON.stringify(insights.goals)) {
      setInsights({
        ...insights,
        goals: updatedGoals
      });
    }
  }, [insights]);

  // Update goals whenever there's a new reading
  useEffect(() => {
    // Initial update
    updateGoalValues();
    
    // Set up an interval to periodically update values
    const intervalId = setInterval(updateGoalValues, 60000); // Update every minute
    
    return () => clearInterval(intervalId);
  }, [updateGoalValues]);
  
  // Fetch insights for demo purposes
  React.useEffect(() => {
    const loadInsights = async () => {
      setIsLoadingInsights(true);
      
      try {
        // Get current activity data before creating insights
        const currentActivityData = currentActivity;
        const activityHistoryData = [...activityHistory];
        
        // Mock data for demonstration
        const mockInsights = {
          sleep: {
            score: 85,
            message: "Your sleep patterns have been analyzed from your assessments.",
            recommendation: "Based on your self-reported sleep data, try to maintain consistent sleep habits.",
            priority: 'medium' as InsightPriority,
            sources: ['Self-Report', 'Daily Assessment'],
            context: "Your self-reported sleep data shows moderate consistency. Consider creating a regular sleep schedule.",
            actions: [
              {
                label: "Sleep Schedule",
                description: "Set a regular sleep schedule to improve sleep quality",
                timeframe: 'today' as const,
                impact: 'high' as const
              },
              {
                label: "Bedtime routine",
                description: "Create a calming bedtime routine to signal your body it's time to sleep",
                timeframe: 'week' as const,
                impact: 'medium' as const
              }
            ],
            relatedInsights: ['Evening Activity']
          },
          activity: {
            score: 70,
            message: "Your activity levels have been analyzed.",
            recommendation: "Try to stay active throughout the day.",
            priority: 'low' as InsightPriority,
            sources: ['Activity Tracker', 'Step Counter', 'ML Activity Classification'],
            context: "You've maintained a decent activity level averaging 7,500 steps per day, which is close to the recommended 10,000 steps.",
            actions: [
              {
                label: "Daily Walk",
                description: "Add a 20-minute walk to your daily routine",
                timeframe: 'today' as const,
                impact: 'medium' as const
              }
            ],
            relatedInsights: ['Cardio Fitness', 'Recovery Speed']
          },
          stress: {
            score: 65,
            message: "Your stress levels have been analyzed.",
            recommendation: "Practice regular stress management techniques.",
            priority: 'high' as InsightPriority,
            sources: ['HRV Reading', 'Manual Assessment'],
            context: "Your stress levels show some elevation during weekdays, particularly in the afternoon hours. This pattern correlates with your work schedule.",
            actions: [
              {
                label: "Breathing Exercise",
                description: "Practice 5-minute deep breathing exercises twice daily",
                timeframe: 'now' as const,
                impact: 'high' as const,
                url: "https://www.youtube.com/watch?v=acUZdGd_3Gk"
              }
            ],
            relatedInsights: ['Sleep Quality', 'Recovery Trend']
          },
          nutrition: {
            score: 75,
            message: "Your nutrition patterns have been analyzed.",
            recommendation: "Focus on a balanced diet with plenty of vegetables.",
            priority: 'info' as InsightPriority,
            sources: ['Meal Logging', 'Nutritional Assessment'],
            context: "Your nutrition log shows good protein intake but could benefit from increased vegetable consumption and more consistent meal timing.",
            actions: [
              {
                label: "Meal Planning",
                description: "Schedule and plan your meals for the week ahead",
                timeframe: 'week' as const,
                impact: 'high' as const
              }
            ]
          },
          healthTrends: {
            heart: {
              status: 'stable' as const,
              message: "Your heart metrics are within normal range.",
              priority: 'info' as InsightPriority,
              sources: ['ECG', 'Wearable'],
              context: "Your resting heart rate has stayed between 58-65 bpm which is considered healthy. Your HRV shows normal daily fluctuations."
            },
            energy: {
              status: 'improving' as const,
              message: "Your energy levels are trending upward.",
              priority: 'low' as InsightPriority,
              sources: ['Self-Report', 'Activity Patterns'],
              context: "Your reported energy levels and activity patterns show a gradual improvement over the past 3 weeks, correlating with improved sleep quality."
            },
            sleep: {
              status: 'stable' as const,
              message: "Your self-reported sleep data shows consistent patterns.",
              priority: 'medium' as InsightPriority,
              sources: ['Self-Report', 'Daily Assessment'],
              context: "Based on your daily assessments, your sleep patterns have remained consistent."
            },
            // Add activity recognition trend data with activity classification
            activityRecognition: currentActivityData ? {
              status: 'stable' as const,
              message: `Your most common activity is ${activityClassifier.getActivityName(currentActivityData.activityType)}`,
              priority: 'info' as InsightPriority,
              sources: ['ML Activity Classification'],
              context: "Our ML model has detected your activity patterns to provide more personalized insights.",
              classification: currentActivityData,
              recentActivities: activityHistoryData
            } : undefined
          },
          dailyRecommendation: "Focus on improving sleep quality by limiting screen time before bed.",
          
          // Phase 4: Add advanced insights
          insights: [
            {
              id: 'insight-001',
              title: 'Stress and Activity Connection',
              description: 'High stress days show reduced activity levels.',
              category: 'Activity',
              priority: 'high' as InsightPriority,
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
              sources: [
                {
                  name: 'Activity Tracking',
                  type: 'wearable',
                  lastUpdated: new Date(),
                  confidence: 0.89
                },
                {
                  name: 'HRV Analysis',
                  type: 'calculated',
                  lastUpdated: new Date(),
                  confidence: 0.92
                }
              ],
              context: "After analyzing your activity and stress metrics over the last 30 days, we've detected a correlation. On days when your stress score is above 75, your activity level is typically 30% lower than your baseline.",
              actions: [
                {
                  label: "Activity Reminder",
                  description: "Set activity reminders for high-stress days to maintain movement",
                  timeframe: 'today' as const,
                  impact: 'high' as const
                },
                {
                  label: "Stress Journal",
                  description: "Track your stress triggers and resolution strategies",
                  timeframe: 'week' as const,
                  impact: 'medium' as const
                }
              ],
              relatedInsights: ['Recovery Patterns']
            },
            // Add ML-powered activity insight if we have activity classification data
            ...(currentActivityData ? [{
              id: 'insight-activity-ml',
              title: 'Activity Pattern Detected',
              description: `Your movement patterns indicate ${activityClassifier.getActivityName(currentActivityData.activityType)} activity.`,
              category: 'Activity',
              priority: 'info' as InsightPriority,
              timestamp: new Date(),
              sources: [
                {
                  name: 'Activity Classification',
                  type: 'calculated',
                  lastUpdated: new Date(),
                  confidence: currentActivityData.confidence
                }
              ],
              context: `Our on-device machine learning model has analyzed your movement patterns and classified your activity as ${activityClassifier.getActivityName(currentActivityData.activityType)} with ${Math.round(currentActivityData.confidence * 100)}% confidence.`,
              actions: [
                {
                  label: "Track Activities",
                  description: "Log your activities to help improve the ML model accuracy",
                  timeframe: 'today' as const,
                  impact: 'medium' as const
                }
              ]
            }] : []),
            {
              id: 'insight-002',
              title: 'Optimal Recovery Window',
              description: 'Your body shows the best recovery between 10 PM and 2 AM.',
              category: 'Recovery',
              priority: 'medium' as InsightPriority,
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
              sources: [
                {
                  name: 'Sleep Stages',
                  type: 'wearable',
                  lastUpdated: new Date(),
                  confidence: 0.85
                }
              ],
              context: "Analysis of your sleep patterns shows that your body enters its deepest and most restorative sleep phases between 10 PM and 2 AM. This is when your HRV peaks and body temperature drops optimally.",
              actions: [
                {
                  label: "Sleep Schedule",
                  description: "Adjust your sleep schedule to ensure you're asleep during your optimal recovery window",
                  timeframe: 'today' as const,
                  impact: 'high' as const
                }
              ]
            },
            {
              id: 'insight-003',
              title: 'Hydration Impact',
              description: 'Water intake correlates with improved recovery metrics.',
              category: 'Nutrition',
              priority: 'critical' as InsightPriority,
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1), // 1 day ago
              sources: [
                {
                  name: 'Self-Reported Data',
                  type: 'manual',
                  lastUpdated: new Date(),
                  confidence: 0.78
                },
                {
                  name: 'Recovery Metrics',
                  type: 'wearable',
                  lastUpdated: new Date(),
                  confidence: 0.91
                }
              ],
              context: "When you report higher water intake, your recovery metrics improve by approximately 15%. Proper hydration appears to have a significant effect on your overall health.",
              actions: [
                {
                  label: "Hydration Schedule",
                  description: "Set reminders to drink water throughout the day",
                  timeframe: 'now' as const,
                  impact: 'high' as const
                },
                {
                  label: "Track Water Intake",
                  description: "Log your daily water consumption in the app",
                  timeframe: 'week' as const,
                  impact: 'medium' as const
                }
              ],
              relatedInsights: ['Recovery Speed']
            }
          ],
          
          // Phase 4: Add goals
          goals: [
            {
              id: 'goal-001',
              name: 'Increase Daily Steps',
              currentValue: 7500,
              targetValue: 10000,
              startValue: 5000,
              unit: 'steps',
              timeframe: 'daily' as const,
              category: 'Activity',
              startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30), // 30 days ago
              endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days from now
              metricId: 'steps',
              milestones: [
                {
                  value: 6000,
                  label: 'Regular Activity',
                  reached: true
                },
                {
                  value: 8000,
                  label: 'Active Lifestyle',
                  reached: false
                },
                {
                  value: 10000,
                  label: 'Optimal Activity',
                  reached: false
                }
              ],
              relatedInsights: ['Cardio Fitness', 'Energy Levels'],
              trendDirection: 'up',
              trendPercentage: 12.5
            },
            {
              id: 'goal-002',
              name: 'Reduce Resting Heart Rate',
              currentValue: 68,
              targetValue: 60,
              startValue: 72,
              unit: 'bpm',
              timeframe: 'monthly' as const,
              category: 'Heart Health',
              startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45), // 45 days ago
              endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 45), // 45 days from now
              metricId: 'resting_heart_rate',
              milestones: [
                {
                  value: 70,
                  label: 'Good',
                  reached: true
                },
                {
                  value: 65,
                  label: 'Very Good',
                  reached: false
                },
                {
                  value: 60,
                  label: 'Excellent',
                  reached: false
                }
              ],
              relatedInsights: ['Cardio Fitness', 'Recovery Patterns'],
              trendDirection: 'down',
              trendPercentage: 5.6
            },
            {
              id: 'goal-003',
              name: 'Improve Blood Oxygen',
              currentValue: 96,
              targetValue: 98,
              startValue: 95,
              unit: '%',
              timeframe: 'weekly' as const,
              category: 'Respiratory Health',
              startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
              endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14), // 14 days from now
              metricId: 'spo2',
              milestones: [
                {
                  value: 96,
                  label: 'Good',
                  reached: true
                },
                {
                  value: 97,
                  label: 'Very Good',
                  reached: false
                },
                {
                  value: 98,
                  label: 'Excellent',
                  reached: false
                }
              ],
              relatedInsights: ['Respiratory Health', 'Energy Levels'],
              trendDirection: 'up',
              trendPercentage: 1.2
            }
          ],
          
          // Phase 4: Add insight history
          insightHistory: [
            {
              id: 'hist-resp',
              title: 'Respiratory Health',
              description: 'Your blood oxygen levels are consistently in the optimal range.',
              category: 'Health',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
              priority: 'medium' as InsightPriority,
              isValid: true
            },
            {
              id: 'hist-rec',
              title: 'Recovery Patterns',
              description: 'Your recovery is most effective following light activity days.',
              category: 'Recovery',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11),
              priority: 'medium' as InsightPriority,
              isValid: true,
              wasActionTaken: true
            },
            {
              id: 'hist-hydra',
              title: 'Hydration and Energy',
              description: 'Your energy levels drop on days with lower water intake.',
              category: 'Nutrition',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8),
              priority: 'medium' as InsightPriority,
              isValid: true,
              isHelpful: false,
              feedbackTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)
            },
            {
              id: 'hist-act',
              title: 'Activity Timing Impact',
              description: 'Morning activity correlates with higher daily energy levels.',
              category: 'Activity',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4),
              priority: 'high' as InsightPriority,
              isValid: true,
              isHelpful: true,
              wasActionTaken: true,
              actionTaken: 'Action Taken',
              improvementScore: 22,
              feedbackTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3)
            },
            {
              id: 'hist-card',
              title: 'Cardio Fitness Improvement',
              description: 'Your cardiovascular fitness is improving based on recovery rate.',
              category: 'Fitness',
              timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28),
              priority: 'medium' as InsightPriority,
              isValid: true,
              isHelpful: true,
              wasActionTaken: true,
              actionTaken: 'Action Taken',
              improvementScore: 15,
              feedbackTimestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 27)
            }
          ]
        };
        
        setInsights(mockInsights as MLInsights);
        
        // Initialize insight history from the mock data
        if (mockInsights.insightHistory) {
          setInsightHistory(mockInsights.insightHistory);
        }
      } catch (error) {
        console.error("Error loading insights:", error);
      } finally {
        setIsLoadingInsights(false);
      }
    };
    
    if (activityModelInitialized) {
      loadInsights();
    }
  }, [activityModelInitialized, currentActivity ? currentActivity.activityType : null]);
  
  // Load insights when activity changes
  React.useEffect(() => {
    // Only update insights if activity model is initialized and we have activity data
    if (activityModelInitialized && currentActivity) {
      setInsights(prev => {
        if (!prev) return prev;
        
        // Create new insights object with updated activity recognition
        return {
          ...prev,
          healthTrends: {
            ...prev.healthTrends,
            activityRecognition: {
              status: 'stable' as const,
              message: `Your most common activity is ${activityClassifier.getActivityName(currentActivity.activityType)}`,
              priority: 'info' as InsightPriority,
              sources: ['ML Activity Classification'],
              context: "Our ML model has detected your activity patterns to provide more personalized insights.",
              classification: currentActivity,
              recentActivities: activityHistory
            }
          }
        };
      });
    }
  }, [activityModelInitialized, currentActivity, activityHistory]);
  
  // Sample data for correlation plot
  const correlationData: DataPoint[] = [
    { id: '1', date: '2023-10-01', xValue: 85, yValue: 65, weight: 40 },
    { id: '2', date: '2023-10-02', xValue: 75, yValue: 72, weight: 35 },
    { id: '3', date: '2023-10-03', xValue: 90, yValue: 58, weight: 45 },
    { id: '4', date: '2023-10-04', xValue: 65, yValue: 80, weight: 30, anomaly: true },
    { id: '5', date: '2023-10-05', xValue: 88, yValue: 62, weight: 50 },
    { id: '6', date: '2023-10-06', xValue: 92, yValue: 60, weight: 55 },
    { id: '7', date: '2023-10-07', xValue: 78, yValue: 68, weight: 40 },
    { id: '8', date: '2023-10-08', xValue: 82, yValue: 64, weight: 45 },
    { id: '9', date: '2023-10-09', xValue: 70, yValue: 75, weight: 35, anomaly: true },
    { id: '10', date: '2023-10-10', xValue: 86, yValue: 63, weight: 50 },
    { id: '11', date: '2023-10-11', xValue: 80, yValue: 67, weight: 45 },
    { id: '12', date: '2023-10-12', xValue: 77, yValue: 70, weight: 40 },
    { id: '13', date: '2023-10-13', xValue: 95, yValue: 56, weight: 60 },
    { id: '14', date: '2023-10-14', xValue: 72, yValue: 74, weight: 35 },
  ];
  
  // Sample data for heat map calendar
  const generateHeatMapData = (metric: HeatMapMetricType): DayData[] => {
    const data: DayData[] = [];
    const today = new Date();
    const baseValue = metric === 'heartRate' ? 60 : 
                   metric === 'sleepQuality' ? 75 : 
                   metric === 'recovery' ? 80 : 50;
    
    // Generate 30 days of data
    for (let i = 0; i < 30; i++) {
      const date = subDays(today, i);
      // Random value with some variance
      const variance = Math.random() * 20 - 10; // -10 to +10
      
      // Weekend effect (better sleep, recovery on weekends)
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendBoost = isWeekend && (metric === 'sleepQuality' || metric === 'recovery') ? 10 : 0;
      
      let value = Math.round(baseValue + variance + weekendBoost);
      // Ensure values are in reasonable ranges
      if (metric === 'heartRate') value = Math.max(50, Math.min(90, value));
      if (metric === 'sleepQuality' || metric === 'recovery') value = Math.max(40, Math.min(100, value));
      
      // Add annotations occasionally
      const shouldAddAnnotation = Math.random() > 0.85;
      const annotation = shouldAddAnnotation ? 
        metric === 'heartRate' ? 'Elevated after exercise' :
        metric === 'sleepQuality' ? 'Improved after meditation' :
        metric === 'recovery' ? 'Full recovery day' : undefined
        : undefined;
      
      data.push({
        date: date.toISOString(),
        value,
        percentile: Math.round(Math.random() * 100),
        annotation,
        highlight: shouldAddAnnotation
      });
    }
    
    return data;
  };
  
  // Generate sample data for comparative analysis
  const generateComparisonData = (metric: CompMetricType, range: TimeRangeType): ComparisonData => {
    const today = new Date();
    let currentStart, currentEnd, previousStart, previousEnd;
    
    // Determine date ranges based on selected time range
    switch (range) {
      case 'day':
        currentEnd = today;
        currentStart = today;
        previousStart = subDays(today, 1);
        previousEnd = subDays(today, 1);
        break;
      case 'week':
        currentEnd = today;
        currentStart = subDays(today, 6);
        previousStart = subDays(today, 13);
        previousEnd = subDays(today, 7);
        break;
      case 'month':
        currentEnd = today;
        currentStart = subDays(today, 29);
        previousStart = subDays(today, 59);
        previousEnd = subDays(today, 30);
        break;
      case 'year':
        currentEnd = today;
        currentStart = subMonths(today, 11);
        previousStart = subMonths(today, 23);
        previousEnd = subMonths(today, 12);
        break;
      default:
        currentEnd = today;
        currentStart = subDays(today, 6);
        previousStart = subDays(today, 13);
        previousEnd = subDays(today, 7);
    }
    
    // Generate base value and trend based on metric
    const baseCurrentValue = metric === 'heartRate' ? 65 : 
                          metric === 'sleepQuality' ? 85 : 
                          metric === 'recovery' ? 82 : 
                          metric === 'hrvScore' ? 68 : 75;
                          
    const randomVariance = (Math.random() * 10) - 5; // -5 to +5
    const currentValue = Math.round(baseCurrentValue + randomVariance);
    
    // Previous period value with some difference
    const changeMagnitude = Math.random() * 15 - 7.5; // -7.5 to +7.5
    const previousValue = Math.round(currentValue - changeMagnitude);
    
    // Calculate delta and determine status
    const delta = currentValue - previousValue;
    const deltaPercentage = (delta / previousValue) * 100;
    
    let status: 'positive' | 'negative' | 'neutral';
    
    // Different metrics have different interpretations of positive/negative
    if (metric === 'heartRate') {
      // For heart rate, lower is generally better (resting)
      status = delta < 0 ? 'positive' : delta > 0 ? 'negative' : 'neutral';
    } else {
      // For sleep quality, recovery, hrv, etc. higher is better
      status = delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral';
    }
    
    // Generate daily data for the chart
    const generateDailyData = (start: Date, end: Date, baseValue: number) => {
      const data = [];
      const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      for (let i = 0; i < days; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        
        const dayVariance = Math.random() * 20 - 10; // -10 to +10
        const value = Math.round(baseValue + dayVariance);
        
        data.push({
          date: date.toISOString(),
          value
        });
      }
      
      return data;
    };
    
    return {
      metrics: {
        [metric]: {
          current: {
            value: currentValue,
            label: `Current ${timeRangeLabels[range]}`,
            details: {
              'Average': currentValue,
              'Peak': Math.round(currentValue * 1.2),
              'Low': Math.round(currentValue * 0.8),
              'Variance': Math.round(Math.random() * 10)
            }
          },
          previous: {
            value: previousValue,
            label: `Previous ${timeRangeLabels[range]}`,
            details: {
              'Average': previousValue,
              'Peak': Math.round(previousValue * 1.2),
              'Low': Math.round(previousValue * 0.8),
              'Variance': Math.round(Math.random() * 10)
            }
          },
          delta,
          deltaPercentage,
          trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
          status,
          significance: Math.random() * 0.1 // 0-0.1, so sometimes significant (<0.05)
        }
      },
      timeRanges: {
        current: {
          start: currentStart.toISOString(),
          end: currentEnd.toISOString()
        },
        previous: {
          start: previousStart.toISOString(),
          end: previousEnd.toISOString()
        }
      },
      dailyData: {
        current: generateDailyData(currentStart, currentEnd, currentValue),
        previous: generateDailyData(previousStart, previousEnd, previousValue)
      }
    };
  };
  
  // Animation variants for sections
  const sectionVariants = {
    open: { 
      height: 'auto', 
      opacity: 1,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.25, delay: 0.05 }
      }
    },
    closed: { 
      height: 0, 
      opacity: 0,
      transition: {
        height: { duration: 0.3 },
        opacity: { duration: 0.2 }
      }
    }
  };
  
  // Animation variants for cards and elements
  const cardVariants = {
    hover: { 
      y: -5, 
      boxShadow: colorMode === 'dark' || colorMode === 'night' 
        ? "0 10px 15px rgba(0, 0, 0, 0.3)" 
        : "0 10px 20px rgba(0, 0, 0, 0.1)",
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    },
    initial: {
      opacity: 0,
      y: 20
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };
  
  // Entry animation sequence variants for staggered loading
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };
  
  // Get theme-aware colors for charts and UI elements
  const getThemeColor = (lightColor: string, darkColor: string) => {
    return colorMode === 'dark' || colorMode === 'night' ? darkColor : lightColor;
  };
  
  // Add a function to navigate to the forecast page
  const navigateToForecast = () => {
    navigate('/advanced-insights', { state: { initialTab: 'forecast' } });
  };
  
  // State for collapsible health plan
  const [healthPlanExpanded, setHealthPlanExpanded] = useState(false);
  
  // State for goal customization modal
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  const { completedAssessments, getAssessmentForDate, getReadinessHistory } = useAssessment();

  // Get today's and recent assessment data
  const today = new Date();
  const todayAssessment = getAssessmentForDate(today);
  const recentAssessments = completedAssessments.slice(-7).reverse();
  const readinessHistory = getReadinessHistory(7);
  const currentReadiness = readinessHistory.length > 0 ? readinessHistory[readinessHistory.length - 1].score : null;
  const previousReadiness = readinessHistory.length > 1 ? readinessHistory[readinessHistory.length - 2].score : null;

  // Generate robust summaries
  const readinessInsights = generateReadinessInsights(recentAssessments, currentReadiness ?? 0, previousReadiness ?? undefined);
  const weeklySummary = generateWeeklyWellnessSummary(recentAssessments);

  // Compose sleep insight disclaimer
  const sleepDisclaimer = "Sleep insights are based on your daily self-assessment, as this device is not worn during sleep.";
  
  return (
    <div className={cn("min-h-screen pb-24", 
      colorMode === 'dark' || colorMode === 'night' 
        ? "bg-gray-900 text-white" 
        : "bg-gray-50 text-gray-900"
    )}>
      <StatusBar />
      
      <div className="container px-4 sm:p-4 mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className={cn("hover:text-blue-600", 
              colorMode === 'dark' || colorMode === 'night' 
                ? "text-gray-300" 
                : "text-gray-600"
            )}
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className={cn("text-2xl font-bold", 
            colorMode === 'dark' || colorMode === 'night' 
              ? "text-white" 
              : "text-gray-900"
          )}>Health Insights</h1>
          
          {/* Dark mode toggle button removed - now uses global appearance settings */}
        </div>
        
        {isLoadingInsights ? (
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Readiness Score with Enhanced Tooltip - Progressive Loading */}
            <motion.section 
              className="mb-4" 
              variants={itemVariants}
              initial={loadingStates.readinessScore ? "hidden" : "visible"}
              animate="visible"
            >
              <ReadinessScore 
                value={lastReading?.readiness || 75} 
                showLabel={true} 
                dailySummary={readinessInsights.summary + ' ' + sleepDisclaimer}
                weeklySummary={weeklySummary + ' ' + sleepDisclaimer}
              />
            </motion.section>
            
            {/* Enhanced Personalized Health Plan - Collapsible Section */}
            <motion.section 
              className="mb-8"
              variants={itemVariants}
              initial={loadingStates.healthPlan ? "hidden" : "visible"}
              animate="visible"
            >
              <Card className={cn(
                "overflow-hidden transition-colors", 
                colorMode === 'dark' || colorMode === 'night' 
                  ? "bg-gray-800 border-gray-700" 
                  : "bg-white"
              )}>
                <div className="p-5">
                  <div className="flex flex-wrap gap-2 sm:gap-0 sm:flex-nowrap items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mr-3",
                        colorMode === 'dark' || colorMode === 'night' 
                          ? "bg-indigo-900" 
                          : "bg-indigo-100"
                      )}>
                        <Award className={colorMode === 'dark' || colorMode === 'night' ? "text-indigo-300" : "text-indigo-600"} size={20} />
          </div>
                      <h2 className={cn("text-lg font-semibold", 
                        colorMode === 'dark' || colorMode === 'night' 
                          ? "text-white" 
                          : "text-gray-900"
                      )}>Personalized Health Plan</h2>
                    </div>
                    
                    {/* Enhancement 1: Collapsible with memory */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn("text-sm w-full sm:w-auto", 
                        colorMode === 'dark' || colorMode === 'night' 
                          ? "text-gray-300 hover:text-white hover:bg-gray-700" 
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                      onClick={() => toggleSection('healthPlan')}
                    >
                      {sectionStates.healthPlan ? "See less" : "See more"}
                    </Button>
                  </div>
                  
                  {/* Preview Section - Always visible */}
                  <div className={cn("p-4 rounded-lg mb-4", 
                    colorMode === 'dark' || colorMode === 'night' 
                      ? "bg-indigo-900/30" 
                      : "bg-indigo-50"
                  )}>
                    <div className="flex items-center mb-2">
                      <Clock className={colorMode === 'dark' || colorMode === 'night' ? "text-indigo-300 mr-2" : "text-indigo-600 mr-2"} size={18} />
                      <h3 className={cn("font-medium", 
                        colorMode === 'dark' || colorMode === 'night' 
                          ? "text-white" 
                          : "text-gray-800"
                      )}>Today's Focus</h3>
                    </div>
                    <p className={cn("text-sm", 
                      colorMode === 'dark' || colorMode === 'night' 
                        ? "text-gray-300" 
                        : "text-gray-700"
                    )}>
                      {readinessInsights.recommendedActions[0]}
                    </p>
                  </div>
                  
                  {/* Expanded Content with Animation */}
                  <AnimatePresence>
                    {sectionStates.healthPlan && (
                      <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={sectionVariants}
                        className="overflow-hidden"
                      >
                        <p className={cn("text-sm leading-relaxed mb-5", 
                          colorMode === 'dark' || colorMode === 'night' 
                            ? "text-gray-400" 
                            : "text-gray-600"
                        )}>
                          {readinessInsights.factors.map(f => `${f.description}. `).join('')}
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Physical Wellbeing */}
                          <div className={cn("border rounded-lg p-4", 
                            colorMode === 'dark' || colorMode === 'night' 
                              ? "border-gray-700 bg-gray-800/50" 
                              : "border-gray-100"
                          )}>
                            <div className="flex items-center mb-2">
                              <Activity className={colorMode === 'dark' || colorMode === 'night' ? "text-emerald-400 mr-2" : "text-emerald-500 mr-2"} size={18} />
                              <h3 className={cn("font-medium", 
                                colorMode === 'dark' || colorMode === 'night' 
                                  ? "text-white" 
                                  : "text-gray-800"
                              )}>Physical Wellbeing</h3>
                            </div>
                            <p className={cn("text-sm", 
                              colorMode === 'dark' || colorMode === 'night' 
                                ? "text-gray-400" 
                                : "text-gray-600"
                            )}>
                              {insights?.activity?.recommendation || 'Maintain regular movement and log your activities for more personalized insights.'}
                            </p>
                          </div>
                          
                          {/* Mental Balance */}
                          <div className={cn("border rounded-lg p-4", 
                            colorMode === 'dark' || colorMode === 'night' 
                              ? "border-gray-700 bg-gray-800/50" 
                              : "border-gray-100"
                          )}>
                            <div className="flex items-center mb-2">
                              <Brain className={colorMode === 'dark' || colorMode === 'night' ? "text-purple-400 mr-2" : "text-purple-500 mr-2"} size={18} />
                              <h3 className={cn("font-medium", 
                                colorMode === 'dark' || colorMode === 'night' 
                                  ? "text-white" 
                                  : "text-gray-800"
                              )}>Mental Balance</h3>
                            </div>
                            <p className={cn("text-sm", 
                              colorMode === 'dark' || colorMode === 'night' 
                                ? "text-gray-400" 
                                : "text-gray-600"
                            )}>
                              {insights?.stress?.recommendation || 'Practice short breathing breaks and mindfulness to manage stress.'}
                            </p>
                          </div>
                          
                          {/* Nutrition & Hydration */}
                          <div className="border border-gray-100 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                              <div className="mr-2 text-blue-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v1"></path><path d="M4.93 10.93 4 11a2 2 0 1 0 0 4l.93.07"></path><path d="M19.07 10.93 20 11a2 2 0 1 1 0 4l-.93.07"></path><path d="M12 16a2 2 0 1 0 0 4a2 2 0 0 0 0-4z"></path><path d="M12 12a2 2 0 1 0 0 4a2 2 0 0 0 0-4z"></path><path d="M12 8a2 2 0 1 0 0 4a2 2 0 0 0 0-4z"></path><path d="M18 5a2 2 0 1 0 0 4a2 2 0 0 0 0-4z"></path><path d="M6 5a2 2 0 1 0 0 4a2 2 0 0 0 0-4z"></path></svg>
                              </div>
                              <h3 className="font-medium text-gray-800">Nutrition & Hydration</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                              {insights?.nutrition?.recommendation || 'Prioritize protein-rich foods and increase water intake.'}
                            </p>
                          </div>
                          
                          {/* Sleep Optimization */}
                          <div className="border border-gray-100 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                              <CloudSun className="text-blue-500 mr-2" size={18} />
                              <h3 className="font-medium text-gray-800">Sleep Optimization</h3>
                            </div>
                            <p className="text-sm text-gray-600">
                              {insights?.sleep?.recommendation || 'Focus on improving sleep quality by limiting screen time before bed.'} {sleepDisclaimer}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.section>
            
            {/* Goal Progress Section - Collapsible Section */}
            {insights?.goals && insights.goals.length > 0 && (
              <motion.section 
                className="mb-8"
                variants={itemVariants}
                initial={loadingStates.goalProgress ? "hidden" : "visible"}
                animate="visible"
              >
                <Card className={cn(
                  "overflow-hidden transition-colors", 
                  colorMode === 'dark' || colorMode === 'night' 
                    ? "bg-gray-800 border-gray-700" 
                    : "bg-white"
                )}>
                  <div className="p-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
                      <h2 className={cn("text-lg font-semibold", 
                        colorMode === 'dark' || colorMode === 'night' 
                          ? "text-white" 
                          : "text-gray-900"
                      )}>Goal Progress</h2>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className={cn("text-xs w-full sm:w-auto", 
                            colorMode === 'dark' || colorMode === 'night' 
                              ? "border-gray-700 text-gray-300 hover:bg-gray-700" 
                              : ""
                          )}
                          onClick={() => setShowGoalModal(true)}
                        >
                          Customize Goals
                        </Button>
                        
                        {/* Enhancement 1: Collapsible with memory */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={cn("text-xs", 
                            colorMode === 'dark' || colorMode === 'night' 
                              ? "text-gray-300 hover:text-white hover:bg-gray-700" 
                              : "text-gray-600 hover:bg-gray-100"
                          )}
                          onClick={() => toggleSection('goalProgress')}
                        >
                          {sectionStates.goalProgress ? "Hide" : "Show"}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Animated Collapsible Content */}
                    <AnimatePresence>
                      {sectionStates.goalProgress && (
                        <motion.div
                          initial="closed"
                          animate="open"
                          exit="closed"
                          variants={sectionVariants}
                          className="overflow-hidden"
                        >
                          <GoalVisualization 
                            goals={insights.goals}
                            onGoalClick={handleViewGoalDetails}
                            onInsightClick={handleRelatedInsightClick}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </Card>
              </motion.section>
            )}
            
            {/* Insights Section - Collapsible */}
            <motion.section 
              className="mb-8"
              variants={itemVariants}
              initial={loadingStates.insights ? "hidden" : "visible"}
              animate="visible"
            >
              <Card className={cn(
                "overflow-hidden transition-colors", 
                colorMode === 'dark' || colorMode === 'night' 
                  ? "bg-gray-800 border-gray-700" 
                  : "bg-white"
              )}>
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className={cn("text-lg font-semibold flex items-center gap-2", 
                      colorMode === 'dark' || colorMode === 'night' 
                        ? "text-white" 
                        : "text-gray-900"
                    )}>
                      Personalized Insights
                      
                      {/* Enhancement 2: What affects my score tooltip */}
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 rounded-full">
                              <HelpCircle className={cn("h-4 w-4", 
                                colorMode === 'dark' || colorMode === 'night' 
                                  ? "text-gray-400" 
                                  : "text-gray-500"
                              )} />
                              <span className="sr-only">What affects my score?</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent 
                            className={cn("max-w-sm p-4 space-y-2", 
                              colorMode === 'dark' || colorMode === 'night' 
                                ? "bg-gray-800 border-gray-700" 
                                : ""
                            )} 
                            side="right"
                          >
                            <h3 className="font-medium text-base">What affects my score?</h3>
                            <p className="text-sm">Your readiness score is calculated from several factors:</p>
                            <ul className="text-sm space-y-1 list-disc pl-4">
                              <li><span className="font-medium">Sleep quality:</span> Deep sleep duration and consistency</li>
                              <li><span className="font-medium">Recovery:</span> Heart rate variability and resting heart rate</li>
                              <li><span className="font-medium">Activity balance:</span> Daily activity levels and recovery periods</li>
                              <li><span className="font-medium">Stress levels:</span> Measured through HRV and reported stressors</li>
                            </ul>
                            <p className="text-sm">Focus on improving sleep consistency and stress management for the most significant impact.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </h2>
                    
                    {/* Enhancement 1: Collapsible with memory */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn("text-sm", 
                        colorMode === 'dark' || colorMode === 'night' 
                          ? "text-gray-300 hover:text-white hover:bg-gray-700" 
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                      onClick={() => toggleSection('personalizedInsights')}
                    >
                      {sectionStates.personalizedInsights ? "Hide" : "Show"}
                    </Button>
                  </div>
                  
                  {/* Animated Collapsible Content */}
                  <AnimatePresence>
                    {sectionStates.personalizedInsights && (
                      <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={sectionVariants}
                        className="overflow-hidden space-y-4"
                      >
                        {insights?.insights && insights.insights.length > 0 ? (
                          insights.insights
                            .sort((a, b) => {
                              // Sort by priority
                              const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
                              return priorityOrder[a.priority] - priorityOrder[b.priority];
                            })
                            .map(insight => (
                              <InsightCard
                                key={insight.id}
                                id={insight.id}
                                title={insight.title}
                                description={insight.description}
                                priority={insight.priority}
                                category={insight.category}
                                timestamp={insight.timestamp}
                                sources={insight.sources}
                                context={insight.context}
                                actions={insight.actions}
                                relatedInsights={insight.relatedInsights}
                                onFeedback={handleInsightFeedback}
                                onActionTaken={handleActionTaken}
                              />
                            ))
                        ) : (
                          <div className={cn("p-5 rounded-xl text-center py-8", 
                            colorMode === 'dark' || colorMode === 'night' 
                              ? "bg-gray-700" 
                              : "bg-white"
                          )}>
                            <p className={colorMode === 'dark' || colorMode === 'night' ? "text-gray-400" : "text-gray-600"}>No insights available yet. Keep tracking your health data.</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.section>
            
            {/* Weekly Trends Chart - Collapsible - Enhanced for Dark Mode */}
            <motion.section 
              className="mb-8"
              variants={itemVariants}
              initial={loadingStates.trends ? "hidden" : "visible"}
              animate="visible"
            >
              <Card className={cn(
                "overflow-hidden transition-colors", 
                colorMode === 'dark' || colorMode === 'night' 
                  ? "bg-gray-800 border-gray-700" 
                  : "bg-white"
              )}>
                <div className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className={cn("text-lg font-semibold", 
                      colorMode === 'dark' || colorMode === 'night' 
                        ? "text-white" 
                        : "text-gray-900"
                    )}>Health Trends</h2>
                    
                    {/* Enhancement 1: Collapsible with memory */}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={cn("text-sm", 
                        colorMode === 'dark' || colorMode === 'night' 
                          ? "text-gray-300 hover:text-white hover:bg-gray-700" 
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                      onClick={() => toggleSection('healthTrends')}
                    >
                      {sectionStates.healthTrends ? "Hide" : "Show"}
                    </Button>
                  </div>
                  
                  {/* Animated Collapsible Content */}
                  <AnimatePresence>
                    {sectionStates.healthTrends && (
                      <motion.div
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={sectionVariants}
                        className="overflow-hidden"
                      >
                        <WeeklyTrendChart 
                          dataType={selectedMetric}
                          days={14}
                          allowMetricChange={true}
                          compact={false}
                          className={cn("h-[320px] sm:h-[420px]", 
                            // Add these custom CSS variables to style the chart in dark mode
                            colorMode === 'dark' || colorMode === 'night' ? 
                              "dark-chart [--chart-axis:#a3a3a3] [--chart-text:#e5e5e5] [--chart-grid:#333333] [--chart-tooltip-bg:#1e293b] [--chart-tooltip-border:#4b5563]" : 
                              ""
                          )}
                          selectionLayoutStyle={{
                            container: "flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0",
                            metricSelector: "w-full sm:w-auto sm:flex-1 flex justify-start",
                            timeSelector: "w-full sm:w-auto sm:flex-1 flex justify-start sm:justify-end"
                          }}
                          statsLayoutStyle={{
                            container: cn("flex flex-wrap justify-between items-center mt-4 pt-2 gap-y-2", 
                              colorMode === 'dark' || colorMode === 'night' 
                                ? "border-t border-gray-700" 
                                : "border-t border-gray-100"
                            ),
                            statItem: cn("text-xs flex flex-col items-center w-1/2 sm:w-auto", 
                              colorMode === 'dark' || colorMode === 'night' 
                                ? "text-gray-400" 
                                : "text-gray-600"
                            )
                          }}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Card>
            </motion.section>
            
            {/* Enhancement 2: Transform Advanced Analytics button into a visually appealing card */}
            <motion.div 
              whileHover="hover"
              whileTap="tap"
              variants={cardVariants}
              initial="initial"
              animate="animate"
              className="mb-10"
            >
              <Card className={cn(
                "overflow-hidden cursor-pointer transition-colors", 
                colorMode === 'dark' || colorMode === 'night' 
                  ? "bg-gradient-to-r from-blue-900/80 to-indigo-900/80 border-gray-700 hover:border-blue-700" 
                  : "bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100"
              )}
              onClick={() => navigate('/advanced-insights', { state: { initialTab: 'ai-health-analysis' } })}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mr-3",
                        colorMode === 'dark' || colorMode === 'night' 
                          ? "bg-blue-800" 
                          : "bg-blue-100"
                      )}>
                        <LineChart className={colorMode === 'dark' || colorMode === 'night' ? "text-blue-300" : "text-blue-600"} size={20} />
                      </div>
                      <div>
                        <h3 className={cn("font-semibold", 
                          colorMode === 'dark' || colorMode === 'night' 
                            ? "text-white" 
                            : "text-gray-900"
                        )}>
                          Explore Advanced Analytics
                        </h3>
                        <p className={cn("text-sm", 
                          colorMode === 'dark' || colorMode === 'night' 
                            ? "text-gray-300" 
                            : "text-gray-700"
                        )}>
                          Dive deeper into your health data with AI-powered analysis
                        </p>
                      </div>
                    </div>
                    <div className={cn("rounded-full p-2", 
                      colorMode === 'dark' || colorMode === 'night' 
                        ? "bg-blue-800/50" 
                        : "bg-blue-200/50"
                    )}>
                      <ArrowRight className={colorMode === 'dark' || colorMode === 'night' ? "text-blue-300" : "text-blue-600"} size={16} />
                    </div>
                  </div>
                  
                  <div className={cn("mt-4 grid grid-cols-3 gap-2",
                    colorMode === 'dark' || colorMode === 'night' 
                      ? "text-gray-300" 
                      : "text-gray-700"
                  )}>
                    <div className="text-center text-xs">
                      <div className={cn("mb-2 mx-auto rounded-full w-8 h-8 flex items-center justify-center",
                        colorMode === 'dark' || colorMode === 'night' 
                          ? "bg-indigo-900/70" 
                          : "bg-indigo-100"
                      )}>
                        <Brain size={14} className={colorMode === 'dark' || colorMode === 'night' ? "text-indigo-300" : "text-indigo-600"} />
                      </div>
                      <span>AI Health Analysis</span>
                    </div>
                    <div className="text-center text-xs">
                      <div className={cn("mb-2 mx-auto rounded-full w-8 h-8 flex items-center justify-center",
                        colorMode === 'dark' || colorMode === 'night' 
                          ? "bg-blue-900/70" 
                          : "bg-blue-100"
                      )}>
                        <Calendar size={14} className={colorMode === 'dark' || colorMode === 'night' ? "text-blue-300" : "text-blue-600"} />
                      </div>
                      <span>Health Heat Map</span>
                    </div>
                    <div className="text-center text-xs">
                      <div className={cn("mb-2 mx-auto rounded-full w-8 h-8 flex items-center justify-center",
                        colorMode === 'dark' || colorMode === 'night' 
                          ? "bg-purple-900/70" 
                          : "bg-purple-100"
                      )}>
                        <TrendingUp size={14} className={colorMode === 'dark' || colorMode === 'night' ? "text-purple-300" : "text-purple-600"} />
                      </div>
                      <span>Compare Metrics</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Readiness Score */}
            <section className="mb-4">
              <ReadinessScore 
                value={lastReading?.readiness || 75} 
                showLabel={true} 
                dailySummary={readinessInsights.summary + ' ' + sleepDisclaimer}
                weeklySummary={weeklySummary + ' ' + sleepDisclaimer}
              />
            </section>
            
            {/* Enhanced Daily Recommendation */}
            <section className="mb-8">
              <div className="bg-white p-4 sm:p-6 rounded-xl shadow-sm">
                <div className="flex flex-wrap gap-2 sm:gap-0 sm:flex-nowrap items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                      <Award className="text-indigo-600" size={20} />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">Personalized Health Plan</h2>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-sm text-gray-600 w-full sm:w-auto"
                    onClick={() => setHealthPlanExpanded(prev => !prev)}
                  >
                    {healthPlanExpanded ? "See less" : "See more"}
                  </Button>
                </div>
                
                {/* Preview Section - Always visible */}
                <div className="bg-indigo-50 p-4 rounded-lg mb-4">
                  <div className="flex items-center mb-2">
                    <Clock className="text-indigo-600 mr-2" size={18} />
                    <h3 className="font-medium text-gray-800">Today's Focus</h3>
                  </div>
                  <p className="text-sm text-gray-700">
                    {readinessInsights.recommendedActions[0]}
                  </p>
                </div>
                
                {/* Expanded Content */}
                {healthPlanExpanded && (
                  <>
                    <p className="text-sm text-gray-600 leading-relaxed mb-5">
                      {readinessInsights.factors.map(f => `${f.description}. `).join('')}
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {/* Physical Wellbeing */}
                      <div className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Activity className="text-emerald-500 mr-2" size={18} />
                          <h3 className="font-medium text-gray-800">Physical Wellbeing</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          {insights?.activity?.recommendation || 'Maintain regular movement and log your activities for more personalized insights.'}
                        </p>
                      </div>
                      
                      {/* Mental Balance */}
                      <div className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <Brain className="text-purple-500 mr-2" size={18} />
                          <h3 className="font-medium text-gray-800">Mental Balance</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          {insights?.stress?.recommendation || 'Practice short breathing breaks and mindfulness to manage stress.'}
                        </p>
                      </div>
                      
                      {/* Nutrition & Hydration */}
                      <div className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <div className="mr-2 text-blue-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v1"></path><path d="M4.93 10.93 4 11a2 2 0 1 0 0 4l.93.07"></path><path d="M19.07 10.93 20 11a2 2 0 1 1 0 4l-.93.07"></path><path d="M12 16a2 2 0 1 0 0 4a2 2 0 0 0 0-4z"></path><path d="M12 12a2 2 0 1 0 0 4a2 2 0 0 0 0-4z"></path><path d="M12 8a2 2 0 1 0 0 4a2 2 0 0 0 0-4z"></path><path d="M18 5a2 2 0 1 0 0 4a2 2 0 0 0 0-4z"></path><path d="M6 5a2 2 0 1 0 0 4a2 2 0 0 0 0-4z"></path></svg>
                          </div>
                          <h3 className="font-medium text-gray-800">Nutrition & Hydration</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          {insights?.nutrition?.recommendation || 'Prioritize protein-rich foods and increase water intake.'}
                        </p>
                      </div>
                      
                      {/* Sleep Optimization */}
                      <div className="border border-gray-100 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <CloudSun className="text-blue-500 mr-2" size={18} />
                          <h3 className="font-medium text-gray-800">Sleep Optimization</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                          {insights?.sleep?.recommendation || 'Focus on improving sleep quality by limiting screen time before bed.'} {sleepDisclaimer}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Clock className="text-indigo-600 mr-2" size={18} />
                        <h3 className="font-medium text-gray-800">Time-Sensitive Recommendation</h3>
                      </div>
                      <p className="text-sm text-gray-700">
                        Taking short breaks and practicing deep breathing can help stabilize your readiness score today. Monitor your stress levels and hydration for optimal recovery.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </section>
            
            {/* Goal Progress Section - Moved after Personalized Health Plan */}
            {insights?.goals && insights.goals.length > 0 && (
              <section className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0">
                  <h2 className="text-lg font-semibold text-gray-900">Goal Progress</h2>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="text-xs w-full sm:w-auto"
                    onClick={() => setShowGoalModal(true)}
                  >
                    Customize Goals
                  </Button>
                </div>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <GoalVisualization 
                    goals={insights.goals}
                    onGoalClick={handleViewGoalDetails}
                    onInsightClick={handleRelatedInsightClick}
                  />
                </div>
              </section>
            )}
            
            {/* Insights Section */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personalized Insights</h2>
              
              <div className="space-y-4">
                {insights?.insights && insights.insights.length > 0 ? (
                  insights.insights
                    .sort((a, b) => {
                      // Sort by priority
                      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
                      return priorityOrder[a.priority] - priorityOrder[b.priority];
                    })
                    .map(insight => (
                      <InsightCard
                        key={insight.id}
                        id={insight.id}
                        title={insight.title}
                        description={insight.description}
                        priority={insight.priority}
                        category={insight.category}
                        timestamp={insight.timestamp}
                        sources={insight.sources}
                        context={insight.context}
                        actions={insight.actions}
                        relatedInsights={insight.relatedInsights}
                        onFeedback={handleInsightFeedback}
                        onActionTaken={handleActionTaken}
                      />
                    ))
                ) : (
                  <div className="bg-white p-5 rounded-xl shadow-sm text-center py-8">
                    <p className="text-gray-600">No insights available yet. Keep tracking your health data.</p>
                  </div>
                )}
              </div>
            </section>
            
            {/* Weekly Trends Chart */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Health Trends</h2>
              <div className="bg-white p-4 rounded-xl shadow-sm overflow-hidden">
                <WeeklyTrendChart 
                  dataType={selectedMetric}
                  days={14}
                  allowMetricChange={true}
                  compact={false}
                  className="h-[320px] sm:h-[420px]"
                  selectionLayoutStyle={{
                    container: "flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2 sm:gap-0",
                    metricSelector: "w-full sm:w-auto sm:flex-1 flex justify-start",
                    timeSelector: "w-full sm:w-auto sm:flex-1 flex justify-start sm:justify-end"
                  }}
                  statsLayoutStyle={{
                    container: "flex flex-wrap justify-between items-center mt-4 pt-2 border-t border-gray-100 gap-y-2",
                    statItem: "text-xs text-gray-600 flex flex-col items-center w-1/2 sm:w-auto"
                  }}
                />
              </div>
            </section>
            
            {/* Advanced Analytics Button */}
            <Button 
                                  variant="outline"
              className="w-full mb-10"
              onClick={() => navigate('/advanced-insights', { state: { initialTab: 'ai-health-analysis' } })}
            >
              <LineChart className="mr-2 h-4 w-4" />
              Explore Advanced Analytics
                        </Button>
                      </div>
        )}
        </div>

        {/* Goal Customization Modal */}
        <GoalCustomizationModal 
          open={showGoalModal}
        onOpenChange={(open) => setShowGoalModal(open)}
          goals={insights?.goals || []}
          onSaveGoals={handleSaveGoals}
        />
      
      <BottomNavbar />
    </div>
  );
};

export default Insights; 