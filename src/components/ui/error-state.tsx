import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, RefreshCw, HelpCircle, Frown, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from "class-variance-authority";

const errorStateVariants = cva(
  "flex flex-col items-center justify-center p-6 rounded-lg text-center",
  {
    variants: {
      variant: {
        default: "bg-red-50 border border-red-100",
        subtle: "bg-transparent",
        card: "bg-white border border-gray-200 shadow-sm",
      },
      severity: {
        error: "text-red-600",
        warning: "text-amber-600",
        info: "text-blue-600",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      severity: "error",
      size: "default",
    },
  }
);

export interface ErrorStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof errorStateVariants> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  showAnimation?: boolean;
  code?: string;
}

const ErrorState = React.forwardRef<HTMLDivElement, ErrorStateProps>(
  ({
    className,
    variant,
    severity,
    size,
    title,
    description,
    icon,
    primaryAction,
    secondaryAction,
    showAnimation = true,
    code,
    ...props
  }, ref) => {
    const getDefaultIcon = () => {
      switch (severity) {
        case 'error':
          return <AlertCircle className="h-8 w-8 text-red-500" />;
        case 'warning':
          return <AlertTriangle className="h-8 w-8 text-amber-500" />;
        case 'info':
          return <HelpCircle className="h-8 w-8 text-blue-500" />;
        default:
          return <Frown className="h-8 w-8 text-red-500" />;
      }
    };

    const containerAnimation = {
      hidden: { opacity: 0, y: 20 },
      visible: { 
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.3,
          ease: "easeOut"
        }
      }
    };

    const iconAnimation = {
      hidden: { scale: 0.8, rotate: -10 },
      visible: {
        scale: 1,
        rotate: 0,
        transition: {
          type: "spring",
          stiffness: 200,
          damping: 20
        }
      }
    };

    return (
      <motion.div
        ref={ref}
        className={cn(errorStateVariants({ variant, severity, size, className }))}
        initial={showAnimation ? "hidden" : "visible"}
        animate="visible"
        variants={containerAnimation}
        {...props}
      >
        <motion.div
          className="mb-4"
          variants={iconAnimation}
        >
          {icon || getDefaultIcon()}
        </motion.div>

        <h3 className={cn(
          "text-lg font-medium mb-2",
          severity === 'error' ? "text-red-800" : 
          severity === 'warning' ? "text-amber-800" : "text-blue-800"
        )}>
          {title}
        </h3>

        {description && (
          <p className="text-sm text-gray-600 mb-4 max-w-md">
            {description}
          </p>
        )}

        {code && (
          <div className="mb-4 px-3 py-2 bg-gray-800 rounded text-xs text-white font-mono">
            {code}
          </div>
        )}

        <div className="flex flex-wrap gap-3 mt-1">
          {primaryAction && (
            <Button 
              onClick={primaryAction.onClick}
              className="flex items-center"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              {primaryAction.label}
            </Button>
          )}

          {secondaryAction && (
            <Button 
              variant="outline" 
              onClick={secondaryAction.onClick}
              className="flex items-center"
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              {secondaryAction.label}
            </Button>
          )}
        </div>
      </motion.div>
    );
  }
);

ErrorState.displayName = "ErrorState";

export { ErrorState, errorStateVariants };

// Predefined error states
export const NetworkErrorState = React.forwardRef<HTMLDivElement, Omit<ErrorStateProps, 'title' | 'description' | 'primaryAction'> & { onRetry: () => void }>(
  ({ onRetry, ...props }, ref) => (
    <ErrorState
      ref={ref}
      title="Connection Error"
      description="We couldn't connect to our servers. Please check your internet connection and try again."
      primaryAction={{ label: "Try Again", onClick: onRetry }}
      {...props}
    />
  )
);

NetworkErrorState.displayName = "NetworkErrorState";

export const DataLoadErrorState = React.forwardRef<HTMLDivElement, Omit<ErrorStateProps, 'title' | 'description' | 'primaryAction'> & { onRetry: () => void }>(
  ({ onRetry, ...props }, ref) => (
    <ErrorState
      ref={ref}
      title="Couldn't Load Data"
      description="There was a problem loading your data. We've been notified and are working to fix it."
      primaryAction={{ label: "Retry", onClick: onRetry }}
      {...props}
    />
  )
);

DataLoadErrorState.displayName = "DataLoadErrorState";

export const PermissionErrorState = React.forwardRef<HTMLDivElement, Omit<ErrorStateProps, 'title' | 'description' | 'primaryAction' | 'secondaryAction'> & { 
  onRequestPermission: () => void,
  onContinueWithout?: () => void
}>(
  ({ onRequestPermission, onContinueWithout, ...props }, ref) => (
    <ErrorState
      ref={ref}
      severity="warning"
      title="Permission Required"
      description="We need your permission to access this feature. Some functionality may be limited without it."
      primaryAction={{ label: "Grant Permission", onClick: onRequestPermission }}
      secondaryAction={onContinueWithout ? { label: "Continue Without", onClick: onContinueWithout } : undefined}
      {...props}
    />
  )
);

PermissionErrorState.displayName = "PermissionErrorState"; 