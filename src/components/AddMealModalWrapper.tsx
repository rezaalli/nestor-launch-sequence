
import React from 'react';
import AddMealModal from './AddMealModal';
import { useMealTracking, MealFormData } from '@/hooks/use-meal-tracking';
import { useToast } from '@/hooks/use-toast';

interface AddMealModalWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Remove the onSave prop since we handle that internally
}

const AddMealModalWrapper: React.FC<AddMealModalWrapperProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { addMeal, isSubmitting } = useMealTracking();
  const { toast } = useToast();

  const handleSave = async (mealData: MealFormData) => {
    const success = await addMeal(mealData);
    
    if (success) {
      toast({
        title: "Meal added",
        description: `${mealData.mealName || mealData.mealType} has been added to your log.`,
      });
      
      onOpenChange(false); // Close modal on success
      return true;
    } else {
      toast({
        title: "Error adding meal",
        description: "There was a problem adding your meal. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  return (
    <AddMealModal 
      open={open} 
      onOpenChange={onOpenChange} 
      onSave={handleSave}
      isSubmitting={isSubmitting}
    />
  );
};

export default AddMealModalWrapper;
