
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define types for our nutrition data
export type MacroNutrient = 'protein' | 'carbs' | 'fat';

export interface NutritionData {
  calories: {
    consumed: number;
    target: number;
  };
  protein: {
    consumed: number;
    target: number;
  };
  carbs: {
    consumed: number;
    target: number;
  };
  fat: {
    consumed: number;
    target: number;
  };
  lastUpdated: string;
}

export interface Meal {
  id: string;
  name: string;
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  timestamp: string;
  imageUrl?: string;
}

interface NutritionContextType {
  nutritionData: NutritionData;
  todaysMeals: Meal[];
  addMeal: (meal: Meal) => void;
  removeMeal: (mealId: string) => void;
  resetDailyNutrition: () => void;
  updateNutritionTargets: (targets: { calories: number, protein: number, carbs: number, fat: number }) => void;
  getRemaining: (nutrient: 'calories' | MacroNutrient) => number;
  getPercentage: (nutrient: 'calories' | MacroNutrient) => number;
}

// Default nutrition targets (can be customized by user later)
const DEFAULT_NUTRITION_TARGETS = {
  calories: 2000,
  protein: 150, // grams
  carbs: 200, // grams
  fat: 65, // grams
};

// Create the context with a default empty value
const NutritionContext = createContext<NutritionContextType | undefined>(undefined);

export const NutritionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or defaults
  const [nutritionData, setNutritionData] = useState<NutritionData>(() => {
    const savedData = localStorage.getItem('nutritionData');
    
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      
      // Check if the data is from today
      const today = new Date().toISOString().split('T')[0];
      if (parsedData.lastUpdated && parsedData.lastUpdated.startsWith(today)) {
        return parsedData;
      }
    }
    
    // Return default data if no saved data or not from today
    return {
      calories: { consumed: 0, target: DEFAULT_NUTRITION_TARGETS.calories },
      protein: { consumed: 0, target: DEFAULT_NUTRITION_TARGETS.protein },
      carbs: { consumed: 0, target: DEFAULT_NUTRITION_TARGETS.carbs },
      fat: { consumed: 0, target: DEFAULT_NUTRITION_TARGETS.fat },
      lastUpdated: new Date().toISOString()
    };
  });
  
  // Initialize meals state
  const [todaysMeals, setTodaysMeals] = useState<Meal[]>(() => {
    const savedMeals = localStorage.getItem('todaysMeals');
    
    if (savedMeals) {
      const parsedMeals = JSON.parse(savedMeals);
      
      // Check if the meals are from today
      const today = new Date().toISOString().split('T')[0];
      const allFromToday = parsedMeals.every((meal: Meal) => 
        meal.timestamp && meal.timestamp.startsWith(today)
      );
      
      if (allFromToday) {
        return parsedMeals;
      }
    }
    
    return [];
  });

  // Save nutrition data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('nutritionData', JSON.stringify(nutritionData));
  }, [nutritionData]);
  
  // Save meals to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('todaysMeals', JSON.stringify(todaysMeals));
  }, [todaysMeals]);

  // Add a new meal and update nutrition totals
  const addMeal = (meal: Meal) => {
    setTodaysMeals(prev => [...prev, meal]);
    
    setNutritionData(prev => ({
      ...prev,
      calories: { 
        ...prev.calories,
        consumed: prev.calories.consumed + meal.calories 
      },
      protein: { 
        ...prev.protein,
        consumed: prev.protein.consumed + meal.protein 
      },
      carbs: { 
        ...prev.carbs,
        consumed: prev.carbs.consumed + meal.carbs 
      },
      fat: { 
        ...prev.fat,
        consumed: prev.fat.consumed + meal.fat 
      },
      lastUpdated: new Date().toISOString()
    }));
  };
  
  // Remove a meal and update nutrition totals
  const removeMeal = (mealId: string) => {
    const mealToRemove = todaysMeals.find(meal => meal.id === mealId);
    
    if (!mealToRemove) return;
    
    setTodaysMeals(prev => prev.filter(meal => meal.id !== mealId));
    
    setNutritionData(prev => ({
      ...prev,
      calories: { 
        ...prev.calories,
        consumed: Math.max(0, prev.calories.consumed - mealToRemove.calories)
      },
      protein: { 
        ...prev.protein,
        consumed: Math.max(0, prev.protein.consumed - mealToRemove.protein)
      },
      carbs: { 
        ...prev.carbs,
        consumed: Math.max(0, prev.carbs.consumed - mealToRemove.carbs)
      },
      fat: { 
        ...prev.fat,
        consumed: Math.max(0, prev.fat.consumed - mealToRemove.fat)
      },
      lastUpdated: new Date().toISOString()
    }));
  };
  
  // Reset nutrition data for a new day
  const resetDailyNutrition = () => {
    setNutritionData({
      calories: { consumed: 0, target: nutritionData.calories.target },
      protein: { consumed: 0, target: nutritionData.protein.target },
      carbs: { consumed: 0, target: nutritionData.carbs.target },
      fat: { consumed: 0, target: nutritionData.fat.target },
      lastUpdated: new Date().toISOString()
    });
    setTodaysMeals([]);
  };
  
  // Update nutrition targets
  const updateNutritionTargets = (targets: { 
    calories: number, 
    protein: number, 
    carbs: number, 
    fat: number 
  }) => {
    setNutritionData(prev => ({
      ...prev,
      calories: { ...prev.calories, target: targets.calories },
      protein: { ...prev.protein, target: targets.protein },
      carbs: { ...prev.carbs, target: targets.carbs },
      fat: { ...prev.fat, target: targets.fat },
      lastUpdated: prev.lastUpdated
    }));
  };
  
  // Calculate remaining nutrients
  const getRemaining = (nutrient: 'calories' | MacroNutrient): number => {
    const { consumed, target } = nutritionData[nutrient];
    return Math.max(0, target - consumed);
  };
  
  // Calculate percentage of target consumed
  const getPercentage = (nutrient: 'calories' | MacroNutrient): number => {
    const { consumed, target } = nutritionData[nutrient];
    if (target === 0) return 0;
    return Math.min(100, Math.round((consumed / target) * 100));
  };

  // Check if it's a new day and reset if needed
  useEffect(() => {
    const checkForNewDay = () => {
      const today = new Date().toISOString().split('T')[0];
      const lastUpdatedDay = nutritionData.lastUpdated.split('T')[0];
      
      if (today !== lastUpdatedDay) {
        resetDailyNutrition();
      }
    };
    
    // Check on component mount
    checkForNewDay();
    
    // Check periodically (every hour)
    const interval = setInterval(checkForNewDay, 3600000);
    
    return () => clearInterval(interval);
  }, [nutritionData.lastUpdated]);

  return (
    <NutritionContext.Provider 
      value={{
        nutritionData,
        todaysMeals,
        addMeal,
        removeMeal,
        resetDailyNutrition,
        updateNutritionTargets,
        getRemaining,
        getPercentage
      }}
    >
      {children}
    </NutritionContext.Provider>
  );
};

export const useNutrition = (): NutritionContextType => {
  const context = useContext(NutritionContext);
  
  if (context === undefined) {
    throw new Error('useNutrition must be used within a NutritionProvider');
  }
  
  return context;
};
