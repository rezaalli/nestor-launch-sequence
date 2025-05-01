
import React from "react";

interface LifestyleFactorsProps {
  lifestyleFactors: {
    caffeine: boolean;
    exercise: boolean;
  };
  setLifestyleFactors: (factor: string, value: boolean) => void;
}

const LifestyleFactors: React.FC<LifestyleFactorsProps> = ({ 
  lifestyleFactors, 
  setLifestyleFactors 
}) => {
  return (
    <div className="w-full flex flex-col items-center min-h-[400px] justify-center">
      <div className="w-full max-w-md">
        <label className="block text-sm font-medium text-nestor-gray-700 mb-8 text-center">
          Lifestyle Factors
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center">
              <i className="fa-solid fa-mug-hot text-nestor-gray-700 mr-3"></i>
              <span className="text-sm text-nestor-gray-900">Caffeine</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox"
                className="sr-only peer"
                checked={lifestyleFactors.caffeine}
                onChange={(e) => setLifestyleFactors("caffeine", e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
            </label>
          </div>

          <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center">
              <i className="fa-solid fa-dumbbell text-nestor-gray-700 mr-3"></i>
              <span className="text-sm text-nestor-gray-900">Exercise</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={lifestyleFactors.exercise}
                onChange={(e) => setLifestyleFactors("exercise", e.target.checked)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-900"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifestyleFactors;
