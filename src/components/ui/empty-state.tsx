import React from 'react';
import { cva, type VariantProps } from "class-variance-authority";
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center p-6 rounded-lg text-center",
  {
    variants: {
      variant: {
        default: "bg-gray-50",
        card: "bg-white border border-gray-200 shadow-sm",
        subtle: "bg-transparent",
      },
      size: {
        default: "py-10",
        sm: "py-6",
        lg: "py-16",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  onSecondaryAction?: () => void;
  showAnimation?: boolean;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({
    className,
    variant,
    size,
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    secondaryActionLabel,
    secondaryActionHref,
    onSecondaryAction,
    showAnimation = true,
    ...props
  }, ref) => {
    const iconAnimation = {
      hidden: { scale: 0.8, opacity: 0 },
      visible: { 
        scale: 1,
        opacity: 1,
        transition: {
          delay: 0.1,
          duration: 0.4,
          ease: "easeOut"
        }
      }
    };
    
    const textAnimation = {
      hidden: { y: 10, opacity: 0 },
      visible: { 
        y: 0,
        opacity: 1,
        transition: {
          delay: 0.2,
          duration: 0.3,
          ease: "easeOut"
        }
      }
    };
    
    const buttonAnimation = {
      hidden: { y: 5, opacity: 0 },
      visible: { 
        y: 0,
        opacity: 1,
        transition: {
          delay: 0.3,
          duration: 0.3,
          ease: "easeOut"
        }
      }
    };

    return (
      <div
        ref={ref}
        className={cn(emptyStateVariants({ variant, size, className }))}
        {...props}
      >
        {Icon && (
          <motion.div
            className={cn(
              "flex items-center justify-center w-16 h-16 mb-4 rounded-full",
              variant === "default" ? "bg-white" : "bg-gray-50"
            )}
            initial={showAnimation ? "hidden" : "visible"}
            animate="visible"
            variants={iconAnimation}
          >
            <Icon className="w-8 h-8 text-gray-400" />
          </motion.div>
        )}
        
        <motion.h3
          className="text-lg font-medium text-gray-900 mb-1"
          initial={showAnimation ? "hidden" : "visible"}
          animate="visible"
          variants={textAnimation}
        >
          {title}
        </motion.h3>
        
        {description && (
          <motion.p
            className="text-sm text-gray-500 max-w-md mb-4"
            initial={showAnimation ? "hidden" : "visible"}
            animate="visible"
            variants={textAnimation}
          >
            {description}
          </motion.p>
        )}
        
        {(actionLabel || secondaryActionLabel) && (
          <motion.div 
            className="flex flex-wrap gap-3 mt-2"
            initial={showAnimation ? "hidden" : "visible"}
            animate="visible"
            variants={buttonAnimation}
          >
            {actionLabel && (
              <Button
                onClick={onAction}
                asChild={!!actionHref}
              >
                {actionHref ? <a href={actionHref}>{actionLabel}</a> : actionLabel}
              </Button>
            )}
            
            {secondaryActionLabel && (
              <Button
                variant="outline"
                onClick={onSecondaryAction}
                asChild={!!secondaryActionHref}
              >
                {secondaryActionHref ? <a href={secondaryActionHref}>{secondaryActionLabel}</a> : secondaryActionLabel}
              </Button>
            )}
          </motion.div>
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

export { EmptyState, emptyStateVariants }; 