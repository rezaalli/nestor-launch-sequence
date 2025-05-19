import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, X, Search, Coffee, Utensils, Pizza, Apple, 
  MoreHorizontal, Edit, Camera, ChevronRight, ChevronDown,
  BarChart, ArrowRight, Check, Sparkles, Clock, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { variants, easings } from '@/styles/motion';

// Define meal and food types
interface NutritionInfo {
  calories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  fiber?: number; // in grams
  sugar?: number; // in grams
  sodium?: number; // in mg
}

interface FoodItem {
  id: string;
  name: string;
  brand?: string;
  servingSize: string;
  nutrition: NutritionInfo;
  image?: string;
  isFavorite?: boolean;
  isCommon?: boolean;
}

interface MealEntry {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  time: string; // ISO string
  foods: Array<{
    food: FoodItem;
    quantity: number;
  }>;
}

// Sample food data
const commonFoods: FoodItem[] = [
  {
    id: 'f1',
    name: 'Banana',
    servingSize: '1 medium (118g)',
    nutrition: {
      calories: 105,
      protein: 1.3,
      carbs: 27,
      fat: 0.4,
      fiber: 3.1,
      sugar: 14.4
    },
    isCommon: true,
    image: 'https://via.placeholder.com/100/FFDD80/000000?text=🍌'
  },
  {
    id: 'f2',
    name: 'Greek Yogurt',
    brand: 'Fage',
    servingSize: '3/4 cup (170g)',
    nutrition: {
      calories: 100,
      protein: 18,
      carbs: 5,
      fat: 0.7,
      sugar: 5
    },
    isFavorite: true,
    image: 'https://via.placeholder.com/100/FFFFFF/000000?text=🥛'
  },
  {
    id: 'f3',
    name: 'Chicken Breast',
    servingSize: '3 oz (85g)',
    nutrition: {
      calories: 128,
      protein: 26,
      carbs: 0,
      fat: 2.7,
      sodium: 44
    },
    isFavorite: true,
    image: 'https://via.placeholder.com/100/F5DEB3/000000?text=🍗'
  },
  {
    id: 'f4',
    name: 'Whole Wheat Bread',
    brand: 'Dave\'s Killer Bread',
    servingSize: '1 slice (45g)',
    nutrition: {
      calories: 110,
      protein: 5,
      carbs: 22,
      fat: 1.5,
      fiber: 5,
      sugar: 5
    },
    image: 'https://via.placeholder.com/100/D2B48C/000000?text=🍞'
  },
  {
    id: 'f5',
    name: 'Avocado',
    servingSize: '1/2 medium (68g)',
    nutrition: {
      calories: 114,
      protein: 1.3,
      carbs: 6,
      fat: 10.5,
      fiber: 5
    },
    isCommon: true,
    image: 'https://via.placeholder.com/100/568203/FFFFFF?text=🥑'
  },
  {
    id: 'f6',
    name: 'Eggs',
    servingSize: '1 large (50g)',
    nutrition: {
      calories: 72,
      protein: 6.3,
      carbs: 0.4,
      fat: 5,
      sodium: 71
    },
    isCommon: true,
    isFavorite: true,
    image: 'https://via.placeholder.com/100/FFFACD/000000?text=🥚'
  },
  {
    id: 'f7',
    name: 'Oatmeal',
    brand: 'Quaker',
    servingSize: '1/2 cup dry (40g)',
    nutrition: {
      calories: 150,
      protein: 5,
      carbs: 27,
      fat: 2.5,
      fiber: 4,
      sugar: 1
    },
    image: 'https://via.placeholder.com/100/D2B48C/000000?text=🥣'
  }
];

// Sample meal data
const sampleMeals: MealEntry[] = [
  {
    id: 'm1',
    type: 'breakfast',
    time: new Date(new Date().setHours(8, 30)).toISOString(),
    foods: [
      {
        food: commonFoods[1], // Greek Yogurt
        quantity: 1
      },
      {
        food: commonFoods[0], // Banana
        quantity: 1
      },
      {
        food: commonFoods[6], // Oatmeal
        quantity: 0.5
      }
    ]
  },
  {
    id: 'm2',
    type: 'lunch',
    time: new Date(new Date().setHours(13, 0)).toISOString(),
    foods: [
      {
        food: commonFoods[2], // Chicken Breast
        quantity: 1.5
      },
      {
        food: commonFoods[3], // Whole Wheat Bread
        quantity: 2
      },
      {
        food: commonFoods[4], // Avocado
        quantity: 0.5
      }
    ]
  },
  {
    id: 'm3',
    type: 'snack',
    time: new Date(new Date().setHours(16, 0)).toISOString(),
    foods: [
      {
        food: commonFoods[0], // Banana
        quantity: 1
      }
    ]
  }
];

