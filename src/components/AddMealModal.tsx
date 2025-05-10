
import React, { useState } from "react";
import { 
  X, Plus, Search, Camera, Barcode, 
  Utensils, Settings, Check, ArrowLeft 
} from "lucide-react";
import { Dialog, DialogContentWithoutCloseButton } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MealFormData } from "@/hooks/use-meal-tracking";

interface Food {
  id: number;
  name: string;
  amount: string;
  calories: number;
  icon: string;
  color: string;
  nutrients: {
    protein: number;
    carbs: number;
    fat: number;
    extra: {
      name: string;
      amount: string;
    };
  };
}

interface AddMealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: MealFormData) => Promise<boolean>;
  isSubmitting: boolean;
}

const AddMealModal: React.FC<AddMealModalProps> = ({ 
  open, 
  onOpenChange, 
  onSave,
  isSubmitting 
}) => {
  // State for various modals
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  
  // State for form inputs
  const [searchQuery, setSearchQuery] = useState("");
  const [mealType, setMealType] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">("Breakfast");
  const [activeFilter, setActiveFilter] = useState("Recent");
  
  // Sample meal data for testing
  const [mealData, setMealData] = useState<MealFormData>({
    mealType: "Breakfast",
    mealName: "Quick Breakfast",
    calories: 350,
    protein: 15,
    carbs: 45,
    fat: 12
  });
  
  // Nutrition targets
  const [nutritionTargets, setNutritionTargets] = useState({
    calories: 2000,
    protein: 90,
    carbs: 250,
    fat: 65
  });
  
  // Current nutrition values (would normally come from a context or API)
  const [currentNutrition] = useState({
    protein: 65,
    carbs: 180,
    fat: 45
  });
  
  // Sample recent food data
  const recentFoods: Food[] = [
    {
      id: 1,
      name: "Greek Yogurt",
      amount: "170g",
      calories: 100,
      icon: "bowl",
      color: "orange",
      nutrients: {
        protein: 17,
        carbs: 6,
        fat: 0.4,
        extra: {
          name: "Ca",
          amount: "200mg"
        }
      }
    },
    {
      id: 2,
      name: "Apple",
      amount: "1 medium",
      calories: 95,
      icon: "apple",
      color: "green",
      nutrients: {
        protein: 0.5,
        carbs: 25,
        fat: 0.3,
        extra: {
          name: "Fiber",
          amount: "4.5g"
        }
      }
    }
  ];
  
  const handleSaveMeal = async () => {
    // Update meal type from the select
    const updatedMealData = {
      ...mealData,
      mealType
    };
    
    // Call the onSave function provided by the parent
    const success = await onSave(updatedMealData);
    if (success) {
      onOpenChange(false);
    }
  };
  
  const handleSaveSettings = () => {
    setShowSettingsModal(false);
    // Would normally update nutrition targets in a context or API
  };

  // Handler for meal type selection change
  const handleMealTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    // Cast the string value to our allowed meal type
    const value = e.target.value as "Breakfast" | "Lunch" | "Dinner" | "Snack";
    setMealType(value);
  };

  return (
    <>
      {/* Main Add Meal Modal */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContentWithoutCloseButton className="max-w-md p-0 gap-0 rounded-xl">
          {/* Header */}
          <div className="px-6 pt-4 pb-2 flex items-center justify-between border-b">
            <button 
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              onClick={() => onOpenChange(false)}
            >
              <X className="text-gray-700" size={18} />
            </button>
            <h2 className="text-lg font-medium text-gray-900">Add Food</h2>
            <button 
              className="text-blue-900 font-medium text-sm"
              onClick={handleSaveMeal}
            >
              Save
            </button>
          </div>
          
          {/* Content - Scrollable */}
          <ScrollArea className="h-[calc(100vh-140px)]">
            <div className="pb-[180px]"> {/* Add padding to account for the fixed bottom section */}
              {/* Search Bar */}
              <div className="p-6 pb-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={18} />
                  <Input 
                    type="text" 
                    placeholder="Search foods" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-12 py-6 h-12 bg-gray-100 border-0"
                  />
                  <button className="absolute right-3 top-2.5 p-1.5 bg-white rounded-lg border border-gray-200">
                    <Barcode className="text-blue-900" size={18} />
                  </button>
                </div>
              </div>
              
              {/* Quick Add Options with Camera */}
              <div className="px-6 pb-4">
                <div className="flex space-x-3 overflow-x-auto hide-scrollbar">
                  {["Recent", "My Foods", "Favorites"].map(filter => (
                    <button
                      key={filter}
                      className={cn(
                        "flex-shrink-0 px-4 py-2 rounded-full text-sm",
                        activeFilter === filter ? "bg-blue-900 text-white" : "bg-gray-100 text-gray-600"
                      )}
                      onClick={() => setActiveFilter(filter)}
                    >
                      {filter}
                    </button>
                  ))}
                  <button 
                    className="flex-shrink-0 px-4 py-2 bg-blue-900 text-white rounded-full text-sm flex items-center"
                    onClick={() => setShowCameraModal(true)}
                  >
                    <Camera className="mr-1.5" size={16} />
                    Photo
                  </button>
                </div>
              </div>
              
              {/* Meal Type Selection */}
              <div className="px-6 pb-4">
                <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                  <Utensils className="text-gray-400" size={18} />
                  <select 
                    className="bg-transparent text-gray-900 flex-1 focus:outline-none"
                    value={mealType}
                    onChange={handleMealTypeChange}
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snack">Snack</option>
                  </select>
                </div>
              </div>
              
              {/* Recent Foods */}
              <div className="px-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">RECENT FOODS</h3>
                <div className="space-y-2">
                  {recentFoods.map(food => (
                    <div key={food.id} className="p-4 bg-white border border-gray-200 rounded-xl">
                      <div className="flex items-center mb-3">
                        <div className={`w-12 h-12 bg-${food.color}-100 rounded-lg flex items-center justify-center mr-3`}>
                          <Utensils className={`text-${food.color}-600`} size={20} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{food.name}</h4>
                          <p className="text-sm text-gray-500">{food.amount} • {food.calories} kcal</p>
                        </div>
                        <button className="text-blue-900 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="p-2 bg-gray-50 rounded-lg text-center">
                          <span className="text-gray-500">Protein</span>
                          <p className="font-medium text-gray-900">{food.nutrients.protein}g</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-lg text-center">
                          <span className="text-gray-500">Carbs</span>
                          <p className="font-medium text-gray-900">{food.nutrients.carbs}g</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-lg text-center">
                          <span className="text-gray-500">Fat</span>
                          <p className="font-medium text-gray-900">{food.nutrients.fat}g</p>
                        </div>
                        <div className="p-2 bg-gray-50 rounded-lg text-center">
                          <span className="text-gray-500">{food.nutrients.extra.name}</span>
                          <p className="font-medium text-gray-900">{food.nutrients.extra.amount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Micronutrients Summary */}
              <div className="px-6 mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">MICRONUTRIENTS</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500">Vitamin D</span>
                      <span className="text-xs text-gray-400">75%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full">
                      <div className="h-1.5 bg-blue-900 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-500">Iron</span>
                      <span className="text-xs text-gray-400">45%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 rounded-full">
                      <div className="h-1.5 bg-blue-900 rounded-full" style={{ width: '45%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Custom Entry Button */}
              <div className="px-6 mt-6">
                <Button 
                  className="w-full py-6 bg-blue-900 text-white hover:bg-blue-800 h-auto"
                >
                  <Plus className="mr-2" size={16} />
                  Custom Entry
                </Button>
              </div>
            </div>
          </ScrollArea>
          
          {/* Nutritional Summary - Fixed at bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-gray-500">TODAY'S NUTRITION</h3>
                <button 
                  className="text-sm text-blue-900 flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
                  onClick={() => setShowSettingsModal(true)}
                >
                  <Settings size={16} />
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { name: "Protein", current: currentNutrition.protein, target: nutritionTargets.protein, width: '60%' },
                  { name: "Carbs", current: currentNutrition.carbs, target: nutritionTargets.carbs, width: '75%' },
                  { name: "Fat", current: currentNutrition.fat, target: nutritionTargets.fat, width: '40%' },
                ].map((nutrient, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm text-gray-500">{nutrient.name}</span>
                    <div className="flex items-center">
                      <p className="text-lg font-medium text-gray-900">{nutrient.current}</p>
                      <span className="text-sm text-gray-500 ml-1">/ {nutrient.target}g</span>
                    </div>
                    <div className="h-1 bg-gray-200 rounded-full mt-2">
                      <div className="h-1 bg-blue-900 rounded-full" style={{ width: nutrient.width }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContentWithoutCloseButton>
      </Dialog>
      
      {/* Camera Modal */}
      <Dialog open={showCameraModal} onOpenChange={setShowCameraModal}>
        <DialogContentWithoutCloseButton className="max-w-md p-0 gap-0 bg-black">
          <div className="h-full flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between">
              <button 
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center"
                onClick={() => setShowCameraModal(false)}
              >
                <X className="text-white" size={18} />
              </button>
              <div className="flex space-x-4">
                <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <ArrowLeft className="text-white" size={18} />
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <Settings className="text-white" size={18} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <p className="text-gray-400">Camera Preview</p>
              </div>
            </div>
            
            <div className="px-6 py-8 flex items-center justify-between">
              <button className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                <Plus className="text-white" size={20} />
              </button>
              <button className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-blue-900"></div>
              </button>
              <div className="w-12 h-12">
                {/* Spacer */}
              </div>
            </div>
          </div>
        </DialogContentWithoutCloseButton>
      </Dialog>
      
      {/* Settings Modal */}
      <Dialog open={showSettingsModal} onOpenChange={setShowSettingsModal}>
        <DialogContentWithoutCloseButton className="max-w-md p-0 gap-0 rounded-xl">
          <div className="px-6 pt-4 pb-2 flex items-center justify-between border-b">
            <button 
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              onClick={() => setShowSettingsModal(false)}
            >
              <X className="text-gray-700" size={18} />
            </button>
            <h2 className="text-lg font-medium text-gray-900">Nutrition Targets</h2>
            <button 
              className="text-blue-900 font-medium text-sm"
              onClick={handleSaveSettings}
            >
              Save
            </button>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Calorie Target</label>
                <div className="flex items-center bg-gray-50 rounded-xl p-4">
                  <input 
                    type="number" 
                    value={nutritionTargets.calories} 
                    onChange={(e) => setNutritionTargets({...nutritionTargets, calories: parseInt(e.target.value) || 0})}
                    className="w-full bg-transparent text-gray-900 focus:outline-none"
                  />
                  <span className="text-gray-500 ml-2">kcal</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Protein Target</label>
                <div className="flex items-center bg-gray-50 rounded-xl p-4">
                  <input 
                    type="number" 
                    value={nutritionTargets.protein} 
                    onChange={(e) => setNutritionTargets({...nutritionTargets, protein: parseInt(e.target.value) || 0})}
                    className="w-full bg-transparent text-gray-900 focus:outline-none"
                  />
                  <span className="text-gray-500 ml-2">g</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Carbohydrate Target</label>
                <div className="flex items-center bg-gray-50 rounded-xl p-4">
                  <input 
                    type="number" 
                    value={nutritionTargets.carbs} 
                    onChange={(e) => setNutritionTargets({...nutritionTargets, carbs: parseInt(e.target.value) || 0})}
                    className="w-full bg-transparent text-gray-900 focus:outline-none"
                  />
                  <span className="text-gray-500 ml-2">g</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Fat Target</label>
                <div className="flex items-center bg-gray-50 rounded-xl p-4">
                  <input 
                    type="number" 
                    value={nutritionTargets.fat} 
                    onChange={(e) => setNutritionTargets({...nutritionTargets, fat: parseInt(e.target.value) || 0})}
                    className="w-full bg-transparent text-gray-900 focus:outline-none"
                  />
                  <span className="text-gray-500 ml-2">g</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContentWithoutCloseButton>
      </Dialog>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};

export default AddMealModal;
