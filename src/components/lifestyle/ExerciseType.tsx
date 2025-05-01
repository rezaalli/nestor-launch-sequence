
import React from "react";
import { ChevronDown } from "lucide-react";

interface ExerciseTypeProps {
  exerciseType: string;
  setExerciseType: (type: string) => void;
}

const ExerciseType: React.FC<ExerciseTypeProps> = ({ exerciseType, setExerciseType }) => {
  const exerciseOptions = [
    "Light Exercise (30 min)",
    "Moderate Exercise (30-60 min)",
    "Intense Exercise (60+ min)",
    "Rest Day"
  ];

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-nestor-gray-700 mb-8 text-center">
        Exercise Type
      </label>
      <div className="relative">
        <select 
          className="w-full p-4 text-nestor-gray-900 bg-white border border-gray-200 rounded-xl appearance-none"
          value={exerciseType}
          onChange={(e) => setExerciseType(e.target.value)}
        >
          {exerciseOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4">
          <ChevronDown className="text-gray-400" size={16} />
        </div>
      </div>
    </div>
  );
};

export default ExerciseType;
