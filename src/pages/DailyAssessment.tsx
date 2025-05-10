
import React, { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, Bookmark, CheckCircle, Circle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import StatusBar from "@/components/StatusBar";

// Define question types and structures
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

const DailyAssessment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initial assessment state
  const [assessmentState, setAssessmentState] = useState<AssessmentState>({
    currentQuestionId: 1,
    selectedOptions: {},
    notes: {},
    customInputs: {},
  });

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
      notesPlaceholder: "Add any details about how you're feeling...",
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
      nextQuestion: (selectedOption) => selectedOption === "yes" ? 4.1 : 4.2
    },
    {
      id: 4.1,
      text: "What was the intensity and duration?",
      options: [
        { text: "Light (e.g., walking, stretching)", value: "light" },
        { text: "Moderate (e.g., running, strength training)", value: "moderate" },
        { text: "Intense (e.g., HIIT, endurance training)", value: "intense" }
      ],
      hasNotes: true,
      notesPlaceholder: "Describe how the exercise made you feel, any soreness, or improvements noticed...",
      nextQuestion: () => 5
    },
    {
      id: 4.2,
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
      text: "How much water did you drink today?",
      options: [
        { text: "Less than 1 liter", value: "less_than_1L" },
        { text: "1–2 liters", value: "1_2L" },
        { text: "More than 2 liters", value: "more_than_2L" }
      ],
      hasNotes: false,
      nextQuestion: () => 5.1
    },
    {
      id: 5.1,
      text: "Signs of dehydration? (select all that apply)",
      options: [
        { text: "Dry mouth", value: "dry_mouth" },
        { text: "Dark urine", value: "dark_urine" },
        { text: "Dizziness", value: "dizziness" },
        { text: "Fatigue", value: "fatigue" },
        { text: "None", value: "none" }
      ],
      hasNotes: true,
      notesPlaceholder: "Share any reasons for low water intake or symptoms noticed...",
      nextQuestion: () => 6
    },
    {
      id: 6,
      text: "Urination frequency and hue?",
      options: [
        { text: "Normal Frequency and Color", value: "normal" },
        { text: "Increased Frequency or Abnormal Color", value: "increased" },
        { text: "Decreased Frequency", value: "decreased" }
      ],
      hasNotes: true,
      notesPlaceholder: "Describe if you noticed reduced fluid intake or any other changes...",
      nextQuestion: (selectedOption) => selectedOption === "increased" ? 6.1 : 7
    },
    {
      id: 6.1,
      text: "Explore possible causes:",
      options: [
        { text: "Hydration", value: "hydration" },
        { text: "Infection (UTI)", value: "uti" },
        { text: "Diabetes Symptoms", value: "diabetes" },
        { text: "Other", value: "other", requiresInput: true }
      ],
      hasNotes: false,
      nextQuestion: () => 7
    },
    {
      id: 7,
      text: "Bowel movements and stool consistency?",
      options: [
        { text: "Normal", value: "normal" },
        { text: "Constipation", value: "constipation" },
        { text: "Diarrhea", value: "diarrhea" },
        { text: "Bloody or Black Stool (Urgent)", value: "bloody" }
      ],
      hasNotes: true,
      notesPlaceholder: "Mention if this is linked to specific foods or stress events...",
      nextQuestion: () => 8
    },
    {
      id: 8,
      text: "Did you feel any aches or pains anywhere?",
      options: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "yes" ? 8.1 : 9
    },
    {
      id: 8.1,
      text: "Location and type? (select all that apply)",
      options: [
        { text: "Joint pain", value: "joint" },
        { text: "Muscle pain", value: "muscle" },
        { text: "Headache", value: "headache" },
        { text: "Abdominal pain", value: "abdominal" },
        { text: "Back pain", value: "back" },
        { text: "Other", value: "other", requiresInput: true }
      ],
      hasNotes: true,
      notesPlaceholder: "Describe pain intensity, duration, and any triggers...",
      nextQuestion: () => 9
    },
    {
      id: 9,
      text: "Do you have any chronic conditions?",
      options: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "yes" ? 9.1 : 10
    },
    {
      id: 9.1,
      text: "Which conditions? (select all that apply)",
      options: [
        { text: "Hypertension", value: "hypertension" },
        { text: "Diabetes", value: "diabetes" },
        { text: "Asthma", value: "asthma" },
        { text: "Migraines", value: "migraines" },
        { text: "Arthritis", value: "arthritis" },
        { text: "Other", value: "other", requiresInput: true }
      ],
      hasNotes: true,
      notesPlaceholder: "Add details about symptoms or medication adherence today...",
      nextQuestion: () => 10
    },
    {
      id: 10,
      text: "Did you consume any alcohol?",
      options: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "yes" ? 10.1 : 11
    },
    {
      id: 10.1,
      text: "Amount and type?",
      options: [
        { text: "Light to moderate", value: "light_moderate" },
        { text: "Heavy", value: "heavy" },
        { text: "Occasional", value: "occasional" }
      ],
      hasNotes: true,
      notesPlaceholder: "Add context such as social drinking, celebrations, or coping mechanisms...",
      nextQuestion: () => 11
    },
    {
      id: 11,
      text: "Did you consume any substances?",
      options: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "yes" ? 11.1 : 12
    },
    {
      id: 11.1,
      text: "Type and quantity?",
      options: [
        { text: "Recreational", value: "recreational" },
        { text: "Prescription", value: "prescription" },
        { text: "Non-prescribed", value: "non_prescribed" }
      ],
      hasNotes: true,
      notesPlaceholder: "Add context such as medical reasons, frequency, and effects felt...",
      nextQuestion: () => 12
    },
    {
      id: 12,
      text: "How were your meals today?",
      options: [
        { text: "Balanced and Nutritious", value: "balanced" },
        { text: "Skipped or Poor Quality", value: "poor" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "poor" ? 12.1 : 13
    },
    {
      id: 12.1,
      text: "Reason for poor quality meals?",
      options: [
        { text: "No appetite", value: "no_appetite" },
        { text: "No time", value: "no_time" },
        { text: "Lack of healthy options", value: "lack_options" }
      ],
      hasNotes: true,
      notesPlaceholder: "Describe reasons and any plans to improve...",
      nextQuestion: () => 13
    },
    {
      id: 13,
      text: "How are you feeling mentally?",
      options: [
        { text: "Good/Stable", value: "good" },
        { text: "Stressed/Anxious/Depressed", value: "stressed" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "stressed" ? 13.1 : 14
    },
    {
      id: 13.1,
      text: "Explore triggers:",
      options: [
        { text: "Work/school stress", value: "work" },
        { text: "Personal relationships", value: "relationships" },
        { text: "Financial concerns", value: "financial" },
        { text: "Health worries", value: "health" }
      ],
      hasNotes: true,
      notesPlaceholder: "Add details about thoughts, triggers, or coping strategies...",
      nextQuestion: () => 14
    },
    {
      id: 14,
      text: "Have you noticed anything different about yourself today?",
      options: [
        { text: "Yes", value: "yes" },
        { text: "No", value: "no" }
      ],
      hasNotes: false,
      nextQuestion: (selectedOption) => selectedOption === "yes" ? 14.1 : 15
    },
    {
      id: 14.1,
      text: "Type of change?",
      options: [
        { text: "Physical (e.g., swelling, rash)", value: "physical" },
        { text: "Emotional (e.g., mood swings)", value: "emotional" },
        { text: "Cognitive (e.g., forgetfulness)", value: "cognitive" }
      ],
      hasNotes: true,
      notesPlaceholder: "Describe the change and its impact on your day...",
      nextQuestion: () => 15
    },
    {
      id: 15,
      text: "Assessment Complete",
      options: [
        { text: "Submit Assessment", value: "submit" }
      ],
      hasNotes: false
    }
  ];

  // Helper function to get current question
  const getCurrentQuestion = () => {
    return questions.find(q => q.id === assessmentState.currentQuestionId) || questions[0];
  };

  // Get total "main" questions (those with integer IDs)
  const getTotalMainQuestions = () => {
    const mainQuestionIds = questions
      .map(q => q.id)
      .filter(id => Number.isInteger(id));
    return mainQuestionIds.length;
  };

  // Get current "main" question number
  const getCurrentMainQuestionNumber = () => {
    const currentId = assessmentState.currentQuestionId;
    const mainQuestionId = Math.floor(currentId);
    return mainQuestionId;
  };

  // Handle option selection
  const handleOptionSelect = (optionValue: string) => {
    const currentQuestion = getCurrentQuestion();
    
    setAssessmentState(prev => {
      // For single selection questions, replace existing selection
      // For multi-selection questions (those with decimal IDs containing .1, .2 etc), allow multiple
      const isMultiSelect = !Number.isInteger(currentQuestion.id) && 
                            String(currentQuestion.id).includes('.') &&
                            !String(currentQuestion.id).endsWith('.0');
      
      let newSelectedOptions = { ...prev.selectedOptions };
      
      if (isMultiSelect) {
        // For multi-select, toggle the selection
        const currentSelections = prev.selectedOptions[currentQuestion.id] || [];
        if (currentSelections.includes(optionValue)) {
          newSelectedOptions[currentQuestion.id] = currentSelections.filter(
            val => val !== optionValue
          );
        } else {
          newSelectedOptions[currentQuestion.id] = [...currentSelections, optionValue];
        }
      } else {
        // For single select, replace previous selection
        newSelectedOptions[currentQuestion.id] = [optionValue];
      }
      
      return {
        ...prev,
        selectedOptions: newSelectedOptions
      };
    });
  };

  // Handle note input
  const handleNoteChange = (noteText: string) => {
    setAssessmentState(prev => ({
      ...prev,
      notes: {
        ...prev.notes,
        [getCurrentQuestion().id]: noteText
      }
    }));
  };

  // Handle custom input for "Other" options
  const handleCustomInput = (optionValue: string, inputValue: string) => {
    setAssessmentState(prev => ({
      ...prev,
      customInputs: {
        ...prev.customInputs,
        [getCurrentQuestion().id]: {
          ...prev.customInputs[getCurrentQuestion().id],
          [optionValue]: inputValue
        }
      }
    }));
  };

  // Navigate to next question
  const handleNextQuestion = () => {
    const currentQuestion = getCurrentQuestion();
    const selectedOption = assessmentState.selectedOptions[currentQuestion.id]?.[0] || "";
    
    // If we're at the last question, submit the assessment
    if (currentQuestion.id === 15) {
      handleSubmitAssessment();
      return;
    }
    
    // Use the nextQuestion function if available to determine next question
    if (currentQuestion.nextQuestion) {
      const nextQuestionId = currentQuestion.nextQuestion(selectedOption);
      setAssessmentState(prev => ({
        ...prev,
        currentQuestionId: nextQuestionId
      }));
    } else {
      // Default to next sequential question if no custom logic
      const nextIndex = questions.findIndex(q => q.id === currentQuestion.id) + 1;
      if (nextIndex < questions.length) {
        setAssessmentState(prev => ({
          ...prev,
          currentQuestionId: questions[nextIndex].id
        }));
      }
    }
  };

  // Navigate to previous question
  const handlePreviousQuestion = () => {
    const currentQuestion = getCurrentQuestion();
    const currentIndex = questions.findIndex(q => q.id === currentQuestion.id);
    
    if (currentIndex > 0) {
      setAssessmentState(prev => ({
        ...prev,
        currentQuestionId: questions[currentIndex - 1].id
      }));
    }
  };

  // Handle final submission
  const handleSubmitAssessment = () => {
    // Here we would typically send data to an API
    console.log("Submitting assessment data:", assessmentState);
    
    // Show success toast
    toast({
      title: "Assessment submitted",
      description: "Your wellness data has been recorded.",
    });
    
    // Return to dashboard
    navigate("/dashboard");
  };

  // Check if option is selected
  const isOptionSelected = (optionValue: string) => {
    const currentQuestion = getCurrentQuestion();
    const selectedOptions = assessmentState.selectedOptions[currentQuestion.id] || [];
    return selectedOptions.includes(optionValue);
  };

  // Calculate progress percentage for the circle
  useEffect(() => {
    const progressCircle = document.getElementById('progress-circle');
    if (progressCircle) {
      const circumference = 2 * Math.PI * 20;
      const totalQuestions = getTotalMainQuestions();
      const currentQuestion = getCurrentMainQuestionNumber();
      const progress = (currentQuestion / totalQuestions) * 100;
      const offset = circumference - (progress / 100) * circumference;
      
      progressCircle.style.strokeDasharray = `${circumference}`;
      progressCircle.style.strokeDashoffset = `${offset}`;
    }
  }, [assessmentState.currentQuestionId]);

  // Get current question
  const currentQuestion = getCurrentQuestion();
  const currentMainQuestion = getCurrentMainQuestionNumber();
  const totalMainQuestions = getTotalMainQuestions();
  
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <StatusBar />
      
      {/* Header */}
      <div className="px-6 pt-4 pb-4 flex items-center justify-between">
        <button 
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="text-gray-700" size={18} />
        </button>
        <h2 className="text-lg font-medium text-gray-900">Daily Wellness Assessment</h2>
        <button 
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
        >
          <Bookmark className="text-gray-700" size={18} />
        </button>
      </div>

      {/* Question Container */}
      <div className="flex-1 px-6">
        <div className="w-full max-w-md mx-auto">
          {/* Question Content */}
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center">
            <span className="text-sm text-blue-900 font-medium mb-2">
              Question {currentMainQuestion} of {totalMainQuestions}
            </span>
            <h3 className="text-xl font-medium text-gray-900 mb-8">
              {currentQuestion.text}
            </h3>
            
            {/* Answer Options */}
            <div className="w-full space-y-3">
              {currentQuestion.options.map((option) => (
                <div key={option.value}>
                  <button 
                    className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-blue-900 transition-colors flex items-center justify-between group"
                    onClick={() => handleOptionSelect(option.value)}
                  >
                    <span className={`text-gray-700 group-hover:text-blue-900 ${isOptionSelected(option.value) ? 'text-blue-900 font-medium' : ''}`}>
                      {option.text}
                    </span>
                    {isOptionSelected(option.value) ? (
                      <CheckCircle className="text-blue-900" size={20} />
                    ) : (
                      <Circle className="text-gray-400 group-hover:text-blue-900" size={20} />
                    )}
                  </button>
                  
                  {/* Show custom input field for "Other" options when selected */}
                  {option.requiresInput && isOptionSelected(option.value) && (
                    <input
                      type="text"
                      className="w-full mt-2 p-3 rounded-xl border-2 border-gray-200"
                      placeholder="Please specify..."
                      value={assessmentState.customInputs[currentQuestion.id]?.[option.value] || ''}
                      onChange={(e) => handleCustomInput(option.value, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Optional Notes */}
            {currentQuestion.hasNotes && (
              <div className="w-full mt-8">
                <label className="block text-sm text-gray-500 mb-2 text-left">
                  Additional Notes (Optional)
                </label>
                <textarea 
                  className="w-full p-4 rounded-xl border-2 border-gray-200 resize-none h-24"
                  placeholder={currentQuestion.notesPlaceholder || "Add any additional details..."}
                  value={assessmentState.notes[currentQuestion.id] || ''}
                  onChange={(e) => handleNoteChange(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* Progress Circle */}
          <div className="relative w-12 h-12">
            <svg className="transform -rotate-90 w-12 h-12">
              <circle cx="24" cy="24" r="20" strokeWidth="4" fill="none" className="stroke-gray-200" />
              <circle 
                id="progress-circle"
                cx="24" 
                cy="24" 
                r="20" 
                strokeWidth="4" 
                fill="none" 
                className="stroke-blue-900" 
                style={{ strokeDasharray: "126", strokeDashoffset: "115" }}
              />
            </svg>
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-medium text-blue-900">
              {currentMainQuestion}/{totalMainQuestions}
            </span>
          </div>

          {/* Previous Button - Show only if not first question */}
          {assessmentState.currentQuestionId !== 1 && (
            <button 
              className="h-14 px-6 bg-gray-100 text-gray-700 font-medium rounded-xl flex items-center"
              onClick={handlePreviousQuestion}
            >
              <ArrowLeft className="mr-2" size={16} />
              Previous
            </button>
          )}

          {/* Next/Submit Button */}
          <button 
            className={`${assessmentState.currentQuestionId !== 1 ? 'flex-1 ml-4' : 'flex-1'} h-14 bg-blue-900 text-white font-medium rounded-xl flex items-center justify-center`}
            onClick={handleNextQuestion}
            disabled={
              !assessmentState.selectedOptions[currentQuestion.id] || 
              assessmentState.selectedOptions[currentQuestion.id].length === 0
            }
          >
            {currentQuestion.id === 15 ? 'Submit' : 'Continue'}
            <ArrowRight className="ml-2" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyAssessment;
