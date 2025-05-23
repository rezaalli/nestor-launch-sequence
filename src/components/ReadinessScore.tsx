import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Star, ArrowUp, Clock, ArrowRight, HelpCircle } from 'lucide-react';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useAssessment } from '@/contexts/AssessmentContext';
import { getContributingFactors, getReadinessGrade } from '@/utils/readinessScoring';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { SimpleSkeletonLoader as Skeleton } from "@/components/ui/skeleton";
import { generateReadinessInsights, getTopContributingCategories, generateWeeklyWellnessSummary, generateCondensedWellnessSummary } from '@/utils/insightGenerator';
import { getLastReading } from '@/utils/bleUtils';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";

interface ReadinessScoreProps {
  className?: string;
  showDetailed?: boolean;
  score?: number;
  showLabel?: boolean;
  value?: number; // For backward compatibility
  dailySummary?: string;
  weeklySummary?: string;
}

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const ReadinessScore = ({ 
  className = '', 
  showDetailed = false, 
  score, 
  showLabel, 
  value,
  dailySummary,
  weeklySummary
}: ReadinessScoreProps) => {
  const navigate = useNavigate();
  const { completedAssessments, getReadinessHistory } = useAssessment();
  
  // State to store the latest readiness score
  const [readinessData, setReadinessData] = useState({
    readinessScore: (score || value) ?? getLastReading()?.readiness ?? 82,
    changePercentage: 4 as number,
    isPositiveChange: true
  });
  
  // State for historical readiness trend
  const [weeklyTrend, setWeeklyTrend] = useState<{day: string; score: number; today: boolean}[]>([
    {day: 'Mon', score: 75, today: false},
    {day: 'Tue', score: 80, today: false},
    {day: 'Wed', score: 85, today: false},
    {day: 'Thu', score: 70, today: false},
    {day: 'Fri', score: 78, today: false},
    {day: 'Today', score: 82, today: true},
  ]);
  
  // State for contributing factors
  const [contributingFactors, setContributingFactors] = useState<{ name: string; percentage: number }[]>([
    { name: 'Physiological Metrics', percentage: 85 },
    { name: 'Lifestyle Consistency', percentage: 80 },
    { name: 'Self-Reported Health', percentage: 75 }
  ]);
  
  // State for expanded view
  const [isExpanded, setIsExpanded] = useState(false);
  
  // State for show weekly summary
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  
  // State for insights
  const [insights, setInsights] = useState({
    summary: "Your readiness improved thanks to consistent sleep schedule and lower caffeine intake. Consider maintaining your current hydration levels which supported recovery.",
    factors: [] as any[],
    recommendedActions: ["Maintain your current healthy routines to support recovery"]
  });
  
  // State for top supporters and limiters
  const [topSupporters, setTopSupporters] = useState<string[]>([]);
  const [topLimiters, setTopLimiters] = useState<string[]>([]);
  
  // Handle navigation to trends page
  const navigateToTrends = () => {
    navigate('/insights');
  };
  
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
      
      for (let i = 6; i >= 0; i--) {
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() - i);
        const targetDateStr = targetDate.toISOString().split('T')[0];
        const dayName = format(targetDate, 'E'); // Get short day name (Mon, Tue, etc.)
        const isToday = i === 0;
        
        const historyItem = readinessHistory.find(item => item.date.startsWith(targetDateStr));
        
        if (historyItem) {
          weeklyData.push({
            day: isToday ? 'Today' : dayName,
            score: historyItem.score,
            today: isToday
          });
          scores.push(historyItem.score);
        } else {
          // Use previous value or default if no data
          const prevValue = weeklyData.length > 0 ? weeklyData[weeklyData.length - 1].score : null;
          const score = prevValue ?? 70;
          weeklyData.push({
            day: isToday ? 'Today' : dayName,
            score: score,
            today: isToday
          });
          scores.push(score);
        }
      }
      
      setWeeklyTrend(weeklyData);
    }
  }, [completedAssessments, getReadinessHistory]);
  
  // Determine score grade and color
  const scoreGradeInfo = getReadinessGrade(readinessData.readinessScore);
  const { grade: scoreGrade, color: scoreColor } = scoreGradeInfo;
  
  return (
    <div className={`${className} p-5 bg-blue-50 rounded-xl`}>
      <div className="flex items-start mb-4">
        <div className="flex-1">
          {/* Score Header */}
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <Star className="text-blue-900" size={18} />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 flex items-center">
                Readiness Score
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="ml-1.5 focus:outline-none" aria-label="What affects my score?">
                        <HelpCircle className="text-blue-500 hover:text-blue-700 transition-colors" size={14} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-sm p-4">
                      <div className="space-y-3">
                        <h4 className="font-medium text-sm">What affects your score?</h4>
                        <div className="space-y-2">
                          {contributingFactors.map((factor, index) => (
                            <div key={index} className="flex items-start">
                              <div className={`w-2 h-2 rounded-full mt-1.5 ${factor.percentage > 80 ? 'bg-green-500' : factor.percentage > 60 ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                              <div className="ml-2">
                                <div className="text-xs font-medium">{factor.name}</div>
                                <div className="text-xs text-gray-500">
                                  {factor.name === 'Physiological Metrics' && 'Sleep quality, resting heart rate, and recovery metrics'}
                                  {factor.name === 'Lifestyle Consistency' && 'Regular exercise, balanced nutrition, and stress management'}
                                  {factor.name === 'Self-Reported Health' && 'Your subjective assessment of how you feel'}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-blue-600 font-medium">
                          Suggested improvement: {readinessData.readinessScore < 70 ? 'Focus on improving sleep quality and reducing stress' : 'Maintain your current healthy routines'}
                        </div>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </h3>
              <div className="flex items-center">
                <span className="text-2xl font-semibold text-blue-900 mr-1">{readinessData.readinessScore}</span>
                <span className="text-sm text-gray-600">/ 100</span>
                <div className={`flex items-center ${readinessData.isPositiveChange ? 'text-green-600' : 'text-red-600'} text-xs font-medium ml-2`}>
                  {readinessData.isPositiveChange ? (
                    <ArrowUp className="mr-1" size={12} />
                  ) : (
                    <ChevronDown className="mr-1" size={12} />
                  )}
                  <span>{readinessData.changePercentage}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Score Bar Timeline */}
          <div className="flex space-x-1.5 mb-3">
            {weeklyTrend.map((day, index) => (
              <div className="flex-1" key={index}>
                <div className="h-1.5 w-full bg-blue-200 rounded-full">
                  <div 
                    className="h-full bg-blue-900 rounded-full" 
                    style={{ width: `${day.score}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">{day.day}</div>
                <div className={`text-xs font-medium ${day.today ? 'text-blue-900' : 'text-gray-700'}`}>
                  {day.score}
                </div>
              </div>
            ))}
          </div>

          {/* Score Contribution Bars */}
          <div className="space-y-2">
            {contributingFactors.map((factor, index) => (
              <div className="flex items-center justify-between" key={index}>
                <span className="text-xs text-gray-600">{factor.name}</span>
                <div className="flex items-center">
                  <div className="w-16 h-1.5 bg-blue-200 rounded-full mr-2">
                    <div 
                      className="h-full bg-blue-900 rounded-full" 
                      style={{ width: `${factor.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-gray-700">{factor.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Daily and Weekly Summary Section */}
      {(dailySummary || weeklySummary) && (
        <div className="bg-white rounded-lg p-4 mb-3">
          {/* Daily Summary */}
          {dailySummary && (
            <div className="mb-3">
              <h4 className="font-medium text-sm text-gray-800 mb-1">Daily Summary</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {dailySummary}
              </p>
            </div>
          )}
          
          {/* Weekly Summary - Collapsible */}
          {weeklySummary && (
            <div className="mt-3">
              <h4 className="font-medium text-sm text-gray-800 mb-1">Weekly Summary</h4>
              <div className="text-center">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs text-gray-600 h-6 px-2 mx-auto"
                  onClick={() => setShowWeeklySummary(prev => !prev)}
                >
                  {showWeeklySummary ? "See less" : "See more"}
                </Button>
              </div>
              
              {showWeeklySummary && (
                <p className="text-sm text-gray-700 leading-relaxed mt-1">
                  {weeklySummary}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {showDetailed && (
        <Collapsible
          open={isExpanded}
          onOpenChange={setIsExpanded}
        >
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
          
          <CollapsibleContent>
            <div className="px-0 pb-0 border-t border-gray-100 pt-4 mt-4">
              {/* Recommended Actions */}
              <div className="mb-4">
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Recommended Actions</h4>
                <ul className="space-y-2">
                  {insights.recommendedActions.map((action, index) => (
                    <li key={index} className="flex items-start text-sm text-gray-700">
                      <Star className="text-green-500 mr-2 mt-0.5 flex-shrink-0" size={16} />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Detail View Link */}
              <div className="mt-4">
                <button 
                  className="w-full py-2.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                  onClick={navigateToTrends}
                >
                  View Detailed History
                </button>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </div>
  );
};

export default ReadinessScore;
