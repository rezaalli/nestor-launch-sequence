
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { format } from "date-fns";

interface Assessment {
  date: string;
  data: Record<string, any>;
  completedAt: string;
}

interface AssessmentContextType {
  completedAssessments: Assessment[];
  isAssessmentCompletedForDate: (date: Date) => boolean;
  saveAssessment: (data: Record<string, any>) => void;
  getAssessmentForDate: (date: Date) => Assessment | undefined;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

export const AssessmentProvider = ({ children }: { children: ReactNode }) => {
  const [completedAssessments, setCompletedAssessments] = useState<Assessment[]>([]);

  // Load completed assessments from local storage on initial render
  useEffect(() => {
    const storedAssessments = localStorage.getItem('completedAssessments');
    if (storedAssessments) {
      try {
        setCompletedAssessments(JSON.parse(storedAssessments));
      } catch (error) {
        console.error("Error parsing stored assessments:", error);
      }
    }
  }, []);

  // Save assessments to local storage whenever they change
  useEffect(() => {
    if (completedAssessments.length > 0) {
      localStorage.setItem('completedAssessments', JSON.stringify(completedAssessments));
    }
  }, [completedAssessments]);

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

  // Save a new assessment or update an existing one
  const saveAssessment = (data: Record<string, any>) => {
    const today = new Date();
    const dateString = format(today, "yyyy-MM-dd");
    const existingIndex = completedAssessments.findIndex(a => a.date === dateString);

    const newAssessment: Assessment = {
      date: dateString,
      data,
      completedAt: new Date().toISOString()
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
      getAssessmentForDate
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
