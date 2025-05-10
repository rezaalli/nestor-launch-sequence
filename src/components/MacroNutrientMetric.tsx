
import React from 'react';
import { Utensils, Flame } from 'lucide-react';
import { useNutrition } from '@/contexts/NutritionContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MacroNutrientMetricProps {
  className?: string;
  showDragHandle?: boolean;
  onDragHandleClick?: () => void;
  // The id prop isn't needed since we're not using it
}

const MacroNutrientMetric = ({ 
  className,
  showDragHandle = false,
  onDragHandleClick
}: MacroNutrientMetricProps) => {
  const { nutritionData, getRemaining, getPercentage } = useNutrition();
  
  // Create a function to format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 });
  };
  
  // Calculate remaining calories
  const remainingCalories = getRemaining('calories');
  const caloriePercentage = getPercentage('calories');
  
  // Calculate remaining macros
  const remainingProtein = getRemaining('protein');
  const remainingCarbs = getRemaining('carbs');
  const remainingFat = getRemaining('fat');
  
  return (
    <div className={cn("p-4 bg-white border border-gray-200 rounded-xl relative", className)}>
      {showDragHandle && (
        <button 
          className="absolute top-2 right-2 text-gray-400 cursor-move"
          onClick={onDragHandleClick}
        >
          <svg width="14" height="14" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M5.5 4.625C5.5 5.06 5.14 5.42 4.705 5.42C4.27 5.42 3.91 5.06 3.91 4.625C3.91 4.19 4.27 3.83 4.705 3.83C5.14 3.83 5.5 4.19 5.5 4.625ZM5.5 10.375C5.5 10.81 5.14 11.17 4.705 11.17C4.27 11.17 3.91 10.81 3.91 10.375C3.91 9.94 4.27 9.58 4.705 9.58C5.14 9.58 5.5 9.94 5.5 10.375ZM10.295 5.42C10.73 5.42 11.09 5.06 11.09 4.625C11.09 4.19 10.73 3.83 10.295 3.83C9.86 3.83 9.5 4.19 9.5 4.625C9.5 5.06 9.86 5.42 10.295 5.42ZM11.09 10.375C11.09 10.81 10.73 11.17 10.295 11.17C9.86 11.17 9.5 10.81 9.5 10.375C9.5 9.94 9.86 9.58 10.295 9.58C10.73 9.58 11.09 9.94 11.09 10.375Z" stroke="currentColor" fillRule="evenodd" clipRule="evenodd"/>
          </svg>
        </button>
      )}
      
      <div className="flex items-center mb-3">
        <Flame className="text-orange-500 mr-2" size={18} />
        <span className="text-sm font-medium text-gray-700">Nutrition</span>
      </div>
      
      {/* Calories Display */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600">Remaining Calories</span>
          <Badge variant="calories" size="sm">
            {formatNumber(remainingCalories)} kcal
          </Badge>
        </div>
        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-green-500 rounded-full" 
            style={{ width: `${caloriePercentage}%` }}
          />
        </div>
      </div>
      
      {/* Macronutrients Display */}
      <div className="space-y-2.5">
        {/* Protein */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Protein</span>
            <Badge variant="protein" size="sm">
              {remainingProtein}g left
            </Badge>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full" 
              style={{ width: `${getPercentage('protein')}%` }}
            />
          </div>
        </div>
        
        {/* Carbs */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Carbs</span>
            <Badge variant="carbs" size="sm">
              {remainingCarbs}g left
            </Badge>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-yellow-500 rounded-full" 
              style={{ width: `${getPercentage('carbs')}%` }}
            />
          </div>
        </div>
        
        {/* Fat */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-600">Fat</span>
            <Badge variant="fat" size="sm">
              {remainingFat}g left
            </Badge>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-500 rounded-full" 
              style={{ width: `${getPercentage('fat')}%` }}
            />
          </div>
        </div>
      </div>
      
      <div className="mt-3 text-xs text-gray-500 flex items-center">
        <Utensils className="mr-1" size={12} />
        <span>Based on today's meals</span>
      </div>
    </div>
  );
};

export default MacroNutrientMetric;
