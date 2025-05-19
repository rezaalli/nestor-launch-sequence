import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Maximize2, Minimize2, AlertCircle, Info, ThumbsUp, ThumbsDown, ExternalLink, Clock, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

export type InsightPriority = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night' | 'all-day';

export interface InsightSource {
  name: string;
  type: 'wearable' | 'manual' | 'assessment' | 'calculated' | 'historical';
  lastUpdated?: Date;
  confidence?: number;
}

export interface InsightAction {
  label: string;
  description: string;
  timeframe: 'now' | 'today' | 'week' | 'long-term';
  impact: 'high' | 'medium' | 'low';
  url?: string;
  isRecommendedForTimeOfDay?: TimeOfDay[];
}

export interface AdaptiveInsightProps {
  id: string;
  title: string;
  description: string;
  priority: InsightPriority;
  category: string;
  timestamp: Date;
  sources?: InsightSource[];
  context?: string;
  actions?: InsightAction[];
  relatedInsights?: string[];
  relatedMetrics?: string[];
  correlationStrength?: number;
  timeRelevance?: TimeOfDay[];
  visualData?: any; // For embedded mini-visualizations
  onFeedback?: (id: string, isHelpful: boolean, comment?: string) => void;
  onActionTaken?: (id: string, actionLabel: string) => void;
  onExpand?: (id: string) => void;
  currentTimeOfDay?: TimeOfDay;
  userPreferences?: {
    preferredCategories: string[];
    detailLevel: 'minimal' | 'moderate' | 'detailed';
  };
}

/**
 * AdaptiveInsightCard - An enhanced insight card with progressive disclosure,
 * contextual highlighting, and visual hierarchy based on user preferences and time of day
 */
