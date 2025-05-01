
import React, { useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
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

  // Update individual survey field
  const updateSurveyData = (field, value) => {
    setSurveyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Update nested lifestyle factors
  const updateLifestyleFactors = (factor, value) => {
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
    if (currentSlide < 5) {
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

  // Render slide based on current index
  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return (
          <MoodSelection 
            mood={surveyData.mood} 
            setMood={(value) => updateSurveyData("mood", value)} 
          />
        );
      case 1:
        return (
          <EnergyLevel 
            energyLevel={surveyData.energyLevel} 
            setEnergyLevel={(value) => updateSurveyData("energyLevel", value)} 
          />
        );
      case 2:
        return (
          <SleepQuality 
            sleepQuality={surveyData.sleepQuality} 
            setSleepQuality={(value) => updateSurveyData("sleepQuality", value)} 
          />
        );
      case 3:
        return (
          <LifestyleFactors 
            lifestyleFactors={surveyData.lifestyleFactors} 
            setLifestyleFactors={updateLifestyleFactors} 
          />
        );
      case 4:
        return (
          <ExerciseType 
            exerciseType={surveyData.exerciseType} 
            setExerciseType={(value) => updateSurveyData("exerciseType", value)} 
          />
        );
      case 5:
        return (
          <NotesSection 
            notes={surveyData.notes} 
            setNotes={(value) => updateSurveyData("notes", value)} 
          />
        );
      default:
        return null;
    }
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
      <div className="px-6 pb-20 flex-1 overflow-hidden">
        <div className="w-full max-w-md mx-auto">
          {renderSlide()}
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center">
        <button 
          className="h-14 px-6 bg-gray-100 text-gray-700 font-medium rounded-xl flex items-center"
          onClick={goToPreviousSlide}
          style={{ visibility: currentSlide === 0 ? 'hidden' : 'visible' }}
        >
          <ArrowLeft className="mr-2" size={16} />
          Previous
        </button>
        
        <div className="flex items-center space-x-1.5">
          {[...Array(6)].map((_, index) => (
            <div 
              key={index}
              className={`w-2 h-2 rounded-full ${currentSlide === index ? 'bg-nestor-blue' : 'bg-gray-200'}`}
            ></div>
          ))}
        </div>

        <button 
          className="h-14 px-6 bg-nestor-blue text-white font-medium rounded-xl flex items-center"
          onClick={goToNextSlide}
        >
          {currentSlide === 5 ? 'Submit' : 'Next'}
          {currentSlide < 5 && <ChevronRight className="ml-2" size={16} />}
        </button>
      </div>
    </div>
  );
};

export default LifestyleCheckIn;
