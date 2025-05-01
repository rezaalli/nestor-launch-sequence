
import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import StatusBar from "@/components/StatusBar";
import MoodSelection from "@/components/lifestyle/MoodSelection";
import EnergyLevel from "@/components/lifestyle/EnergyLevel";
import SleepQuality from "@/components/lifestyle/SleepQuality";
import LifestyleFactors from "@/components/lifestyle/LifestyleFactors";
import ExerciseType from "@/components/lifestyle/ExerciseType";
import NotesSection from "@/components/lifestyle/NotesSection";

const LifestyleCheckIn = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSlide, setCurrentSlide] = useState(0);
  const progressCircleRef = useRef<SVGCircleElement>(null);
  const totalSlides = 6;
  
  // Survey data state
  const [surveyData, setSurveyData] = useState({
    mood: "okay",
    energyLevel: 7,
    sleepQuality: 8,
    lifestyleFactors: {
      caffeine: false,
      exercise: false
    },
    exerciseType: "Light Exercise (30 min)",
    notes: ""
  });

  // Update progress circle
  useEffect(() => {
    if (progressCircleRef.current) {
      const circumference = 2 * Math.PI * 20;
      const progress = ((currentSlide + 1) / totalSlides) * 100;
      const offset = circumference - (progress / 100) * circumference;
      
      progressCircleRef.current.style.strokeDasharray = `${circumference}`;
      progressCircleRef.current.style.strokeDashoffset = `${offset}`;
    }
  }, [currentSlide]);

  // Update individual survey field
  const updateSurveyData = (field: string, value: any) => {
    setSurveyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update nested lifestyle factors
  const updateLifestyleFactors = (factor: string, value: boolean) => {
    setSurveyData(prev => ({
      ...prev,
      lifestyleFactors: {
        ...prev.lifestyleFactors,
        [factor]: value
      }
    }));
  };

  const goToPreviousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToNextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      // Submit the form
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    // Here you would typically send data to an API
    console.log("Submitting survey data:", surveyData);
    
    // Show success toast
    toast({
      title: "Check-in submitted",
      description: "Your lifestyle data has been recorded.",
    });
    
    // Return to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <StatusBar />
      
      {/* Header */}
      <div className="px-6 pt-4 pb-4 flex items-center justify-between">
        <button 
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="text-nestor-gray-700" size={18} />
        </button>
        <h2 className="text-lg font-medium text-nestor-gray-900">Lifestyle Check-In</h2>
        <div className="w-10"></div>
      </div>
      
      {/* Survey Form */}
      <div className="px-6 pb-6 flex-1 overflow-hidden">
        <div className="w-full max-w-md mx-auto">
          {/* Dynamic slide content */}
          {currentSlide === 0 && (
            <MoodSelection 
              mood={surveyData.mood} 
              setMood={(value) => updateSurveyData("mood", value)} 
            />
          )}
          
          {currentSlide === 1 && (
            <EnergyLevel 
              energyLevel={surveyData.energyLevel} 
              setEnergyLevel={(value) => updateSurveyData("energyLevel", value)} 
            />
          )}
          
          {currentSlide === 2 && (
            <SleepQuality 
              sleepQuality={surveyData.sleepQuality} 
              setSleepQuality={(value) => updateSurveyData("sleepQuality", value)} 
            />
          )}
          
          {currentSlide === 3 && (
            <LifestyleFactors 
              lifestyleFactors={surveyData.lifestyleFactors} 
              setLifestyleFactors={updateLifestyleFactors} 
            />
          )}
          
          {currentSlide === 4 && (
            <ExerciseType 
              exerciseType={surveyData.exerciseType} 
              setExerciseType={(value) => updateSurveyData("exerciseType", value)} 
            />
          )}
          
          {currentSlide === 5 && (
            <NotesSection 
              notes={surveyData.notes} 
              setNotes={(value) => updateSurveyData("notes", value)} 
            />
          )}
        </div>
      </div>
      
      {/* Submit Button with Progress Circle */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center">
        <button 
          className="h-14 px-6 bg-gray-100 text-gray-700 font-medium rounded-xl flex items-center"
          onClick={goToPreviousSlide}
          style={{ visibility: currentSlide === 0 ? 'hidden' : 'visible' }}
        >
          <ArrowLeft className="mr-2" size={16} />
          Previous
        </button>
        
        <div className="relative w-12 h-12">
          <svg className="transform -rotate-90 w-12 h-12">
            <circle
              cx="24"
              cy="24"
              r="20"
              strokeWidth="4"
              fill="none"
              className="stroke-gray-200"
            />
            <circle
              ref={progressCircleRef}
              cx="24"
              cy="24"
              r="20"
              strokeWidth="4"
              fill="none"
              className="stroke-blue-900"
              style={{ strokeDasharray: "126", strokeDashoffset: "126" }}
            />
          </svg>
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-medium text-blue-900">
            {currentSlide + 1}/{totalSlides}
          </span>
        </div>

        <button 
          className="h-14 px-6 bg-nestor-blue text-white font-medium rounded-xl flex items-center"
          onClick={goToNextSlide}
        >
          {currentSlide === totalSlides - 1 ? 'Submit' : 'Next'}
          {currentSlide < totalSlides - 1 && <ArrowRight className="ml-2" size={16} />}
        </button>
      </div>
    </div>
  );
};

export default LifestyleCheckIn;
