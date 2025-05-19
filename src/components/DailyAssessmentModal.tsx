import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle, Circle } from "lucide-react";
import { useAssessment } from "@/contexts/AssessmentContext";
import { useToast } from "@/hooks/use-toast";

interface DailyAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assessmentData: any) => void;
}

interface Question {
  id: number;
  text: string;
  options: Option[];
  hasNotes: boolean;
  notesPlaceholder?: string;
  nextQuestion?: (selectedOption: string) => number;
}

interface Option {
  text: string;
  value: string;
  requiresInput?: boolean;
}

const DailyAssessmentModal: React.FC<DailyAssessmentModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  const { saveAssessment } = useAssessment();
  const { toast } = useToast();
  
  // State for the assessment
  const [currentQuestionId, setCurrentQuestionId] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string[]>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [customInputs, setCustomInputs] = useState<Record<number, Record<string, string>>>({});
  
  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionId(1);
      setSelectedOptions({});
      setNotes({});
      setCustomInputs({});
    }
  }, [isOpen]);
  
  // Questions data with conditional logic
  const questions: Question[] = [
    {
      id: 1,
      text: "How do you feel today?",
      options: [
        { text: "Good", value: "good" },
        { text: "Not Good / Unwell", value: "not_good" }
      ],
      hasNotes: true,
      notesPlaceholder: "Describe anything positive or significant about your day so far...",
      nextQuestion: (selectedOption) => selectedOption === "good" ? 2 : 1.1
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
      nextQuestion: (selectedOption) => selectedOption === "well_rested" ? 3 : 2.1
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
      notesPlaceholder: "Add details like what time you woke up, if you remember any disturbances, etc...",
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
      text: "Amount?",
      options: [
        { text: "1-2 cups", value: "1_2_cups" },
        { text: "3+ cups", value: "3_plus_cups" }
      ],
      hasNotes: false,
      nextQuestion: () => 3.2
    },
    {
      id: 3.2,
      text: "Time Consumed?",
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
      text: "Type:",
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
      text: "Intensity and Duration?",
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
      text: "Reason?",
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
      text: "Urination Frequency and Hue?",
      options: [
        { text: "Normal Frequency and Color", value: "normal" },
        { text: "Increased Frequency or Unusual Color", value: "unusual" },
        { text: "Decreased Frequency", value: "decreased" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => {
        if (selectedOption === "normal") return 6;
        if (selectedOption === "unusual") return 5.1;
        return 5.2;
      }
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
      text: "Bowel Movements and Stool consistency?",
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
      text: "Location and Type? (select all that apply)",
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
      text: "Chronic Conditions?",
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
      text: "Type of Alcohol?",
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
      text: "Type of Substance?",
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
      text: "Frequency of Use?",
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
      text: "Meals?",
      options: [
        { text: "Balanced and Nutritious", value: "balanced" },
        { text: "Skipped or Poor Quality", value: "poor" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "balanced" ? 12 : 11.1
    },
    {
      id: 11.1,
      text: "Reason?",
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
      nextQuestion: (selectedOption) => selectedOption === "good" ? 13 : 12.1
    },
    {
      id: 12.1,
      text: "Explore Triggers: (select all that apply)",
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
      text: "Current Symptoms: (select all that apply)",
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
      text: "Coping Mechanisms Used: (select all that apply)",
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
      text: "Type of Change?",
      options: [
        { text: "Physical", value: "physical" },
        { text: "Emotional", value: "emotional" },
        { text: "Cognitive", value: "cognitive" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => {
        if (selectedOption === "physical") return 13.2;
        if (selectedOption === "emotional") return 13.3;
        return 13.4;
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
      text: "Duration of Change:",
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
        { text: "Yes, I want to add more", value: "more", requiresInput: true }
      ],
      hasNotes: true,
      notesPlaceholder: "Share anything else about your day..."
    }
  ];
  
  // Get current question
  const getCurrentQuestion = () => {
    const foundQuestion = questions.find(q => q.id === currentQuestionId);
    return foundQuestion;
  };
  
  // Helper function to check if a question allows multiple selections
  const isMultiSelectQuestion = (questionId: number): boolean => {
    // Questions that allow multiple selections
    const multiSelectQuestionIds = [
      1.2, // Specify symptoms
      2.1, // Reasons for poor sleep
      5.1, // Unusual urination observations
      5.2, // Decreased urination observations
      7.1, // Aches and pains locations
      8.1, // Chronic conditions
      12.1, // Mental health triggers
      12.2, // Current mental symptoms
      12.3, // Coping mechanisms
      13.2, // Physical changes
      13.3, // Emotional changes
      13.4  // Cognitive changes
    ];
    
    return multiSelectQuestionIds.includes(questionId);
  };
  
  // Handle option selection - updated to support multi-select for applicable questions
  const handleOptionSelect = (optionValue: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    // Check if option requires additional input
    const selectedOption = currentQuestion.options.find(o => o.value === optionValue);
    const requiresInput = selectedOption?.requiresInput;
    
    // Check if this is a multi-select question
    const isMultiSelect = isMultiSelectQuestion(currentQuestion.id);
    
    if (isMultiSelect) {
      // For multi-select questions, toggle the selection
      setSelectedOptions(prev => {
        const currentSelections = prev[currentQuestion.id] || [];
        
        if (currentSelections.includes(optionValue)) {
          // If already selected, remove it
          return {
            ...prev,
            [currentQuestion.id]: currentSelections.filter(value => value !== optionValue)
          };
        } else {
          // If not selected, add it
          return {
            ...prev,
            [currentQuestion.id]: [...currentSelections, optionValue]
          };
        }
      });
    } else {
      // For single selection questions, replace the selection
      setSelectedOptions(prev => ({
        ...prev,
        [currentQuestion.id]: [optionValue]
      }));
    }
    
    // If option requires input, set focus on input field
    if (requiresInput) {
      // Logic to handle custom input focus would go here
    }
  };
  
  // Handle custom input changes
  const handleCustomInputChange = (optionValue: string, inputValue: string) => {
    setCustomInputs(prev => ({
      ...prev,
      [currentQuestionId]: {
        ...(prev[currentQuestionId] || {}),
        [optionValue]: inputValue
      }
    }));
  };
  
  // Handle note changes
  const handleNoteChange = (noteText: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    setNotes(prev => ({
      ...prev,
      [currentQuestion.id]: noteText
    }));
  };
  
  // Handle continue to next question
  const handleContinue = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    // If this is the last question, complete the assessment
    if (currentQuestion.id === 14) {
      handleComplete();
      return;
    }
    
    // Get the selected option value
    const selectedOption = selectedOptions[currentQuestion.id]?.[0] || "";
    
    // Determine the next question ID
    let nextQuestionId;
    if (currentQuestion.nextQuestion) {
      nextQuestionId = currentQuestion.nextQuestion(selectedOption);
    } else {
      // Default to the next question in sequence
      const currentIndex = questions.findIndex(q => q.id === currentQuestion.id);
      if (currentIndex < questions.length - 1) {
        nextQuestionId = questions[currentIndex + 1].id;
      } else {
        // We've reached the end
        handleComplete();
        return;
      }
    }
    
    // Update current question
    setCurrentQuestionId(nextQuestionId);
  };
  
  // Handle complete assessment
  const handleComplete = () => {
    try {
      // Process assessment data
      const assessmentData = {
        selectedOptions: selectedOptions,
        notes: notes,
        customInputs: customInputs,
        timestamp: new Date().toISOString()
      };
      
      // Save assessment
      saveAssessment(assessmentData);
      
      // Call onSave prop with the data
      onSave(assessmentData);
      
      // Show completion toast
      toast({
        title: "Assessment Completed",
        description: "Your daily assessment has been saved.",
        variant: "success",
        duration: 5000 // Auto-dismiss after 5 seconds
      });
      
      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error saving assessment:", error);
      toast({
        title: "Error",
        description: "There was an error saving your assessment. Please try again.",
        variant: "destructive",
        duration: 5000 // Auto-dismiss after 5 seconds
      });
    }
  };
  
  // Check if option is selected
  const isOptionSelected = (optionValue: string) => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return false;
    
    return selectedOptions[currentQuestion.id]?.includes(optionValue) || false;
  };
  
  // Check if continue button should be enabled
  const canContinue = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return false;
    
    // Check if at least one option is selected
    return (selectedOptions[currentQuestion.id]?.length > 0);
  };
  
  // Get the main question number for any sub-question
  const getMainQuestionNumber = (questionId: number): number => {
    // Extract the main question number (the integer part)
    return Math.floor(questionId);
  };

  // Get all main questions (no sub-questions)
  const getMainQuestions = (): number[] => {
    // Create a set of all main question IDs (integer values from 1-14)
    const mainQuestions = new Set<number>();
    
    questions.forEach(q => {
      // Add the main question number (floor of the question ID)
      mainQuestions.add(Math.floor(q.id));
    });
    
    // Convert to array and sort
    return Array.from(mainQuestions).sort((a, b) => a - b);
  };

  // Get question number out of total
  const getQuestionNumber = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return "0/13";
    
    // Get the main question number
    const mainQuestionNumber = getMainQuestionNumber(currentQuestion.id);
    
    // Find the position of this main question in the list of main questions
    const mainQuestions = getMainQuestions();
    const position = mainQuestions.indexOf(mainQuestionNumber) + 1;
    
    // Return position out of total main questions (should be 13)
    return `${position}/13`;
  };

  // Calculate circle progress dashoffset based on main questions
  const getCircleOffset = () => {
    const circumference = 2 * Math.PI * 20;
    const progress = parseInt(getQuestionNumber().split('/')[0]);
    const total = parseInt(getQuestionNumber().split('/')[1]);
    const percentage = (progress / total) * 100;
    return circumference - (percentage / 100) * circumference;
  };

  // Calculate overall progress percentage
  const getProgress = () => {
    const mainQuestions = getMainQuestions();
    const totalMainQuestions = mainQuestions.length;
    
    // Count how many main questions have been started
    const answeredMainQuestions = new Set<number>();
    
    Object.keys(selectedOptions).forEach(questionId => {
      // Add the main question number for each answered question
      answeredMainQuestions.add(Math.floor(parseFloat(questionId)));
    });
    
    return Math.min((answeredMainQuestions.size / totalMainQuestions) * 100, 100);
  };
  
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  const currentQuestion = getCurrentQuestion();
  
  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
      <div id="wellness-assessment" className="h-full w-full max-w-md flex flex-col bg-white rounded-lg overflow-hidden">
        {/* Status Bar */}
        <div id="status-bar" className="h-6 w-full bg-white"></div>
        
        {/* Header */}
        <div id="header" className="px-6 pt-4 pb-4 flex items-center justify-between">
          <button 
            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
            onClick={onClose}
          >
            <i className="fa-solid fa-arrow-left text-gray-700"></i>
          </button>
          <h2 className="text-lg font-medium text-gray-900">Daily Wellness Assessment</h2>
          <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <i className="fa-regular fa-bookmark text-gray-700"></i>
          </button>
        </div>

        {/* Question Container */}
        <div id="question-container" className="flex-1 px-6 overflow-y-auto">
          <div id="current-question" className="w-full max-w-md mx-auto">
            {/* Question Content */}
            <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
              <span className="text-sm text-blue-900 font-medium mb-2">Question {getQuestionNumber()}</span>
              <h3 className="text-xl font-medium text-gray-900 mb-2">{currentQuestion?.text}</h3>
              
              {/* Show multi-select hint if applicable */}
              {currentQuestion && isMultiSelectQuestion(currentQuestion.id) && (
                <p className="text-sm text-gray-500 mb-6">Select all that apply</p>
              )}
              {!currentQuestion || !isMultiSelectQuestion(currentQuestion.id) && (
                <div className="mb-6"></div>
              )}
              
              {/* Answer Options */}
              <div className="w-full space-y-3">
                {currentQuestion?.options.map((option) => (
                  <div key={option.value} className="w-full">
                    <button
                      className={`w-full p-4 rounded-xl border-2 ${
                        isOptionSelected(option.value)
                          ? "border-blue-900 bg-blue-50"
                          : "border-gray-200 hover:border-blue-900"
                      } transition-colors flex items-center justify-between group`}
                      onClick={() => handleOptionSelect(option.value)}
                    >
                      <span className={`${
                        isOptionSelected(option.value) ? "text-blue-900" : "text-gray-700 group-hover:text-blue-900"
                      }`}>
                        {option.text}
                      </span>
                      {isOptionSelected(option.value) ? (
                        currentQuestion && isMultiSelectQuestion(currentQuestion.id) ? (
                          <i className="fa-solid fa-square-check text-blue-900"></i>
                        ) : (
                          <i className="fa-solid fa-circle-check text-blue-900"></i>
                        )
                      ) : (
                        currentQuestion && isMultiSelectQuestion(currentQuestion.id) ? (
                          <i className="fa-regular fa-square text-gray-400 group-hover:text-blue-900"></i>
                        ) : (
                          <i className="fa-regular fa-circle text-gray-400 group-hover:text-blue-900"></i>
                        )
                      )}
                    </button>
                    
                    {/* Custom input field for options that require it */}
                    {option.requiresInput && isOptionSelected(option.value) && (
                      <input
                        type="text"
                        className="w-full mt-2 p-3 rounded-xl border-2 border-gray-200"
                        placeholder={`Please specify ${option.text.toLowerCase()}...`}
                        value={(customInputs[currentQuestionId]?.[option.value]) || ''}
                        onChange={(e) => handleCustomInputChange(option.value, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Optional Notes */}
              {currentQuestion?.hasNotes && (
                <div className="w-full mt-8">
                  <label className="block text-sm text-gray-500 mb-2 text-left">Additional Notes (Optional)</label>
                  <textarea 
                    className="w-full p-4 rounded-xl border-2 border-gray-200 resize-none h-24" 
                    placeholder={currentQuestion.notesPlaceholder || "Add any additional notes..."}
                    value={notes[currentQuestion.id] || ""}
                    onChange={(e) => handleNoteChange(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div id="navigation" className="bg-white border-t border-gray-100 px-6 py-4">
          <div className="flex items-center justify-between mx-auto">
            {/* Progress Circle */}
            <div className="relative w-12 h-12">
              <svg xmlns="http://www.w3.org/2000/svg" className="transform -rotate-90 w-12 h-12">
                <circle cx="24" cy="24" r="20" strokeWidth="4" fill="none" className="stroke-gray-200"/>
                <circle 
                  cx="24" 
                  cy="24" 
                  r="20" 
                  strokeWidth="4" 
                  fill="none" 
                  className="stroke-blue-900" 
                  style={{ 
                    strokeDasharray: 2 * Math.PI * 20, 
                    strokeDashoffset: getCircleOffset() 
                  }} 
                />
              </svg>
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-medium text-blue-900">
                {getQuestionNumber().split('/')[0]}/{getQuestionNumber().split('/')[1]}
              </span>
            </div>

            {/* Next Button */}
            <button 
              className={`flex-1 ml-4 h-14 bg-blue-900 text-white font-medium rounded-xl flex items-center justify-center ${
                !canContinue() ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={handleContinue}
              disabled={!canContinue()}
            >
              Continue
              <i className="fa-solid fa-arrow-right ml-2"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyAssessmentModal; 