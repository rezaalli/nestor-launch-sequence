
import React from "react";
import { Slider } from "@/components/ui/slider";

interface EnergyLevelProps {
  energyLevel: number;
  setEnergyLevel: (level: number) => void;
}

const EnergyLevel: React.FC<EnergyLevelProps> = ({ energyLevel, setEnergyLevel }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <label className="text-sm font-medium text-nestor-gray-700">Energy Level</label>
        <span className="text-sm font-medium text-nestor-blue">{energyLevel}/10</span>
      </div>
      
      <Slider 
        defaultValue={[energyLevel]} 
        max={10}
        min={1}
        step={1}
        onValueChange={(value) => setEnergyLevel(value[0])}
      />
      
      <div className="flex justify-between mt-2">
        <span className="text-xs text-nestor-gray-500">Low Energy</span>
        <span className="text-xs text-nestor-gray-500">High Energy</span>
      </div>
    </div>
  );
};

export default EnergyLevel;
