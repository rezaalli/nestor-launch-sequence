import React, { useState, useEffect } from 'react';
import { Sun, Moon, Coffee, Clock, ChevronRight, Calendar, Zap, BarChart2, TrendingUp, Info, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

// Import components needed for insights preview
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

// Import types for insights
export type InsightPriority = 'critical' | 'high' | 'medium' | 'low' | 'info';

// Time of day type
type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

// Insight preview interface
interface InsightPreview {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: InsightPriority;
}

interface DailyStatusCardProps {
  date?: Date;
  onViewAllClick?: () => void;
  onAdvancedInsightsClick?: () => void;
  className?: string;
}

const DailyStatusCard: React.FC<DailyStatusCardProps> = ({ 
  date = new Date(), 
  onViewAllClick,
  onAdvancedInsightsClick,
  className
}) => {
  const navigate = useNavigate();
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [insightPreviews, setInsightPreviews] = useState<InsightPreview[]>([]);
  
  // Determine time of day based on current hour
  useEffect(() => {
    const updateTimeOfDay = () => {
      const currentHour = new Date().getHours();
      
      if (currentHour >= 5 && currentHour < 12) {
        setTimeOfDay('morning');
      } else if (currentHour >= 12 && currentHour < 17) {
        setTimeOfDay('afternoon');
      } else if (currentHour >= 17 && currentHour < 22) {
        setTimeOfDay('evening');
      } else {
        setTimeOfDay('night');
      }
    };
    
    updateTimeOfDay();
    
    // Generate sample insights for preview
    generateInsightPreviews();
    
    // Update time of day every hour
    const intervalId = setInterval(updateTimeOfDay, 60 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [date]);
  
  // Generate sample insights for the demo
  const generateInsightPreviews = () => {
    // Simulate fetching insights from the insights page
    const insights: InsightPreview[] = [
      {
        id: 'insight-001',
        title: 'Stress and Activity Connection',
        description: 'High stress days show reduced activity levels.',
        category: 'Activity',
        priority: 'high'
      },
      {
        id: 'insight-002',
        title: 'Optimal Recovery Window',
        description: 'Your body shows the best recovery between 10 PM and 2 AM.',
        category: 'Recovery',
        priority: 'medium'
      },
      {
        id: 'insight-003',
        title: 'Hydration Impact',
        description: 'Water intake correlates with improved recovery metrics.',
        category: 'Nutrition',
        priority: 'critical'
      }
    ];
    
    // Sort by priority importance: critical, high, medium, low, info
    insights.sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    setInsightPreviews(insights);
  };
  
  // Handle insight click - navigate to the insights page
  const handleInsightClick = (insightId: string) => {
    if (onViewAllClick) {
      // We'll use the same handler for now, but in a real implementation 
      // we'd want to pass the insight ID to the insights page
      onViewAllClick();
    }
  };
  
  // Generate greeting based on time of day
  const getGreeting = () => {
    switch (timeOfDay) {
      case 'morning':
        return 'Good morning';
      case 'afternoon':
        return 'Good afternoon';
      case 'evening':
        return 'Good evening';
      case 'night':
        return 'Good night';
    }
  };
  
  // Generate contextual prompt based on time of day
  const getContextualPrompt = () => {
    switch (timeOfDay) {
      case 'morning':
        return 'Focus on hydration and movement to boost energy levels';
      case 'afternoon':
        return 'Take short breaks to maintain productivity'; 
      case 'evening':
        return 'Wind down with relaxation activities';
      case 'night':
        return 'Prepare for quality sleep - avoid screens';
    }
  };
  
  // Get time of day icon
  const getTimeOfDayIcon = () => {
    switch (timeOfDay) {
      case 'morning':
        return <Sun className="h-5 w-5 text-amber-500" />;
      case 'afternoon':
        return <Sun className="h-5 w-5 text-amber-600" />;
      case 'evening':
        return <Sun className="h-5 w-5 text-amber-700" />;
      case 'night':
        return <Moon className="h-5 w-5 text-indigo-400" />;
    }
  };

  // Get priority styles for insight cards
  const getPriorityStyles = (priority: InsightPriority) => {
    switch (priority) {
      case 'critical':
        return {
          border: 'border-l-[6px] border-l-gradient-to-b from-red-600 to-red-400 bg-gradient-to-r from-red-50 to-transparent dark:from-red-900/20 dark:to-transparent',
          badge: 'bg-gradient-to-r from-red-600 to-red-500 text-white',
          icon: <Info className="w-4 h-4 text-red-500" />
        };
      case 'high':
        return {
          border: 'border-l-[6px] border-l-gradient-to-b from-orange-600 to-orange-400 bg-gradient-to-r from-orange-50 to-transparent dark:from-orange-900/20 dark:to-transparent',
          badge: 'bg-gradient-to-r from-orange-600 to-orange-500 text-white',
          icon: <Info className="w-4 h-4 text-orange-500" />
        };
      case 'medium':
        return {
          border: 'border-l-[6px] border-l-gradient-to-b from-yellow-600 to-yellow-400 bg-gradient-to-r from-yellow-50 to-transparent dark:from-yellow-900/20 dark:to-transparent',
          badge: 'bg-gradient-to-r from-yellow-600 to-yellow-500 text-white',
          icon: <Info className="w-4 h-4 text-yellow-500" />
        };
      case 'low':
        return {
          border: 'border-l-[6px] border-l-gradient-to-b from-green-600 to-green-400 bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/20 dark:to-transparent',
          badge: 'bg-gradient-to-r from-green-600 to-green-500 text-white',
          icon: <Info className="w-4 h-4 text-green-500" />
        };
      case 'info':
      default:
        return {
          border: 'border-l-[6px] border-l-gradient-to-b from-blue-600 to-blue-400 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-900/20 dark:to-transparent',
          badge: 'bg-gradient-to-r from-blue-600 to-blue-500 text-white',
          icon: <Info className="w-4 h-4 text-blue-500" />
        };
    }
  };

  return (
    <Card className={cn("overflow-hidden ds-card", className)} variant="elevated">
      <CardHeader className="pb-2 pt-5 px-5 ds-card-header">
        <CardTitle className="text-lg flex items-center justify-between">
          <span className="flex items-center gap-2 text-foreground dark:text-slate-100">
            {getTimeOfDayIcon()}
            <span>{getGreeting()}</span>
          </span>
          <Badge variant="outline" className="font-normal">
            <Clock className="h-3 w-3 mr-1" />
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 ds-card-content">
        <div className="mb-6">
          <p className="text-sm text-neutral-700 dark:text-slate-300 mb-3 font-medium">{getContextualPrompt()}</p>
        </div>
        
        {/* Personalized Insights Preview */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-slate-300">Personalized Insights</h4>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs text-neutral-600 dark:text-slate-400 h-7 px-2.5 ds-button ds-button-sm ds-button-ghost"
              onClick={onViewAllClick}
            >
              View All
              <ArrowRight className="ml-1.5 h-3 w-3" />
            </Button>
          </div>
          
          <div className="space-y-4 ds-stagger">
            {insightPreviews.map((insight, idx) => {
              const priorityStyles = getPriorityStyles(insight.priority);
              
              // Extract key metrics from description for highlighting
              const metrics = insight.description.match(/(\d+(\.\d+)?%|\d+(\.\d+)?x|\d+(\.\d+)?\s(min|hrs|days|bpm))/g);
              
              return (
                <div 
                  key={insight.id}
                  className={cn(
                    "rounded-lg border bg-white dark:bg-slate-800 dark:border-slate-700 p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all duration-200",
                    priorityStyles.border,
                    insight.priority === 'critical' && "animate-pulse-subtle",
                    "shadow-md hover:shadow-lg transform hover:-translate-y-1 group ds-interactive ds-animate-appear"
                  )}
                  style={{ animationDelay: `${idx * 75}ms` }}
                  onClick={() => handleInsightClick(insight.id)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-start">
                      {priorityStyles.icon && 
                        <div className="mr-3 p-2 bg-white dark:bg-slate-700 rounded-full shadow-sm flex-shrink-0 mt-0.5 group-hover:shadow group-hover:scale-105 transition-transform">
                          {priorityStyles.icon}
                        </div>
                      }
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-slate-200 text-sm mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{insight.title}</h3>
                        <p className="text-xs text-gray-700 dark:text-slate-300">{insight.description}</p>
                        
                        {/* Highlight key metrics if found */}
                        {metrics && metrics.length > 0 && (
                          <div className="mt-2 flex items-center gap-2">
                            {metrics.map((metric, idx) => (
                              <div key={idx} className="flex items-center">
                                <span className="text-base font-bold text-blue-600 dark:text-blue-400">{metric}</span>
                                {idx < metrics.length - 1 && (
                                  <span className="mx-1.5 text-gray-400">•</span>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge className={cn(priorityStyles.badge, "px-2 py-0.5 text-xs font-medium rounded-full shadow-sm")}>
                            {insight.priority.charAt(0).toUpperCase() + insight.priority.slice(1)}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-xs">{insight.priority === 'critical' ? 'Needs immediate attention' : 
                                              insight.priority === 'high' ? 'Important to address' : 
                                              insight.priority === 'medium' ? 'Worth considering' : 
                                              insight.priority === 'low' ? 'For future reference' : 
                                              'Informational only'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  
                  <div className="flex justify-between items-center mt-3 ml-10">
                    <Badge 
                      variant="outline" 
                      className="text-xs font-normal bg-gray-50 dark:bg-slate-700 dark:border-slate-600 text-gray-600 dark:text-slate-300 shadow-sm"
                    >
                      {insight.category}
                    </Badge>
                    
                    {/* Replace "Tap to learn more" with a proper button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center gap-1 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-all rounded-full ds-button ds-button-sm ds-button-ghost"
                    >
                      <span>View details</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DailyStatusCard; 