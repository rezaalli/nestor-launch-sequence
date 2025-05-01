
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface WeeklyTrendProps {
  onViewAllClick?: () => void;
}

const WeeklyTrend = ({ onViewAllClick }: WeeklyTrendProps) => {
  const navigate = useNavigate();
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const heights = [10, 16, 14, 12, 8, 18, 20]; // Height values for each day (in rem units)
  
  const handleViewAllTrends = () => {
    if (onViewAllClick) {
      onViewAllClick();
    } else {
      navigate('/trends');
    }
  };
  
  return (
    <div className="p-4 bg-white border border-gray-200 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-nestor-gray-900">Heart Rate</h4>
        <div 
          className="text-xs flex items-center text-nestor-gray-600 cursor-pointer"
          onClick={handleViewAllTrends}
        >
          <span>Last 7 days</span>
          <ChevronDown className="ml-1" size={12} />
        </div>
      </div>
      
      <div className="h-32 mb-2">
        <div className="h-full flex items-end justify-between">
          {days.map((day, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className={`h-${heights[index]} w-6 bg-blue-100 rounded-t-md relative`}>
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-nestor-blue rounded-t-md" 
                  style={{height: `${heights[index] * 0.7}px`}}
                ></div>
              </div>
              <span className="text-xs text-nestor-gray-500 mt-1">{day}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-nestor-gray-600">
        <div>Avg: <span className="font-medium">72 bpm</span></div>
        <div>Peak: <span className="font-medium">118 bpm</span></div>
        <div>Rest: <span className="font-medium">58 bpm</span></div>
      </div>
    </div>
  );
};

export default WeeklyTrend;
