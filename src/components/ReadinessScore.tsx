
import React, { useState, useEffect } from 'react';
import { Star, ArrowUp, ArrowDown, Info } from 'lucide-react';
import { getLastReading, getReadings } from '@/utils/bleUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ReadinessScoreProps {
  className?: string;
  showDetailed?: boolean;
}

const ReadinessScore = ({ className = '', showDetailed = false }: ReadinessScoreProps) => {
  // State to store the latest readiness score
  const [readinessData, setReadinessData] = useState({
    readinessScore: getLastReading()?.readiness ?? 82,
    changePercentage: 4 as number, // Cast as number to fix type issue
    isPositiveChange: true
  });
  
  // State for historical readiness trend
  const [weeklyTrend, setWeeklyTrend] = useState<number[]>([]);
  
  // Update readiness data when new readings come in
  useEffect(() => {
    const calculateChange = () => {
      const lastReading = getLastReading();
      if (!lastReading) return;
      
      // Get readings from the last 2 days to calculate change
      const recentReadings = getReadings(2);
      
      // Split readings into today and yesterday
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      
      const todayReadings = recentReadings.filter(r => r.timestamp >= todayStart);
      const yesterdayReadings = recentReadings.filter(r => r.timestamp < todayStart);
      
      // Calculate average readiness scores
      let todayAvg = 0;
      let yesterdayAvg = 0;
      
      if (todayReadings.length > 0) {
        todayAvg = todayReadings.reduce((sum, r) => sum + r.readiness, 0) / todayReadings.length;
      } else if (lastReading) {
        todayAvg = lastReading.readiness;
      }
      
      if (yesterdayReadings.length > 0) {
        yesterdayAvg = yesterdayReadings.reduce((sum, r) => sum + r.readiness, 0) / yesterdayReadings.length;
      }
      
      // Calculate percentage change if both values exist
      let changePercentage = 0;
      let isPositiveChange = true;
      
      if (todayAvg > 0 && yesterdayAvg > 0) {
        changePercentage = Math.round(((todayAvg - yesterdayAvg) / yesterdayAvg) * 100);
        isPositiveChange = changePercentage > 0;
      }
      
      setReadinessData({
        readinessScore: Math.round(todayAvg),
        changePercentage: Math.abs(changePercentage),
        isPositiveChange
      });
      
      // Calculate weekly trend
      calculateWeeklyTrend();
    };
    
    const calculateWeeklyTrend = () => {
      const recentReadings = getReadings(7);
      const now = new Date();
      
      // Create an array for the past 7 days
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
          // If no readings for this day, use estimated value or null
          const prevValue = weeklyData.length > 0 ? weeklyData[weeklyData.length - 1] : null;
          weeklyData.push(prevValue ?? 70); // Use previous value or default to 70
        }
      }
      
      setWeeklyTrend(weeklyData);
    };
    
    // Calculate initially
    calculateChange();
    
    // Update when new readings come in
    const handleVitalUpdate = () => {
      calculateChange();
    };
    
    window.addEventListener('nestor-vital-update', handleVitalUpdate);
    
    return () => {
      window.removeEventListener('nestor-vital-update', handleVitalUpdate);
    };
  }, []);
  
  // Determine score grade and color
  let scoreGrade: string;
  let scoreColor: string;
  
  if (readinessData.readinessScore >= 85) {
    scoreGrade = 'Optimal';
    scoreColor = 'text-green-600';
  } else if (readinessData.readinessScore >= 70) {
    scoreGrade = 'Good';
    scoreColor = 'text-blue-600';
  } else if (readinessData.readinessScore >= 50) {
    scoreGrade = 'Moderate';
    scoreColor = 'text-yellow-600';
  } else {
    scoreGrade = 'Low';
    scoreColor = 'text-red-600';
  }

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
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Sleep Quality</span>
            <div className="flex-1 mx-4">
              <div className="h-1.5 bg-gray-200 rounded-full">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <span className="text-xs font-medium">75%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">HRV</span>
            <div className="flex-1 mx-4">
              <div className="h-1.5 bg-gray-200 rounded-full">
                <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <span className="text-xs font-medium">85%</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Recovery</span>
            <div className="flex-1 mx-4">
              <div className="h-1.5 bg-gray-200 rounded-full">
                <div className="h-full bg-blue-500 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
            <span className="text-xs font-medium">78%</span>
          </div>
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
