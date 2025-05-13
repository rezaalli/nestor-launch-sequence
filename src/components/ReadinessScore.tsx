
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, CircleCheck, CircleMinus, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useAssessment } from '@/contexts/AssessmentContext';
import { getContributingFactors, getReadinessGrade } from '@/utils/readinessScoring';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";
import { generateReadinessInsights, getTopContributingCategories } from '@/utils/insightGenerator';
import { getLastReading } from '@/utils/bleUtils';
import { format } from 'date-fns';

interface ReadinessScoreProps {
  className?: string;
  showDetailed?: boolean;
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

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
    { name: 'Physiological Metrics', percentage: 75 },
    { name: 'Lifestyle Consistency', percentage: 85 },
    { name: 'Self-Reported Health', percentage: 78 }
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
  
  // State for top supporters and limiters
  const [topSupporters, setTopSupporters] = useState<string[]>([]);
  const [topLimiters, setTopLimiters] = useState<string[]>([]);
  
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
          
          // Rename the factors to match the new naming convention
          const renamedFactors = factors.map(factor => {
            if (factor.name === 'Sleep Quality') return { ...factor, name: 'Physiological Metrics' };
            if (factor.name === 'Lifestyle') return { ...factor, name: 'Lifestyle Consistency' };
            if (factor.name === 'Wellness') return { ...factor, name: 'Self-Reported Health' };
            return factor;
          });
          
          setContributingFactors(renamedFactors);
          
          // Generate insights
          const previousScore = previousAssessment?.readinessScore;
          const insights = generateReadinessInsights(sortedAssessments, latestAssessment.readinessScore, previousScore);
          setInsights(insights);
          
          // Extract top supporters and limiters
          const categories = getTopContributingCategories(latestAssessment.data);
          
          const supporters = categories
            .filter(cat => cat.impact === 'positive')
            .slice(0, 3)
            .map(cat => cat.category);
            
          const limiters = categories
            .filter(cat => cat.impact === 'negative')
            .slice(0, 3)
            .map(cat => cat.category);
            
          setTopSupporters(supporters);
          setTopLimiters(limiters);
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
        const mockTrend = [72, 68, 75, 81, 76, 79, 82];
        return mockTrend;
      };
      
      setWeeklyTrend(calculateDeviceBasedTrend());
    }
  }, [completedAssessments, getReadinessHistory]);
  
  // Determine score grade and color
  const scoreGradeInfo = getReadinessGrade(readinessData.readinessScore);
  const { grade: scoreGrade, color: scoreColor } = scoreGradeInfo;
  
  // Get color based on score (for bars)
  const getBarColor = (score: number): string => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={setIsExpanded}
      className={`bg-white border border-gray-100 rounded-xl shadow-sm ${className}`}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Readiness Score</h3>
            <div className="flex items-baseline mt-1">
              <span className={`text-3xl font-bold ${scoreColor}`}>{readinessData.readinessScore}</span>
              <span className="text-xs text-gray-600 ml-1.5">/ 100</span>
              <span className={`ml-3 text-sm font-medium ${scoreColor}`}>{scoreGrade}</span>
              <div className={`ml-3 flex items-center py-0.5 px-1.5 rounded ${readinessData.isPositiveChange ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'} text-xs`}>
                {readinessData.isPositiveChange ? (
                  <TrendingUp className="mr-0.5" size={12} />
                ) : (
                  <TrendingDown className="mr-0.5" size={12} />
                )}
                {readinessData.changePercentage}%
              </div>
            </div>
          </div>
        </div>
        
        {/* Weekly Trend Chart */}
        <div className="mb-5">
          <div className="flex items-end justify-between h-20">
            {weeklyTrend.map((value, index) => {
              const heightPercent = value ? `${value}%` : '0%';
              const barColor = getBarColor(value);
              const isToday = index === weeklyTrend.length - 1;
              
              return (
                <TooltipProvider key={index}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex-1 flex flex-col items-center">
                        <span className="text-xs font-medium mb-1">{value}</span>
                        <div className="w-full px-0.5">
                          <div 
                            className={`${barColor} rounded-sm ${isToday ? 'w-full' : 'w-2/3 mx-auto'}`} 
                            style={{ height: heightPercent }}
                          ></div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs py-1 px-2">
                      <p>{isToday ? 'Today' : index === 6 ? 'Yesterday' : `${6-index} days ago`}: {value}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              );
            })}
          </div>
          <div className="flex justify-between mt-1">
            {WEEKDAYS.map((day, i) => (
              <div key={i} className="flex-1 text-center">
                <span className="text-xs text-gray-500">{day}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Insight Summary */}
        <div className="mb-5">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Insight</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{insights.summary}</p>
        </div>
        
        {/* Contributing Categories */}
        <div className="mb-5">
          <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Key Contributors</h4>
          <div className="space-y-3">
            {contributingFactors.map((factor, index) => (
              <div className="flex items-center" key={index}>
                <span className="text-sm text-gray-700 w-32 pr-2">{factor.name}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={getBarColor(factor.percentage)} 
                    style={{ width: `${factor.percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-gray-700 ml-2 w-8 text-right">{factor.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Supplemental Metrics */}
        <div className="flex justify-between text-xs text-gray-600 border-t border-gray-100 pt-4">
          <div>
            <span className="text-gray-500">Weekly Avg</span>
            <p className="font-semibold">{weeklyMetrics.average}</p>
          </div>
          
          {topSupporters.length > 0 && (
            <div>
              <span className="text-gray-500">Top Supporter</span>
              <p className="font-semibold text-green-600">{topSupporters[0]}</p>
            </div>
          )}
          
          {topLimiters.length > 0 && (
            <div>
              <span className="text-gray-500">Top Limiter</span>
              <p className="font-semibold text-red-600">{topLimiters[0]}</p>
            </div>
          )}
        </div>
        
        {/* Expand/Collapse Button */}
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
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Recommended Actions</h4>
            <ul className="space-y-2">
              {insights.recommendedActions.map((action, index) => (
                <li key={index} className="flex items-start text-sm text-gray-700">
                  <CircleCheck className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Weekly Performance */}
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Weekly Performance</h4>
            <div className="flex justify-between text-sm">
              <div>
                <span className="text-gray-500">Best Day</span>
                <p className="font-semibold text-green-600">
                  {weeklyMetrics.bestDay.day} ({weeklyMetrics.bestDay.score})
                </p>
              </div>
              
              <div>
                <span className="text-gray-500">Weekly Average</span>
                <p className="font-semibold">{weeklyMetrics.average}</p>
              </div>
              
              <div>
                <span className="text-gray-500">Lowest Day</span>
                <p className="font-semibold text-red-600">
                  {weeklyMetrics.worstDay.day} ({weeklyMetrics.worstDay.score})
                </p>
              </div>
            </div>
          </div>
          
          {/* Detail View Link */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button 
              className="w-full py-2.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
              onClick={() => window.location.href = '/trends'}
            >
              View Detailed History
            </button>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ReadinessScore;
