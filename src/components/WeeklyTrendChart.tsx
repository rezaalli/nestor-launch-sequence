
import React, { useEffect, useState } from 'react';
import { getReadings } from '@/utils/bleUtils';
import { ChevronDown, TrendingUp, ChevronUp } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label } from 'recharts';
import { useUser } from '@/contexts/UserContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export type ReadingType = 'readiness' | 'heartRate' | 'temperature' | 'spo2';

interface WeeklyTrendChartProps {
  dataType?: ReadingType;
  days?: number;
  compact?: boolean;
  className?: string;
  onViewAllClick?: () => void;
  allowMetricChange?: boolean;
}

const WeeklyTrendChart = ({ 
  dataType = 'heartRate', 
  days = 7, 
  compact = false,
  className = '',
  onViewAllClick,
  allowMetricChange = false
}: WeeklyTrendChartProps) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deviceWorn, setDeviceWorn] = useState(true);
  const [selectedDataType, setSelectedDataType] = useState<ReadingType>(dataType);
  const [timeRange, setTimeRange] = useState<number>(days);
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
    const readings = getReadings(timeRange);
    
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
      const updatedReadings = getReadings(timeRange);
      const updatedData = processReadings(updatedReadings);
      setChartData(updatedData);
    };
    
    window.addEventListener('nestor-vital-update', handleVitalUpdate);
    
    return () => {
      window.removeEventListener('nestor-wear-state', handleWearStateChange);
      window.removeEventListener('nestor-vital-update', handleVitalUpdate);
    };
  }, [selectedDataType, timeRange, unitPreference]); // Added selectedDataType as dependency

  // Update dataType when a prop change occurs
  useEffect(() => {
    setSelectedDataType(dataType);
  }, [dataType]);
  
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
      
      switch (selectedDataType) {
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
    switch (selectedDataType) {
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
    switch (selectedDataType) {
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
    switch (selectedDataType) {
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
    if (chartData.length === 0) return { avg: 0, min: 0, max: 0, minDay: '', maxDay: '' };
    
    const values = chartData.map(d => d.value);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    const minDay = chartData.find(d => d.value === min)?.day || '';
    const maxDay = chartData.find(d => d.value === max)?.day || '';
    
    return { 
      avg: Math.round(avg * 10) / 10, 
      min, 
      max,
      minDay,
      maxDay
    };
  };
  
  const stats = calculateStats();

  const handleMetricChange = (value: ReadingType) => {
    setSelectedDataType(value);
  };
  
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
              <span>Last {timeRange} days</span>
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
        {allowMetricChange ? (
          <div className="flex items-center">
            <Select value={selectedDataType} onValueChange={(value) => handleMetricChange(value as ReadingType)}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder={getChartTitle()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="heartRate">Heart Rate</SelectItem>
                <SelectItem value="spo2">Blood Oxygen</SelectItem>
                <SelectItem value="temperature">Temperature</SelectItem>
                <SelectItem value="readiness">Readiness</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <h4 className="font-medium text-lg text-nestor-gray-900">{getChartTitle()}</h4>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              Last {timeRange} days
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setTimeRange(7)}>Last 7 days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange(14)}>Last 14 days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTimeRange(30)}>Last 30 days</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="h-44 mb-3">
        <ChartContainer config={chartConfig}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 15, right: 10, left: 5, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false}
                tick={{ fontSize: 14, fill: '#374151', fontWeight: 600 }}
                dy={8}
              />
              <YAxis 
                hide={compact} 
                domain={selectedDataType === 'readiness' ? [0, 100] : ['auto', 'auto']} 
                tick={{ fontSize: 14, fill: '#374151' }}
                width={40}
                label={{ 
                  value: getYAxisLabel(), 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: '14px', fill: '#374151', textAnchor: 'middle' },
                  offset: -5
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 shadow-lg rounded border border-gray-100">
                        <p className="text-sm font-medium text-nestor-gray-800">{payload[0].payload.day}</p>
                        <p className="text-base font-medium text-nestor-gray-900">{`${payload[0].value} ${getYAxisLabel()}`}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              
              {/* Reference lines for min and max values */}
              <ReferenceLine 
                y={stats.max} 
                stroke="#ef4444" 
                strokeDasharray="3 3"
                ifOverflow="extendDomain"
              >
                <Label 
                  value={`${stats.max} ${getYAxisLabel()}`} 
                  position="top" 
                  fill="#ef4444"
                  fontSize={12}
                  fontWeight={600}
                />
              </ReferenceLine>
              
              <ReferenceLine 
                y={stats.min} 
                stroke="#3b82f6" 
                strokeDasharray="3 3"
                ifOverflow="extendDomain"
              >
                <Label 
                  value={`${stats.min} ${getYAxisLabel()}`} 
                  position="bottom" 
                  fill="#3b82f6"
                  fontSize={12}
                  fontWeight={600}
                />
              </ReferenceLine>
              
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={getLineColor()} 
                strokeWidth={2.5}
                activeDot={{ r: 6, strokeWidth: 1, fill: "#fff", stroke: getLineColor() }}
                dot={{ r: 4, strokeWidth: 2, fill: "#fff", stroke: getLineColor() }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mt-4">
        <div className="text-center py-2 bg-gray-50 rounded-lg">
          <p className="text-xs text-nestor-gray-500 mb-1">Average</p>
          <p className="text-sm font-semibold text-nestor-gray-900">{stats.avg} {getYAxisLabel()}</p>
        </div>
        <div className="text-center py-2 bg-red-50 rounded-lg">
          <p className="text-xs text-red-500 mb-1">Peak ({stats.maxDay})</p>
          <p className="text-sm font-semibold text-red-600">{stats.max} {getYAxisLabel()}</p>
        </div>
        <div className="text-center py-2 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-500 mb-1">Low ({stats.minDay})</p>
          <p className="text-sm font-semibold text-blue-600">{stats.min} {getYAxisLabel()}</p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyTrendChart;
