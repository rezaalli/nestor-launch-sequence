
import React from 'react';

interface WeeklyBarChartProps {
  data?: {
    day: string;
    value: number;
  }[];
}

const WeeklyBarChart = ({ data }: WeeklyBarChartProps) => {
  // Default data if none provided
  const chartData = data || [
    { day: 'Mon', value: 60 },
    { day: 'Tue', value: 75 },
    { day: 'Wed', value: 45 },
    { day: 'Thu', value: 90 },
    { day: 'Fri', value: 65 },
    { day: 'Sat', value: 55 },
    { day: 'Sun', value: 70 },
  ];

  // Find the highest value to highlight it
  const highestValue = Math.max(...chartData.map(item => item.value));

  return (
    <div className="h-48 flex items-end justify-between space-x-2">
      {chartData.map((item) => (
        <div key={item.day} className="flex-1 flex flex-col items-center">
          <div 
            className={`w-full ${item.value === highestValue ? 'bg-blue-900' : 'bg-blue-100'} rounded-t-sm`} 
            style={{ height: `${item.value}%` }}
          ></div>
          <span className="text-xs text-gray-500 mt-2">{item.day}</span>
        </div>
      ))}
    </div>
  );
};

export default WeeklyBarChart;
