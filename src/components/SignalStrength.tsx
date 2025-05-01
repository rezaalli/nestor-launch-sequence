
import React from 'react';

interface SignalStrengthProps {
  strength: 'weak' | 'medium' | 'strong';
  label?: string;
}

const SignalStrength = ({ strength, label }: SignalStrengthProps) => {
  const getStrengthBars = () => {
    const bars = [];
    const totalBars = 4;
    let activeBars = 0;
    
    if (strength === 'weak') activeBars = 1;
    if (strength === 'medium') activeBars = 2;
    if (strength === 'strong') activeBars = 3;
    
    for (let i = 0; i < totalBars; i++) {
      bars.push(
        <div 
          key={i} 
          className={`h-1.5 w-8 ${i < activeBars ? 'bg-nestor-blue' : 'bg-gray-300'} rounded-full`}
        />
      );
    }
    
    return bars;
  };
  
  return (
    <div className="flex space-x-1">
      {getStrengthBars()}
      {label && <span className="text-sm text-gray-600 ml-2">{label}</span>}
    </div>
  );
};

export default SignalStrength;
