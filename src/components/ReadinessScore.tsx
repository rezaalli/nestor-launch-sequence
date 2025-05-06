
import React, { useState, useEffect } from 'react';
import { Star, ArrowUp, ArrowDown } from 'lucide-react';
import { getLastReading, getReadings } from '@/utils/bleUtils';

interface ReadinessScoreProps {
  className?: string;
}

const ReadinessScore = ({ className = '' }: ReadinessScoreProps) => {
  // State to store the latest readiness score
  const [readinessData, setReadinessData] = useState({
    readinessScore: getLastReading()?.readiness ?? 82,
    changePercentage: 4 as number, // Cast as number to fix type issue
    isPositiveChange: true
  });
  
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

  return (
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
};

export default ReadinessScore;
