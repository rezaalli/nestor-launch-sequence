
import React, { useState, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { format, subDays, startOfDay } from 'date-fns';

type ReadingType = 'hr' | 'spo2' | 'temp' | 'readiness' | 'motion';

// Add metricType to props interface
interface FlashLogDisplayProps {
  metricType?: string;
}

const FlashLogDisplay: React.FC<FlashLogDisplayProps> = ({ metricType = 'heart-rate' }) => {
  // Map the passed metricType to our internal ReadingType
  const getReadingTypeFromMetric = (metric: string): ReadingType => {
    switch(metric) {
      case 'heart-rate': return 'hr';
      case 'spo2': return 'spo2';
      case 'temperature': return 'temp';
      case 'readiness': return 'readiness';
      case 'activity': 
      case 'sleep': 
      default: return 'motion';
    }
  };
  
  const [activeDataType, setActiveDataType] = useState<ReadingType>(getReadingTypeFromMetric(metricType));
  const [timeRange, setTimeRange] = useState<number | 'today' | 'yesterday' | 'custom'>(7); // days
  const unitPreference = 'imperial'; // Default to imperial units
  
  const [chartData, setChartData] = useState<any[]>([]);
  
  // Update activeDataType when metricType prop changes
  useEffect(() => {
    setActiveDataType(getReadingTypeFromMetric(metricType));
  }, [metricType]);
  
  useEffect(() => {
    // Generate mock data for demonstration
    let days: number = typeof timeRange === 'number' ? timeRange : 7;
    let startDate = new Date();
    let endDate = new Date();
    
    if (timeRange === 'today') {
      days = 1;
      startDate = startOfDay(new Date());
    } else if (timeRange === 'yesterday') {
      days = 1;
      startDate = startOfDay(subDays(new Date(), 1));
      endDate = subDays(new Date(), 1);
      endDate.setHours(23, 59, 59, 999);
    }
    
    const mockData = generateMockData(days, activeDataType, unitPreference, timeRange);
    setChartData(mockData);
  }, [activeDataType, timeRange, unitPreference]);
  
  const handleExportData = () => {
    // Create a simple CSV from chart data
    const headers = ['date', 'time', 'value'];
    let csvContent = headers.join(',') + '\n';
    
    chartData.forEach(item => {
      const row = [item.date, item.time, item.value].join(',');
      csvContent += row + '\n';
    });
    
    // Create a blob and download the CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'health-data.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const getDataMetrics = () => {
    if (chartData.length === 0) return { min: 0, max: 0, avg: 0 };
    
    const values = chartData.map(item => item.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = Math.round((sum / values.length) * 10) / 10;
    
    return { min, max, avg };
  };
  
  const getYAxisLabel = () => {
    switch (activeDataType) {
      case 'hr': return 'bpm';
      case 'spo2': return '%';
      case 'temp': return unitPreference === 'imperial' ? '°F' : '°C';
      case 'readiness': return '';
      case 'motion': return '';
      default: return '';
    }
  };
  
  const getChartTitle = () => {
    switch (activeDataType) {
      case 'hr': return 'Heart Rate';
      case 'spo2': return 'Blood Oxygen';
      case 'temp': return 'Temperature';
      case 'readiness': return 'Readiness Score';
      case 'motion': return 'Motion Level';
      default: return '';
    }
  };
  
  const getLineColor = () => {
    switch (activeDataType) {
      case 'hr': return "#ef4444";
      case 'spo2': return "#3b82f6";
      case 'temp': return "#f97316";
      case 'readiness': return "#0F172A";
      case 'motion': return "#8b5cf6";
      default: return "#0F172A";
    }
  };
  
  // Format the time range for display
  const formatTimeRange = () => {
    if (timeRange === 'today') return 'Today';
    if (timeRange === 'yesterday') return 'Yesterday';
    return `Last ${timeRange} days`;
  };
  
  const metrics = getDataMetrics();

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{getChartTitle()} History</CardTitle>
          <CardDescription>
            View your historical health data from the {formatTimeRange()}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue={activeDataType} onValueChange={(value) => setActiveDataType(value as ReadingType)}>
            <div className="relative w-full mb-2">
              <ScrollArea className="w-full pb-1">
                <div className="px-1">
                  <TabsList className="w-full flex justify-start h-auto py-1">
                    <TabsTrigger 
                      className="min-w-[90px] text-sm px-3 py-1 flex-shrink-0" 
                      value="hr"
                    >
                      Heart Rate
                    </TabsTrigger>
                    <TabsTrigger 
                      className="min-w-[60px] text-sm px-3 py-1 flex-shrink-0" 
                      value="spo2"
                    >
                      SpO₂
                    </TabsTrigger>
                    <TabsTrigger 
                      className="min-w-[90px] text-sm px-3 py-1 flex-shrink-0" 
                      value="temp"
                    >
                      Temperature
                    </TabsTrigger>
                    <TabsTrigger 
                      className="min-w-[80px] text-sm px-3 py-1 flex-shrink-0" 
                      value="readiness"
                    >
                      Readiness
                    </TabsTrigger>
                  </TabsList>
                </div>
              </ScrollArea>
            </div>
            
            <TabsContent value={activeDataType} className="h-[300px] mt-4">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#374151', fontWeight: 500 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: '#374151' }}
                      domain={[
                        (dataMin: number) => Math.floor(dataMin * 0.95),
                        (dataMax: number) => Math.ceil(dataMax * 1.05)
                      ]}
                      label={{ 
                        value: getYAxisLabel(), 
                        angle: -90, 
                        position: 'insideLeft',
                        style: { textAnchor: 'middle' }
                      }}
                    />
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-white p-2 shadow-lg rounded border border-gray-100">
                              <p className="text-sm font-medium text-nestor-gray-800">{payload[0].payload.date} {payload[0].payload.time}</p>
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
                      strokeWidth={2}
                      activeDot={{ r: 6 }}
                      dot={{ r: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <p>No historical data available</p>
                    <p className="text-sm">Sync your device to see data</p>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4">
          <div className="grid grid-cols-3 gap-2 w-full">
            <div className="text-center py-1 bg-gray-50 rounded-lg">
              <p className="text-xs text-nestor-gray-500 mb-1">Avg</p>
              <p className="text-sm font-semibold text-nestor-gray-900">{metrics.avg} {getYAxisLabel()}</p>
            </div>
            <div className="text-center py-1 bg-gray-50 rounded-lg">
              <p className="text-xs text-nestor-gray-500 mb-1">Max</p>
              <p className="text-sm font-semibold text-nestor-gray-900">{metrics.max} {getYAxisLabel()}</p>
            </div>
            <div className="text-center py-1 bg-gray-50 rounded-lg">
              <p className="text-xs text-nestor-gray-500 mb-1">Min</p>
              <p className="text-sm font-semibold text-nestor-gray-900">{metrics.min} {getYAxisLabel()}</p>
            </div>
          </div>
          
          <div className="flex justify-between w-full">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {formatTimeRange()} <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="bg-white">
                <DropdownMenuItem onClick={() => setTimeRange('today')}>Today</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange('yesterday')}>Yesterday</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange(7)}>Last 7 Days</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTimeRange(30)}>Last 30 Days</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" onClick={handleExportData}>
              Export Data
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

// Helper function to generate mock data
const generateMockData = (days: number, dataType: ReadingType, unitPreference: 'metric' | 'imperial', timeRangeType: number | string): any[] => {
  const data = [];
  const now = new Date();
  
  // For today or yesterday view, generate hourly data
  const isToday = timeRangeType === 'today';
  const isYesterday = timeRangeType === 'yesterday';
  const isSingleDay = isToday || isYesterday;
  
  const dateToUse = isYesterday ? subDays(now, 1) : now;
  const startPoint = isSingleDay ? startOfDay(dateToUse) : subDays(now, days);
  
  // For single day view, generate data every hour
  if (isSingleDay) {
    for (let h = 0; h < 24; h++) {
      const entryDate = new Date(startPoint);
      entryDate.setHours(h, 0, 0, 0);
      
      if (isToday && entryDate > now) continue; // Don't generate future data for today
      
      let value: number;
      
      switch (dataType) {
        case 'hr':
          value = Math.round(60 + Math.random() * 30); // 60-90 bpm
          break;
        case 'spo2':
          value = Math.round(95 + Math.random() * 5); // 95-100%
          break;
        case 'temp':
          const celsius = 36.5 + (Math.random() * 1.5 - 0.5); // 36.0-37.5°C
          value = unitPreference === 'imperial' 
            ? Math.round((celsius * 9/5 + 32) * 10) / 10 // Convert to Fahrenheit
            : Math.round(celsius * 10) / 10;
          break;
        case 'readiness':
          value = Math.round(70 + Math.random() * 30); // 70-100 score
          break;
        case 'motion':
          value = Math.round(Math.random() * 3); // 0-3 intensity
          break;
        default:
          value = 0;
      }
      
      data.push({
        date: format(entryDate, 'MMM d'),
        time: format(entryDate, 'h:mm a'),
        value,
        raw: {
          timestamp: entryDate.getTime(),
          value
        }
      });
    }
  } else {
    // Generate multiple readings per day for multi-day view
    for (let i = days; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      // Generate multiple readings per day
      for (let h = 0; h < 24; h += 8) {
        const entryDate = new Date(date);
        entryDate.setHours(h);
        
        let value: number;
        
        // Generate realistic mock data based on data type
        switch (dataType) {
          case 'hr':
            value = Math.round(60 + Math.random() * 30); // 60-90 bpm
            break;
          case 'spo2':
            value = Math.round(95 + Math.random() * 5); // 95-100%
            break;
          case 'temp':
            const celsius = 36.5 + (Math.random() * 1.5 - 0.5); // 36.0-37.5°C
            value = unitPreference === 'imperial' 
              ? Math.round((celsius * 9/5 + 32) * 10) / 10 // Convert to Fahrenheit
              : Math.round(celsius * 10) / 10;
            break;
          case 'readiness':
            value = Math.round(70 + Math.random() * 30); // 70-100 score
            break;
          case 'motion':
            value = Math.round(Math.random() * 3); // 0-3 intensity
            break;
          default:
            value = 0;
        }
        
        data.push({
          date: format(entryDate, 'MMM d'),
          time: format(entryDate, 'h:mm a'),
          value,
          raw: {
            timestamp: entryDate.getTime(),
            value
          }
        });
      }
    }
  }
  
  // Sort by timestamp (oldest to newest)
  return data.sort((a, b) => a.raw.timestamp - b.raw.timestamp);
};

export default FlashLogDisplay;
