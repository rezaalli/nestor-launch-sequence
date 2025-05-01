
import React from "react";

interface SleepQualityProps {
  sleepQuality: number;
  setSleepQuality: (quality: number) => void;
}

const SleepQuality: React.FC<SleepQualityProps> = ({ sleepQuality, setSleepQuality }) => {
  return (
    <div className="w-full flex flex-col items-center min-h-[400px] justify-center">
      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-8">
          <label className="text-sm font-medium text-nestor-gray-700">Sleep Quality</label>
          <span className="text-sm font-medium text-nestor-blue">{sleepQuality}/10</span>
        </div>
        
        <input 
          type="range" 
          min="1" 
          max="10" 
          value={sleepQuality} 
          onChange={(e) => setSleepQuality(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-900" 
        />
        
        <div className="flex justify-between mt-2">
          <span className="text-xs text-nestor-gray-500">Poor Sleep</span>
          <span className="text-xs text-nestor-gray-500">Great Sleep</span>
        </div>
      </div>
    </div>
  );
};

export default SleepQuality;
