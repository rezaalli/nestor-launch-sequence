import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  indicatorColor?: string;
  showValue?: boolean;
  valuePosition?: 'top' | 'right';
  valueClassName?: string;
  thickness?: 'thin' | 'default' | 'thick';
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ 
  className, 
  value, 
  indicatorColor, 
  showValue = false, 
  valuePosition = 'right',
  valueClassName,
  thickness = 'default',
  ...props 
}, ref) => {
  const thicknessClasses = {
    thin: "h-1",
    default: "h-2",
    thick: "h-3"
  };

  return (
    <div className={cn("relative", showValue && valuePosition === 'top' && "mb-1")}>
      {showValue && valuePosition === 'top' && (
        <div className={cn("flex justify-end text-xs font-medium mb-1", valueClassName)}>
          {value}%
        </div>
      )}
      <div className="flex items-center gap-2 w-full">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            "relative w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800",
            thicknessClasses[thickness],
            className
          )}
          {...props}
        >
          <ProgressPrimitive.Indicator
            className={cn(
              "h-full w-full flex-1 rounded-full transition-all",
              indicatorColor || "bg-brand-blue-500 dark:bg-brand-blue-400"
            )}
            style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
          />
        </ProgressPrimitive.Root>
        {showValue && valuePosition === 'right' && (
          <div className={cn("text-xs font-medium flex-shrink-0", valueClassName)}>
            {value}%
          </div>
        )}
      </div>
    </div>
  );
});

Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
