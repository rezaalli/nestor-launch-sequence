
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
import { getReadings, formatTemperature } from '@/utils/bleUtils';
import { useUser } from '@/contexts/UserContext';
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
import { exportDataAsCSV } from '@/utils/bleUtils';

type ReadingType = 'hr' | 'spo2' | 'temp' | 'readiness' | 'motion';

const FlashLogDisplay = () => {
  const [activeDataType, setActiveDataType] = useState<ReadingType>('hr');
  const [timeRange, setTimeRange] = useState<number>(7); // days
  const { user } = useUser();
  const unitPreference = user.unitPreference || 'imperial';
  
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    // Get all readings from BLE utils
    const readings = getReadings(timeRange);
    if (readings.length === 0) return;
    
    // Process readings into chart-friendly format
    const processedData = readings.map(reading => {
      const date = new Date(reading.timestamp);
      let formattedDate = date.toLocaleDateString();
      let value: number | string = 0;
      
      switch(activeDataType) {
        case 'hr':
          value = reading.hr;
          break;
        case 'spo2':
          value = reading.spo2;
          break;
        case 'temp':
          const tempFormat = formatTemperature(reading.temp, unitPreference);
          value = parseFloat(tempFormat.value);
          break;
        case 'readiness':
          value = reading.readiness;
          break;
        case 'motion':
          value = reading.motion;
          break;
      }
      
      return {
        date: formattedDate,
        time: date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        value,
        raw: reading
      };
    });
    
    setChartData(processedData);
  }, [activeDataType, timeRange, unitPreference]);
  
  const handleExportData = () => {
    const csvData = exportDataAsCSV();
    
    // Create a blob and download the CSV
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'nestor-health-data.csv');
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
  
  const metrics = getDataMetrics();

  return (
    <div className="w-full space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{getChartTitle()} History</CardTitle>
          <CardDescription>
            View your historical health data from the past {timeRange} days
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="hr" onValueChange={(value) => setActiveDataType(value as ReadingType)}>
            <TabsList className="mb-4">
              <TabsTrigger value="hr">Heart Rate</TabsTrigger>
              <TabsTrigger value="spo2">SpO₂</TabsTrigger>
              <TabsTrigger value="temp">Temperature</TabsTrigger>
              <TabsTrigger value="readiness">Readiness</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeDataType} className="h-[300px]">
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
            <Button variant="outline" onClick={() => setTimeRange(prev => prev === 7 ? 30 : 7)}>
              Show {timeRange === 7 ? '30' : '7'} Days
            </Button>
            <Button variant="outline" onClick={handleExportData}>
              Export Data
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default FlashLogDisplay;
