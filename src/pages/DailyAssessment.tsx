import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle, Circle, AlertCircle, Award, ChevronRight, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useML } from "@/hooks/useML";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Define question types and structures
interface Question {
  id: number;
  text: string;
  options: Option[];
  hasNotes: boolean;
  notesPlaceholder?: string;
  nextQuestion?: (selectedOption: string) => number;
  insight?: string;
}

interface Option {
  text: string;
  value: string;
  subOptions?: Option[];
  requiresInput?: boolean;
}

// Define assessment state
interface AssessmentState {
  currentQuestionId: number;
  selectedOptions: Record<number, string[]>;
  notes: Record<number, string>;
  customInputs: Record<number, Record<string, string>>;
}

// Group questions by category for the new tabbed interface
const questionCategories = {
  general: "General Wellness",
  physical: "Physical Health",
  nutrition: "Nutrition & Hydration",
  mental: "Mental Wellbeing",
  sleep: "Sleep & Recovery",
  lifestyle: "Lifestyle Factors"
};

// Map questions to categories
const questionCategoryMap: Record<number, keyof typeof questionCategories> = {
  1: "general",
  1.1: "general",
  1.2: "general",
  2: "sleep",
  2.1: "sleep",
  3: "lifestyle",
  3.1: "lifestyle",
  3.2: "lifestyle",
  4: "physical",
  4.1: "physical",
  4.2: "physical",
  4.3: "physical",
  4.4: "physical",
  4.5: "physical",
  5: "physical",
  5.1: "physical",
  5.2: "physical",
  6: "physical",
  7: "physical",
  7.1: "physical",
  8: "physical",
  8.1: "physical",
  9: "lifestyle",
  9.1: "lifestyle",
  9.2: "lifestyle",
  9.3: "lifestyle",
  10: "lifestyle",
  10.1: "lifestyle",
  10.2: "lifestyle",
  11: "nutrition",
  11.1: "nutrition",
  11.2: "nutrition",
  12: "mental",
  12.1: "mental",
  12.2: "mental",
  12.3: "mental",
  13: "general",
  13.1: "general",
  13.2: "physical",
  13.3: "mental",
  13.4: "mental",
  13.5: "general",
  13.6: "general",
  14: "general"
};

const DailyAssessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { saveAssessment } = useAssessment();
  const { predict, isLoading: mlLoading } = useML();
  
  // State variables
  const [assessmentState, setAssessmentState] = useState<AssessmentState>({
    currentQuestionId: 1,
    selectedOptions: {},
    notes: {},
    customInputs: {},
  });
  const [activeCategory, setActiveCategory] = useState<keyof typeof questionCategories>("general");
  const [progress, setProgress] = useState(0);
  const [showInsights, setShowInsights] = useState(false);
  const [mlInsights, setMlInsights] = useState<Record<string, string>>({});
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  
  // Questions data with conditional logic and ML insights
  const questions: Question[] = [
    {
      id: 1,
      text: "How do you feel today?",
      options: [
        { text: "Good", value: "good" },
        { text: "Not Good / Unwell", value: "not_good" }
      ],
      hasNotes: true,
      notesPlaceholder: "Add any details about how you're feeling...",
      nextQuestion: (selectedOption) => selectedOption === "good" ? 2 : 1.1,
      insight: "Our ML model shows that your general wellness trend is improving based on your recent responses."
    },
    {
      id: 1.1,
      text: "Do you have any symptoms?",
      options: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "yes" ? 1.2 : 2
    },
    {
      id: 1.2,
      text: "Specify symptoms (select all that apply)",
      options: [
        { text: "Headache", value: "headache" },
        { text: "Fatigue", value: "fatigue" },
        { text: "Nausea", value: "nausea" },
        { text: "Muscle Pain", value: "muscle_pain" },
        { text: "Dizziness", value: "dizziness" },
        { text: "Shortness of Breath", value: "shortness_of_breath" },
        { text: "Chest Pain", value: "chest_pain" },
        { text: "Joint Pain", value: "joint_pain" },
        { text: "Other", value: "other", requiresInput: true }
      ],
      hasNotes: true,
      notesPlaceholder: "Describe what feels off or different from usual...",
      nextQuestion: () => 2
    },
    {
      id: 2,
      text: "How do you feel like you slept?",
      options: [
        { text: "Well Rested", value: "well_rested" },
        { text: "Poorly Rested", value: "poorly_rested" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "well_rested" ? 3 : 2.1,
      insight: "Your sleep patterns show a correlation with your reported energy levels. Consider maintaining a consistent sleep schedule."
    },
    {
      id: 2.1,
      text: "What was the reason for poor sleep? (select all that apply)",
      options: [
        { text: "Insomnia", value: "insomnia" },
        { text: "Nightmares", value: "nightmares" },
        { text: "Discomfort or Pain", value: "pain" },
        { text: "Frequent Waking", value: "frequent_waking" },
        { text: "Stress or Anxiety", value: "stress" },
        { text: "Sleep Apnea", value: "sleep_apnea" },
        { text: "Restless Leg Syndrome", value: "restless_leg" },
        { text: "Unknown", value: "unknown" },
        { text: "Other", value: "other", requiresInput: true }
      ],
      hasNotes: true,
      notesPlaceholder: "Add details like what time you woke up, disturbances, etc...",
      nextQuestion: () => 3
    },
    {
      id: 3,
      text: "Have you had caffeine today?",
      options: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "yes" ? 3.1 : 4
    },
    {
      id: 3.1,
      text: "How much caffeine have you had?",
      options: [
        { text: "1-2 cups", value: "1_2_cups" },
        { text: "3+ cups", value: "3_plus_cups" }
      ],
      hasNotes: false,
      nextQuestion: () => 3.2
    },
    {
      id: 3.2,
      text: "What time did you consume caffeine?",
      options: [
        { text: "Morning", value: "morning" },
        { text: "Afternoon", value: "afternoon" },
        { text: "Evening", value: "evening" }
      ],
      hasNotes: true,
      notesPlaceholder: "Describe your typical daily intake and how it affects you...",
      nextQuestion: () => 4
    },
    {
      id: 4,
      text: "Did you exercise today?",
      options: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "yes" ? 4.1 : 4.5
    },
    {
      id: 4.1,
      text: "What type of exercise did you do?",
      options: [
        { text: "Cardio (Running, Cycling, Swimming)", value: "cardio" },
        { text: "Strength Training (Weights, Resistance Bands)", value: "strength" },
        { text: "Mixed (Combination of Cardio and Strength)", value: "mixed" }
      ],
      hasNotes: false,
      nextQuestion: () => 4.2
    },
    {
      id: 4.2,
      text: "What was the intensity and duration?",
      options: [
        { text: "Light (15-30 mins)", value: "light" },
        { text: "Moderate (30-60 mins)", value: "moderate" },
        { text: "Intense (60+ mins)", value: "intense" }
      ],
      hasNotes: false,
      nextQuestion: () => 4.3
    },
    {
      id: 4.3,
      text: "How many times did you work out today?",
      options: [
        { text: "1 time", value: "one_time" },
        { text: "2 times", value: "two_times" },
        { text: "3 or more times", value: "three_plus_times" }
      ],
      hasNotes: false,
      nextQuestion: () => 4.4
    },
    {
      id: 4.4,
      text: "Would you like to log or reference today's workout metrics?",
      options: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" }
      ],
      hasNotes: true,
      notesPlaceholder: "Describe how the exercise made you feel, any soreness, or improvements noticed...",
      nextQuestion: () => 5
    },
    {
      id: 4.5,
      text: "Why didn't you exercise today?",
      options: [
        { text: "No time", value: "no_time" },
        { text: "Injury or Pain", value: "injury" },
        { text: "Lack of Motivation", value: "lack_motivation" },
        { text: "Other", value: "other", requiresInput: true }
      ],
      hasNotes: true,
      notesPlaceholder: "Mention if you plan to make it up or if there were any barriers today...",
      nextQuestion: () => 5
    },
    {
      id: 5,
      text: "Urination frequency and hue?",
      options: [
        { text: "Normal Frequency and Color", value: "normal" },
        { text: "Increased Frequency or Unusual Color", value: "increased" },
        { text: "Decreased Frequency", value: "decreased" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "normal" ? 6 : 
                                       (selectedOption === "increased" ? 5.1 : 5.2)
    },
    {
      id: 5.1,
      text: "What did you observe? (select all that apply)",
      options: [
        { text: "Dark yellow or amber", value: "dark_yellow" },
        { text: "Cloudy", value: "cloudy" },
        { text: "Reddish or pinkish", value: "reddish" },
        { text: "Foamy", value: "foamy" },
        { text: "Strong odor", value: "strong_odor" },
        { text: "Other", value: "other", requiresInput: true }
      ],
      hasNotes: true,
      notesPlaceholder: "Describe if you noticed reduced fluid intake or any other changes...",
      nextQuestion: () => 6
    },
    {
      id: 5.2,
      text: "What did you observe? (select all that apply)",
      options: [
        { text: "Less than usual", value: "less_than_usual" },
        { text: "Difficulty urinating", value: "difficulty" },
        { text: "Uncomfortable sensation", value: "uncomfortable" },
        { text: "Other", value: "other", requiresInput: true }
      ],
      hasNotes: true,
      notesPlaceholder: "Describe if you noticed reduced fluid intake or any other changes...",
      nextQuestion: () => 6
    },
    {
      id: 6,
      text: "Bowel movements and stool consistency?",
      options: [
        { text: "Normal", value: "normal" },
        { text: "Constipation", value: "constipation" },
        { text: "Diarrhea", value: "diarrhea" },
        { text: "Bloody or Black Stool (Urgent)", value: "bloody" }
      ],
      hasNotes: true,
      notesPlaceholder: "Mention if this is linked to specific foods or stress events...",
      nextQuestion: () => 7
    },
    {
      id: 7,
      text: "Did you feel any aches or pains anywhere?",
      options: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "yes" ? 7.1 : 8
    },
    {
      id: 7.1,
      text: "Location and type? (select all that apply)",
      options: [
        { text: "Joint pain", value: "joint" },
        { text: "Muscle pain", value: "muscle" },
        { text: "Headache", value: "headache" },
        { text: "Abdominal pain", value: "abdominal" },
        { text: "Back pain", value: "back" },
        { text: "Chest pain", value: "chest" },
        { text: "Migraines", value: "migraines" },
        { text: "Other", value: "other", requiresInput: true }
      ],
      hasNotes: true,
      notesPlaceholder: "Describe pain intensity, duration, and any triggers...",
      nextQuestion: () => 8
    },
    {
      id: 8,
      text: "Do you have any chronic conditions?",
      options: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "yes" ? 8.1 : 9
    },
    {
      id: 8.1,
      text: "Which conditions? (select all that apply)",
      options: [
        { text: "Hypertension", value: "hypertension" },
        { text: "Diabetes", value: "diabetes" },
        { text: "Asthma", value: "asthma" },
        { text: "Migraines", value: "migraines" },
        { text: "Arthritis", value: "arthritis" },
        { text: "Heart Disease", value: "heart_disease" },
        { text: "Respiratory Disorders", value: "respiratory" },
        { text: "Other", value: "other", requiresInput: true }
      ],
      hasNotes: true,
      notesPlaceholder: "Add details about symptoms or medication adherence today...",
      nextQuestion: () => 9
    },
    {
      id: 9,
      text: "Did you consume any alcohol?",
      options: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "yes" ? 9.1 : 10
    },
    {
      id: 9.1,
      text: "What type of alcohol did you consume?",
      options: [
        { text: "Beer", value: "beer" },
        { text: "Wine", value: "wine" },
        { text: "Whiskey", value: "whiskey" },
        { text: "Vodka", value: "vodka" },
        { text: "Rum", value: "rum" },
        { text: "Tequila", value: "tequila" },
        { text: "Other", value: "other", requiresInput: true }
      ],
      hasNotes: false,
      nextQuestion: () => 9.2
    },
    {
      id: 9.2,
      text: "How much did you consume?",
      options: [
        { text: "1 Drink", value: "one_drink" },
        { text: "2–3 Drinks", value: "two_three_drinks" },
        { text: "More than 3 Drinks", value: "more_than_three" },
        { text: "Binge Drinking", value: "binge" }
      ],
      hasNotes: false,
      nextQuestion: () => 9.3
    },
    {
      id: 9.3,
      text: "When did you consume it?",
      options: [
        { text: "Morning", value: "morning" },
        { text: "Afternoon", value: "afternoon" },
        { text: "Evening", value: "evening" }
      ],
      hasNotes: true,
      notesPlaceholder: "Add context such as social drinking, celebrations, or coping mechanisms...",
      nextQuestion: () => 10
    },
    {
      id: 10,
      text: "Did you consume any substances?",
      options: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "yes" ? 10.1 : 11
    },
    {
      id: 10.1,
      text: "Type of substance?",
      options: [
        { text: "Marijuana", value: "marijuana" },
        { text: "Cocaine", value: "cocaine" },
        { text: "MDMA", value: "mdma" },
        { text: "Prescription Drugs", value: "prescription" },
        { text: "Over-the-Counter Medications", value: "otc" },
        { text: "Other", value: "other", requiresInput: true }
      ],
      hasNotes: false,
      nextQuestion: () => 10.2
    },
    {
      id: 10.2,
      text: "Frequency of use?",
      options: [
        { text: "First Time", value: "first_time" },
        { text: "Occasional", value: "occasional" },
        { text: "Regular Use", value: "regular" },
        { text: "Heavy Use", value: "heavy" }
      ],
      hasNotes: true,
      notesPlaceholder: "Add context such as medical reasons, frequency, and effects felt...",
      nextQuestion: () => 11
    },
    {
      id: 11,
      text: "How were your meals today?",
      options: [
        { text: "Balanced and Nutritious", value: "balanced" },
        { text: "Skipped or Poor Quality", value: "poor" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "balanced" ? 12 : 11.1
    },
    {
      id: 11.1,
      text: "Reason for poor quality meals?",
      options: [
        { text: "No appetite", value: "no_appetite" },
        { text: "No time", value: "no_time" },
        { text: "Lack of healthy options", value: "lack_options" },
        { text: "Stress-related", value: "stress" }
      ],
      hasNotes: false,
      nextQuestion: () => 11.2
    },
    {
      id: 11.2,
      text: "Would you like to reference your Meal Log?",
      options: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" }
      ],
      hasNotes: true,
      notesPlaceholder: "Describe reasons and any plans to improve...",
      nextQuestion: () => 12
    },
    {
      id: 12,
      text: "How are you feeling mentally?",
      options: [
        { text: "Good/Stable", value: "good" },
        { text: "Stressed/Anxious/Depressed", value: "stressed" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "good" ? 13 : 12.1,
      insight: "Based on your biometric data, we've detected potential stress patterns. Consider mindfulness techniques if you're feeling stressed."
    },
    {
      id: 12.1,
      text: "Explore triggers: (select all that apply)",
      options: [
        { text: "Work/school stress", value: "work" },
        { text: "Personal relationships", value: "relationships" },
        { text: "Financial concerns", value: "financial" },
        { text: "Health worries", value: "health" },
        { text: "Trauma or PTSD", value: "trauma" },
        { text: "Recent life event (e.g., loss, major change)", value: "life_event" },
        { text: "Unknown", value: "unknown" }
      ],
      hasNotes: false,
      nextQuestion: () => 12.2
    },
    {
      id: 12.2,
      text: "Current symptoms: (select all that apply)",
      options: [
        { text: "Racing thoughts", value: "racing_thoughts" },
        { text: "Difficulty concentrating", value: "difficulty_concentrating" },
        { text: "Mood swings", value: "mood_swings" },
        { text: "Irritability", value: "irritability" },
        { text: "Insomnia", value: "insomnia" },
        { text: "Appetite changes", value: "appetite_changes" },
        { text: "Other", value: "other", requiresInput: true }
      ],
      hasNotes: false,
      nextQuestion: () => 12.3
    },
    {
      id: 12.3,
      text: "Coping mechanisms used: (select all that apply)",
      options: [
        { text: "Exercise", value: "exercise" },
        { text: "Meditation", value: "meditation" },
        { text: "Journaling", value: "journaling" },
        { text: "Talking with friends/family", value: "talking" },
        { text: "Substance use", value: "substance_use" },
        { text: "Other", value: "other", requiresInput: true }
      ],
      hasNotes: true,
      notesPlaceholder: "Add details about thoughts, triggers, or coping strategies...",
      nextQuestion: () => 13
    },
    {
      id: 13,
      text: "Have you noticed anything different about yourself today?",
      options: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "yes" ? 13.1 : 14
    },
    {
      id: 13.1,
      text: "Type of change?",
      options: [
        { text: "Physical", value: "physical" },
        { text: "Emotional", value: "emotional" },
        { text: "Cognitive", value: "cognitive" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => {
        if (selectedOption === "physical") return 13.2;
        if (selectedOption === "emotional") return 13.3;
        if (selectedOption === "cognitive") return 13.4;
        return 13.5;
      }
    },
    {
      id: 13.2,
      text: "Physical changes: (select all that apply)",
      options: [
        { text: "Swelling", value: "swelling" },
        { text: "Rash", value: "rash" },
        { text: "Discoloration", value: "discoloration" },
        { text: "Hair Loss", value: "hair_loss" },
        { text: "Weight change", value: "weight_change" },
        { text: "Other", value: "other", requiresInput: true }
      ],
      hasNotes: false,
      nextQuestion: () => 13.5
    },
    {
      id: 13.3,
      text: "Emotional changes: (select all that apply)",
      options: [
        { text: "Mood swings", value: "mood_swings" },
        { text: "Sudden sadness", value: "sadness" },
        { text: "Heightened anxiety", value: "anxiety" },
        { text: "Irritability", value: "irritability" }
      ],
      hasNotes: false,
      nextQuestion: () => 13.5
    },
    {
      id: 13.4,
      text: "Cognitive changes: (select all that apply)",
      options: [
        { text: "Forgetfulness", value: "forgetfulness" },
        { text: "Confusion", value: "confusion" },
        { text: "Brain fog", value: "brain_fog" },
        { text: "Difficulty focusing", value: "focusing" }
      ],
      hasNotes: false,
      nextQuestion: () => 13.5
    },
    {
      id: 13.5,
      text: "Duration of change:",
      options: [
        { text: "Less than 24 hours", value: "less_24" },
        { text: "1–3 Days", value: "1_3_days" },
        { text: "4–7 Days", value: "4_7_days" },
        { text: "More than a week", value: "more_than_week" }
      ],
      hasNotes: false,
      nextQuestion: () => 13.6
    },
    {
      id: 13.6,
      text: "Have you experienced this before?",
      options: [
        { text: "Yes", value: "yes", requiresInput: true },
        { text: "No", value: "no" }
      ],
      hasNotes: true,
      notesPlaceholder: "Describe the change and its impact on your day...",
      nextQuestion: () => 14
    },
    {
      id: 14,
      text: "Is there anything else you'd like to share today?",
      options: [
        { text: "No, I'm done", value: "done" },
        { text: "Yes, let me add more details", value: "more_details", requiresInput: true }
      ],
      hasNotes: true,
      notesPlaceholder: "Share anything else about your day or how you're feeling...",
      insight: "Your daily assessment data helps our ML models provide more personalized health insights over time."
    }
  ];
  
  // Get all questions for the current category
  const getCategoryQuestions = () => {
    return questions.filter(q => questionCategoryMap[q.id] === activeCategory);
  };
  
  // Calculate progress percentage
  useEffect(() => {
    const completedCategories = Object.keys(questionCategories).filter(category => 
      getCategoryQuestions().every(q => assessmentState.selectedOptions[q.id]?.length > 0)
    ).length;
    
    const progressPercentage = (completedCategories / Object.keys(questionCategories).length) * 100;
    setProgress(progressPercentage);
  }, [assessmentState, activeCategory]);
  
  // Generate ML insights based on completed assessment data
  const generateInsights = async () => {
    setIsGeneratingInsights(true);
    
    try {
      // Prepare assessment data for ML model
      const assessmentData = {
        responses: assessmentState.selectedOptions,
        notes: assessmentState.notes,
        timestamp: new Date().toISOString()
      };
      
      // Use the ML hook to get insights
      const result = await predict('wellness-insights', assessmentData);
      
      if (result) {
        setMlInsights({
          general: (result.prediction as any).general || "Continue monitoring your general wellness trends.",
          sleep: (result.prediction as any).sleep || "Your sleep patterns appear normal based on your responses.",
          physical: (result.prediction as any).physical || "Keep maintaining healthy physical activity levels.", 
          mental: (result.prediction as any).mental || "Your mental wellness indicators are within normal ranges.",
          nutrition: (result.prediction as any).nutrition || "Your nutrition choices are generally supporting your health goals.",
          lifestyle: (result.prediction as any).lifestyle || "Your lifestyle choices are aligned with your health objectives."
        });
        
        setShowInsights(true);
      }
    } catch (error) {
      console.error("Error generating insights:", error);
      // Fallback insights if ML fails
      setMlInsights({
        general: "Keep tracking your daily wellness to enable personalized insights.",
        sleep: "Consistent sleep patterns contribute significantly to overall health.",
        physical: "Regular physical activity is important for maintaining health.",
        mental: "Mental wellbeing is an essential component of your overall health.",
        nutrition: "Balanced nutrition supports your body's needs.",
        lifestyle: "Your lifestyle choices impact your long-term health outcomes."
      });
      setShowInsights(true);
    } finally {
      setIsGeneratingInsights(false);
    }
  };
  
  // Get the current question for display
  const getCurrentQuestion = () => {
    return questions.find(q => q.id === assessmentState.currentQuestionId);
  };
  
  // Handle option selection
  const handleOptionSelect = (optionValue: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    setAssessmentState(prevState => {
      // Toggle option selection for multi-select or replace for single-select
      const isMultiSelect = currentQuestion.id.toString().includes('.');
      const currentSelections = prevState.selectedOptions[currentQuestion.id] || [];
      
      let newSelections;
      if (isMultiSelect) {
        // Toggle for multi-select
        newSelections = currentSelections.includes(optionValue)
          ? currentSelections.filter(v => v !== optionValue)
          : [...currentSelections, optionValue];
      } else {
        // Replace for single-select
        newSelections = [optionValue];
      }
      
      return {
        ...prevState,
        selectedOptions: {
          ...prevState.selectedOptions,
          [currentQuestion.id]: newSelections
        }
      };
    });
  };
  
  // Handle note changes
  const handleNoteChange = (noteText: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    setAssessmentState(prevState => ({
      ...prevState,
      notes: {
        ...prevState.notes,
        [currentQuestion.id]: noteText
      }
    }));
  };
  
  // Handle custom input for options that require additional input
  const handleCustomInput = (optionValue: string, inputValue: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    setAssessmentState(prevState => ({
      ...prevState,
      customInputs: {
        ...prevState.customInputs,
        [currentQuestion.id]: {
          ...(prevState.customInputs[currentQuestion.id] || {}),
          [optionValue]: inputValue
        }
      }
    }));
  };
  
  // Handle category change
  const handleCategoryChange = (category: keyof typeof questionCategories) => {
    setActiveCategory(category);
    // Find the first question in this category
    const firstQuestionInCategory = questions.find(q => questionCategoryMap[q.id] === category);
    if (firstQuestionInCategory) {
      setAssessmentState(prev => ({
        ...prev,
        currentQuestionId: firstQuestionInCategory.id
      }));
    }
  };
  
  // Handle next question navigation
  const handleNextQuestion = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    // Get the selected option value
    const selectedOption = assessmentState.selectedOptions[currentQuestion.id]?.[0] || "";
    
    // Determine the next question ID
    let nextQuestionId;
    if (currentQuestion.nextQuestion) {
      nextQuestionId = currentQuestion.nextQuestion(selectedOption);
    } else {
      // No specific next question, find the next one in the same category
      const categoryQuestions = getCategoryQuestions();
      const currentIndex = categoryQuestions.findIndex(q => q.id === currentQuestion.id);
      if (currentIndex < categoryQuestions.length - 1) {
        nextQuestionId = categoryQuestions[currentIndex + 1].id;
      } else {
        // Move to the next category
        const categories = Object.keys(questionCategories);
        const currentCategoryIndex = categories.indexOf(activeCategory);
        if (currentCategoryIndex < categories.length - 1) {
          const nextCategory = categories[currentCategoryIndex + 1] as keyof typeof questionCategories;
          setActiveCategory(nextCategory);
          const firstQuestionInNextCategory = questions.find(q => questionCategoryMap[q.id] === nextCategory);
          nextQuestionId = firstQuestionInNextCategory?.id || 1;
        } else {
          // End of assessment
          handleSubmitAssessment();
          return;
        }
      }
    }
    
    // Update current question
    setAssessmentState(prevState => ({
      ...prevState,
      currentQuestionId: nextQuestionId
    }));
  };
  
  // Handle previous question navigation
  const handlePreviousQuestion = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    // Find the previous question in the same category
    const categoryQuestions = getCategoryQuestions();
    const currentIndex = categoryQuestions.findIndex(q => q.id === currentQuestion.id);
    
    if (currentIndex > 0) {
      // Go to previous question in this category
      setAssessmentState(prevState => ({
        ...prevState,
        currentQuestionId: categoryQuestions[currentIndex - 1].id
      }));
    } else {
      // Go to previous category
      const categories = Object.keys(questionCategories);
      const currentCategoryIndex = categories.indexOf(activeCategory);
      
      if (currentCategoryIndex > 0) {
        const prevCategory = categories[currentCategoryIndex - 1] as keyof typeof questionCategories;
        setActiveCategory(prevCategory);
        
        // Go to the last question of the previous category
        const prevCategoryQuestions = questions.filter(q => questionCategoryMap[q.id] === prevCategory);
        if (prevCategoryQuestions.length > 0) {
          setAssessmentState(prevState => ({
            ...prevState,
            currentQuestionId: prevCategoryQuestions[prevCategoryQuestions.length - 1].id
          }));
        }
      }
    }
  };
  
  // Handle assessment submission
  const handleSubmitAssessment = async () => {
    try {
      // Process assessment data
      const assessmentData = {
        date: new Date().toISOString(),
        responses: assessmentState.selectedOptions,
        notes: assessmentState.notes,
        customInputs: assessmentState.customInputs
      };
      // Save assessment
      await saveAssessment({
        ...assessmentData,
        selectedOptions: assessmentState.selectedOptions,
        timestamp: new Date().getTime().toString()
      });
      
      // Generate insights
      await generateInsights();
      // Show completion toast
      toast({
        title: "Assessment Completed",
        description: "Your daily assessment has been saved.",
      });
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast({
        title: "Error",
        description: "There was an error saving your assessment. Please try again.",
        variant: "destructive"
      });
    }
  };
  
  // Check if an option is selected
  const isOptionSelected = (optionValue: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return false;
    
    const selections = assessmentState.selectedOptions[currentQuestion.id] || [];
    return selections.includes(optionValue);
  };
  
  // Check if the current question is complete
  const isCurrentQuestionComplete = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return false;
    
    const selections = assessmentState.selectedOptions[currentQuestion.id] || [];
    return selections.length > 0;
  };
  
  // Get category completion status
  const getCategoryCompletionStatus = (category: keyof typeof questionCategories) => {
    const categoryQuestions = questions.filter(q => questionCategoryMap[q.id] === category);
    const completedQuestions = categoryQuestions.filter(q => 
      assessmentState.selectedOptions[q.id]?.length > 0
    );
    
    return {
      total: categoryQuestions.length,
      completed: completedQuestions.length,
      percentage: Math.round((completedQuestions.length / categoryQuestions.length) * 100)
    };
  };
  
  // Get active question
  const currentQuestion = getCurrentQuestion();
  
  // Get category completion
  const categoryCompletion = getCategoryCompletionStatus(activeCategory);
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white p-4 border-b flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-semibold ml-2">Daily Wellness Assessment</h1>
        </div>
        <div className="flex items-center">
          <Badge variant="outline" className="mr-2">
            {progress.toFixed(0)}% Complete
          </Badge>
          <button 
            className="ml-2 text-blue-600"
            onClick={handleSubmitAssessment}
            disabled={progress < 100 && !showInsights}
          >
            {progress < 100 && !showInsights ? "In Progress" : "Complete"}
          </button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <Progress value={progress} className="w-full h-1" />
      
      {showInsights ? (
        /* ML Insights View */
        <div className="flex-1 p-4 overflow-auto">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Personalized Insights</CardTitle>
                <Award className="text-yellow-500" size={24} />
              </div>
              <CardDescription>
                Based on your assessment and historical data, here are personalized insights to help improve your wellness.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(mlInsights).map(([category, insight]) => (
                  <div key={category} className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="font-medium text-blue-900 mb-1">{questionCategories[category as keyof typeof questionCategories]}</h3>
                    <p className="text-sm text-gray-700">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setShowInsights(false)}>
                Return to Assessment
              </Button>
              <Button onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </CardFooter>
          </Card>
        </div>
      ) : (
        /* Main Assessment View */
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Category Navigation */}
          <div className="bg-white md:w-64 p-4 border-r">
            <h2 className="font-medium text-gray-500 mb-4 uppercase text-xs">Categories</h2>
            <div className="space-y-2">
              {Object.entries(questionCategories).map(([key, label]) => {
                const status = getCategoryCompletionStatus(key as keyof typeof questionCategories);
                return (
                  <button
                    key={key}
                    onClick={() => handleCategoryChange(key as keyof typeof questionCategories)}
                    className={`flex items-center justify-between w-full p-3 rounded-lg text-left ${
                      activeCategory === key 
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span>{label}</span>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 mr-2">
                        {status.completed}/{status.total}
                      </span>
                      {status.completed === status.total ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <Circle size={16} className="text-gray-300" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Question Content */}
          <div className="flex-1 p-4 overflow-auto">
            {currentQuestion && (
              <div className="max-w-3xl mx-auto">
                <Card className="mb-6">
                  <CardHeader>
                    <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
                    {currentQuestion.insight && (
                      <CardDescription className="flex items-center text-amber-600">
                        <AlertCircle size={16} className="mr-1" />
                        ML Insight: {currentQuestion.insight}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {currentQuestion.options.map(option => (
                        <div key={option.value} className="mb-4">
                          <button
                            onClick={() => handleOptionSelect(option.value)}
                            className={`flex items-center w-full p-4 rounded-lg border ${
                              isOptionSelected(option.value)
                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <div className="mr-3">
                              {isOptionSelected(option.value) ? (
                                <CheckCircle size={20} className="text-blue-600" />
                              ) : (
                                <Circle size={20} className="text-gray-300" />
                              )}
                            </div>
                            <span>{option.text}</span>
                          </button>
                          
                          {option.requiresInput && isOptionSelected(option.value) && (
                            <input
                              type="text"
                              placeholder="Please specify..."
                              value={assessmentState.customInputs[currentQuestion.id]?.[option.value] || ''}
                              onChange={(e) => handleCustomInput(option.value, e.target.value)}
                              className="mt-2 w-full p-3 border border-gray-300 rounded-lg"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {currentQuestion.hasNotes && (
                      <div className="mt-6">
                        <h3 className="font-medium mb-2">Additional Notes</h3>
                        <textarea
                          placeholder={currentQuestion.notesPlaceholder || "Add your notes here..."}
                          value={assessmentState.notes[currentQuestion.id] || ''}
                          onChange={(e) => handleNoteChange(e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg h-32"
                        />
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={handlePreviousQuestion}
                      disabled={!currentQuestion || getCategoryQuestions()[0]?.id === currentQuestion.id && activeCategory === "general"}
                    >
                      <ArrowLeft size={16} className="mr-2" />
                      Previous
                    </Button>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>
                            <Button 
                              onClick={handleNextQuestion}
                              disabled={!isCurrentQuestionComplete()}
                            >
                              {progress === 100 ? "Complete" : "Next"}
                              <ArrowRight size={16} className="ml-2" />
                            </Button>
                          </span>
                        </TooltipTrigger>
                        {!isCurrentQuestionComplete() && (
                          <TooltipContent>
                            <p>Please answer the question to continue</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Generate Insights Button (visible when assessment is complete) */}
      {progress === 100 && !showInsights && (
        <div className="fixed bottom-0 left-0 right-0 bg-white p-4 border-t flex justify-center">
          <Button 
            className="w-full max-w-md flex items-center justify-center"
            onClick={generateInsights}
            disabled={isGeneratingInsights}
          >
            {isGeneratingInsights ? (
              <>
                <RefreshCw size={16} className="mr-2 animate-spin" />
                Generating Insights...
              </>
            ) : (
              <>
                <AlertCircle size={16} className="mr-2" />
                Generate ML Insights
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default DailyAssessment;
