
import React, { useState, useEffect } from 'react';
import { Star, ArrowUp, ArrowDown, Info, ChevronDown, ChevronUp, Badge, Activity, Coffee, Sun } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAssessment } from '@/contexts/AssessmentContext';
import { getContributingFactors, getReadinessGrade } from '@/utils/readinessScoring';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { generateReadinessInsights, getTopContributingCategories } from '@/utils/insightGenerator';
import { getLastReading } from '@/utils/bleUtils';
import { format } from 'date-fns';

interface ReadinessScoreProps {
  className?: string;
  showDetailed?: boolean;
}

const CATEGORY_ICONS: Record<string, any> = {
  "Sleep Quality": Sun,
  "Mental Health": Coffee,
  "Physical Activity": Activity,
  "Nutrition": Coffee,
  "Substance Use": Coffee,
  "Symptoms": Info
};

const ReadinessScore = ({ className = '', showDetailed = false }: ReadinessScoreProps) => {
  const { completedAssessments, getReadinessHistory } = useAssessment();
  
  // State to store the latest readiness score
  const [readinessData, setReadinessData] = useState({
    readinessScore: getLastReading()?.readiness ?? 82,
    changePercentage: 4 as number,
    isPositiveChange: true
  });
  
  // State for historical readiness trend
  const [weeklyTrend, setWeeklyTrend] = useState<number[]>([]);
  
  // State for contributing factors
  const [contributingFactors, setContributingFactors] = useState<{ name: string; percentage: number }[]>([
    { name: 'Sleep Quality', percentage: 75 },
    { name: 'Lifestyle', percentage: 85 },
    { name: 'Wellness', percentage: 78 }
  ]);
  
  // State for expanded view
  const [isExpanded, setIsExpanded] = useState(false);
  
  // State for insights
  const [insights, setInsights] = useState({
    summary: "Complete your daily assessment to receive personalized insights.",
    factors: [] as any[],
    recommendedActions: ["Take your first assessment to establish a baseline"]
  });
  
  // State for weekly metrics
  const [weeklyMetrics, setWeeklyMetrics] = useState({
    average: 0,
    bestDay: { day: '', score: 0 },
    worstDay: { day: '', score: 0 }
  });
  
  // State for category breakdown
  const [categoryBreakdown, setcategoryBreakdown] = useState<{
    category: string;
    score: number;
    impact: 'positive' | 'negative' | 'neutral';
  }[]>([]);
  
  // Update readiness data when new assessments come in
  useEffect(() => {
    // Check if we have a recent assessment
    if (completedAssessments.length > 0) {
      const sortedAssessments = [...completedAssessments].sort((a, b) => 
        new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
      );
      
      const latestAssessment = sortedAssessments[0];
      
      if (latestAssessment.readinessScore !== undefined) {
        // Get the previous day's assessment if available
        const previousAssessment = sortedAssessments.length > 1 ? sortedAssessments[1] : null;
        let changePercentage = 0;
        let isPositiveChange = true;
        
        if (previousAssessment?.readinessScore !== undefined) {
          const currentScore = latestAssessment.readinessScore;
          const previousScore = previousAssessment.readinessScore;
          
          if (previousScore > 0) {
            changePercentage = Math.round(((currentScore - previousScore) / previousScore) * 100);
            isPositiveChange = changePercentage > 0;
          }
        }
        
        setReadinessData({
          readinessScore: Math.round(latestAssessment.readinessScore),
          changePercentage: Math.abs(changePercentage),
          isPositiveChange
        });
        
        // Calculate contributing factors if assessment data available
        if (latestAssessment.data) {
          const factors = getContributingFactors(latestAssessment.data);
          setContributingFactors(factors);
          
          // Generate insights
          const previousScore = previousAssessment?.readinessScore;
          const insights = generateReadinessInsights(sortedAssessments, latestAssessment.readinessScore, previousScore);
          setInsights(insights);
          
          // Get category breakdown
          const categories = getTopContributingCategories(latestAssessment.data);
          setcategoryBreakdown(categories);
        }
      }
    }
    
    // Calculate weekly trend from assessment history
    const readinessHistory = getReadinessHistory(7);
    
    if (readinessHistory.length > 0) {
      // Fill in missing days with estimated values
      const weeklyData = [];
      const now = new Date();
      const scores: number[] = [];
      let bestScore = 0;
      let bestDay = '';
      let worstScore = 100;
      let worstDay = '';
      
      for (let i = 6; i >= 0; i--) {
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() - i);
        const targetDateStr = targetDate.toISOString().split('T')[0];
        const dayName = format(targetDate, 'E'); // Get short day name (Mon, Tue, etc.)
        
        const historyItem = readinessHistory.find(item => item.date.startsWith(targetDateStr));
        
        if (historyItem) {
          weeklyData.push(historyItem.score);
          scores.push(historyItem.score);
          
          // Track best and worst days
          if (historyItem.score > bestScore) {
            bestScore = historyItem.score;
            bestDay = dayName;
          }
          if (historyItem.score < worstScore) {
            worstScore = historyItem.score;
            worstDay = dayName;
          }
        } else {
          // Use previous value or default if no data
          const prevValue = weeklyData.length > 0 ? weeklyData[weeklyData.length - 1] : null;
          const score = prevValue ?? 70;
          weeklyData.push(score);
          scores.push(score);
        }
      }
      
      setWeeklyTrend(weeklyData);
      
      // Calculate weekly average
      const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
      
      setWeeklyMetrics({
        average: Math.round(average),
        bestDay: { day: bestDay, score: bestScore },
        worstDay: { day: worstDay, score: worstScore }
      });
    } else {
      // Fall back to device data if no assessment data
      const calculateDeviceBasedTrend = () => {
        // This function uses the existing device-based logic from the original component
        const recentReadings = getReadings(7);
        const now = new Date();
        const weeklyData = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
          const dayEnd = dayStart + 24 * 60 * 60 * 1000;
          
          const dayReadings = recentReadings.filter(r => r.timestamp >= dayStart && r.timestamp < dayEnd);
          
          if (dayReadings.length > 0) {
            const dayAvg = dayReadings.reduce((sum, r) => sum + r.readiness, 0) / dayReadings.length;
            weeklyData.push(Math.round(dayAvg));
          } else {
            const prevValue = weeklyData.length > 0 ? weeklyData[weeklyData.length - 1] : null;
            weeklyData.push(prevValue ?? 70);
          }
        }
        
        return weeklyData;
      };
      
      setWeeklyTrend(calculateDeviceBasedTrend());
    }
  }, [completedAssessments, getReadinessHistory]);
  
  // Helper function for compatibility with original code
  const getReadings = (days: number) => {
    // Mock function to maintain compatibility
    const lastReading = getLastReading();
    if (!lastReading) return [];
    
    // Create mock readings for the past days
    const readings = [];
    const now = Date.now();
    
    for (let i = 0; i < days; i++) {
      readings.push({
        ...lastReading,
        timestamp: now - (i * 24 * 60 * 60 * 1000)
      });
    }
    
    return readings;
  };
  
  // Determine score grade and color
  const scoreGradeInfo = getReadinessGrade(readinessData.readinessScore);
  const { grade: scoreGrade, color: scoreColor } = scoreGradeInfo;
  
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={`bg-white border border-gray-100 rounded-xl shadow-sm ${className}`}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-3">
              <Star className="text-blue-600" size={20} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 text-lg">Readiness Score</h3>
              <div className="flex items-center">
                <span className={`text-2xl font-bold ${scoreColor} mr-1`}>{readinessData.readinessScore}</span>
                <span className="text-xs text-gray-600 mt-1">/ 100</span>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-end">
            <div className={`flex items-center py-1 px-2 rounded-full ${readinessData.isPositiveChange ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} text-xs font-medium mb-1`}>
              {readinessData.isPositiveChange ? (
                <ArrowUp className="mr-1" size={12} />
              ) : (
                <ArrowDown className="mr-1" size={12} />
              )}
              <span>{readinessData.changePercentage}%</span>
            </div>
            
            <span className={`text-sm font-medium ${scoreColor}`}>{scoreGrade}</span>
          </div>
        </div>
        
        {/* Weekly Mini Chart */}
        <div className="mb-4 h-20">
          <div className="flex items-end justify-between h-full">
            {weeklyTrend.map((value, index) => {
              const heightPercent = value ? `${value}%` : '0%';
              let barColor = 'bg-blue-200';
              
              if (value >= 85) barColor = 'bg-green-500';
              else if (value >= 70) barColor = 'bg-blue-500';
              else if (value >= 50) barColor = 'bg-yellow-500';
              else barColor = 'bg-red-500';
              
              return (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex-1 flex items-end justify-center px-0.5">
                        <div 
                          className={`w-full ${barColor} rounded-t`} 
                          style={{ height: heightPercent }}
                        ></div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{value} - {index === 6 ? 'Today' : index === 5 ? 'Yesterday' : `${6-index} days ago`}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
          <div className="flex justify-between mt-1 text-xs text-gray-500">
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
            <span>Today</span>
          </div>
        </div>
        
        {/* Weekly Average and Best/Worst Days */}
        <div className="flex justify-between mb-4 text-xs">
          <div className="text-center">
            <span className="text-gray-500">Weekly Avg</span>
            <p className="font-bold text-sm">{weeklyMetrics.average}</p>
          </div>
          
          <div className="text-center">
            <span className="text-gray-500">Best Day</span>
            <p className="font-bold text-sm text-green-600">
              {weeklyMetrics.bestDay.day} ({weeklyMetrics.bestDay.score})
            </p>
          </div>
          
          <div className="text-center">
            <span className="text-gray-500">Lowest Day</span>
            <p className="font-bold text-sm text-red-600">
              {weeklyMetrics.worstDay.day} ({weeklyMetrics.worstDay.score})
            </p>
          </div>
        </div>
        
        {/* Insight Summary */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Insight Summary</h4>
          <p className="text-sm text-gray-600">{insights.summary}</p>
        </div>
        
        {/* Main Contributing Categories */}
        <div>
          <h4 className="text-sm font-medium text-gray-800 mb-2 flex items-center">
            Contributing Categories
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info size={14} className="ml-1 text-blue-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">These factors influence your readiness score</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h4>
          
          <div className="space-y-2">
            {contributingFactors.slice(0, 3).map((factor, index) => (
              <div className="flex items-center" key={index}>
                <span className="text-xs text-gray-600 w-24">{factor.name}</span>
                <div className="flex-1 mx-2">
                  <div className="h-1.5 bg-gray-200 rounded-full">
                    <div 
                      className={`h-full rounded-full ${
                        factor.percentage >= 85 ? 'bg-green-500' : 
                        factor.percentage >= 70 ? 'bg-blue-500' : 
                        factor.percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${factor.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-xs font-medium min-w-8 text-right">{factor.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
        
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-center mt-3 text-blue-600 text-sm font-medium">
            {isExpanded ? (
              <>
                <ChevronUp size={16} className="mr-1" />
                Less Details
              </>
            ) : (
              <>
                <ChevronDown size={16} className="mr-1" />
                More Details
              </>
            )}
          </button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent>
        <div className="px-5 pb-5 border-t border-gray-100 pt-4">
          {/* Recommended Actions */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-800 mb-2">Recommended Actions</h4>
            <ul className="list-disc pl-5 text-sm text-gray-600">
              {insights.recommendedActions.map((action, index) => (
                <li key={index}>{action}</li>
              ))}
            </ul>
          </div>
          
          {/* All Categories Breakdown */}
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-2">All Categories</h4>
            <div className="space-y-3">
              {categoryBreakdown.map((category, index) => {
                const Icon = CATEGORY_ICONS[category.category] || Info;
                return (
                  <div className="flex items-center" key={index}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 ${
                      category.impact === 'positive' ? 'bg-green-100 text-green-600' : 
                      category.impact === 'negative' ? 'bg-red-100 text-red-600' : 
                      'bg-gray-100 text-gray-600'
                    }`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-sm">{category.category}</span>
                    <div className="flex-1 mx-2">
                      <div className="h-1.5 bg-gray-200 rounded-full">
                        <div 
                          className={`h-full rounded-full ${
                            category.score >= 85 ? 'bg-green-500' : 
                            category.score >= 70 ? 'bg-blue-500' : 
                            category.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${category.score}%` }}
                        ></div>
                      </div>
                    </div>
                    <span className="text-xs font-medium min-w-8 text-right">{category.score}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* View Detailed History Link */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button className="w-full py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium">
              View Detailed Readiness History
            </button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ReadinessScore;
