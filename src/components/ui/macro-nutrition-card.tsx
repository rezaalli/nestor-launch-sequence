import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Utensils, Flame, Cookie, Droplet, Egg } from "lucide-react";
import { Progress } from "./progress";

export interface MacroNutritionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  calories: {
    consumed: number;
    target?: number;
  };
  protein: {
    consumed: number;
    target?: number;
  };
  carbs: {
    consumed: number;
    target?: number;
  };
  fat: {
    consumed: number;
    target?: number;
  };
  isLoading?: boolean;
  isNew?: boolean;
  updated?: boolean;
}

const MacroNutritionCard = React.forwardRef<HTMLDivElement, MacroNutritionCardProps>(
  ({ 
    className, 
    calories,
    protein,
    carbs,
    fat,
    isLoading = false,
    isNew = false,
    updated = false,
    ...props 
  }, ref) => {
    const [showAnimation, setShowAnimation] = React.useState(updated);

    // Calculate percentages for progress bars
    const calculatePercentage = (consumed: number, target?: number) => {
      if (!target) return 100; // If no target, show as 100%
      return Math.min(Math.round((consumed / target) * 100), 100);
    };

    // Format values for display
    const formatValue = (consumed: number, target?: number) => {
      if (target) {
        return `${Math.round(consumed)}/${target}`;
      }
      return `${Math.round(consumed)}`;
    };

    // Disable animation after it plays
    React.useEffect(() => {
      if (showAnimation) {
        const timer = setTimeout(() => {
          setShowAnimation(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }, [showAnimation]);

    // Handle update animation
    React.useEffect(() => {
      if (updated) {
        setShowAnimation(true);
      }
    }, [updated]);

    return (
      <div
        ref={ref}
        className={cn(
          "nestor-card p-4 transition-all duration-300",
          className
        )}
        {...props}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center mr-2 bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
              <Utensils className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-neutral-600 flex items-center dark:text-neutral-300">
                Nutrition & Macros
                {isNew && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-2 px-1.5 py-0.5 bg-brand-blue-100 text-brand-blue-800 rounded text-[10px] font-medium dark:bg-brand-blue-900 dark:text-brand-blue-300"
                  >
                    NEW
                  </motion.div>
                )}
              </h3>
            </div>
          </div>

          <div className="text-xs font-semibold text-neutral-600 dark:text-neutral-400">
            {calories.target ? `${Math.round((calories.consumed / calories.target) * 100)}%` : 'No Goal Set'}
          </div>
        </div>

        {/* Calories Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <Flame className="w-3.5 h-3.5 mr-1.5 text-orange-500 dark:text-orange-400" />
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Calories</span>
            </div>
            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
              {formatValue(calories.consumed, calories.target)}
              <span className="text-neutral-400 dark:text-neutral-500 ml-1">kcal</span>
            </span>
          </div>
          <Progress 
            value={calculatePercentage(calories.consumed, calories.target)} 
            thickness="thick"
            className="h-2.5" 
            indicatorColor="bg-gradient-to-r from-orange-400 to-orange-500 dark:from-orange-500 dark:to-orange-400"
          />
        </div>

        {/* Macronutrients */}
        <div className="space-y-3">
          {/* Protein Bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <Egg className="w-3.5 h-3.5 mr-1.5 text-purple-500 dark:text-purple-400" />
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Protein</span>
              </div>
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {formatValue(protein.consumed, protein.target)}
                <span className="text-neutral-400 dark:text-neutral-500 ml-1">g</span>
              </span>
            </div>
            <Progress 
              value={calculatePercentage(protein.consumed, protein.target)} 
              className="h-2" 
              indicatorColor="bg-purple-500 dark:bg-purple-400"
            />
          </div>

          {/* Carbs Bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <Cookie className="w-3.5 h-3.5 mr-1.5 text-blue-500 dark:text-blue-400" />
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Carbs</span>
              </div>
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {formatValue(carbs.consumed, carbs.target)}
                <span className="text-neutral-400 dark:text-neutral-500 ml-1">g</span>
              </span>
            </div>
            <Progress 
              value={calculatePercentage(carbs.consumed, carbs.target)} 
              className="h-2" 
              indicatorColor="bg-blue-500 dark:bg-blue-400"
            />
          </div>

          {/* Fats Bar */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                <Droplet className="w-3.5 h-3.5 mr-1.5 text-yellow-500 dark:text-yellow-400" />
                <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300">Fats</span>
              </div>
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                {formatValue(fat.consumed, fat.target)}
                <span className="text-neutral-400 dark:text-neutral-500 ml-1">g</span>
              </span>
            </div>
            <Progress 
              value={calculatePercentage(fat.consumed, fat.target)} 
              className="h-2" 
              indicatorColor="bg-yellow-500 dark:bg-yellow-400"
            />
          </div>
        </div>

        {showAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="absolute top-1 right-1"
          >
            <div className="h-4 w-4 text-brand-blue-500">✨</div>
          </motion.div>
        )}
      </div>
    );
  }
);

MacroNutritionCard.displayName = "MacroNutritionCard";

export { MacroNutritionCard }; 