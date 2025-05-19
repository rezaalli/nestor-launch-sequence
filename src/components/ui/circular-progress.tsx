import * as React from "react";
import { cn } from "@/lib/utils";

export interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  size?: "sm" | "md" | "lg" | "xl";
  thickness?: number;
  showValue?: boolean;
  valueFormat?: (value: number) => string | number;
  label?: string;
  status?: "neutral" | "success" | "warning" | "error" | "info";
  animated?: boolean;
  valueSize?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
}

const CircularProgress = React.forwardRef<HTMLDivElement, CircularProgressProps>(
  ({ 
    className, 
    value, 
    max = 100, 
    size = "md", 
    thickness = 8, 
    showValue = true, 
    valueFormat, 
    label, 
    status = "neutral", 
    animated = false, 
    valueSize = "md",
    icon,
    ...props 
  }, ref) => {
    // Calculate the normalized value as a percentage (0-100)
    const normalizedValue = Math.min(Math.max(0, value), max);
    const percentage = (normalizedValue / max) * 100;
    
    // Calculate the circumference and stroke-dasharray/dashoffset
    const radius = 50 - thickness / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    // Handle size variations
    const sizeClasses = {
      sm: "w-16 h-16",
      md: "w-24 h-24",
      lg: "w-32 h-32",
      xl: "w-40 h-40",
    };
    
    // Handle value font size variations
    const valueSizeClasses = {
      sm: "text-base",
      md: "text-xl",
      lg: "text-3xl",
    };
    
    // Status colors for the progress track
    const statusColorMap = {
      neutral: "#9ca3af", // gray-400
      success: "#22c55e", // success-500
      warning: "#f59e0b", // warning-500
      error: "#ef4444",   // error-500
      info: "#3b82f6",    // info-500
    };
    
    // Status colors for the background track
    const bgColorMap = {
      neutral: "#f3f4f6", // neutral-100
      success: "#dcfce7", // success-100
      warning: "#fef3c7", // warning-100
      error: "#fee2e2",   // error-100
      info: "#dbeafe",    // info-100
    };
    
    // Format the displayed value
    const formattedValue = valueFormat
      ? valueFormat(value)
      : Math.round(value).toString();

    return (
      <div 
        ref={ref} 
        className={cn("relative flex flex-col items-center justify-center", 
          sizeClasses[size], 
          className
        )} 
        {...props}
      >
        {/* SVG for the circular progress */}
        <svg 
          className="w-full h-full" 
          viewBox="0 0 100 100"
          style={{
            transform: "rotate(-90deg)", // Start from the top
          }}
        >
          {/* Background track */}
          <circle
            className="transition-all duration-300"
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={bgColorMap[status]}
            strokeWidth={thickness}
          />
          
          {/* Progress track */}
          <circle
            className={cn(
              "transition-all duration-300",
              animated && "transition-[stroke-dashoffset] duration-700"
            )}
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={statusColorMap[status]}
            strokeWidth={thickness}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {icon && (
            <div className="mb-1">
              {icon}
            </div>
          )}
          
          {showValue && (
            <div className={cn(
              "font-semibold", 
              valueSizeClasses[valueSize]
            )}>
              {formattedValue}
            </div>
          )}
          
          {label && (
            <div className="text-xs font-medium text-neutral-500 mt-0.5">
              {label}
            </div>
          )}
        </div>
      </div>
    );
  }
);

CircularProgress.displayName = "CircularProgress";

export { CircularProgress }; 