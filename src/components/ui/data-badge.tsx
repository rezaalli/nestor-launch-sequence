import * as React from "react";
import { cn } from "@/lib/utils";

export interface DataBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "neutral" | "brand" | "success" | "warning" | "error" | "info";
  label?: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "flat";
  loading?: boolean;
}

const DataBadge = React.forwardRef<HTMLDivElement, DataBadgeProps>(
  ({ className, variant = "neutral", label, value, icon, trend, loading = false, ...props }, ref) => {
    // Map variant to class names
    const variantClassMap = {
      neutral: "data-badge-neutral",
      brand: "data-badge-brand",
      success: "data-badge-success",
      warning: "data-badge-warning",
      error: "data-badge-error",
      info: "data-badge-info",
    };

    // Trend indicator icon
    const trendIcon = trend ? (
      <span className="ml-1">
        {trend === "up" && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 4L20 12L17.5 14.5L13 10V20H11V10L6.5 14.5L4 12L12 4Z" fill="currentColor" />
          </svg>
        )}
        {trend === "down" && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 20L4 12L6.5 9.5L11 14V4H13V14L17.5 9.5L20 12L12 20Z" fill="currentColor" />
          </svg>
        )}
        {trend === "flat" && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        )}
      </span>
    ) : null;

    if (loading) {
      return (
        <div ref={ref} className={cn("data-badge", variantClassMap[variant], "animate-pulse", className)} {...props}>
          <div className="h-3 w-10 bg-current opacity-20 rounded"></div>
        </div>
      );
    }

    return (
      <div ref={ref} className={cn("data-badge", variantClassMap[variant], className)} {...props}>
        {icon && <span className="mr-1.5">{icon}</span>}
        <span className="inline-flex items-center">
          {label && <span className="mr-1">{label}:</span>}
          <span className="font-semibold">{value}</span>
          {trendIcon}
        </span>
      </div>
    );
  }
);

DataBadge.displayName = "DataBadge";

export { DataBadge }; 