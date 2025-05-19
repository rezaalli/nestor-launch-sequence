import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import InteractiveChart, { ChartDataPoint, ComparisonDataset } from './InteractiveChart';
import { useTheme } from '@/contexts/ThemeContext';

// Example data for demonstration
const generateDemoData = (days = 30, baseValue = 70, variance = 10): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate a value with some random variance
    const randomVariance = Math.random() * variance * 2 - variance;
    const value = baseValue + randomVariance;
    
    data.push({
      timestamp: date.getTime(),
      date: date.toLocaleDateString(),
      label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      value: Math.round(value),
      temperature: Math.round((97 + Math.random() * 2) * 10) / 10,
      steps: Math.floor(Math.random() * 8000) + 2000,
      sleepHours: Math.round((6 + Math.random() * 3) * 10) / 10
    });
  }
  
  return data;
};

// Generate comparison datasets for previous periods
const generateComparisonDatasets = (): ComparisonDataset[] => {
  return [
    {
      id: 'previous-month',
      name: 'Previous Month',
      color: '#9333ea', // Purple
      data: generateDemoData(30, 65, 12).map(point => ({
        ...point,
        timestamp: point.timestamp - 30 * 24 * 60 * 60 * 1000, // Shift back 30 days
        date: new Date(point.timestamp - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        label: new Date(point.timestamp - 30 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }))
    },
    {
      id: 'last-year',
      name: 'Last Year',
      color: '#10b981', // Green
      data: generateDemoData(30, 68, 15).map(point => ({
        ...point,
        timestamp: point.timestamp - 365 * 24 * 60 * 60 * 1000, // Shift back a year
        date: new Date(point.timestamp - 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        label: new Date(point.timestamp - 365 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      }))
    }
  ];
};

/**
 * EnhancedDataVisualization - A component showcasing interactive data charts
 * with accessibility features
 */
const EnhancedDataVisualization: React.FC = () => {
  const { colorMode } = useTheme();
  const [activeTab, setActiveTab] = useState('heartRate');
  const [heartRateData, setHeartRateData] = useState<ChartDataPoint[]>([]);
  const [temperatureData, setTemperatureData] = useState<ChartDataPoint[]>([]);
  const [stepsData, setStepsData] = useState<ChartDataPoint[]>([]);
  const [sleepData, setSleepData] = useState<ChartDataPoint[]>([]);
  const [comparisonDatasets, setComparisonDatasets] = useState<ComparisonDataset[]>([]);
  
  // Generate different datasets on mount
  useEffect(() => {
    setHeartRateData(generateDemoData(30, 72, 10));
    setTemperatureData(generateDemoData(30, 98.6, 1).map(point => ({
      ...point,
      value: point.temperature
    })));
    setStepsData(generateDemoData(30, 8000, 3000).map(point => ({
      ...point,
      value: point.steps
    })));
    setSleepData(generateDemoData(30, 7.5, 1.5).map(point => ({
      ...point,
      value: point.sleepHours
    })));
    setComparisonDatasets(generateComparisonDatasets());
  }, []);
  
  // Handle chart data point click
  const handleDataPointClick = (dataPoint: ChartDataPoint) => {
    console.log('Clicked data point:', dataPoint);
    // You could show a modal with details about this specific data point
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Health Insights</h1>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="heartRate" className="text-xs sm:text-sm">Heart Rate</TabsTrigger>
          <TabsTrigger value="temperature" className="text-xs sm:text-sm">Temperature</TabsTrigger>
          <TabsTrigger value="steps" className="text-xs sm:text-sm">Steps</TabsTrigger>
          <TabsTrigger value="sleep" className="text-xs sm:text-sm">Sleep</TabsTrigger>
        </TabsList>
        
        <TabsContent value="heartRate" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Heart Rate</CardTitle>
              <CardDescription>Average beats per minute over time</CardDescription>
            </CardHeader>
            <CardContent>
              <InteractiveChart
                title="Heart Rate"
                data={heartRateData}
                dataKey="value"
                yAxisLabel="bpm"
                height={350}
                color="#ef4444"
                showControls={true}
                showBrush={true}
                showComparison={true}
                comparableDatasets={comparisonDatasets}
                referenceLines={[
                  { value: 60, label: 'Low', color: '#3b82f6' },
                  { value: 100, label: 'High', color: '#ef4444' }
                ]}
                onDataPointClick={handleDataPointClick}
              />
              
              <div className="mt-6">
                <p className="text-sm">
                  <strong>Interactive Features:</strong> Try clicking data points, toggling comparison datasets, zooming in by clicking the magnifying glass and dragging across the chart, or switching between visualization types. All features are keyboard navigable and screen reader friendly.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="temperature" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Body Temperature</CardTitle>
              <CardDescription>Temperature readings over time (°F)</CardDescription>
            </CardHeader>
            <CardContent>
              <InteractiveChart
                title="Temperature"
                data={temperatureData}
                dataKey="value"
                yAxisLabel="°F"
                height={350}
                color="#f97316"
                showControls={true}
                showBrush={true}
                showComparison={true}
                comparableDatasets={comparisonDatasets}
                referenceLines={[
                  { value: 97, label: 'Low', color: '#3b82f6' },
                  { value: 99.5, label: 'High', color: '#ef4444' }
                ]}
                onDataPointClick={handleDataPointClick}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="steps" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Daily Steps</CardTitle>
              <CardDescription>Step count per day</CardDescription>
            </CardHeader>
            <CardContent>
              <InteractiveChart
                title="Steps"
                data={stepsData}
                dataKey="value"
                yAxisLabel="steps"
                height={350}
                color="#8b5cf6"
                chartType="bar"
                showControls={true}
                showBrush={true}
                showComparison={true}
                referenceLines={[
                  { value: 10000, label: 'Goal', color: '#22c55e' }
                ]}
                onDataPointClick={handleDataPointClick}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sleep" className="pt-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Sleep Duration</CardTitle>
              <CardDescription>Hours of sleep per night</CardDescription>
            </CardHeader>
            <CardContent>
              <InteractiveChart
                title="Sleep"
                data={sleepData}
                dataKey="value"
                yAxisLabel="hours"
                height={350}
                color="#0ea5e9"
                chartType="area"
                showControls={true}
                showBrush={true}
                showComparison={true}
                referenceLines={[
                  { value: 7, label: 'Recommended', color: '#22c55e' }
                ]}
                onDataPointClick={handleDataPointClick}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-lg font-bold mb-2">Accessibility Features</h2>
        <p className="mb-4">This component includes several accessibility enhancements:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Keyboard navigable charts and controls (Tab through elements and use Enter to interact)</li>
          <li>Screen reader announcements for data points and interactions</li>
          <li>Color contrast that adapts to light/dark mode and respects high contrast settings</li>
          <li>Supports reduced motion preferences</li>
          <li>Touch-friendly sizing for mobile interactions</li>
          <li>Accessible labels and ARIA attributes throughout</li>
        </ul>
      </div>
    </div>
  );
};

export default EnhancedDataVisualization; 