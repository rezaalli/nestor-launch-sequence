
import React from 'react';
import { Star, ArrowUp, ArrowDown } from 'lucide-react';
import { getLastReading } from '@/utils/bleUtils';

interface ReadinessScoreProps {
  className?: string;
}

const ReadinessScore = ({ className = '' }: ReadinessScoreProps) => {
  // Get the latest readiness score from BLE readings
  const lastReading = getLastReading();
  const readinessScore = lastReading?.readiness ?? 82; // Fallback to 82
  
  // Calculate change percentage (mock data for now)
  const changePercentage: number = 4; // This would come from comparing to previous day
  const isPositiveChange = changePercentage > 0;
  
  // Determine score grade and color
  let scoreGrade: string;
  let scoreColor: string;
  
  if (readinessScore >= 85) {
    scoreGrade = 'Optimal';
    scoreColor = 'text-green-600';
  } else if (readinessScore >= 70) {
    scoreGrade = 'Good';
    scoreColor = 'text-blue-600';
  } else if (readinessScore >= 50) {
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
            <span className={`text-sm font-medium ${scoreColor} mr-1`}>{readinessScore}</span>
            <span className="text-xs text-nestor-gray-600">/ 100</span>
            <span className={`text-xs ml-2 ${scoreColor}`}>({scoreGrade})</span>
          </div>
        </div>
        {changePercentage !== 0 && (
          <div className={`ml-auto flex items-center ${isPositiveChange ? 'text-green-600' : 'text-red-600'} text-xs font-medium`}>
            {isPositiveChange ? (
              <ArrowUp className="mr-1" size={14} />
            ) : (
              <ArrowDown className="mr-1" size={14} />
            )}
            <span>{Math.abs(changePercentage)}%</span>
          </div>
        )}
      </div>
      <p className="text-sm text-nestor-gray-700">
        {readinessScore >= 85 ? 
          "You're fully recovered and ready for peak performance today." :
          readinessScore >= 70 ?
          "Your body is well recovered. You can engage in moderate to high-intensity activities." :
          readinessScore >= 50 ?
          "Your recovery is partial. Consider moderate activities and avoid peak intensity." :
          "Your body needs more recovery. Focus on rest and light activities today."
        }
      </p>
    </div>
  );
};

export default ReadinessScore;
