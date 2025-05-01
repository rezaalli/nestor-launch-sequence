
import React from "react";
import { Slider } from "@/components/ui/slider";

interface SleepQualityProps {
  sleepQuality: number;
  setSleepQuality: (quality: number) => void;
}

const SleepQuality: React.FC<SleepQualityProps> = ({ sleepQuality, setSleepQuality }) => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <label className="text-sm font-medium text-nestor-gray-700">Sleep Quality</label>
        <span className="text-sm font-medium text-nestor-blue">{sleepQuality}/10</span>
      </div>
      
      <Slider 
        defaultValue={[sleepQuality]} 
        max={10}
        min={1}
        step={1}
        onValueChange={(value) => setSleepQuality(value[0])}
      />
      
      <div className="flex justify-between mt-2">
        <span className="text-xs text-nestor-gray-500">Poor Sleep</span>
        <span className="text-xs text-nestor-gray-500">Great Sleep</span>
      </div>
    </div>
  );
};

export default SleepQuality;
