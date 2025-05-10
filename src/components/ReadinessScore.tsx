
import React, { useState, useEffect } from 'react';
import { Star, ArrowUp, ArrowDown, Info } from 'lucide-react';
import { getLastReading } from '@/utils/bleUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAssessment } from '@/contexts/AssessmentContext';
import { getContributingFactors, getReadinessGrade } from '@/utils/readinessScoring';

interface ReadinessScoreProps {
  className?: string;
  showDetailed?: boolean;
}

const ReadinessScore = ({ className = '', showDetailed = false }: ReadinessScoreProps) => {
  const { completedAssessments, getReadinessHistory } = useAssessment();
  
  // State to store the latest readiness score
  const [readinessData, setReadinessData] = useState({
    readinessScore: getLastReading()?.readiness ?? 82,
    changePercentage: 4 as number, // Cast as number to fix type issue
    isPositiveChange: true
  });
  
  // State for historical readiness trend
  const [weeklyTrend, setWeeklyTrend] = useState<number[]>([]);
  // State for contributing factors
  const [contributingFactors, setContributingFactors] = useState<{ name: string; percentage: number }[]>([
    { name: 'Sleep Quality', percentage: 75 },
    { name: 'HRV', percentage: 85 },
    { name: 'Recovery', percentage: 78 }
  ]);
  
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
        }
      }
    }
    
    // Calculate weekly trend from assessment history
    const readinessHistory = getReadinessHistory(7);
    
    if (readinessHistory.length > 0) {
      // Fill in missing days with estimated values
      const weeklyData = [];
      const now = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() - i);
        const targetDateStr = targetDate.toISOString().split('T')[0];
        
        const historyItem = readinessHistory.find(item => item.date.startsWith(targetDateStr));
        
        if (historyItem) {
          weeklyData.push(historyItem.score);
        } else {
          // Use previous value or default if no data
          const prevValue = weeklyData.length > 0 ? weeklyData[weeklyData.length - 1] : null;
          weeklyData.push(prevValue ?? 70);
        }
      }
      
      setWeeklyTrend(weeklyData);
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

  const renderDetailedView = () => (
    <div className={`p-5 bg-blue-50 rounded-xl ${className}`}>
      <div className="flex items-center mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
          <Star className="text-blue-900" size={18} />
        </div>
        <div>
          <h3 className="font-medium text-nestor-gray-900">Readiness Score</h3>
          <div className="flex items-center">
            <span className={`text-lg font-medium ${scoreColor} mr-1`}>{readinessData.readinessScore}</span>
            <span className="text-xs text-nestor-gray-600">/ 100</span>
            <span className={`text-xs ml-2 ${scoreColor}`}>({scoreGrade})</span>
          </div>
        </div>
        {readinessData.changePercentage !== 0 && (
          <div className={`ml-auto flex items-center ${readinessData.isPositiveChange ? 'text-green-600' : 'text-red-600'} text-xs font-medium`}>
            {readinessData.isPositiveChange ? (
              <ArrowUp className="mr-1" size={14} />
            ) : (
              <ArrowDown className="mr-1" size={14} />
            )}
            <span>{readinessData.changePercentage}%</span>
          </div>
        )}
      </div>
      
      {/* Weekly Mini Chart */}
      <div className="mb-4 h-16">
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
          <span>7d</span>
          <span>6d</span>
          <span>5d</span>
          <span>4d</span>
          <span>3d</span>
          <span>2d</span>
          <span>Today</span>
        </div>
      </div>
      
      <p className="text-sm text-nestor-gray-700">
        {readinessData.readinessScore >= 85 ? 
          "You're fully recovered and ready for peak performance today." :
          readinessData.readinessScore >= 70 ?
          "Your body is well recovered. You can engage in moderate to high-intensity activities." :
          readinessData.readinessScore >= 50 ?
          "Your recovery is partial. Consider moderate activities and avoid peak intensity." :
          "Your body needs more recovery. Focus on rest and light activities today."
        }
      </p>
      
      {/* Readiness Factors */}
      <div className="mt-4 pt-4 border-t border-blue-100">
        <h4 className="text-sm font-medium text-nestor-gray-900 mb-3 flex items-center">
          Contributing Factors
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
        
        <div className="space-y-3">
          {contributingFactors.map((factor, index) => (
            <div className="flex items-center justify-between" key={index}>
              <span className="text-xs text-gray-600">{factor.name}</span>
              <div className="flex-1 mx-4">
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
              <span className="text-xs font-medium">{factor.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSimpleView = () => (
    <div className={`p-5 bg-blue-50 rounded-xl ${className}`}>
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
          <Star className="text-blue-900" size={18} />
        </div>
        <div>
          <h3 className="font-medium text-nestor-gray-900">Readiness Score</h3>
          <div className="flex items-center">
            <span className={`text-sm font-medium ${scoreColor} mr-1`}>{readinessData.readinessScore}</span>
            <span className="text-xs text-nestor-gray-600">/ 100</span>
            <span className={`text-xs ml-2 ${scoreColor}`}>({scoreGrade})</span>
          </div>
        </div>
        {readinessData.changePercentage !== 0 && (
          <div className={`ml-auto flex items-center ${readinessData.isPositiveChange ? 'text-green-600' : 'text-red-600'} text-xs font-medium`}>
            {readinessData.isPositiveChange ? (
              <ArrowUp className="mr-1" size={14} />
            ) : (
              <ArrowDown className="mr-1" size={14} />
            )}
            <span>{readinessData.changePercentage}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-nestor-gray-700">
        {readinessData.readinessScore >= 85 ? 
          "You're fully recovered and ready for peak performance today." :
          readinessData.readinessScore >= 70 ?
          "Your body is well recovered. You can engage in moderate to high-intensity activities." :
          readinessData.readinessScore >= 50 ?
          "Your recovery is partial. Consider moderate activities and avoid peak intensity." :
          "Your body needs more recovery. Focus on rest and light activities today."
        }
      </p>
    </div>
  );

  return showDetailed ? renderDetailedView() : renderSimpleView();
};

export default ReadinessScore;
