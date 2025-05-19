import React from 'react';
import AddMealModal from './AddMealModal';
import { useMealTracking, MealFormData } from '@/hooks/use-meal-tracking';
import { useToast } from '@/hooks/use-toast';

interface AddMealModalWrapperProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
}

const AddMealModalWrapper: React.FC<AddMealModalWrapperProps> = ({ 
  open, 
  onOpenChange,
  onClose
}) => {
  const { addMeal, isSubmitting } = useMealTracking();
  const { toast } = useToast();
  
  // Handle legacy onClose prop
  const isOpen = open !== undefined ? open : true;
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else if (!newOpen && onClose) {
      onClose();
    }
  };

  const handleSave = async (mealData: MealFormData) => {
    const success = await addMeal(mealData);
    
    if (success) {
      toast({
        title: "Meal added",
        description: `${mealData.mealName || mealData.mealType} has been added to your log.`,
      });
      
      handleOpenChange(false); // Close modal on success
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
      open={isOpen} 
      onOpenChange={handleOpenChange} 
      onSave={handleSave}
      isSubmitting={isSubmitting}
    />
  );
};

export default AddMealModalWrapper;
