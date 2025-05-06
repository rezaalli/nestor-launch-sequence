
import React, { useEffect, useState } from 'react';
import { getReadings } from '@/utils/bleUtils';
import { ChevronDown, TrendingUp } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '@/contexts/UserContext';

interface WeeklyTrendChartProps {
  dataType: 'readiness' | 'heartRate' | 'temperature' | 'spo2';
  days?: number;
  compact?: boolean;
  className?: string;
  onViewAllClick?: () => void;
}

const WeeklyTrendChart = ({ 
  dataType, 
  days = 7, 
  compact = false,
  className = '',
  onViewAllClick
}: WeeklyTrendChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceWorn, setDeviceWorn] = useState(true);
  const { user } = useUser();
  const unitPreference = user.unitPreference || 'imperial'; // Default to imperial
  
  // Chart config settings
  const chartConfig = {
    default: {
      color: "#e5e7eb"
    },
    active: {
      color: getLineColor()
    }
  };
  
  useEffect(() => {
    // Get readings from BLE utils
    const readings = getReadings(days);
    
    if (readings.length === 0) {
      setLoading(false);
      setDeviceWorn(false);
      return;
    }
    
    // Process the readings into chart data
    const processedData = processReadings(readings);
    setChartData(processedData);
    setLoading(false);
    setDeviceWorn(true);
    
    // Listen for wear state changes
    const handleWearStateChange = (event: Event) => {
      const { worn } = (event as CustomEvent).detail;
      setDeviceWorn(worn);
    };
    
    window.addEventListener('nestor-wear-state', handleWearStateChange);
    
    // Listen for vital updates to refresh chart
    const handleVitalUpdate = () => {
      const updatedReadings = getReadings(days);
      const updatedData = processReadings(updatedReadings);
      setChartData(updatedData);
    };
    
    window.addEventListener('nestor-vital-update', handleVitalUpdate);
    
    return () => {
      window.removeEventListener('nestor-wear-state', handleWearStateChange);
      window.removeEventListener('nestor-vital-update', handleVitalUpdate);
    };
  }, [dataType, days, unitPreference]); // Added unitPreference as dependency
  
  // Process the readings into chart data
  function processReadings(readings: any[]) {
    // Group readings by day
    const groupedByDay: { [key: string]: any[] } = {};
    
    readings.forEach(reading => {
      const date = new Date(reading.timestamp);
      const day = date.toLocaleDateString('en-US', { 
        weekday: 'short' 
      });
      
      if (!groupedByDay[day]) {
        groupedByDay[day] = [];
      }
      
      groupedByDay[day].push(reading);
    });
    
    // Calculate averages for each day
    const chartData = Object.keys(groupedByDay).map(day => {
      const dayReadings = groupedByDay[day];
      let value = 0;
      
      switch (dataType) {
        case 'readiness':
          value = dayReadings.reduce((sum, r) => sum + r.readiness, 0) / dayReadings.length;
          break;
        case 'heartRate':
          value = dayReadings.reduce((sum, r) => sum + r.hr, 0) / dayReadings.length;
          break;
        case 'temperature':
          // Convert to Celsius first, then to Fahrenheit if needed
          const tempInC = dayReadings.reduce((sum, r) => sum + r.temp, 0) / dayReadings.length / 10;
          value = unitPreference === 'imperial' ? (tempInC * 9/5) + 32 : tempInC;
          break;
        case 'spo2':
          value = dayReadings.reduce((sum, r) => sum + r.spo2, 0) / dayReadings.length;
          break;
      }
      
      return {
        day,
        value: Math.round(value * 10) / 10 // Round to 1 decimal place
      };
    });
    
    // Sort days in order (Sun, Mon, Tue, Wed, Thu, Fri, Sat)
    const daysOrder = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return chartData.sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));
  }
  
  // Get chart title and y-axis label based on data type
  function getChartTitle() {
    switch (dataType) {
      case 'readiness':
        return 'Readiness Score';
      case 'heartRate':
        return 'Heart Rate';
      case 'temperature':
        return 'Temperature';
      case 'spo2':
        return 'Blood Oxygen';
      default:
        return '';
    }
  }
  
  function getYAxisLabel() {
    switch (dataType) {
      case 'readiness':
        return '';
      case 'heartRate':
        return 'bpm';
      case 'temperature':
        return unitPreference === 'imperial' ? '°F' : '°C';
      case 'spo2':
        return '%';
      default:
        return '';
    }
  }
  
  // Get line color based on data type
  function getLineColor() {
    switch (dataType) {
      case 'readiness':
        return "#0F172A"; // Blue
      case 'heartRate':
        return "#ef4444"; // Red
      case 'temperature':
        return "#f97316"; // Orange
      case 'spo2':
        return "#3b82f6"; // Blue
      default:
        return "#0F172A";
    }
  }
  
  // Calculate stats
  const calculateStats = () => {
    if (chartData.length === 0) return { avg: 0, min: 0, max: 0 };
    
    const values = chartData.map(d => d.value);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return { avg: Math.round(avg * 10) / 10, min, max };
  };
  
  const stats = calculateStats();
  
  // For empty state or loading
  if (loading) {
    return (
      <div className={`p-4 bg-white border border-gray-200 rounded-xl ${className}`}>
        <div className="h-32 flex items-center justify-center">
          <span className="text-nestor-gray-500">Loading data...</span>
        </div>
      </div>
    );
  }
  
  if (!deviceWorn || chartData.length === 0) {
    return (
      <div className={`p-4 bg-white border border-gray-200 rounded-xl ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-nestor-gray-900">{getChartTitle()}</h4>
          {!compact && (
            <div className="text-xs flex items-center text-nestor-gray-600 cursor-pointer">
              <span>Last {days} days</span>
              <ChevronDown className="ml-1" size={12} />
            </div>
          )}
        </div>
        
        <div className="h-32 flex flex-col items-center justify-center">
          <TrendingUp className="text-nestor-gray-400 mb-2" size={24} />
          <span className="text-nestor-gray-500 text-sm">No data — device idle</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`p-4 bg-white border border-gray-200 rounded-xl ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-lg text-nestor-gray-900">{getChartTitle()}</h4>
        <div 
          className="text-sm flex items-center text-nestor-gray-600 cursor-pointer"
          onClick={onViewAllClick}
        >
          <span>Last {days} days</span>
          <ChevronDown className="ml-1" size={14} />
        </div>
      </div>
      
      <div className="h-32 mb-3">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
                dy={8}
              />
              <YAxis 
                hide={compact} 
                domain={dataType === 'readiness' ? [0, 100] : ['auto', 'auto']} 
                tick={{ fontSize: 12, fill: '#374151' }}
                width={30}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-2 shadow-lg rounded border border-gray-100">
                        <p className="text-sm font-medium text-nestor-gray-800">{payload[0].payload.day}</p>
                        <p className="text-sm font-medium text-nestor-gray-900">{`${payload[0].value} ${getYAxisLabel()}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={getLineColor()} 
                strokeWidth={2.5}
                activeDot={{ r: 6, strokeWidth: 1 }}
                dot={{ r: 4, strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="text-center py-1 bg-gray-50 rounded-lg">
          <p className="text-xs text-nestor-gray-500 mb-1">Avg</p>
          <p className="text-sm font-semibold text-nestor-gray-900">{stats.avg} {getYAxisLabel()}</p>
        </div>
        <div className="text-center py-1 bg-gray-50 rounded-lg">
          <p className="text-xs text-nestor-gray-500 mb-1">Max</p>
          <p className="text-sm font-semibold text-nestor-gray-900">{stats.max} {getYAxisLabel()}</p>
        </div>
        <div className="text-center py-1 bg-gray-50 rounded-lg">
          <p className="text-xs text-nestor-gray-500 mb-1">Min</p>
          <p className="text-sm font-semibold text-nestor-gray-900">{stats.min} {getYAxisLabel()}</p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyTrendChart;
