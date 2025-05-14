import React, { useEffect, useState } from 'react';
import { getReadings } from '@/utils/bleUtils';
import { ChevronDown, TrendingUp, Calendar } from 'lucide-react';
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
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, subDays, isSameDay, parseISO, isWithinInterval, startOfDay } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';

export type ReadingType = 'readiness' | 'heartRate' | 'temperature' | 'spo2' | 'steps';

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
  const [timeRange, setTimeRange] = useState<number | 'today' | 'yesterday' | 'custom'>(days);
  const { user } = useUser();
  // Default to imperial if user is null or unitPreference is not set
  const unitPreference = user?.unitPreference || 'imperial';
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), days),
    to: new Date()
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
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
    let effectiveTimeRange = typeof timeRange === 'number' ? timeRange : 7;
    let startDate: Date;
    let endDate: Date = new Date();
    
    // Handle different time range types
    if (timeRange === 'today') {
      startDate = startOfDay(new Date());
      endDate = new Date();
    } else if (timeRange === 'yesterday') {
      startDate = startOfDay(subDays(new Date(), 1));
      endDate = subDays(new Date(), 1);
      endDate.setHours(23, 59, 59, 999);
    } else if (timeRange === 'custom' && dateRange?.from && dateRange?.to) {
      startDate = dateRange.from;
      endDate = dateRange.to;
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      effectiveTimeRange = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    } else {
      startDate = subDays(new Date(), effectiveTimeRange);
    }
    
    const readings = getReadings(effectiveTimeRange);
    
    if (readings.length === 0) {
      setLoading(false);
      setDeviceWorn(false);
      return;
    }
    
    // Process the readings into chart data
    const processedData = processReadings(readings, startDate, endDate);
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
      const updatedReadings = getReadings(effectiveTimeRange);
      const updatedData = processReadings(updatedReadings, startDate, endDate);
      setChartData(updatedData);
    };
    
    window.addEventListener('nestor-vital-update', handleVitalUpdate);
    
    return () => {
      window.removeEventListener('nestor-wear-state', handleWearStateChange);
      window.removeEventListener('nestor-vital-update', handleVitalUpdate);
    };
  }, [selectedDataType, timeRange, unitPreference, dateRange]); 

  // Update dataType when a prop change occurs
  useEffect(() => {
    setSelectedDataType(dataType);
  }, [dataType]);
  
  // Process the readings into chart data
  function processReadings(readings: any[], startDate: Date, endDate: Date) {
    // Filter readings by date range
    let filteredReadings = readings.filter(reading => {
      const readingTime = new Date(reading.timestamp).getTime();
      return readingTime >= startDate.getTime() && readingTime <= endDate.getTime();
    });
    
    // Group readings by day
    const groupedByDay: { [key: string]: any[] } = {};
    
    filteredReadings.forEach(reading => {
      const date = new Date(reading.timestamp);
      
      // Format the day label based on the time range
      let dayLabel = '';
      
      if (timeRange === 'today' || timeRange === 'yesterday') {
        // For today/yesterday, use hours
        dayLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (typeof timeRange === 'number' && timeRange <= 7) {
        // For shorter ranges, use short weekday name
        dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      } else {
        // For longer ranges, use the date format MM/DD
        dayLabel = date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
      }
      
      // Create the key for grouping
      const groupKey = dayLabel;
      
      if (!groupedByDay[groupKey]) {
        groupedByDay[groupKey] = [];
      }
      
      groupedByDay[groupKey].push(reading);
    });
    
    // Calculate averages for each day
    const chartData = Object.keys(groupedByDay).map(dayLabel => {
      const dayReadings = groupedByDay[dayLabel];
      let value = 0;
      
      switch (selectedDataType) {
        case 'readiness':
          value = dayReadings.reduce((sum, r) => sum + (r.readiness || 0), 0) / dayReadings.length;
          break;
        case 'heartRate':
          value = dayReadings.reduce((sum, r) => sum + r.hr, 0) / dayReadings.length;
          break;
        case 'temperature':
          // Convert to Celsius first, then to Fahrenheit if needed
          const tempInC = dayReadings.reduce((sum, r) => sum + r.temp, 0) / dayReadings.length / 10;
          // Use unitPreference safely with default to imperial if null/undefined
          value = (unitPreference === 'imperial') ? (tempInC * 9/5) + 32 : tempInC;
          break;
        case 'spo2':
          value = dayReadings.reduce((sum, r) => sum + r.spo2, 0) / dayReadings.length;
          break;
        case 'steps':
          // Assuming steps are stored in the readings
          value = dayReadings.reduce((sum, r) => sum + (r.steps || 0), 0) / dayReadings.length;
          break;
      }
      
      // Get the full date (for sorting and display)
      const firstReadingDate = new Date(dayReadings[0].timestamp);
      
      return {
        day: dayLabel,
        value: Math.round(value * 10) / 10, // Round to 1 decimal place
        date: firstReadingDate.toLocaleDateString(),
        timestamp: firstReadingDate.getTime(),
        min: Math.min(...dayReadings.map(r => {
          switch (selectedDataType) {
            case 'readiness': return r.readiness || 0;
            case 'heartRate': return r.hr;
            case 'temperature': 
              const tempC = r.temp / 10;
              return unitPreference === 'imperial' ? (tempC * 9/5) + 32 : tempC;
            case 'spo2': return r.spo2;
            case 'steps': return r.steps || 0;
            default: return 0;
          }
        })),
        max: Math.max(...dayReadings.map(r => {
          switch (selectedDataType) {
            case 'readiness': return r.readiness || 0;
            case 'heartRate': return r.hr;
            case 'temperature': 
              const tempC = r.temp / 10;
              return unitPreference === 'imperial' ? (tempC * 9/5) + 32 : tempC;
            case 'spo2': return r.spo2;
            case 'steps': return r.steps || 0;
            default: return 0;
          }
        }))
      };
    });
    
    // Sort by timestamp (oldest to newest)
    return chartData.sort((a, b) => a.timestamp - b.timestamp);
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
      case 'steps':
        return 'Steps';
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
      case 'steps':
        return 'steps';
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
      case 'steps':
        return "#8b5cf6"; // Purple
      default:
        return "#0F172A";
    }
  }
  
  // Calculate stats
  const calculateStats = () => {
    if (chartData.length === 0) return { avg: 0, min: 0, max: 0, minDay: '', maxDay: '' };
    
    // For a single day view (today or a custom single day)
    if (chartData.length === 1) {
      const day = chartData[0];
      return { 
        avg: day.value, 
        min: day.min, 
        max: day.max,
        minDay: day.day,
        maxDay: day.day
      };
    }
    
    // For multi-day view
    const values = chartData.map(d => d.value);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    
    // Find day with lowest average
    const minValue = Math.min(...values);
    const minDay = chartData.find(d => d.value === minValue)?.day || '';
    
    // Find day with highest average
    const maxValue = Math.max(...values);
    const maxDay = chartData.find(d => d.value === maxValue)?.day || '';
    
    return { 
      avg: Math.round(avg * 10) / 10, 
      min: minValue, 
      max: maxValue,
      minDay,
      maxDay
    };
  };
  
  const stats = calculateStats();

  const handleMetricChange = (value: ReadingType) => {
    setSelectedDataType(value);
  };
  
  const handleTimeRangeChange = (value: number | 'today' | 'yesterday' | 'custom') => {
    setTimeRange(value);
    
    if (value === 'custom') {
      // When switching to custom, open the calendar
      setIsCalendarOpen(true);
    } else if (value === 'today') {
      // For today, set the date range to today only
      const today = new Date();
      setDateRange({
        from: startOfDay(today),
        to: today
      });
    } else if (value === 'yesterday') {
      // For yesterday, set the date range to yesterday only
      const yesterday = subDays(new Date(), 1);
      setDateRange({
        from: startOfDay(yesterday),
        to: yesterday
      });
    } else {
      // For predefined ranges, update the date range automatically
      const endDate = new Date();
      const startDate = subDays(endDate, value as number);
      
      setDateRange({
        from: startDate,
        to: endDate
      });
    }
  };
  
  const formatDateRange = () => {
    if (timeRange === 'today') {
      return 'Today';
    }
    
    if (timeRange === 'yesterday') {
      return 'Yesterday';
    }
    
    if (timeRange !== 'custom') {
      return `Last ${timeRange} days`;
    }
    
    if (dateRange?.from && dateRange?.to) {
      if (isSameDay(dateRange.from, dateRange.to)) {
        return format(dateRange.from, 'MMM d, yyyy');
      }
      return `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`;
    }
    
    return 'Custom Range';
  };
  
  const handleCalendarSelect = (range: DateRange | undefined) => {
    if (!range) return;
    
    // If only from date is selected, set it for both from and to
    if (range.from && !range.to) {
      setDateRange({
        from: range.from,
        to: range.from
      });
    } else {
      setDateRange(range);
    }
  };
  
  const applyDateRange = () => {
    if (dateRange?.from && dateRange?.to) {
      setIsCalendarOpen(false);
    }
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
              <span>{formatDateRange()}</span>
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
              <SelectTrigger className="w-32">
                <SelectValue placeholder={getChartTitle()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="heartRate">Heart Rate</SelectItem>
                <SelectItem value="spo2">Blood Oxygen</SelectItem>
                <SelectItem value="temperature">Temperature</SelectItem>
                <SelectItem value="readiness">Readiness</SelectItem>
                <SelectItem value="steps">Steps</SelectItem>
              </SelectContent>
            </Select>
          </div>
        ) : (
          <h4 className="font-medium text-lg text-nestor-gray-900">{getChartTitle()}</h4>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1 min-w-[150px] justify-between">
              {formatDateRange()}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleTimeRangeChange('today')}>Today</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTimeRangeChange('yesterday')}>Yesterday</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTimeRangeChange(7)}>Last 7 days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTimeRangeChange(14)}>Last 14 days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTimeRangeChange(30)}>Last 30 days</DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleTimeRangeChange('custom')}>Custom Range</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Calendar popover for custom date range selection - fixed implementation */}
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" className="hidden">Calendar</Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[100]" align="end">
          <div className="p-3">
            <CalendarComponent
              initialFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleCalendarSelect}
              numberOfMonths={1}
            />
            <div className="mt-3 border-t pt-3">
              <Button 
                variant="default" 
                className="w-full"
                onClick={applyDateRange}
                disabled={!dateRange?.from || !dateRange?.to}
              >
                Apply Range
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
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
                tick={{ fontSize: 12, fill: '#374151' }}
                dy={8}
              />
              <YAxis 
                hide={compact} 
                domain={selectedDataType === 'readiness' ? [0, 100] : ['auto', 'auto']} 
                tick={{ fontSize: 12, fill: '#374151' }}
                width={40}
                label={{ 
                  value: getYAxisLabel(), 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fontSize: '12px', fill: '#374151', textAnchor: 'middle' },
                  offset: -5
                }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 shadow-lg rounded border border-gray-100">
                        <p className="text-sm font-medium text-nestor-gray-800">{payload[0].payload.day} - {payload[0].payload.date}</p>
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
