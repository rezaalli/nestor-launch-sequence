import React, { useState, useEffect } from 'react';
import { ChevronLeft, PanelBottom, LineChart, SlidersHorizontal, CloudSun, Brain, Calendar, Activity, Zap } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import StatusBar from '@/components/StatusBar';
import BottomNavbar from '@/components/BottomNavbar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, subDays, subWeeks, subMonths, parseISO } from 'date-fns';

// Import our visualization components
import CorrelationPlot, { DataPoint, MetricType as CorrMetricType } from '@/components/visualizations/CorrelationPlot';
import HeatMapCalendar, { DayData, MetricType as HeatMapMetricType } from '@/components/visualizations/HeatMapCalendar';
import ComparativeAnalysis, { 
  ComparisonData, 
  MetricType as CompMetricType, 
  TimeRangeType 
} from '@/components/visualizations/ComparativeAnalysis';
import HealthForecast from '@/components/insights/HealthForecast';

// Import ML functionality for Activity Classification
import activityClassifier, { ActivityType, AccelerometerData, ActivityClassification } from '@/lib/ml/models/activityClassifier';

// Define time range labels
const timeRangeLabels: Record<TimeRangeType, string> = {
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly',
  year: 'Yearly',
  custom: 'Custom'
};

const AdvancedInsights = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialTabFromState = location.state?.initialTab;
  const [activeTab, setActiveTab] = useState(initialTabFromState || 'ai-health-analysis');
  
  // State for correlation plot
  const [xMetric, setXMetric] = useState<CorrMetricType>('sleepQuality');
  const [yMetric, setYMetric] = useState<CorrMetricType>('heartRate');
  
  // State for heat map
  const [heatMapMetric, setHeatMapMetric] = useState<HeatMapMetricType>('recovery');
  
  // State for comparative analysis
  const [compareMetric, setCompareMetric] = useState<CompMetricType>('sleepQuality');
  const [timeRange, setTimeRange] = useState<TimeRangeType>('week');
  
  // Set the active tab when the location state changes
  useEffect(() => {
    if (initialTabFromState) {
      setActiveTab(initialTabFromState);
    }
  }, [initialTabFromState]);
  
  // Handle back button
  const handleBack = () => {
    navigate('/dashboard');
  };
  
  // Handle correlation metrics change
  const handleCorrelationMetricsChange = (x: CorrMetricType, y: CorrMetricType) => {
    setXMetric(x);
    setYMetric(y);
  };
  
  // Sample data for correlation plot
  const correlationData: DataPoint[] = [
    { id: '1', date: '2023-10-01', xValue: 85, yValue: 65, weight: 40 },
    { id: '2', date: '2023-10-02', xValue: 75, yValue: 72, weight: 35 },
    { id: '3', date: '2023-10-03', xValue: 90, yValue: 58, weight: 45 },
    { id: '4', date: '2023-10-04', xValue: 65, yValue: 80, weight: 30, anomaly: true },
    { id: '5', date: '2023-10-05', xValue: 88, yValue: 62, weight: 50 },
    { id: '6', date: '2023-10-06', xValue: 92, yValue: 60, weight: 55 },
    { id: '7', date: '2023-10-07', xValue: 78, yValue: 68, weight: 40 },
    { id: '8', date: '2023-10-08', xValue: 82, yValue: 64, weight: 45 },
    { id: '9', date: '2023-10-09', xValue: 70, yValue: 75, weight: 35, anomaly: true },
    { id: '10', date: '2023-10-10', xValue: 86, yValue: 63, weight: 50 },
    { id: '11', date: '2023-10-11', xValue: 80, yValue: 67, weight: 45 },
    { id: '12', date: '2023-10-12', xValue: 77, yValue: 70, weight: 40 },
    { id: '13', date: '2023-10-13', xValue: 95, yValue: 56, weight: 60 },
    { id: '14', date: '2023-10-14', xValue: 72, yValue: 74, weight: 35 },
  ];
  
  // Sample data for heat map calendar
  const generateHeatMapData = (metric: HeatMapMetricType): DayData[] => {
    const data: DayData[] = [];
    const today = new Date();
    const baseValue = metric === 'heartRate' ? 60 : 
                   metric === 'sleepQuality' ? 75 : 
                   metric === 'recovery' ? 80 : 50;
    
    // Generate 30 days of data
    for (let i = 0; i < 30; i++) {
      const date = subDays(today, i);
      // Random value with some variance
      const variance = Math.random() * 20 - 10; // -10 to +10
      
      // Weekend effect (better sleep, recovery on weekends)
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const weekendBoost = isWeekend && (metric === 'sleepQuality' || metric === 'recovery') ? 10 : 0;
      
      let value = Math.round(baseValue + variance + weekendBoost);
      // Ensure values are in reasonable ranges
      if (metric === 'heartRate') value = Math.max(50, Math.min(90, value));
      if (metric === 'sleepQuality' || metric === 'recovery') value = Math.max(40, Math.min(100, value));
      
      // Add annotations occasionally
      const shouldAddAnnotation = Math.random() > 0.85;
      const annotation = shouldAddAnnotation ? 
        metric === 'heartRate' ? 'Elevated after exercise' :
        metric === 'sleepQuality' ? 'Improved after meditation' :
        metric === 'recovery' ? 'Full recovery day' : undefined
        : undefined;
      
      data.push({
        date: date.toISOString(),
        value,
        percentile: Math.round(Math.random() * 100),
        annotation,
        highlight: shouldAddAnnotation
      });
    }
    
    return data;
  };
  
  // Generate sample data for comparative analysis
  const generateComparisonData = (metric: CompMetricType, range: TimeRangeType): ComparisonData => {
    const today = new Date();
    let currentStart, currentEnd, previousStart, previousEnd;
    
    // Determine date ranges based on selected time range
    switch (range) {
      case 'day':
        currentEnd = today;
        currentStart = today;
        previousStart = subDays(today, 1);
        previousEnd = subDays(today, 1);
        break;
      case 'week':
        currentEnd = today;
        currentStart = subDays(today, 6);
        previousStart = subDays(today, 13);
        previousEnd = subDays(today, 7);
        break;
      case 'month':
        currentEnd = today;
        currentStart = subDays(today, 29);
        previousStart = subDays(today, 59);
        previousEnd = subDays(today, 30);
        break;
      case 'year':
        currentEnd = today;
        currentStart = subMonths(today, 11);
        previousStart = subMonths(today, 23);
        previousEnd = subMonths(today, 12);
        break;
      default:
        currentEnd = today;
        currentStart = subDays(today, 6);
        previousStart = subDays(today, 13);
        previousEnd = subDays(today, 7);
    }
    
    // Generate base value and trend based on metric
    const baseCurrentValue = metric === 'heartRate' ? 65 : 
                          metric === 'sleepQuality' ? 85 : 
                          metric === 'recovery' ? 82 : 
                          metric === 'hrvScore' ? 68 : 75;
                          
    const randomVariance = (Math.random() * 10) - 5; // -5 to +5
    const currentValue = Math.round(baseCurrentValue + randomVariance);
    
    // Previous period value with some difference
    const changeMagnitude = Math.random() * 15 - 7.5; // -7.5 to +7.5
    const previousValue = Math.round(currentValue - changeMagnitude);
    
    // Calculate delta and determine status
    const delta = currentValue - previousValue;
    const deltaPercentage = (delta / previousValue) * 100;
    
    let status: 'positive' | 'negative' | 'neutral';
    
    // Different metrics have different interpretations of positive/negative
    if (metric === 'heartRate') {
      // For heart rate, lower is generally better (resting)
      status = delta < 0 ? 'positive' : delta > 0 ? 'negative' : 'neutral';
    } else {
      // For sleep quality, recovery, hrv, etc. higher is better
      status = delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral';
    }
    
    // Generate daily data for the chart
    const generateDailyData = (start: Date, end: Date, baseValue: number) => {
      const data = [];
      const days = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      for (let i = 0; i < days; i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        
        const dayVariance = Math.random() * 20 - 10; // -10 to +10
        const value = Math.round(baseValue + dayVariance);
        
        data.push({
          date: date.toISOString(),
          value
        });
      }
      
      return data;
    };
    
    return {
      metrics: {
        [metric]: {
          current: {
            value: currentValue,
            label: `Current ${timeRangeLabels[range]}`,
            details: {
              'Average': currentValue,
              'Peak': Math.round(currentValue * 1.2),
              'Low': Math.round(currentValue * 0.8),
              'Variance': Math.round(Math.random() * 10)
            }
          },
          previous: {
            value: previousValue,
            label: `Previous ${timeRangeLabels[range]}`,
            details: {
              'Average': previousValue,
              'Peak': Math.round(previousValue * 1.2),
              'Low': Math.round(previousValue * 0.8),
              'Variance': Math.round(Math.random() * 10)
            }
          },
          delta,
          deltaPercentage,
          trend: delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat',
          status,
          significance: Math.random() * 0.1 // 0-0.1, so sometimes significant (<0.05)
        }
      },
      timeRanges: {
        current: {
          start: currentStart.toISOString(),
          end: currentEnd.toISOString()
        },
        previous: {
          start: previousStart.toISOString(),
          end: previousEnd.toISOString()
        }
      },
      dailyData: {
        current: generateDailyData(currentStart, currentEnd, currentValue),
        previous: generateDailyData(previousStart, previousEnd, previousValue)
      }
    };
  };
  
  // Generate data based on current selections
  const heatMapData = generateHeatMapData(heatMapMetric);
  const comparisonData = generateComparisonData(compareMetric, timeRange);
  
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <StatusBar />
      
      {/* Header */}
      <div className="px-6 pt-4 pb-3 flex items-center justify-between bg-white">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-2">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Advanced Insights</h1>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="px-6 py-2 bg-white border-b border-neutral-200">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="ai-health-analysis" className="flex-1">
              <Brain className="h-4 w-4 mr-1" />
              AI Health Analysis
            </TabsTrigger>
            <TabsTrigger value="health-heat-map" className="flex-1">
              <Calendar className="h-4 w-4 mr-1" />
              Health Heat Map
            </TabsTrigger>
            <TabsTrigger value="comparative-analysis" className="flex-1">
              <Activity className="h-4 w-4 mr-1" />
              Comparative Analysis
            </TabsTrigger>
            <TabsTrigger value="correlations" className="flex-1">
              <LineChart className="h-4 w-4 mr-1" />
              Correlations
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex-1">
              <PanelBottom className="h-4 w-4 mr-1" />
              Heat Map
            </TabsTrigger>
            <TabsTrigger value="comparative" className="flex-1">
              <SlidersHorizontal className="h-4 w-4 mr-1" />
              Compare
            </TabsTrigger>
            <TabsTrigger value="forecast" className="flex-1">
              <CloudSun className="h-4 w-4 mr-1" />
              Forecast
            </TabsTrigger>
            <TabsTrigger value="activity" className="flex-1">
              <Brain className="h-4 w-4 mr-1" />
              Activity
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-4 pb-20">
        <TabsContent value="correlations" className="mt-0">
          <div className="mb-4">
            <p className="text-sm text-neutral-600">
              Discover relationships between different health metrics to understand what impacts your wellbeing.
            </p>
          </div>
          
          <CorrelationPlot 
            xMetric={xMetric}
            yMetric={yMetric}
            data={correlationData}
            onMetricChange={handleCorrelationMetricsChange}
            correlationStrength={-0.7} // Strong negative correlation
            correlationSignificance={0.01} // Statistically significant
          />
          
          <div className="mt-4 bg-white rounded-lg p-4 border border-neutral-200">
            <h3 className="text-sm font-medium mb-2">Understanding Correlations</h3>
            <p className="text-xs text-neutral-600">
              This visualization shows how different aspects of your health relate to each other. 
              Strong correlations (shown by trend lines) suggest that when one metric changes, the other 
              tends to change in a predictable way.
            </p>
            <p className="text-xs text-neutral-600 mt-2">
              For example, a negative correlation between sleep quality and resting heart rate means that 
              as your sleep improves, your resting heart rate tends to decrease.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="heatmap" className="mt-0">
          <div className="mb-4">
            <p className="text-sm text-neutral-600">
              View your health metrics across time to identify patterns, trends, and recurring behaviors.
            </p>
          </div>
          
          <HeatMapCalendar 
            metric={heatMapMetric}
            data={heatMapData}
            onMetricChange={setHeatMapMetric}
            colorScale="gradient"
          />
          
          <div className="mt-4 bg-white rounded-lg p-4 border border-neutral-200">
            <h3 className="text-sm font-medium mb-2">Reading Your Heat Map</h3>
            <p className="text-xs text-neutral-600">
              The heat map shows your daily metrics with color intensity indicating higher or lower values. 
              Look for patterns like weekday vs. weekend differences, or how lifestyle changes impact your metrics over time.
            </p>
            <p className="text-xs text-neutral-600 mt-2">
              Yellow indicators highlight days with annotations or significant events worth noting.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="comparative" className="mt-0">
          <div className="mb-4">
            <p className="text-sm text-neutral-600">
              Compare your health metrics across different time periods to track progress and identify changes.
            </p>
          </div>
          
          <ComparativeAnalysis 
            data={comparisonData}
            primaryMetric={compareMetric}
            onMetricChange={setCompareMetric}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
          
          <div className="mt-4 bg-white rounded-lg p-4 border border-neutral-200">
            <h3 className="text-sm font-medium mb-2">Tracking Your Progress</h3>
            <p className="text-xs text-neutral-600">
              This comparison tool helps you understand how your health metrics are changing over time. 
              Green indicators show positive changes while red highlights areas that need attention.
            </p>
            <p className="text-xs text-neutral-600 mt-2">
              Use the different views (split, bar chart, timeline) to get different perspectives on your data.
              The "significant" badge appears when changes are statistically meaningful rather than random fluctuations.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="forecast" className="mt-0">
          <div className="mb-4">
            <p className="text-sm text-neutral-600">
              View AI-powered predictions about your future health trends and personalized intervention suggestions.
            </p>
          </div>
          
          <HealthForecast />
          
          <div className="mt-4 bg-white rounded-lg p-4 border border-neutral-200">
            <h3 className="text-sm font-medium mb-2">Understanding Your Health Forecast</h3>
            <p className="text-xs text-neutral-600">
              This forecast uses AI to predict future health trends based on your historical data patterns. 
              The predictions become less certain the further into the future they extend.
            </p>
            <p className="text-xs text-neutral-600 mt-2">
              Suggested interventions are personalized actions that may help improve your predicted outcomes.
              Focus on high-impact interventions for the most significant health benefits.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="mt-0">
          <div className="mb-4">
            <p className="text-sm text-neutral-600">
              View AI-powered predictions about your future health trends and personalized intervention suggestions.
            </p>
          </div>
          
          <HealthForecast />
          
          <div className="mt-4 bg-white rounded-lg p-4 border border-neutral-200">
            <h3 className="text-sm font-medium mb-2">Understanding Your Health Forecast</h3>
            <p className="text-xs text-neutral-600">
              This forecast uses AI to predict future health trends based on your historical data patterns. 
              The predictions become less certain the further into the future they extend.
            </p>
            <p className="text-xs text-neutral-600 mt-2">
              Suggested interventions are personalized actions that may help improve your predicted outcomes.
              Focus on high-impact interventions for the most significant health benefits.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="ai-health-analysis" className="mt-0">
          <div className="mb-4">
            <p className="text-sm text-neutral-600">
              AI-powered analysis of your health data to identify trends and patterns in your well-being.
            </p>
          </div>
          
          {/* Health Trend Categories */}
          <div className="space-y-4 mb-6 p-4 bg-white rounded-lg border border-neutral-200">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Health Trends</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-100">
                  <Activity className="text-red-600" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Heart Health</h3>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Your heart rate variability has been increasing, suggesting improved cardiac health and resilience to stress.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-yellow-100">
                  <Zap className="text-yellow-600" size={20} />
                </div>
                <div className="flex flex-col">
                  <h3 className="font-medium text-gray-900">Energy Levels</h3>
                  <span className="text-green-600 text-sm font-medium">Improving</span>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Your energy metrics have shown a 12% improvement over the last two weeks, correlating with better sleep quality.
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                  <Brain className="text-purple-600" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Sleep Patterns</h3>
                </div>
              </div>
              <p className="text-sm text-gray-500">
                Your deep sleep has increased by an average of 15 minutes per night, which may be contributing to improved recovery metrics.
              </p>
            </div>
          </div>
          
          <div className="mt-4 bg-white rounded-lg p-4 border border-neutral-200">
            <h3 className="text-sm font-medium mb-2">Understanding AI Health Analysis</h3>
            <p className="text-xs text-neutral-600">
              Our AI analyzes your health data to identify meaningful patterns and correlations 
              that may not be immediately obvious. This analysis becomes more accurate and personalized 
              as you continue to track your health metrics.
            </p>
            <p className="text-xs text-neutral-600 mt-2">
              Health trends are calculated by analyzing changes in your metrics over time and 
              comparing them to baseline measurements and population data where available.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="health-heat-map" className="mt-0">
          <div className="mb-4">
            <p className="text-sm text-neutral-600">
              View patterns in your health data over time through color intensity.
            </p>
          </div>
          
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-neutral-600">
              Select a metric to view its patterns over time:
            </p>
            <select 
              className="bg-gray-100 border-none rounded-md px-2 py-1 text-xs"
              value={heatMapMetric}
              onChange={(e) => setHeatMapMetric(e.target.value as HeatMapMetricType)}
            >
              <option value="heartRate">Heart Rate</option>
              <option value="sleepQuality">Sleep Quality</option>
              <option value="recovery">Recovery</option>
            </select>
          </div>
          
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <HeatMapCalendar 
              metric={heatMapMetric}
              data={generateHeatMapData(heatMapMetric)}
              showAnnotations={true}
              showWeekdayLabels={true}
              highlightToday={true}
            />
          </div>
          
          <div className="mt-4 bg-white rounded-lg p-4 border border-neutral-200">
            <h3 className="text-sm font-medium mb-2">Understanding Heat Maps</h3>
            <p className="text-xs text-neutral-600">
              This calendar visualization shows how your health metrics vary day by day. 
              Deeper colors indicate higher values, helping you spot patterns across days and weeks.
            </p>
            <p className="text-xs text-neutral-600 mt-2">
              Look for weekly patterns, effects of lifestyle changes, and consistent trends 
              that may reveal insights about your health habits.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="comparative-analysis" className="mt-0">
          <div className="mb-4">
            <p className="text-sm text-neutral-600">
              Compare your health metrics between different time periods to track progress.
            </p>
          </div>
          
          <div className="bg-white rounded-lg border border-neutral-200 p-4">
            <ComparativeAnalysis 
              data={generateComparisonData(compareMetric, timeRange)}
              primaryMetric={compareMetric}
              timeRange={timeRange}
              onMetricChange={(metric) => setCompareMetric(metric)}
              onTimeRangeChange={(range) => setTimeRange(range)}
            />
          </div>
          
          <div className="mt-4 bg-white rounded-lg p-4 border border-neutral-200">
            <h3 className="text-sm font-medium mb-2">Understanding Comparisons</h3>
            <p className="text-xs text-neutral-600">
              This visualization compares your health metrics between different time periods. 
              It helps you understand if your metrics are improving, declining, or staying stable over time.
            </p>
            <p className="text-xs text-neutral-600 mt-2">
              Use the different view options to explore your data from multiple perspectives and 
              gain deeper insights into your health trends.
            </p>
          </div>
        </TabsContent>
      </div>
      
      <BottomNavbar />
    </div>
  );
};

export default AdvancedInsights; 