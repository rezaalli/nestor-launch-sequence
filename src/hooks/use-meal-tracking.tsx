
import { useState } from 'react';
import { useNutrition, Meal } from '@/contexts/NutritionContext';
import { v4 as uuidv4 } from 'uuid';

export interface MealFormData {
  mealType: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
  mealName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  imageUrl?: string;
  notes?: string;
}

export function useMealTracking() {
  const { addMeal, removeMeal, todaysMeals } = useNutrition();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddMeal = async (data: MealFormData) => {
    setIsSubmitting(true);
    
    try {
      const newMeal: Meal = {
        id: uuidv4(),
        name: data.mealName,
        mealType: data.mealType,
        calories: data.calories,
        protein: data.protein,
        carbs: data.carbs,
        fat: data.fat,
        timestamp: new Date().toISOString(),
        imageUrl: data.imageUrl
      };
      
      addMeal(newMeal);
      return true;
    } catch (error) {
      console.error('Error adding meal:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMeal = (mealId: string) => {
    try {
      removeMeal(mealId);
      return true;
    } catch (error) {
      console.error('Error removing meal:', error);
      return false;
    }
  };
  
  return {
    addMeal: handleAddMeal,
    removeMeal: handleRemoveMeal,
    todaysMeals,
    isSubmitting
  };
}
