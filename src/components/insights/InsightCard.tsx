import React, { useState } from 'react';
import { 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

// Priority levels for insights
export type InsightPriority = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface InsightSource {
  name: string;
  type: 'wearable' | 'manual' | 'assessment' | 'calculated';
  lastUpdated?: Date;
  confidence?: number;
}

export interface InsightAction {
  label: string;
  description: string;
  timeframe: 'now' | 'today' | 'week' | 'long-term';
  impact: 'high' | 'medium' | 'low';
  url?: string;
}

export interface InsightProps {
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
  onFeedback?: (id: string, isHelpful: boolean, comment?: string) => void;
  onActionTaken?: (id: string, actionLabel: string) => void;
}

/**
 * InsightCard component with visual priority system and expandable contextual explanations
 */
const InsightCard: React.FC<InsightProps> = ({
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
  onFeedback,
  onActionTaken
}) => {
  const [expanded, setExpanded] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);
  
  // Get color scheme based on priority
  const getPriorityStyles = (priority: InsightPriority) => {
    switch (priority) {
      case 'critical':
        return {
          border: 'border-l-[6px] border-l-gradient-to-b from-red-600 to-red-400 bg-gradient-to-r from-red-50 to-transparent dark:from-red-900/20 dark:to-transparent',
          badge: 'bg-gradient-to-r from-red-600 to-red-500 text-white',
          icon: <AlertCircle className="w-5 h-5 text-red-500" />
        };
      case 'high':
        return {
          border: 'border-l-[6px] border-l-gradient-to-b from-orange-600 to-orange-400 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-900/20 dark:to-transparent',
          badge: 'bg-gradient-to-r from-orange-600 to-orange-500 text-white',
          icon: <AlertCircle className="w-5 h-5 text-orange-500" />
        };
      case 'medium':
        return {
          border: 'border-l-[6px] border-l-gradient-to-b from-yellow-600 to-yellow-400 bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/20 dark:to-transparent',
          badge: 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white',
          icon: <Info className="w-5 h-5 text-yellow-500" />
        };
      case 'low':
        return {
          border: 'border-l-[6px] border-l-gradient-to-b from-green-600 to-green-400 bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/20 dark:to-transparent',
          badge: 'bg-gradient-to-r from-green-600 to-green-500 text-white',
          icon: <Info className="w-5 h-5 text-green-500" />
        };
      case 'info':
      default:
        return {
          border: 'border-l-[6px] border-l-gradient-to-b from-blue-600 to-blue-400 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent',
          badge: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white',
          icon: <Info className="w-5 h-5 text-blue-500" />
        };
    }
  };
  
  const priorityStyles = getPriorityStyles(priority);
  
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
  
  return (
    <Card 
      className={cn(
        "w-full mb-4 overflow-hidden ds-card ds-interactive",
        priorityStyles.border,
        priority === 'critical' && "animate-pulse-subtle",
        "transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1 group ds-animate-appear"
      )}
    >
      {/* Card Header */}
      <div className="p-6 cursor-pointer group-hover:bg-gray-50 dark:group-hover:bg-slate-800/60 ds-card-content" onClick={() => setExpanded(!expanded)}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            {priorityStyles.icon && 
              <div className="p-2.5 bg-white dark:bg-slate-800 rounded-full shadow-sm flex-shrink-0 mt-0.5 group-hover:shadow group-hover:scale-105 transition-transform">
                {priorityStyles.icon}
              </div>
            }
            <div className="space-y-1">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
              {/* Description moved inside this container for better grouping */}
              <p className="text-sm text-gray-700 dark:text-gray-300">{description}</p>
              
              {/* Highlight key metrics - extract numbers from description and make them larger */}
              {description.match(/\d+(\.\d+)?%|\d+(\.\d+)?x|\d+(\.\d+)?\s(min|hrs|days|bpm)/) && (
                <div className="mt-2 flex items-center gap-2">
                  {description.match(/(\d+(\.\d+)?%|\d+(\.\d+)?x|\d+(\.\d+)?\s(min|hrs|days|bpm))/g)?.map((metric, idx) => (
                    <div key={idx} className="flex items-center">
                      <span className="text-xl font-bold text-blue-600 dark:text-blue-400">{metric}</span>
                      {idx < (description.match(/(\d+(\.\d+)?%|\d+(\.\d+)?x|\d+(\.\d+)?\s(min|hrs|days|bpm))/g)?.length || 0) - 1 && (
                        <span className="mx-2 text-gray-400">•</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Badge className={cn(priorityStyles.badge, "px-2.5 py-1 text-xs font-medium rounded-full shadow-sm")}>
              {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Badge>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
              {category} • {new Date(timestamp).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        {/* Source Indicators */}
        {sources && sources.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4 mb-4 ml-11">
            {sources.map((source, idx) => (
              <TooltipProvider key={idx}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-gray-300 cursor-help shadow-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      {source.name}
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
        
        {/* Expandable Section Toggle */}
        {(context || actions?.length > 0 || relatedInsights?.length > 0) && (
          <div className="w-full mt-3 flex justify-center items-center text-gray-600 dark:text-gray-400 border-t border-gray-100 dark:border-gray-800 pt-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1.5 px-4 py-1 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(!expanded);
              }}
            >
              <div className={cn(
                "transition-transform duration-300 ease-in-out",
                expanded ? "rotate-180" : "rotate-0"
              )}>
                <ChevronDown size={18} className={cn(
                  "transition-colors",
                  expanded ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-gray-400"
                )} />
              </div>
              <span className={cn(
                "transition-colors",
                expanded ? "text-blue-500 dark:text-blue-400" : "text-gray-500 dark:text-gray-400" 
              )}>
                {expanded ? "Show less" : "Show more"}
              </span>
            </Button>
          </div>
        )}
      </div>
      
      {/* Expandable Content */}
      {expanded && (
        <div 
          className="px-6 pb-6 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-gray-800 animate-slideDown ds-card-content"
        >
          {/* Context Section */}
          {context && (
            <div className="my-4 animate-fadeIn">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Context</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-2">{context}</p>
            </div>
          )}
          
          {/* Actions Section */}
          {actions && actions.length > 0 && (
            <div className="my-4 animate-fadeIn delay-100">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Suggested Actions</h4>
              <div className="space-y-3 ds-stagger">
                {actions.map((action, idx) => (
                  <div 
                    key={idx} 
                    className="bg-white dark:bg-slate-800 p-3 rounded-md border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer ds-interactive ds-animate-slide-up"
                    style={{ animationDelay: `${idx * 50 + 150}ms` }}
                  >
                    <div className="flex justify-between items-start gap-3">
                      <div className="space-y-1.5">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{action.label}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{action.description}</p>
                      </div>
                      <div className="flex flex-col space-y-1.5 items-end">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            action.timeframe === 'now' && "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
                            action.timeframe === 'today' && "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800",
                            action.timeframe === 'week' && "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800",
                            action.timeframe === 'long-term' && "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                          )}
                        >
                          {action.timeframe === 'now' ? 'Urgent' : 
                           action.timeframe === 'today' ? 'Today' : 
                           action.timeframe === 'week' ? 'This week' : 'Long-term'}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            action.impact === 'high' && "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800",
                            action.impact === 'medium' && "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800",
                            action.impact === 'low' && "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800"
                          )}
                        >
                          {action.impact === 'high' ? 'High impact' : 
                           action.impact === 'medium' ? 'Medium impact' : 'Low impact'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex justify-end mt-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs h-7 px-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 dark:hover:bg-blue-900/20 dark:hover:text-blue-400 dark:hover:border-blue-800 transition-colors"
                        onClick={() => handleAction(action.label)}
                      >
                        {action.url ? (
                          <a href={action.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                            <span>Learn more</span>
                            <ExternalLink size={12} className="ml-1" />
                          </a>
                        ) : (
                          <span className="flex items-center">
                            Apply
                            <ChevronRight className="h-3 w-3 ml-1" />
                          </span>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Related Insights */}
          {relatedInsights && relatedInsights.length > 0 && (
            <div className="my-4 animate-fadeIn delay-200">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Related Insights</h4>
              <div className="flex flex-wrap gap-2 ml-2">
                {relatedInsights.map((insight, idx) => (
                  <Badge 
                    key={idx} 
                    variant="secondary" 
                    className="cursor-pointer py-1 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  >
                    {insight}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {/* Feedback Section */}
          {!feedbackGiven && onFeedback && (
            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-700 animate-fadeIn delay-300">
              <p className="text-xs text-gray-700 dark:text-gray-300 mb-2">Was this insight helpful?</p>
              
              {showFeedbackInput ? (
                <div className="space-y-3">
                  <textarea
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-gray-200"
                    placeholder="Tell us why (optional)"
                    rows={2}
                    value={feedbackComment}
                    onChange={e => setFeedbackComment(e.target.value)}
                  />
                  <div className="flex space-x-3">
                    <Button 
                      size="sm" 
                      variant="secondary"
                      className="text-xs"
                      onClick={() => setShowFeedbackInput(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      size="sm"
                      className="text-xs"
                      onClick={() => handleFeedback(true)}
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-3">
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs flex items-center hover:bg-green-50 hover:border-green-200 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:border-green-800 dark:hover:text-green-400 transition-colors ds-interactive"
                    onClick={() => {
                      setShowFeedbackInput(true);
                    }}
                  >
                    <ThumbsUp size={14} className="mr-1.5" />
                    Yes
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-xs flex items-center hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-800 dark:hover:text-red-400 transition-colors ds-interactive"
                    onClick={() => {
                      setShowFeedbackInput(true);
                    }}
                  >
                    <ThumbsDown size={14} className="mr-1.5" />
                    No
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default InsightCard; 