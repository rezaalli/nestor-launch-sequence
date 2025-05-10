
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { format, subDays, parseISO } from "date-fns";
import { calculateReadinessScore, AssessmentData } from "@/utils/readinessScoring";
import { HealthPattern, detectAllPatterns } from "@/utils/patternDetection";

interface Assessment {
  date: string;
  data: AssessmentData;
  completedAt: string;
  readinessScore?: number;
}

interface AssessmentContextType {
  completedAssessments: Assessment[];
  isAssessmentCompletedForDate: (date: Date) => boolean;
  saveAssessment: (data: AssessmentData) => void;
  getAssessmentForDate: (date: Date) => Assessment | undefined;
  getReadinessHistory: (days: number) => { date: string; score: number }[];
  healthPatterns: HealthPattern[];
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider = ({ children }: { children: ReactNode }) => {
  const [completedAssessments, setCompletedAssessments] = useState<Assessment[]>([]);
  const [healthPatterns, setHealthPatterns] = useState<HealthPattern[]>([]);

  // Load completed assessments from local storage on initial render
  useEffect(() => {
    const storedAssessments = localStorage.getItem('completedAssessments');
    const storedPatterns = localStorage.getItem('healthPatterns');
    
    if (storedAssessments) {
      try {
        setCompletedAssessments(JSON.parse(storedAssessments));
      } catch (error) {
        console.error("Error parsing stored assessments:", error);
      }
    }
    
    if (storedPatterns) {
      try {
        setHealthPatterns(JSON.parse(storedPatterns));
      } catch (error) {
        console.error("Error parsing stored health patterns:", error);
      }
    }
  }, []);

  // Save assessments to local storage whenever they change
  useEffect(() => {
    if (completedAssessments.length > 0) {
      localStorage.setItem('completedAssessments', JSON.stringify(completedAssessments));
      
      // When assessments change, detect patterns
      const newPatterns = detectAllPatterns(completedAssessments);
      setHealthPatterns(prevPatterns => {
        // Merge new patterns with existing ones, avoiding duplicates
        const existingIds = new Set(prevPatterns.map(p => p.id));
        const uniqueNewPatterns = newPatterns.filter(p => !existingIds.has(p.id));
        return [...prevPatterns, ...uniqueNewPatterns];
      });
    }
  }, [completedAssessments]);
  
  // Save health patterns to local storage whenever they change
  useEffect(() => {
    if (healthPatterns.length > 0) {
      localStorage.setItem('healthPatterns', JSON.stringify(healthPatterns));
    }
  }, [healthPatterns]);

  // Check if an assessment is already completed for a specific date
  const isAssessmentCompletedForDate = (date: Date): boolean => {
    const dateString = format(date, "yyyy-MM-dd");
    return completedAssessments.some(assessment => assessment.date === dateString);
  };

  // Get assessment data for a specific date
  const getAssessmentForDate = (date: Date): Assessment | undefined => {
    const dateString = format(date, "yyyy-MM-dd");
    return completedAssessments.find(assessment => assessment.date === dateString);
  };

  // Get readiness scores for the last n days
  const getReadinessHistory = (days: number): { date: string; score: number }[] => {
    const history = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = subDays(today, i);
      const dateString = format(date, "yyyy-MM-dd");
      const assessment = completedAssessments.find(a => a.date === dateString);
      
      if (assessment && assessment.readinessScore !== undefined) {
        history.push({
          date: dateString,
          score: assessment.readinessScore
        });
      }
    }
    
    // Sort chronologically
    return history.sort((a, b) => 
      parseISO(a.date).getTime() - parseISO(b.date).getTime()
    );
  };

  // Save a new assessment or update an existing one
  const saveAssessment = (data: AssessmentData) => {
    const today = new Date();
    const dateString = format(today, "yyyy-MM-dd");
    const existingIndex = completedAssessments.findIndex(a => a.date === dateString);
    
    // Calculate readiness score
    const readinessScore = calculateReadinessScore(data);

    const newAssessment: Assessment = {
      date: dateString,
      data,
      completedAt: new Date().toISOString(),
      readinessScore
    };

    if (existingIndex >= 0) {
      // Update existing assessment
      const updatedAssessments = [...completedAssessments];
      updatedAssessments[existingIndex] = newAssessment;
      setCompletedAssessments(updatedAssessments);
    } else {
      // Add new assessment
      setCompletedAssessments([...completedAssessments, newAssessment]);
    }
  };

  return (
    <AssessmentContext.Provider value={{
      completedAssessments,
      isAssessmentCompletedForDate,
      saveAssessment,
      getAssessmentForDate,
      getReadinessHistory,
      healthPatterns
    }}>
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = (): AssessmentContextType => {
  const context = useContext(AssessmentContext);
  if (context === undefined) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
};
