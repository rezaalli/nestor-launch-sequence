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
  isOpen: boolean;
  onClose: () => void;
  onSave: (mealData: any) => void;
}

const AddMealModal: React.FC<AddMealModalProps> = ({ isOpen, onClose, onSave }) => {
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mealType, setMealType] = useState('Breakfast');
  
  // Nutrition targets
  const [targets, setTargets] = useState({
    calories: 2000,
    protein: 90,
    carbs: 250,
    fat: 65
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white z-50">
      {/* Header */}
      <div className="px-6 pt-4 pb-2 flex items-center justify-between border-b">
        <button 
          className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
          onClick={onClose}
        >
          <i className="fa-solid fa-xmark text-gray-700"></i>
        </button>
        <h2 className="text-lg font-medium text-gray-900">Add Food</h2>
        <button 
          className="text-blue-900 font-medium text-sm"
          onClick={() => onSave({ type: mealType })}
        >
          Save
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-6 pb-3">
        <div className="relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-gray-400"></i>
          <input 
            type="text" 
            placeholder="Search foods" 
            className="w-full pl-12 pr-4 py-3 bg-gray-100 rounded-xl text-gray-900" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="absolute right-3 top-2.5 p-1.5 bg-white rounded-lg border border-gray-200">
            <i className="fa-solid fa-barcode text-blue-900"></i>
          </button>
        </div>
      </div>

      {/* Quick Add Options with Camera */}
      <div className="px-6 pb-4">
        <div className="flex space-x-3 overflow-x-auto">
          <button className="flex-shrink-0 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">Recent</button>
          <button className="flex-shrink-0 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">My Foods</button>
          <button className="flex-shrink-0 px-4 py-2 bg-gray-100 rounded-full text-sm text-gray-600">Favorites</button>
          <button 
            className="flex-shrink-0 px-4 py-2 bg-blue-900 text-white rounded-full text-sm flex items-center"
            onClick={() => setShowCameraModal(true)}
          >
            <i className="fa-solid fa-camera mr-1.5"></i>
            Photo
          </button>
        </div>
      </div>

      {/* Meal Type Selection */}
      <div className="px-6 pb-4">
        <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-xl">
          <i className="fa-solid fa-utensils text-gray-400"></i>
          <select 
            className="bg-transparent text-gray-900 flex-1 focus:outline-none"
            value={mealType}
            onChange={(e) => setMealType(e.target.value)}
          >
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Dinner</option>
            <option>Snack</option>
          </select>
        </div>
      </div>

      {/* Recent Foods */}
      <div className="px-6">
        <h3 className="text-sm font-medium text-gray-500 mb-3">RECENT FOODS</h3>
        <div className="space-y-2">
          <div className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                <i className="fa-solid fa-bowl-food text-orange-600"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Greek Yogurt</h4>
                <p className="text-sm text-gray-500">170g • 100 kcal</p>
              </div>
              <button className="text-blue-900 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-gray-50 rounded-lg text-center">
                <span className="text-gray-500">Protein</span>
                <p className="font-medium text-gray-900">17g</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg text-center">
                <span className="text-gray-500">Carbs</span>
                <p className="font-medium text-gray-900">6g</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg text-center">
                <span className="text-gray-500">Fat</span>
                <p className="font-medium text-gray-900">0.4g</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg text-center">
                <span className="text-gray-500">Ca</span>
                <p className="font-medium text-gray-900">200mg</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <i className="fa-solid fa-apple-whole text-green-600"></i>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">Apple</h4>
                <p className="text-sm text-gray-500">1 medium • 95 kcal</p>
              </div>
              <button className="text-blue-900 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                <i className="fa-solid fa-plus"></i>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-gray-50 rounded-lg text-center">
                <span className="text-gray-500">Protein</span>
                <p className="font-medium text-gray-900">0.5g</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg text-center">
                <span className="text-gray-500">Carbs</span>
                <p className="font-medium text-gray-900">25g</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg text-center">
                <span className="text-gray-500">Fiber</span>
                <p className="font-medium text-gray-900">4.5g</p>
              </div>
              <div className="p-2 bg-gray-50 rounded-lg text-center">
                <span className="text-gray-500">Vit C</span>
                <p className="font-medium text-gray-900">8.4mg</p>
              </div>
            </div>
          </div>
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
        <button className="w-full py-3 bg-blue-900 text-white rounded-xl flex items-center justify-center">
          <i className="fa-solid fa-plus mr-2"></i>
          Custom Entry
        </button>
      </div>

      {/* Nutritional Summary */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-500">TODAY'S NUTRITION</h3>
            <button 
              className="text-sm text-blue-900 flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100"
              onClick={() => setShowSettingsModal(true)}
            >
              <i className="fa-solid fa-gear"></i>
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-500">Protein</span>
              <div className="flex items-center">
                <p className="text-lg font-medium text-gray-900">65</p>
                <span className="text-sm text-gray-500 ml-1">/ {targets.protein}g</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full mt-2">
                <div className="h-1 bg-blue-900 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-500">Carbs</span>
              <div className="flex items-center">
                <p className="text-lg font-medium text-gray-900">180</p>
                <span className="text-sm text-gray-500 ml-1">/ {targets.carbs}g</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full mt-2">
                <div className="h-1 bg-blue-900 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            
            <div className="p-3 bg-gray-50 rounded-xl">
              <span className="text-sm text-gray-500">Fat</span>
              <div className="flex items-center">
                <p className="text-lg font-medium text-gray-900">45</p>
                <span className="text-sm text-gray-500 ml-1">/ {targets.fat}g</span>
              </div>
              <div className="h-1 bg-gray-200 rounded-full mt-2">
                <div className="h-1 bg-blue-900 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-white z-50">
          <div className="px-6 pt-4 pb-2 flex items-center justify-between border-b">
            <button 
              className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
              onClick={() => setShowSettingsModal(false)}
            >
              <i className="fa-solid fa-xmark text-gray-700"></i>
            </button>
            <h2 className="text-lg font-medium text-gray-900">Nutrition Targets</h2>
            <button 
              className="text-blue-900 font-medium text-sm"
              onClick={() => {
                // Save settings
                setShowSettingsModal(false);
              }}
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
                    value={targets.calories} 
                    onChange={(e) => setTargets({...targets, calories: parseInt(e.target.value)})}
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
                    value={targets.protein} 
                    onChange={(e) => setTargets({...targets, protein: parseInt(e.target.value)})}
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
                    value={targets.carbs} 
                    onChange={(e) => setTargets({...targets, carbs: parseInt(e.target.value)})}
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
                    value={targets.fat} 
                    onChange={(e) => setTargets({...targets, fat: parseInt(e.target.value)})}
                    className="w-full bg-transparent text-gray-900 focus:outline-none" 
                  />
                  <span className="text-gray-500 ml-2">g</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera Modal */}
      {showCameraModal && (
        <div className="fixed inset-0 bg-black z-50">
          <div className="h-full flex flex-col">
            <div className="px-6 py-4 flex items-center justify-between">
              <button 
                className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center"
                onClick={() => setShowCameraModal(false)}
              >
                <i className="fa-solid fa-xmark text-white"></i>
              </button>
              <div className="flex space-x-4">
                <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <i className="fa-solid fa-camera-rotate text-white"></i>
                </button>
                <button className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <i className="fa-solid fa-bolt text-white"></i>
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                <p className="text-white">Camera preview would appear here</p>
              </div>
            </div>
            
            <div className="px-6 py-8 flex items-center justify-between">
              <button className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center">
                <i className="fa-solid fa-images text-white"></i>
              </button>
              <button className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-blue-900"></div>
              </button>
              <div className="w-12 h-12">
                {/* Spacer */}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMealModal;
