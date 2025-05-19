import React, { useState, useEffect } from 'react';
import { ChevronRight, Target, Award, TrendingUp, Check, BarChart3, Clock, Sparkles } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface GoalMetric {
  id: string;
  name: string;
  currentValue: number;
  targetValue: number;
  startValue: number; // Initial starting value for calculating progress
  unit: string;
  timeframe: 'daily' | 'weekly' | 'monthly' | 'custom';
  category: string;
  startDate: Date;
  endDate?: Date;
  metricId: string; // ID that links this goal to a specific health metric
  milestones?: {
    value: number;
    label: string;
    reached: boolean;
  }[];
  relatedInsights?: string[];
  trendDirection?: 'up' | 'down' | 'neutral';
  trendPercentage?: number;
}

interface GoalVisualizationProps {
  goals: GoalMetric[];
  onGoalClick?: (goalId: string) => void;
  onInsightClick?: (insightId: string) => void;
}

/**
 * GoalVisualization component with animated progress and cross-references to insights
 */
const GoalVisualization: React.FC<GoalVisualizationProps> = ({
  goals,
  onGoalClick,
  onInsightClick
}) => {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(goals.length > 0 ? goals[0].id : null);
  const [showAnimation, setShowAnimation] = useState(true);
  
  // Reset animation when selected goal changes
  useEffect(() => {
    setShowAnimation(true);
    const timer = setTimeout(() => setShowAnimation(false), 1200);
    return () => clearTimeout(timer);
  }, [selectedGoal]);
  
  // Find the currently selected goal data
  const currentGoal = goals.find(g => g.id === selectedGoal) || goals[0];
  
  // Calculate progress percentage
  const calculateProgress = (goal: GoalMetric) => {
    // Handle cases where target is lower than current (for decreasing metrics)
    if (goal.targetValue < goal.currentValue) {
      const total = goal.startValue - goal.targetValue;
      const current = goal.startValue - goal.currentValue;
      return Math.min(100, Math.max(0, (current / total) * 100));
    }
    
    // Regular case: increasing metrics
    const range = goal.targetValue - goal.startValue;
    if (range <= 0) return 100; // Prevent division by zero
    const progress = goal.currentValue - goal.startValue;
    return Math.min(100, Math.max(0, (progress / range) * 100));
  };
  
  // Determine status based on progress
  const getStatus = (goal: GoalMetric) => {
    const progress = calculateProgress(goal);
    
    if (progress >= 100) return 'complete';
    
    // Check if we have trend data to see if we're on track
    if (goal.trendDirection) {
      const isPositiveTrend = goal.trendDirection === 'up' && goal.targetValue > goal.currentValue;
      const isNegativeTrend = goal.trendDirection === 'down' && goal.targetValue < goal.currentValue;
      
      if (isPositiveTrend || isNegativeTrend) {
        return 'on-track';
      } else if (goal.trendDirection === 'neutral') {
        return 'at-risk';
      } else {
        return 'off-track';
      }
    }
    
    // Default logic based on progress
    if (progress > 75) return 'on-track';
    if (progress > 40) return 'at-risk';
    return 'off-track';
  };
  
  // Format days remaining
  const getDaysRemaining = (goal: GoalMetric) => {
    if (!goal.endDate) return null;
    
    const today = new Date();
    const end = new Date(goal.endDate);
    const diffTime = Math.abs(end.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (end < today) return 'Deadline passed';
    return diffDays === 1 ? '1 day left' : `${diffDays} days left`;
  };
  
  // Get status-specific color schemes
  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'complete':
        return {
          bgColor: 'bg-green-50',
          textColor: 'text-green-700',
          borderColor: 'border-green-200',
          progressColor: 'bg-green-500',
          icon: <Check className="w-5 h-5 text-green-500" />
        };
      case 'on-track':
        return {
          bgColor: 'bg-blue-50',
          textColor: 'text-blue-700',
          borderColor: 'border-blue-200',
          progressColor: 'bg-blue-500',
          icon: <TrendingUp className="w-5 h-5 text-blue-500" />
        };
      case 'at-risk':
        return {
          bgColor: 'bg-yellow-50',
          textColor: 'text-yellow-700',
          borderColor: 'border-yellow-200',
          progressColor: 'bg-yellow-500',
          icon: <Clock className="w-5 h-5 text-yellow-500" />
        };
      case 'off-track':
        return {
          bgColor: 'bg-red-50',
          textColor: 'text-red-700',
          borderColor: 'border-red-200',
          progressColor: 'bg-red-500',
          icon: <TrendingUp className="w-5 h-5 text-red-500 transform rotate-180" />
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          textColor: 'text-gray-700',
          borderColor: 'border-gray-200',
          progressColor: 'bg-gray-500',
          icon: <Target className="w-5 h-5 text-gray-500" />
        };
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold flex items-center">
          <Target className="mr-2 h-5 w-5 text-purple-600" />
          Goals Tracking
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No goals found</p>
          </div>
        ) : (
          <div>
            {/* Goal Selection */}
            <div className="flex flex-wrap gap-2 mb-4">
              {goals.map(goal => {
                const isSelected = goal.id === selectedGoal;
                const status = getStatus(goal);
                const statusStyles = getStatusStyles(status);
                
                return (
                  <Badge
                    key={goal.id}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer",
                      isSelected ? `bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100` : "",
                      "flex items-center gap-1"
                    )}
                    onClick={() => setSelectedGoal(goal.id)}
                  >
                    {statusStyles.icon}
                    <span>{goal.name}</span>
                  </Badge>
                );
              })}
            </div>
            
            {currentGoal && (
              <div 
                className={cn(
                  "p-4 rounded-lg border transition-colors duration-300",
                  getStatusStyles(getStatus(currentGoal)).borderColor,
                  getStatusStyles(getStatus(currentGoal)).bgColor,
                  "cursor-pointer hover:opacity-90"
                )}
                onClick={() => onGoalClick && onGoalClick(currentGoal.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className={cn("font-medium", getStatusStyles(getStatus(currentGoal)).textColor)}>
                      {currentGoal.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {currentGoal.category} • {currentGoal.timeframe}
                    </p>
                  </div>
                  <Badge 
                    className={cn(
                      getStatus(currentGoal) === 'complete' && "bg-green-100 text-green-700",
                      getStatus(currentGoal) === 'on-track' && "bg-blue-100 text-blue-700",
                      getStatus(currentGoal) === 'at-risk' && "bg-yellow-100 text-yellow-700",
                      getStatus(currentGoal) === 'off-track' && "bg-red-100 text-red-700"
                    )}
                  >
                    {getStatus(currentGoal) === 'complete' ? 'Completed' :
                     getStatus(currentGoal) === 'on-track' ? 'On Track' :
                     getStatus(currentGoal) === 'at-risk' ? 'At Risk' : 'Off Track'}
                  </Badge>
                </div>
                
                {/* Progress visualization */}
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">
                      {calculateProgress(currentGoal).toFixed(0)}% Complete
                      {calculateProgress(currentGoal) === 100 && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="inline-flex ml-2"
                        >
                          <Sparkles size={16} className="text-yellow-500" />
                        </motion.span>
                      )}
                    </span>
                    {getDaysRemaining(currentGoal) && (
                      <span className="text-gray-600">{getDaysRemaining(currentGoal)}</span>
                    )}
                  </div>
                  
                  <div className="relative">
                    {/* Base progress bar */}
                    <Progress 
                      value={showAnimation ? 0 : calculateProgress(currentGoal)} 
                      className="h-3"
                    />
                    
                    {/* Animated progress overlay */}
                    <AnimatePresence>
                      {showAnimation && (
                        <motion.div 
                          className={cn(
                            "absolute top-0 left-0 h-3 rounded-lg bg-primary",
                            getStatusStyles(getStatus(currentGoal)).progressColor
                          )}
                          initial={{ width: "0%" }}
                          animate={{ width: `${calculateProgress(currentGoal)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </AnimatePresence>
                    
                    {/* Milestones */}
                    {currentGoal.milestones && currentGoal.milestones.map((milestone, idx) => {
                      // Calculate position on the progress bar
                      const position = ((milestone.value - currentGoal.startValue) / 
                                        (currentGoal.targetValue - currentGoal.startValue)) * 100;
                      
                      return (
                        <TooltipProvider key={idx}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div 
                                className={cn(
                                  "absolute top-1/2 transform -translate-y-1/2 w-2 h-5 rounded-full",
                                  milestone.reached ? "bg-green-500" : "bg-gray-300"
                                )}
                                style={{ left: `${position}%` }}
                                whileHover={{ scale: 1.5 }}
                                animate={milestone.reached ? {
                                  scale: [1, 1.5, 1],
                                  borderRadius: ["50%", "50%", "50%"]
                                } : {}}
                                transition={milestone.reached ? {
                                  duration: 2,
                                  repeat: Infinity,
                                  repeatType: "reverse"
                                } : {}}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{milestone.label}</p>
                              <p>{milestone.value} {currentGoal.unit}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}

                    {/* Progress pulse indicator */}
                    {getStatus(currentGoal) === 'on-track' && (
                      <motion.div
                        className="absolute top-0 left-0 h-3 rounded-lg bg-blue-500 opacity-30"
                        style={{ width: `${calculateProgress(currentGoal)}%` }}
                        animate={{ opacity: [0.2, 0.4, 0.2] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    )}
                  </div>
                </div>
                
                {/* Current vs Target */}
                <div className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-600">Current:</span>
                    <motion.span 
                      className="font-medium ml-1"
                      animate={{ color: showAnimation ? "#4f46e5" : "#374151" }}
                      transition={{ duration: 1 }}
                    >
                      {currentGoal.currentValue} {currentGoal.unit}
                    </motion.span>
                    
                    {currentGoal.trendDirection && (
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "ml-2 text-xs",
                          currentGoal.trendDirection === 'up' && "text-green-700",
                          currentGoal.trendDirection === 'down' && "text-red-700"
                        )}
                      >
                        {currentGoal.trendPercentage && (
                          <motion.span
                            animate={
                              currentGoal.trendDirection === 'up' ? 
                              { y: [0, -2, 0] } : 
                              currentGoal.trendDirection === 'down' ? 
                              { y: [0, 2, 0] } : {}
                            }
                            transition={{ repeat: Infinity, duration: 2 }}
                          >
                            {currentGoal.trendDirection === 'up' ? '↑' : 
                             currentGoal.trendDirection === 'down' ? '↓' : '→'} 
                            {Math.abs(currentGoal.trendPercentage).toFixed(1)}%
                          </motion.span>
                        )}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <span className="text-gray-600">Target:</span>
                    <span className="font-medium ml-1">
                      {currentGoal.targetValue} {currentGoal.unit}
                    </span>
                  </div>
                </div>
                
                {/* Related Insights */}
                {currentGoal.relatedInsights && currentGoal.relatedInsights.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-700 mb-2">Related Insights:</p>
                    <div className="flex flex-wrap gap-2">
                      {currentGoal.relatedInsights.map((insight, idx) => (
                        <Badge 
                          key={idx} 
                          variant="outline"
                          className="cursor-pointer text-xs bg-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            onInsightClick && onInsightClick(insight);
                          }}
                        >
                          {insight}
                          <ChevronRight size={12} className="ml-1" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Add default props
GoalVisualization.defaultProps = {
  goals: []
};

export default GoalVisualization; 