// Meal icon mapping
const MealIcon = ({ type, className = "w-4 h-4" }: { type: MealEntry['type'], className?: string }) => {
  switch (type) {
    case 'breakfast':
      return <Coffee className={className} />;
    case 'lunch':
      return <Utensils className={className} />;
    case 'dinner':
      return <Pizza className={className} />;
    case 'snack':
      return <Apple className={className} />;
  }
};

// Meal color mapping
const getMealColor = (type: MealEntry['type']) => {
  switch (type) {
    case 'breakfast':
      return 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400';
    case 'lunch':
      return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400';
    case 'dinner':
      return 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400';
    case 'snack':
      return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400';
  }
};

// Calculate total nutrition for a meal
const calculateMealNutrition = (meal: MealEntry): NutritionInfo => {
  return meal.foods.reduce((totals, { food, quantity }) => {
    return {
      calories: totals.calories + (food.nutrition.calories * quantity),
      protein: totals.protein + (food.nutrition.protein * quantity),
      carbs: totals.carbs + (food.nutrition.carbs * quantity),
      fat: totals.fat + (food.nutrition.fat * quantity),
      fiber: (totals.fiber || 0) + ((food.nutrition.fiber || 0) * quantity),
      sugar: (totals.sugar || 0) + ((food.nutrition.sugar || 0) * quantity),
      sodium: (totals.sodium || 0) + ((food.nutrition.sodium || 0) * quantity)
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 });
};

// Calculate daily nutrition totals
const calculateDailyNutrition = (meals: MealEntry[]): NutritionInfo => {
  return meals.reduce((totals, meal) => {
    const mealNutrition = calculateMealNutrition(meal);
    return {
      calories: totals.calories + mealNutrition.calories,
      protein: totals.protein + mealNutrition.protein,
      carbs: totals.carbs + mealNutrition.carbs,
      fat: totals.fat + mealNutrition.fat,
      fiber: (totals.fiber || 0) + (mealNutrition.fiber || 0),
      sugar: (totals.sugar || 0) + (mealNutrition.sugar || 0),
      sodium: (totals.sodium || 0) + (mealNutrition.sodium || 0)
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0 });
};

interface MealLoggerProps {
  onAddMeal?: (meal: Omit<MealEntry, 'id'>) => void;
  onDeleteMeal?: (id: string) => void;
}

const MealLogger: React.FC<MealLoggerProps> = ({
  onAddMeal,
  onDeleteMeal
}) => {
  const [meals, setMeals] = useState<MealEntry[]>(sampleMeals);
  const [addMealOpen, setAddMealOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMeal, setExpandedMeal] = useState<string | null>(null);
  const [newMeal, setNewMeal] = useState<Partial<MealEntry>>({
    type: 'breakfast',
    time: new Date().toISOString(),
    foods: [],
  });
  const [selectedFoods, setSelectedFoods] = useState<Array<{ food: FoodItem, quantity: number }>>([]);
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [addFoodDialogOpen, setAddFoodDialogOpen] = useState(false);
  const [customFoodDialogOpen, setCustomFoodDialogOpen] = useState(false);
  const [customFood, setCustomFood] = useState<Partial<FoodItem>>({
    name: '',
    servingSize: '1 serving',
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    }
  });
  const [showAdditionalNutrition, setShowAdditionalNutrition] = useState(false);
  const [customFoodImage, setCustomFoodImage] = useState<string | null>(null);
  
  // Daily nutrition goals
  const nutritionGoals = {
    calories: 2000,
    protein: 120, // in grams
    carbs: 200, // in grams
    fat: 65, // in grams
  };
  
  // Calculate daily nutrition
  const dailyNutrition = calculateDailyNutrition(meals);
  
  // Handle search for foods
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (!term.trim()) {
      // Show favorites and common foods when no search term
      setSearchResults(commonFoods.filter(food => food.isFavorite || food.isCommon));
      return;
    }
    
    // Filter foods based on search term
    const results = commonFoods.filter(
      food => food.name.toLowerCase().includes(term.toLowerCase()) ||
              (food.brand && food.brand.toLowerCase().includes(term.toLowerCase()))
    );
    setSearchResults(results);
  };
  
  // Initialize search results with common/favorite foods
  React.useEffect(() => {
    handleSearch('');
  }, []);
  
  const handleAddMeal = () => {
    if (selectedFoods.length === 0) return;
    
    const mealToAdd = {
      ...newMeal,
      id: `meal-${Date.now()}`,
      foods: selectedFoods,
    } as MealEntry;
    
    setMeals(prev => [...prev, mealToAdd]);
    if (onAddMeal) onAddMeal(mealToAdd);
    
    // Reset form and close dialog
    setNewMeal({
      type: 'breakfast',
      time: new Date().toISOString(),
      foods: [],
    });
    setSelectedFoods([]);
    setAddMealOpen(false);
  };
  
  const handleDeleteMeal = (id: string) => {
    setMeals(prev => prev.filter(meal => meal.id !== id));
    if (onDeleteMeal) onDeleteMeal(id);
  };
  
  const handleSelectFood = (food: FoodItem) => {
    const existingIndex = selectedFoods.findIndex(item => item.food.id === food.id);
    
    if (existingIndex >= 0) {
      // Update quantity if already selected
      const updatedFoods = [...selectedFoods];
      updatedFoods[existingIndex].quantity += 1;
      setSelectedFoods(updatedFoods);
    } else {
      // Add new food
      setSelectedFoods(prev => [...prev, { food, quantity: 1 }]);
    }
    
    setAddFoodDialogOpen(false);
  };
  
  const handleUpdateFoodQuantity = (foodId: string, quantity: number) => {
    setSelectedFoods(prev => 
      prev.map(item => 
        item.food.id === foodId 
          ? { ...item, quantity: Math.max(0.1, quantity) } 
          : item
      )
    );
  };
  
  const handleRemoveFood = (foodId: string) => {
    setSelectedFoods(prev => prev.filter(item => item.food.id !== foodId));
  };
  
  const handleAddCustomFood = () => {
    if (!customFood.name) return;
    
    // Calculate calories if not provided based on macros
    if (!customFood.nutrition.calories && (customFood.nutrition.protein || customFood.nutrition.carbs || customFood.nutrition.fat)) {
      const calculatedCalories = 
        (customFood.nutrition.protein || 0) * 4 +
        (customFood.nutrition.carbs || 0) * 4 +
        (customFood.nutrition.fat || 0) * 9;
      
      customFood.nutrition.calories = Math.round(calculatedCalories);
    }
    
    const newFood: FoodItem = {
      id: `custom-${Date.now()}`,
      name: customFood.name,
      brand: customFood.brand,
      servingSize: customFood.servingSize || '1 serving',
      nutrition: customFood.nutrition as NutritionInfo,
      isFavorite: true,
      image: customFoodImage || undefined
    };
    
    // Add to common foods and select it
    commonFoods.push(newFood);
    handleSelectFood(newFood);
    
    // Reset custom food form
    setCustomFood({
      name: '',
      servingSize: '1 serving',
      nutrition: {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0
      }
    });
    setShowAdditionalNutrition(false);
    setCustomFoodImage(null);
    setCustomFoodDialogOpen(false);
  };
  
  // Handle image upload (simulated)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, you would upload this to a server
      // Here we'll create a temporary URL
      const imageUrl = URL.createObjectURL(file);
      setCustomFoodImage(imageUrl);
    }
  };
  
  // Direct handler for opening custom food dialog
  const handleOpenCustomFood = () => {
    console.log('DIRECT OPEN: Opening custom food dialog');
    // First close the add food dialog
    setAddFoodDialogOpen(false);
    
    // Then wait for React to process that state change
    window.setTimeout(() => {
      console.log('DIRECT OPEN: Now opening custom food dialog');
      setCustomFoodDialogOpen(true);
    }, 500); // Longer timeout for safety
  };
  
  // Add this to ensure the component renders
  React.useEffect(() => {
    // Force Custom Entry button to be visible
    const customEntryButton = document.getElementById('force-custom-entry');
    if (customEntryButton) {
      customEntryButton.style.display = 'block';
    }
  }, []);
  
  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
      {/* Emergency Custom Entry Button */}
      <button
        id="force-custom-entry"
        type="button" 
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg"
        onClick={() => {
          // Direct state setting with no dependencies on other dialog state
          setCustomFoodDialogOpen(true);
        }}
      >
        <Plus className="h-6 w-6" />
      </button>
      
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center">
          <Utensils className="w-5 h-5 mr-2 text-blue-500 dark:text-blue-400" />
          Meal Tracker
        </h3>
        <Button 
          size="sm"
          onClick={() => setAddMealOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow"
        >
          <Plus className="w-4 h-4 mr-1" />
          Log Meal
        </Button>
      </div>
      
      {/* Daily Macros Summary - ENHANCED with cleaner display and more distinct styling */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50 dark:bg-slate-900/60">
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center">
            <BarChart className="w-4 h-4 mr-1.5 text-blue-500 dark:text-blue-400" />
            Today's Nutrition
          </h4>
          <div className="flex items-center text-sm">
            <span className="font-bold text-slate-800 dark:text-slate-200">{Math.round(dailyNutrition.calories)}</span>
            <span className="text-slate-500 dark:text-slate-400 mx-1">/</span>
            <span className="text-slate-600 dark:text-slate-400">{nutritionGoals.calories}</span>
            <span className="text-slate-500 dark:text-slate-400 ml-1 font-medium">cal</span>
          </div>
        </div>
        
        {/* Main calorie progress bar - ENHANCED */}
        <div className="relative mb-5">
          <Progress 
            value={(dailyNutrition.calories / nutritionGoals.calories) * 100} 
            thickness="thick"
            className="h-2.5 mb-1" 
            indicatorColor="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-500"
            showValue
            valuePosition="top"
            valueClassName="text-blue-600 dark:text-blue-400"
          />
          <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-500 mt-0.5 px-1">
            <span>0</span>
            <span className="flex items-center">
              <span className="h-1.5 w-1.5 bg-blue-500 rounded-full mr-1"></span>
              Calories
            </span>
            <span>{nutritionGoals.calories}</span>
          </div>
        </div>
        
        {/* Macronutrient grid - ENHANCED with better styling and labels */}
        <div className="grid grid-cols-3 gap-3">
          {/* Protein Card */}
          <div className="rounded-md bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/20 p-3 border border-blue-200 dark:border-blue-900/40 shadow-sm">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400 mr-1.5"></div>
                <span className="text-xs font-semibold text-blue-700 dark:text-blue-300">Protein</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{Math.round(dailyNutrition.protein)}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-0.5">/ {nutritionGoals.protein}g</span>
              </div>
            </div>
            <Progress 
              value={(dailyNutrition.protein / nutritionGoals.protein) * 100} 
              className="h-1.5" 
              indicatorColor="bg-blue-500 dark:bg-blue-400"
            />
          </div>
          
          {/* Carbs Card */}
          <div className="rounded-md bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-900/20 p-3 border border-green-200 dark:border-green-900/40 shadow-sm">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 dark:bg-green-400 mr-1.5"></div>
                <span className="text-xs font-semibold text-green-700 dark:text-green-300">Carbs</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{Math.round(dailyNutrition.carbs)}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-0.5">/ {nutritionGoals.carbs}g</span>
              </div>
            </div>
            <Progress 
              value={(dailyNutrition.carbs / nutritionGoals.carbs) * 100} 
              className="h-1.5" 
              indicatorColor="bg-green-500 dark:bg-green-400"
            />
          </div>
          
          {/* Fats Card */}
          <div className="rounded-md bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/30 dark:to-amber-900/20 p-3 border border-amber-200 dark:border-amber-900/40 shadow-sm">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-amber-500 dark:bg-amber-400 mr-1.5"></div>
                <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Fats</span>
              </div>
              <div className="flex items-baseline">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{Math.round(dailyNutrition.fat)}</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 ml-0.5">/ {nutritionGoals.fat}g</span>
              </div>
            </div>
            <Progress 
              value={(dailyNutrition.fat / nutritionGoals.fat) * 100} 
              className="h-1.5" 
              indicatorColor="bg-amber-500 dark:bg-amber-400"
            />
          </div>
        </div>
      </div>
      
      {/* Meals List */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-3">
        {meals.length > 0 ? (
          meals.map(meal => (
            <motion.div
              key={meal.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-sm"
            >
              <div 
                className="flex items-center p-3 cursor-pointer"
                onClick={() => setExpandedMeal(expandedMeal === meal.id ? null : meal.id)}
              >
                <div className={`p-2 rounded-full mr-3 ${getMealColor(meal.type)}`}>
                  <MealIcon type={meal.type} />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-800 dark:text-slate-200 capitalize">
                      {meal.type}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {format(new Date(meal.time), 'h:mm a')}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-1">
                    <div className="text-slate-800 dark:text-slate-200 text-sm font-medium">
                      {Math.round(calculateMealNutrition(meal).calories)} cal
                    </div>
                    
                    <div className="flex items-center text-slate-500 dark:text-slate-400 text-xs gap-1">
                      <span>P: {Math.round(calculateMealNutrition(meal).protein)}g</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span>C: {Math.round(calculateMealNutrition(meal).carbs)}g</span>
                      <span className="text-slate-300 dark:text-slate-600">•</span>
                      <span>F: {Math.round(calculateMealNutrition(meal).fat)}g</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-7 w-7 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteMeal(meal.id);
                    }}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                  {expandedMeal === meal.id ? (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              </div>
              
              {/* Expanded food details */}
              <AnimatePresence>
                {expandedMeal === meal.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-t border-slate-100 dark:border-slate-700 px-3 pb-3"
                  >
                    <div className="space-y-2 mt-2">
                      {meal.foods.map(({ food, quantity }) => (
                        <div 
                          key={food.id}
                          className="flex items-center bg-slate-50 dark:bg-slate-700/50 p-2 rounded-md"
                        >
                          {food.image && (
                            <div className="w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                              <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1">
                              <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                                {food.name}
                              </h4>
                              {food.brand && (
                                <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                  ({food.brand})
                                </span>
                              )}
                            </div>
                            
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {quantity} × {food.servingSize}
                            </div>
                          </div>
                          
                          <div className="text-right text-xs">
                            <div className="font-medium text-slate-800 dark:text-slate-200">
                              {Math.round(food.nutrition.calories * quantity)} cal
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 text-[10px] mt-0.5">
                              P: {(food.nutrition.protein * quantity).toFixed(1)}g • 
                              C: {(food.nutrition.carbs * quantity).toFixed(1)}g • 
                              F: {(food.nutrition.fat * quantity).toFixed(1)}g
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center text-slate-500 dark:text-slate-400">
            <Utensils className="w-12 h-12 opacity-20 mb-3" />
            <p className="text-sm">No meals logged today</p>
            <p className="text-xs mt-1">Start tracking your nutrition</p>
            <Button 
              onClick={() => setAddMealOpen(true)}
              className="mt-4"
              variant="outline"
              size="sm"
            >
              Log Meal
            </Button>
          </div>
        )}
      </div>
      
      {/* Add Meal Dialog */}
      <Dialog open={addMealOpen} onOpenChange={setAddMealOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Log Meal</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Meal Type
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(type => (
                  <div
                    key={type}
                    className={`
                      flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer border
                      ${newMeal.type === type 
                        ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}
                    `}
                    onClick={() => setNewMeal(prev => ({ ...prev, type }))}
                  >
                    <div className={`p-2 rounded-full ${getMealColor(type)}`}>
                      <MealIcon type={type} />
                    </div>
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">
                      {type}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={format(new Date(newMeal.time || new Date()), 'yyyy-MM-dd')}
                    onChange={e => {
                      const date = new Date(e.target.value);
                      const currentTime = new Date(newMeal.time || new Date());
                      date.setHours(currentTime.getHours(), currentTime.getMinutes());
                      setNewMeal(prev => ({ ...prev, time: date.toISOString() }));
                    }}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Time
                  </label>
                  <Input
                    type="time"
                    value={format(new Date(newMeal.time || new Date()), 'HH:mm')}
                    onChange={e => {
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      const date = new Date(newMeal.time || new Date());
                      date.setHours(hours, minutes);
                      setNewMeal(prev => ({ ...prev, time: date.toISOString() }));
                    }}
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block flex justify-between">
                <span>Foods</span>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs"
                  onClick={() => setAddFoodDialogOpen(true)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add Food
                </Button>
              </label>
              
              <div className="border border-slate-200 dark:border-slate-700 rounded-md p-3 bg-slate-50 dark:bg-slate-800/50 min-h-[120px]">
                {selectedFoods.length > 0 ? (
                  <div className="space-y-2">
                    {selectedFoods.map(({ food, quantity }) => (
                      <div 
                        key={food.id}
                        className="flex items-center bg-white dark:bg-slate-800 p-2 rounded-md shadow-sm"
                      >
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                            {food.name}
                          </h4>
                          
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex rounded-md overflow-hidden border border-slate-200 dark:border-slate-700 h-6">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-none"
                                onClick={() => handleUpdateFoodQuantity(food.id, Math.max(0.1, quantity - 0.5))}
                              >
                                <span className="text-xs">−</span>
                              </Button>
                              <input
                                type="number"
                                value={quantity}
                                onChange={e => handleUpdateFoodQuantity(food.id, parseFloat(e.target.value) || 0.1)}
                                className="w-10 text-center text-xs outline-none border-x border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                                step="0.5"
                                min="0.5"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-none"
                                onClick={() => handleUpdateFoodQuantity(food.id, quantity + 0.5)}
                              >
                                <span className="text-xs">+</span>
                              </Button>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400">
                              {food.servingSize}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right text-xs mr-2">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {Math.round(food.nutrition.calories * quantity)} cal
                          </div>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                          onClick={() => handleRemoveFood(food.id)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[120px] text-center text-slate-500 dark:text-slate-400">
                    <p className="text-sm">No foods added yet</p>
                    <Button 
                      onClick={() => setAddFoodDialogOpen(true)}
                      className="mt-2"
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Food
                    </Button>
                  </div>
                )}
              </div>
              
              {selectedFoods.length > 0 && (
                <div className="flex justify-between text-sm mt-2 px-2">
                  <span className="text-slate-600 dark:text-slate-400">Total:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {Math.round(selectedFoods.reduce((sum, { food, quantity }) => sum + food.nutrition.calories * quantity, 0))} calories
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMealOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddMeal}
              disabled={selectedFoods.length === 0}
              className={selectedFoods.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}
            >
              Save Meal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Food Dialog */}
      <Dialog open={addFoodDialogOpen} onOpenChange={setAddFoodDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Food</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-slate-500" />
              <Input
                placeholder="Search foods..."
                value={searchTerm}
                onChange={e => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {searchResults.length > 0 ? (
                searchResults.map(food => (
                  <div
                    key={food.id}
                    className="flex items-center p-2 rounded-md cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => handleSelectFood(food)}
                  >
                    {food.image && (
                      <div className="w-10 h-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                        <img src={food.image} alt={food.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1">
                        <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                          {food.name}
                        </h4>
                        {food.brand && (
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            ({food.brand})
                          </span>
                        )}
                        {food.isFavorite && (
                          <Badge variant="outline" className="ml-auto text-[10px] border-amber-200 bg-amber-50 text-amber-700">
                            <Sparkles className="h-2.5 w-2.5 mr-0.5" />
                            Favorite
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {food.servingSize} • {food.nutrition.calories} cal
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-slate-500 dark:text-slate-400">
                  <p className="text-sm">No foods found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <Button
              type="button"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              onClick={handleOpenCustomFood}
            >
              <Plus className="h-4 w-4 mr-2" />
              Custom Entry
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Custom Food Dialog */}
      <Dialog open={customFoodDialogOpen} onOpenChange={setCustomFoodDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Custom Food</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                  Food Name
                </label>
                <Input
                  value={customFood.name || ''}
                  onChange={e => setCustomFood(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Homemade Granola"
                  required
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                  Brand/Source (Optional)
                </label>
                <Input
                  value={customFood.brand || ''}
                  onChange={e => setCustomFood(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="e.g. Homemade"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                  Serving Size
                </label>
                <Input
                  value={customFood.servingSize || ''}
                  onChange={e => setCustomFood(prev => ({ ...prev, servingSize: e.target.value }))}
                  placeholder="e.g. 1 cup (100g)"
                  required
                />
              </div>
              
              <div className="md:col-span-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Nutrition Information (per serving)</h4>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-slate-600 dark:text-slate-400">
                      Calories
                    </label>
                    <Input
                      type="number"
                      value={customFood.nutrition.calories || ''}
                      onChange={e => setCustomFood(prev => ({ 
                        ...prev, 
                        nutrition: { 
                          ...prev.nutrition, 
                          calories: parseInt(e.target.value) || 0 
                        } 
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-blue-600 dark:text-blue-400">
                      Protein (g)
                    </label>
                    <Input
                      type="number"
                      value={customFood.nutrition.protein || ''}
                      onChange={e => setCustomFood(prev => ({ 
                        ...prev, 
                        nutrition: { 
                          ...prev.nutrition, 
                          protein: parseFloat(e.target.value) || 0 
                        } 
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-green-600 dark:text-green-400">
                      Carbs (g)
                    </label>
                    <Input
                      type="number"
                      value={customFood.nutrition.carbs || ''}
                      onChange={e => setCustomFood(prev => ({ 
                        ...prev, 
                        nutrition: { 
                          ...prev.nutrition, 
                          carbs: parseFloat(e.target.value) || 0 
                        } 
                      }))}
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs font-medium mb-1.5 block text-amber-600 dark:text-amber-400">
                      Fat (g)
                    </label>
                    <Input
                      type="number"
                      value={customFood.nutrition.fat || ''}
                      onChange={e => setCustomFood(prev => ({ 
                        ...prev, 
                        nutrition: { 
                          ...prev.nutrition, 
                          fat: parseFloat(e.target.value) || 0 
                        } 
                      }))}
                    />
                  </div>
                </div>
                
                <div className="mt-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => setShowAdditionalNutrition(!showAdditionalNutrition)}
                  >
                    {showAdditionalNutrition ? 'Hide' : 'Show'} Additional Nutrients
                    {showAdditionalNutrition ? <ChevronDown className="ml-1 h-3 w-3" /> : <ChevronRight className="ml-1 h-3 w-3" />}
                  </Button>
                </div>
                
                {showAdditionalNutrition && (
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-slate-600 dark:text-slate-400">
                        Fiber (g)
                      </label>
                      <Input
                        type="number"
                        value={customFood.nutrition.fiber || ''}
                        onChange={e => setCustomFood(prev => ({ 
                          ...prev, 
                          nutrition: { 
                            ...prev.nutrition, 
                            fiber: parseFloat(e.target.value) || 0 
                          } 
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-slate-600 dark:text-slate-400">
                        Sugar (g)
                      </label>
                      <Input
                        type="number"
                        value={customFood.nutrition.sugar || ''}
                        onChange={e => setCustomFood(prev => ({ 
                          ...prev, 
                          nutrition: { 
                            ...prev.nutrition, 
                            sugar: parseFloat(e.target.value) || 0 
                          } 
                        }))}
                      />
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium mb-1.5 block text-slate-600 dark:text-slate-400">
                        Sodium (mg)
                      </label>
                      <Input
                        type="number"
                        value={customFood.nutrition.sodium || ''}
                        onChange={e => setCustomFood(prev => ({ 
                          ...prev, 
                          nutrition: { 
                            ...prev.nutrition, 
                            sodium: parseFloat(e.target.value) || 0 
                          } 
                        }))}
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="md:col-span-2 border-t border-slate-200 dark:border-slate-700 pt-4">
                <label className="text-sm font-medium mb-1.5 block text-slate-700 dark:text-slate-300">
                  Food Image (Optional)
                </label>
                
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-md border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden">
                    {customFoodImage ? (
                      <img src={customFoodImage} alt="Food preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera className="h-8 w-8 text-slate-400" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      className="text-sm"
                      onChange={handleImageUpload}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Upload an image of your food (optional)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomFoodDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddCustomFood}
              disabled={!customFood.name}
            >
              Add Food
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealLogger; 