import * as React from "react";
import { cn } from "@/lib/utils";

export interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "elevated" | "flat";
  children: React.ReactNode;
  loading?: boolean;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = "default", children, loading = false, ...props }, ref) => {
    // Map variants to class names
    const variantClassMap = {
      default: "nestor-card",
      interactive: "nestor-card-interactive",
      elevated: "nestor-card shadow-md",
      flat: "nestor-card shadow-none",
    };
    
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(variantClassMap[variant], "skeleton-card", className)}
          {...props}
        >
          <div className="p-4 space-y-3">
            <div className="h-4 w-3/4 bg-neutral-200 rounded"></div>
            <div className="h-10 w-full bg-neutral-200 rounded"></div>
            <div className="h-4 w-1/2 bg-neutral-200 rounded"></div>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(variantClassMap[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
EnhancedCard.displayName = "EnhancedCard";

// Header component for the card
const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("nestor-card-header", className)} {...props} />
));
EnhancedCardHeader.displayName = "EnhancedCardHeader";

// Content component for the card
const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("nestor-card-content", className)} {...props} />
));
EnhancedCardContent.displayName = "EnhancedCardContent";

// Footer component for the card
const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("nestor-card-footer", className)} {...props} />
));
EnhancedCardFooter.displayName = "EnhancedCardFooter";

// Title component for the card
const EnhancedCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold tracking-tight leading-tight text-neutral-900",
      className
    )}
    {...props}
  />
));
EnhancedCardTitle.displayName = "EnhancedCardTitle";

// Description component for the card
const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-neutral-500 leading-normal", className)}
    {...props}
  />
));
EnhancedCardDescription.displayName = "EnhancedCardDescription";

// Metric value component for the card
const EnhancedCardMetric = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { label?: string; trend?: "up" | "down" | "flat"; trendLabel?: string }
>(({ className, label, trend, trendLabel, ...props }, ref) => {
  const trendIcon = trend ? (
    <span className={cn(
      "inline-flex items-center ml-1 text-sm font-medium",
      trend === "up" ? "text-status-success-600" : trend === "down" ? "text-status-error-600" : "text-neutral-500"
    )}>
      {trend === "up" && (
        <svg className="w-4 h-4 mr-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 4L20 12L17.5 14.5L13 10V20H11V10L6.5 14.5L4 12L12 4Z" fill="currentColor" />
        </svg>
      )}
      {trend === "down" && (
        <svg className="w-4 h-4 mr-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 20L4 12L6.5 9.5L11 14V4H13V14L17.5 9.5L20 12L12 20Z" fill="currentColor" />
        </svg>
      )}
      {trend === "flat" && (
        <svg className="w-4 h-4 mr-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      )}
      {trendLabel}
    </span>
  ) : null;
  
  return (
    <div ref={ref} className={cn("flex flex-col", className)} {...props}>
      {label && <div className="text-sm font-medium text-neutral-500 mb-1">{label}</div>}
      <div className="flex items-baseline">
        <div className="metric-value">{props.children}</div>
        {trendIcon}
      </div>
    </div>
  );
});
EnhancedCardMetric.displayName = "EnhancedCardMetric";

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardContent,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardMetric
}; 