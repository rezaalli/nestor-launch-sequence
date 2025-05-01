
import React from "react";
import { MugHot, Dumbbell } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

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
    <div className="w-full">
      <label className="block text-sm font-medium text-nestor-gray-700 mb-8 text-center">
        Lifestyle Factors
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center">
            <MugHot className="text-nestor-gray-700 mr-3" size={20} />
            <span className="text-sm text-nestor-gray-900">Caffeine</span>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="caffeine"
              checked={lifestyleFactors.caffeine}
              onCheckedChange={(checked) => setLifestyleFactors("caffeine", checked)}
            />
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center">
            <Dumbbell className="text-nestor-gray-700 mr-3" size={20} />
            <span className="text-sm text-nestor-gray-900">Exercise</span>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="exercise"
              checked={lifestyleFactors.exercise}
              onCheckedChange={(checked) => setLifestyleFactors("exercise", checked)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LifestyleFactors;
