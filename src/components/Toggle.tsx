
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
      toggle: 'translate-x-4',
      circle: 'h-4 w-4'
    },
    md: {
      container: 'w-11 h-6',
      toggle: 'translate-x-5',
      circle: 'h-5 w-5'
    },
    lg: {
      container: 'w-14 h-7',
      toggle: 'translate-x-7',
      circle: 'h-6 w-6'
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
      <div
        className={`
          ${sizeClasses[size].container} 
          bg-gray-200 
          peer-checked:bg-green-500 
          rounded-full 
          peer 
          peer-focus:ring-2 
          peer-focus:ring-offset-1 
          peer-focus:ring-blue-100 
          transition-all
          relative
        `}
      >
        <span 
          className={`
            ${sizeClasses[size].circle}
            absolute 
            left-0.5
            top-0.5
            bg-white 
            rounded-full 
            transition-transform
            ${checked ? sizeClasses[size].toggle : 'translate-x-0'}
          `}
        ></span>
      </div>
    </label>
  );
};

export default Toggle;
