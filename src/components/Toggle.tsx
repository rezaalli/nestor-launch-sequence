
import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}

const Toggle = ({ checked, onChange, size = 'md' }: ToggleProps) => {
  // Size classes
  const sizeClasses = {
    sm: {
      container: 'w-9 h-5',
      toggle: 'translate-x-4 h-4 w-4',
      circle: 'h-4 w-4 after:h-3 after:w-3 after:top-[2px] after:left-[2px]'
    },
    md: {
      container: 'w-11 h-6',
      toggle: 'translate-x-5 h-5 w-5',
      circle: 'h-5 w-5 after:h-4 after:w-4 after:top-[2px] after:left-[2px]'
    },
    lg: {
      container: 'w-14 h-7',
      toggle: 'translate-x-7 h-6 w-6',
      circle: 'h-6 w-6 after:h-5 after:w-5 after:top-[2px] after:left-[2px]'
    }
  };

  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)} 
        className="sr-only peer" 
      />
      <div className={`${sizeClasses[size].container} bg-gray-200 rounded-full peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-blue-100 
        peer peer-checked:after:${sizeClasses[size].toggle} peer-checked:after:border-white 
        after:content-[''] after:absolute after:bg-white after:border-gray-300 after:border 
        after:rounded-full after:transition-all peer-checked:bg-green-500`}>
      </div>
    </label>
  );
};

export default Toggle;
