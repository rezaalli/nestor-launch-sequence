import React, { useState } from 'react';
import { Heart, Zap, ChevronDown, ChevronUp, Plus, Minus, Activity } from 'lucide-react';
import { CircularProgress } from './ui/circular-progress';
import { cn } from '@/lib/utils';

export interface MetricDetail {
  label: string;
  value: number;
  changePercent: number;
  changeDirection: 'up' | 'down' | 'flat';
  status: 'neutral' | 'success' | 'warning' | 'error' | 'info';
  icon: JSX.Element;
  details?: Array<{
    label: string;
    value: string | number;
    info?: string;
  }>;
}

export interface TriMetricSystemProps {
  metrics: {
    overall: MetricDetail;
    recovery: MetricDetail;
    activity: MetricDetail;
  };
  className?: string;
}

const TriMetricSystem: React.FC<TriMetricSystemProps> = ({ metrics, className }) => {
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  const toggleMetricExpansion = (metricName: string) => {
    setExpandedMetric(expandedMetric === metricName ? null : metricName);
  };

  const getStatusText = (metric: MetricDetail) => {
    switch (metric.status) {
      case 'success':
        return 'Excellent';
      case 'info':
        return 'Good';
      case 'warning':
        return 'Fair';
      case 'error':
        return 'Poor';
      default:
        return 'Normal';
    }
  };

  const renderChangeIndicator = (metric: MetricDetail) => (
    <div className={cn(
      "flex items-center text-xs font-medium",
      metric.changeDirection === 'up' ? 'text-status-success-600' : 
      metric.changeDirection === 'down' ? 'text-status-error-600' : 
      'text-neutral-500'
    )}>
      {metric.changeDirection === 'up' && <ChevronUp className="h-3 w-3 mr-0.5" />}
      {metric.changeDirection === 'down' && <ChevronDown className="h-3 w-3 mr-0.5" />}
      {metric.changeDirection === 'flat' && <span className="h-3 w-3 mr-0.5">―</span>}
      {Math.abs(metric.changePercent)}%
    </div>
  );

  const renderExpandedDetails = (metric: MetricDetail) => {
    if (!metric.details || metric.details.length === 0) return null;
    
    return (
      <div className="mt-3 pt-3 border-t border-neutral-100 w-full">
        {metric.details.map((detail, index) => (
          <div key={index} className="flex justify-between items-center mb-2 last:mb-0">
            <div className="flex items-center">
              <span className="text-xs text-neutral-600">{detail.label}</span>
            </div>
            <span className="text-xs font-medium">{detail.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={cn("bg-white rounded-xl p-4", className)}>
      <h3 className="text-base font-semibold mb-4">Daily Health Score</h3>
      
      <div className="grid grid-cols-3 gap-2">
        {/* Overall Health Metric */}
        <div 
          className={cn(
            "p-3 rounded-xl cursor-pointer transition-all duration-300 flex flex-col items-center",
            expandedMetric === 'overall' ? 'bg-neutral-50 col-span-3' : '',
            "hover:bg-neutral-50"
          )}
          onClick={() => toggleMetricExpansion('overall')}
        >
          <div className={cn(
            "flex flex-col items-center",
            expandedMetric === 'overall' ? 'w-full' : ''
          )}>
            <div className={cn(
              "flex items-center gap-4 mb-2",
              expandedMetric === 'overall' ? 'w-full justify-between' : 'flex-col justify-center'
            )}>
              <CircularProgress 
                value={metrics.overall.value}
                max={100}
                size={expandedMetric === 'overall' ? "md" : "sm"}
                thickness={6}
                status={metrics.overall.status}
                animated
                icon={<Activity className="h-4 w-4 text-blue-600" />}
                label={expandedMetric !== 'overall' ? "Health" : undefined}
              />
              
              <div className={expandedMetric === 'overall' ? "" : "text-center"}>
                <div className="font-medium text-sm">
                  {expandedMetric === 'overall' ? 'Health Score' : getStatusText(metrics.overall)}
                </div>
                {renderChangeIndicator(metrics.overall)}
                {expandedMetric === 'overall' && (
                  <div className="text-xs text-neutral-500 mt-1">vs. your baseline</div>
                )}
              </div>
            </div>
          </div>
          
          {expandedMetric === 'overall' && renderExpandedDetails(metrics.overall)}
        </div>
        
        {/* Recovery Metric */}
        <div 
          className={cn(
            "p-3 rounded-xl cursor-pointer transition-all duration-300 flex flex-col items-center",
            expandedMetric === 'recovery' ? 'bg-neutral-50 col-span-3' : '',
            "hover:bg-neutral-50"
          )}
          onClick={() => toggleMetricExpansion('recovery')}
        >
          <div className={cn(
            "flex flex-col items-center",
            expandedMetric === 'recovery' ? 'w-full' : ''
          )}>
            <div className={cn(
              "flex items-center gap-4 mb-2",
              expandedMetric === 'recovery' ? 'w-full justify-between' : 'flex-col justify-center'
            )}>
              <CircularProgress 
                value={metrics.recovery.value}
                max={100}
                size={expandedMetric === 'recovery' ? "md" : "sm"}
                thickness={6}
                status={metrics.recovery.status}
                animated
                icon={<Heart className="h-4 w-4 text-red-600" />}
                label={expandedMetric !== 'recovery' ? "Recovery" : undefined}
              />
              
              <div className={expandedMetric === 'recovery' ? "" : "text-center"}>
                <div className="font-medium text-sm">
                  {expandedMetric === 'recovery' ? 'Recovery Score' : getStatusText(metrics.recovery)}
                </div>
                {renderChangeIndicator(metrics.recovery)}
                {expandedMetric === 'recovery' && (
                  <div className="text-xs text-neutral-500 mt-1">vs. your baseline</div>
                )}
              </div>
            </div>
          </div>
          
          {expandedMetric === 'recovery' && renderExpandedDetails(metrics.recovery)}
        </div>
        
        {/* Activity Metric */}
        <div 
          className={cn(
            "p-3 rounded-xl cursor-pointer transition-all duration-300 flex flex-col items-center",
            expandedMetric === 'activity' ? 'bg-neutral-50 col-span-3' : '',
            "hover:bg-neutral-50"
          )}
          onClick={() => toggleMetricExpansion('activity')}
        >
          <div className={cn(
            "flex flex-col items-center",
            expandedMetric === 'activity' ? 'w-full' : ''
          )}>
            <div className={cn(
              "flex items-center gap-4 mb-2",
              expandedMetric === 'activity' ? 'w-full justify-between' : 'flex-col justify-center'
            )}>
              <CircularProgress 
                value={metrics.activity.value}
                max={100}
                size={expandedMetric === 'activity' ? "md" : "sm"}
                thickness={6}
                status={metrics.activity.status}
                animated
                icon={<Zap className="h-4 w-4 text-amber-600" />}
                label={expandedMetric !== 'activity' ? "Activity" : undefined}
              />
              
              <div className={expandedMetric === 'activity' ? "" : "text-center"}>
                <div className="font-medium text-sm">
                  {expandedMetric === 'activity' ? 'Activity Score' : getStatusText(metrics.activity)}
                </div>
                {renderChangeIndicator(metrics.activity)}
                {expandedMetric === 'activity' && (
                  <div className="text-xs text-neutral-500 mt-1">vs. your baseline</div>
                )}
              </div>
            </div>
          </div>
          
          {expandedMetric === 'activity' && renderExpandedDetails(metrics.activity)}
        </div>
      </div>
    </div>
  );
};

export default TriMetricSystem; 