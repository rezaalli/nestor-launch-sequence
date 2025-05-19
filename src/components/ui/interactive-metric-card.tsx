import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Sparkles, ChevronDown, ChevronUp, Minus } from "lucide-react";

export interface InteractiveMetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  previousValue?: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'flat';
  trendValue?: string | number;
  trendLabel?: string;
  status?: 'neutral' | 'success' | 'warning' | 'error' | 'info';
  isLoading?: boolean;
  onExpand?: () => void;
  isExpandable?: boolean;
  isNew?: boolean;
  updated?: boolean;
  unit?: string;
  children?: React.ReactNode;
}

const InteractiveMetricCard = React.forwardRef<HTMLDivElement, InteractiveMetricCardProps>(
  ({ 
    className, 
    title, 
    value, 
    previousValue, 
    icon, 
    trend = 'flat', 
    trendValue, 
    trendLabel,
    status = 'neutral', 
    isLoading = false,
    onExpand,
    isExpandable = false,
    isNew = false,
    updated = false,
    unit,
    children,
    ...props 
  }, ref) => {
    const [showAnimation, setShowAnimation] = React.useState(updated);
    const [isHovered, setIsHovered] = React.useState(false);

    // Status color mapping
    const statusColorMap = {
      neutral: "bg-neutral-100 text-neutral-800",
      success: "bg-status-success-100 text-status-success-700",
      warning: "bg-status-warning-100 text-status-warning-700",
      error: "bg-status-error-100 text-status-error-700",
      info: "bg-status-info-100 text-status-info-700",
    };

    // Trend color mapping
    const trendColorMap = {
      up: "text-status-success-600",
      down: "text-status-error-600",
      flat: "text-neutral-500",
    };

    // Disable animation after it plays
    React.useEffect(() => {
      if (showAnimation) {
        const timer = setTimeout(() => {
          setShowAnimation(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    }, [showAnimation]);

    // Handle value update animation
    React.useEffect(() => {
      if (updated) {
        setShowAnimation(true);
      }
    }, [updated, value]);

    return (
      <div
        ref={ref}
        className={cn(
          "nestor-card p-4 transition-all duration-300",
          isExpandable && "cursor-pointer hover:shadow-md",
          isHovered && "transform scale-[1.02]",
          className
        )}
        onClick={isExpandable ? onExpand : undefined}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            {icon && (
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mr-2",
                statusColorMap[status].split(' ')[0] // Use background color from status
              )}>
                {icon}
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-neutral-600 flex items-center">
                {title}
                {isNew && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ml-2 px-1.5 py-0.5 bg-brand-blue-100 text-brand-blue-800 rounded text-[10px] font-medium"
                  >
                    NEW
                  </motion.div>
                )}
              </h3>
            </div>
          </div>

          {isExpandable && (
            <button 
              className="w-6 h-6 flex items-center justify-center rounded-full bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onExpand && onExpand();
              }}
            >
              <ChevronDown className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="relative">
          <AnimatePresence>
            {showAnimation && previousValue !== undefined && (
              <motion.div
                initial={{ y: 0, opacity: 1 }}
                animate={{ y: -20, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex items-center"
              >
                <span className="text-xl font-semibold text-neutral-400">
                  {previousValue}
                  {unit && <span className="text-sm font-medium ml-1">{unit}</span>}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            animate={showAnimation ? { 
              scale: [1, 1.1, 1],
              y: previousValue !== undefined ? [20, 0] : 0
            } : {}}
            transition={{ duration: 0.5 }}
            className="flex items-end"
          >
            {isLoading ? (
              <div className="h-7 w-16 bg-neutral-200 animate-pulse rounded"></div>
            ) : (
              <>
                <span className={cn(
                  "text-xl font-semibold",
                  trend === 'up' ? 'text-status-success-700' :
                  trend === 'down' ? 'text-status-error-700' :
                  'text-neutral-900'
                )}>
                  {value}
                </span>
                {unit && <span className="text-sm font-medium ml-1 text-neutral-500">{unit}</span>}
              </>
            )}
          </motion.div>

          {(trendValue || trendLabel) && (
            <div className={cn(
              "flex items-center text-xs mt-1 font-medium",
              trendColorMap[trend]
            )}>
              {trend === 'up' && <ChevronUp className="h-3 w-3 mr-0.5" />}
              {trend === 'down' && <ChevronDown className="h-3 w-3 mr-0.5" />}
              {trend === 'flat' && <Minus className="h-3 w-3 mr-0.5" />}
              {trendValue && <span className="mr-1">{trendValue}</span>}
              {trendLabel && <span className="text-neutral-500">{trendLabel}</span>}
            </div>
          )}
        </div>

        {showAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="absolute top-1 right-1"
          >
            <Sparkles className="h-4 w-4 text-brand-blue-500" />
          </motion.div>
        )}

        {children && (
          <div className="mt-3 pt-3 border-t border-neutral-100">
            {children}
          </div>
        )}
      </div>
    );
  }
);

InteractiveMetricCard.displayName = "InteractiveMetricCard";

export { InteractiveMetricCard }; 