const AdaptiveInsightCard: React.FC<AdaptiveInsightProps> = ({
  id,
  title,
  description,
  priority,
  category,
  timestamp,
  sources,
  context,
  actions,
  relatedInsights,
  relatedMetrics,
  correlationStrength,
  timeRelevance,
  visualData,
  onFeedback,
  onActionTaken,
  onExpand,
  currentTimeOfDay = 'morning',
  userPreferences
}) => {
  // States for progressive disclosure
  const [disclosureLevel, setDisclosureLevel] = useState<'minimal' | 'moderate' | 'detailed'>(
    userPreferences?.detailLevel || 'minimal'
  );
  const [expanded, setExpanded] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  
  // Determine if this insight is relevant for the current time of day
  const isRelevantNow = !timeRelevance || timeRelevance.includes('all-day') || 
    timeRelevance.includes(currentTimeOfDay);
  
  // Filter actions that are relevant for the current time of day
  const relevantActions = actions?.filter(action => 
    !action.isRecommendedForTimeOfDay || 
    action.isRecommendedForTimeOfDay.includes('all-day') || 
    action.isRecommendedForTimeOfDay.includes(currentTimeOfDay)
  );
  
  // Get color scheme based on priority and relevance
  const getPriorityStyles = (priority: InsightPriority, isRelevant: boolean) => {
    const base = {
      critical: {
        border: 'border-l-4 border-red-500',
        badge: 'bg-red-100 text-red-700',
        icon: <AlertCircle className="w-5 h-5 text-red-500" />,
        bg: 'bg-red-50'
      },
      high: {
        border: 'border-l-4 border-orange-500',
        badge: 'bg-orange-100 text-orange-700',
        icon: <AlertCircle className="w-5 h-5 text-orange-500" />,
        bg: 'bg-orange-50'
      },
      medium: {
        border: 'border-l-4 border-yellow-500',
        badge: 'bg-yellow-100 text-yellow-700',
        icon: null,
        bg: 'bg-yellow-50'
      },
      low: {
        border: 'border-l-4 border-green-500',
        badge: 'bg-green-100 text-green-700',
        icon: null,
        bg: 'bg-green-50'
      },
      info: {
        border: 'border-l-4 border-blue-500',
        badge: 'bg-blue-100 text-blue-700',
        icon: <Info className="w-5 h-5 text-blue-500" />,
        bg: 'bg-blue-50'
      }
    };
    
    // If not relevant for current time of day, reduce visual prominence
    if (!isRelevant && priority !== 'critical') {
      return {
        border: 'border-l-4 border-gray-300',
        badge: 'bg-gray-100 text-gray-600',
        icon: base[priority].icon,
        bg: 'bg-gray-50 opacity-75'
      };
    }
    
    return base[priority];
  };
  
  const priorityStyles = getPriorityStyles(priority, isRelevantNow);
  
  // Handle feedback submission
  const handleFeedback = (helpful: boolean) => {
    if (onFeedback) {
      onFeedback(id, helpful, feedbackComment);
      setFeedbackGiven(true);
      setShowFeedbackInput(false);
    }
  };
  
  // Handle action button click
  const handleAction = (actionLabel: string) => {
    if (onActionTaken) {
      onActionTaken(id, actionLabel);
    }
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
    if (onExpand && !fullscreen) {
      onExpand(id);
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Card 
        className={cn(
          "w-full overflow-hidden transition-all duration-300",
          priorityStyles.border,
          expanded && "shadow-lg",
          fullscreen && "fixed inset-0 z-50 max-w-none rounded-none",
          priority === 'critical' && isRelevantNow && "animate-pulse-subtle",
          !isRelevantNow && priority !== 'critical' && "opacity-80"
        )}
      >
        {/* Card Header */}
        <CardHeader className={cn("p-4 flex flex-row items-start justify-between", priorityStyles.bg)}>
          <div className="flex items-center space-x-2">
            {priorityStyles.icon && <div>{priorityStyles.icon}</div>}
            <CardTitle className="text-base font-medium">{title}</CardTitle>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center space-x-2">
              {isRelevantNow && (
                <Badge className="bg-indigo-100 text-indigo-700">
                  <Clock className="w-3 h-3 mr-1" />
                  Now
                </Badge>
              )}
              <Badge className={priorityStyles.badge}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Badge>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleFullscreen}>
                {fullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {category} • {new Date(timestamp).toLocaleDateString()}
            </span>
          </div>
        </CardHeader>
        
        {/* Card Body */}
        <CardContent className={cn("p-4", disclosureLevel === 'detailed' && "space-y-4")}>
          <p className="text-sm text-gray-700">{description}</p>
          
          {/* Source Indicators */}
          {sources && sources.length > 0 && disclosureLevel !== 'minimal' && (
            <div className="flex flex-wrap gap-1 mt-2">
              {sources.map((source, idx) => (
                <TooltipProvider key={idx}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge 
                        variant="outline" 
                        className="text-xs bg-gray-50 text-gray-600 cursor-help"
                      >
                        {source.name}
                        {source.confidence && (
                          <span className="ml-1 text-[0.6rem]">
                            ({Math.round(source.confidence * 100)}%)
                          </span>
                        )}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Data source: {source.type}</p>
                      {source.lastUpdated && <p>Last updated: {new Date(source.lastUpdated).toLocaleString()}</p>}
                      {source.confidence && <p>Confidence: {Math.round(source.confidence * 100)}%</p>}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
          )}
          
          {/* Correlation Strength - Only show if detailed view and has correlation data */}
          {correlationStrength !== undefined && disclosureLevel === 'detailed' && (
            <div className="mt-2">
              <p className="text-xs font-medium text-gray-700 mb-1">Correlation Strength</p>
              <div className="flex items-center">
                <Progress value={Math.abs(correlationStrength) * 100} className="h-2" />
                <span className="ml-2 text-xs text-gray-600">
                  {Math.abs(correlationStrength) < 0.3 ? 'Weak' : 
                   Math.abs(correlationStrength) < 0.6 ? 'Moderate' : 'Strong'}
                </span>
              </div>
            </div>
          )}
          
          {/* Mini visualization - Only in moderate and detailed views */}
          {visualData && (disclosureLevel === 'moderate' || disclosureLevel === 'detailed') && (
            <div className="mt-3 h-24 bg-gray-50 rounded-md border border-gray-200 flex items-center justify-center">
              {/* Placeholder for visualization component */}
              <p className="text-xs text-gray-500">Insight visualization</p>
            </div>
          )}
          
          {/* Progressive Disclosure Controls */}
          <div className="mt-3 flex justify-between items-center">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-gray-600 flex items-center gap-1"
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {expanded ? "Less details" : "More details"}
              </Button>
            </div>
            {disclosureLevel !== 'detailed' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-gray-600 flex items-center gap-1"
                onClick={() => setDisclosureLevel(disclosureLevel === 'minimal' ? 'moderate' : 'detailed')}
              >
                <RefreshCcw size={14} />
                {disclosureLevel === 'minimal' ? "More context" : "Full details"}
              </Button>
            )}
          </div>
        </CardContent>
        
        {/* Expandable Content */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <CardContent className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                {/* Context Section */}
                {context && (
                  <div className="my-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Context</h4>
                    <p className="text-sm text-gray-600">{context}</p>
                  </div>
                )}
                
                {/* Actions Section */}
                {relevantActions && relevantActions.length > 0 && (
                  <div className="my-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Actions</h4>
                    <div className="space-y-2">
                      {relevantActions.map((action, idx) => (
                        <div key={idx} className="bg-white p-2 rounded-md border border-gray-200">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium flex items-center">
                                {action.label}
                                {action.isRecommendedForTimeOfDay?.includes(currentTimeOfDay) && (
                                  <Badge className="ml-2 bg-indigo-100 text-indigo-700 text-[0.6rem]">
                                    <Clock className="w-2 h-2 mr-1" />
                                    Now
                                  </Badge>
                                )}
                              </p>
                              <p className="text-xs text-gray-600">{action.description}</p>
                              <div className="flex items-center mt-1">
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs", 
                                    action.timeframe === 'now' ? "bg-indigo-50 text-indigo-700" :
                                    action.timeframe === 'today' ? "bg-green-50 text-green-700" :
                                    action.timeframe === 'week' ? "bg-orange-50 text-orange-700" :
                                    "bg-blue-50 text-blue-700"
                                  )}
                                >
                                  {action.timeframe === 'now' ? "Do now" :
                                   action.timeframe === 'today' ? "Today" :
                                   action.timeframe === 'week' ? "This week" : "Long-term"}
                                </Badge>
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-xs ml-2", 
                                    action.impact === 'high' ? "bg-purple-50 text-purple-700" :
                                    action.impact === 'medium' ? "bg-blue-50 text-blue-700" :
                                    "bg-gray-50 text-gray-700"
                                  )}
                                >
                                  {action.impact === 'high' ? "High impact" :
                                   action.impact === 'medium' ? "Medium impact" : "Low impact"}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="flex">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="text-xs h-7"
                                onClick={() => handleAction(action.label)}
                              >
                                {action.url ? (
                                  <a href={action.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                                    <span>Learn more</span>
                                    <ExternalLink size={12} className="ml-1" />
                                  </a>
                                ) : (
                                  "Apply"
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Related Metrics & Insights - Only in detailed view */}
                {((relatedMetrics && relatedMetrics.length > 0) || 
                  (relatedInsights && relatedInsights.length > 0)) && (
                  <div className="my-3">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Related Data</h4>
                    {relatedMetrics && relatedMetrics.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-600 mb-1">Metrics:</p>
                        <div className="flex flex-wrap gap-2">
                          {relatedMetrics.map((metric, idx) => (
                            <Badge key={idx} variant="secondary" className="cursor-pointer">
                              {metric}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {relatedInsights && relatedInsights.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Insights:</p>
                        <div className="flex flex-wrap gap-2">
                          {relatedInsights.map((insight, idx) => (
                            <Badge key={idx} variant="secondary" className="cursor-pointer">
                              {insight}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Feedback Section */}
                {!feedbackGiven && (
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600 mb-2">Was this insight helpful?</p>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs h-7 flex items-center"
                        onClick={() => {
                          setShowFeedbackInput(true);
                          handleFeedback(true);
                        }}
                      >
                        <ThumbsUp size={12} className="mr-1" />
                        Yes
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs h-7 flex items-center"
                        onClick={() => {
                          setShowFeedbackInput(true);
                          handleFeedback(false);
                        }}
                      >
                        <ThumbsDown size={12} className="mr-1" />
                        No
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};

export default AdaptiveInsightCard; 