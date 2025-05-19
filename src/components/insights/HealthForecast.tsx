import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ArrowRight, Droplets, Sun, Cloud, Wind, Umbrella, ArrowUp, ArrowDown, TrendingUp, Lightbulb, AlertCircle, BarChart3, LayoutPanelLeft, ListTodo } from 'lucide-react';
import InteractiveChart from '@/components/InteractiveChart';
import { ChartDataPoint } from '@/components/InteractiveChart';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import ForecastAccuracyTracker from './ForecastAccuracyTracker';
import HabitFormationTracker from './HabitFormationTracker';

// Define types for our predictions
export type PredictionTimeframe = '7day' | '30day' | '90day';
export type MetricType = 'heartRate' | 'recovery' | 'stress' | 'sleep' | 'activity';
export type TrendDirection = 'improving' | 'declining' | 'stable';
export type RiskLevel = 'high' | 'medium' | 'low';

export interface Intervention {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';  
  timeToImpact: string; // e.g., "2 weeks"
  effort: 'easy' | 'moderate' | 'challenging';
  metrics: MetricType[];
}

export interface MetricPrediction {
  metric: MetricType;
  trend: TrendDirection;
  riskLevel: RiskLevel;
  currentValue: number;
  predictedValue: number;
  confidenceLevel: number; // 0-1
  dataPoints: ChartDataPoint[];
  contributingFactors: {
    name: string;
    impact: number; // -1 to 1, negative means harmful
  }[];
}

export interface HealthPrediction {
  timeframe: PredictionTimeframe;
  predictions: MetricPrediction[];
  interventions: Intervention[];
  lastUpdated: Date;
}

// Helper function to get appropriate colors based on trend direction
const getTrendColor = (trend: TrendDirection, riskLevel: RiskLevel) => {
  if (trend === 'improving') return 'bg-green-100 text-green-800 border-green-200';
  if (trend === 'declining') {
    if (riskLevel === 'high') return 'bg-red-100 text-red-800 border-red-200';
    if (riskLevel === 'medium') return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
  return 'bg-blue-100 text-blue-800 border-blue-200'; // stable
};

// Helper function to get trend icon
const getTrendIcon = (trend: TrendDirection) => {
  if (trend === 'improving') return <ArrowUp className="h-4 w-4" />;
  if (trend === 'declining') return <ArrowDown className="h-4 w-4" />;
  return <TrendingUp className="h-4 w-4" />;
};

// Helper to get metric name
const getMetricName = (metric: MetricType): string => {
  switch (metric) {
    case 'heartRate': return 'Heart Rate';
    case 'recovery': return 'Recovery';
    case 'stress': return 'Stress Levels';
    case 'sleep': return 'Sleep Quality';
    case 'activity': return 'Activity Levels';
    default: return metric;
  }
};

// Helper to get impact description
const getImpactText = (impact: 'high' | 'medium' | 'low'): string => {
  switch (impact) {
    case 'high': return 'High impact - significant improvement expected';
    case 'medium': return 'Medium impact - noticeable improvement expected';
    case 'low': return 'Low impact - subtle improvement expected';
    default: return '';
  }
};

// Mock data generator for predictions
const generateMockPredictions = (timeframe: PredictionTimeframe): HealthPrediction => {
  // Determine days based on timeframe
  let days = 7;
  if (timeframe === '30day') days = 30;
  if (timeframe === '90day') days = 90;
  
  // Mock health metrics with different trends
  const metrics: MetricType[] = ['heartRate', 'recovery', 'stress', 'sleep', 'activity'];
  const predictions: MetricPrediction[] = metrics.map((metric) => {
    // Randomize trend and risk for demo purposes
    const trendOptions: TrendDirection[] = ['improving', 'declining', 'stable'];
    const trend = trendOptions[Math.floor(Math.random() * trendOptions.length)];
    
    const riskOptions: RiskLevel[] = ['low', 'medium', 'high'];
    const riskLevel = riskOptions[Math.floor(Math.random() * riskOptions.length)];
    
    // Generate base values
    let currentValue = 0;
    let predictedValue = 0;
    
    switch (metric) {
      case 'heartRate':
        currentValue = 72 + Math.floor(Math.random() * 10);
        predictedValue = trend === 'improving' ? currentValue - 5 : trend === 'declining' ? currentValue + 5 : currentValue;
        break;
      case 'recovery':
        currentValue = 65 + Math.floor(Math.random() * 20);
        predictedValue = trend === 'improving' ? Math.min(95, currentValue + 15) : trend === 'declining' ? Math.max(50, currentValue - 15) : currentValue;
        break;
      case 'stress':
        currentValue = 40 + Math.floor(Math.random() * 35);
        predictedValue = trend === 'improving' ? Math.max(20, currentValue - 15) : trend === 'declining' ? Math.min(90, currentValue + 15) : currentValue;
        break;
      case 'sleep':
        currentValue = 60 + Math.floor(Math.random() * 25);
        predictedValue = trend === 'improving' ? Math.min(95, currentValue + 15) : trend === 'declining' ? Math.max(50, currentValue - 15) : currentValue;
        break;
      case 'activity':
        currentValue = 50 + Math.floor(Math.random() * 30);
        predictedValue = trend === 'improving' ? Math.min(95, currentValue + 20) : trend === 'declining' ? Math.max(40, currentValue - 20) : currentValue;
        break;
    }
    
    // Generate data points for chart
    const dataPoints: ChartDataPoint[] = [];
    const now = new Date();
    
    // Past data (actual)
    for (let i = 30; i > 0; i--) {
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      // Add some variance to create realistic looking data
      const variance = Math.random() * 10 - 5;
      const value = currentValue + variance;
      
      dataPoints.push({
        timestamp: date.getTime(),
        date: date.toLocaleDateString(),
        label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: Math.round(value),
        isPast: true
      });
    }
    
    // Future data (predicted)
    for (let i = 1; i <= days; i++) {
      const date = new Date();
      date.setDate(now.getDate() + i);
      
      // Calculate value with a trend towards predicted value
      const progressRatio = i / days;
      const difference = predictedValue - currentValue;
      const projectedChange = difference * progressRatio;
      const value = currentValue + projectedChange;
      
      // Add some variance but with increasing uncertainty
      const uncertaintyFactor = 0.5 + (i / days) * 2;
      const variance = (Math.random() * 10 - 5) * uncertaintyFactor;
      
      dataPoints.push({
        timestamp: date.getTime(),
        date: date.toLocaleDateString(),
        label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        value: Math.round(value + variance),
        isPredicted: true
      });
    }
    
    // Generate contributing factors
    const possibleFactors = [
      { name: 'Sleep Schedule', impact: Math.random() * 2 - 1 },
      { name: 'Hydration', impact: Math.random() * 2 - 1 },
      { name: 'Exercise Consistency', impact: Math.random() * 2 - 1 },
      { name: 'Stress Management', impact: Math.random() * 2 - 1 },
      { name: 'Nutrition', impact: Math.random() * 2 - 1 },
      { name: 'Screen Time', impact: Math.random() * 2 - 1 },
      { name: 'Social Interaction', impact: Math.random() * 2 - 1 }
    ];
    
    // Select 3-5 random factors as contributors
    const factorCount = 3 + Math.floor(Math.random() * 3);
    const shuffled = [...possibleFactors].sort(() => 0.5 - Math.random());
    const contributingFactors = shuffled.slice(0, factorCount);
    
    return {
      metric,
      trend,
      riskLevel,
      currentValue,
      predictedValue,
      confidenceLevel: 0.6 + Math.random() * 0.3, // 60-90% confidence
      dataPoints,
      contributingFactors
    };
  });
  
  // Generate interventions
  const possibleInterventions: Intervention[] = [
    {
      id: 'int1',
      title: 'Regular Sleep Schedule',
      description: 'Go to bed and wake up at the same time every day, even on weekends.',
      impact: 'high',
      timeToImpact: '2 weeks',
      effort: 'moderate',
      metrics: ['sleep', 'recovery', 'stress']
    },
    {
      id: 'int2',
      title: 'Hydration Routine',
      description: 'Drink at least 8 glasses of water daily, starting with a glass first thing in the morning.',
      impact: 'medium',
      timeToImpact: '1 week',
      effort: 'easy',
      metrics: ['recovery', 'heartRate']
    },
    {
      id: 'int3',
      title: 'Daily Movement Breaks',
      description: 'Take a 5-minute movement break every hour of sedentary activity.',
      impact: 'medium',
      timeToImpact: '3 weeks',
      effort: 'easy',
      metrics: ['activity', 'stress']
    },
    {
      id: 'int4',
      title: 'Evening Wind-Down Routine',
      description: 'Create a 30-minute routine before bed without screens to improve sleep quality.',
      impact: 'high',
      timeToImpact: '10 days',
      effort: 'moderate',
      metrics: ['sleep', 'recovery']
    },
    {
      id: 'int5',
      title: 'Meditation Practice',
      description: 'Practice 10 minutes of guided meditation daily for stress reduction.',
      impact: 'high',
      timeToImpact: '3 weeks',
      effort: 'moderate',
      metrics: ['stress', 'recovery', 'sleep']
    },
    {
      id: 'int6',
      title: 'Consistent Exercise Schedule',
      description: 'Exercise at the same time each day to establish a routine.',
      impact: 'high',
      timeToImpact: '4 weeks',
      effort: 'challenging',
      metrics: ['activity', 'heartRate', 'recovery']
    },
    {
      id: 'int7',
      title: 'Regular Meal Timing',
      description: 'Eat meals at consistent times each day to regulate energy levels.',
      impact: 'medium',
      timeToImpact: '2 weeks',
      effort: 'moderate',
      metrics: ['recovery', 'activity']
    }
  ];
  
  // Select interventions based on declining metrics
  const decliningMetrics = predictions
    .filter(p => p.trend === 'declining')
    .map(p => p.metric);
  
  // If no declining metrics, get metrics with highest risk
  const metricsToTarget = decliningMetrics.length > 0 ? 
    decliningMetrics : 
    predictions
      .sort((a, b) => {
        const riskValue = { high: 3, medium: 2, low: 1 };
        return riskValue[b.riskLevel] - riskValue[a.riskLevel];
      })
      .slice(0, 2)
      .map(p => p.metric);
  
  // Filter interventions that target those metrics
  const relevantInterventions = possibleInterventions
    .filter(intervention => 
      intervention.metrics.some(m => metricsToTarget.includes(m))
    )
    .sort(() => 0.5 - Math.random()) // Shuffle
    .slice(0, 3); // Take 3
  
  return {
    timeframe,
    predictions,
    interventions: relevantInterventions,
    lastUpdated: new Date()
  };
};

interface HealthForecastProps {
  className?: string;
  userId?: string;
}

const HealthForecast: React.FC<HealthForecastProps> = ({ className, userId }) => {
  const [timeframe, setTimeframe] = useState<PredictionTimeframe>('7day');
  const [selectedMetric, setSelectedMetric] = useState<MetricType | null>(null);
  const [healthPrediction, setHealthPrediction] = useState<HealthPrediction>(() => 
    generateMockPredictions(timeframe)
  );
  const [view, setView] = useState<'forecast' | 'accuracy' | 'habits'>('forecast');
  
  // Update predictions when timeframe changes
  React.useEffect(() => {
    setHealthPrediction(generateMockPredictions(timeframe));
  }, [timeframe]);
  
  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: PredictionTimeframe) => {
    setTimeframe(newTimeframe);
  };
  
  // Handle selecting a metric for detailed view
  const handleSelectMetric = (metric: MetricType) => {
    setSelectedMetric(selectedMetric === metric ? null : metric);
  };
  
  // Get the prediction for the currently selected metric
  const getSelectedPrediction = () => {
    if (!selectedMetric) return null;
    return healthPrediction.predictions.find(p => p.metric === selectedMetric) || null;
  };
  
  const selectedPrediction = getSelectedPrediction();
    
  // Render the weather-inspired forecast indicator
  const renderForecastIcon = (trend: TrendDirection) => {
    switch (trend) {
      case 'improving':
        return <Sun className="w-8 h-8 text-yellow-500" />;
      case 'declining':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'stable':
        return <Wind className="w-8 h-8 text-blue-500" />;
      default:
        return null;
    }
  };
  
  // Add a handler for adding new habits based on interventions
  const handleAddHabit = () => {
    // This would be implemented to create a new habit from an intervention
    console.log('Adding new habit from an intervention');
    // For a real implementation, this would open a modal or navigate to a form
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Health Forecast</h2>
        <div className="flex space-x-2">
          <Tabs value={view} onValueChange={(value) => setView(value as 'forecast' | 'accuracy' | 'habits')}>
            <TabsList className="grid grid-cols-3 w-[300px]">
              <TabsTrigger value="forecast">
                <LayoutPanelLeft className="h-4 w-4 mr-1" />
                Forecast
              </TabsTrigger>
              <TabsTrigger value="accuracy">
                <BarChart3 className="h-4 w-4 mr-1" />
                Accuracy
              </TabsTrigger>
              <TabsTrigger value="habits">
                <ListTodo className="h-4 w-4 mr-1" />
                Habits
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      {view === 'forecast' && (
        <>
          <div className="flex items-center justify-end">
            <Tabs value={timeframe} onValueChange={(value) => handleTimeframeChange(value as PredictionTimeframe)}>
              <TabsList className="grid grid-cols-3 w-[240px]">
                <TabsTrigger value="7day">7 Days</TabsTrigger>
                <TabsTrigger value="30day">30 Days</TabsTrigger>
                <TabsTrigger value="90day">90 Days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          {/* Forecast overview panel */}
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-center">
                <motion.div 
                  className="mr-2"
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: 0 }}
                >
                  <Droplets className="h-5 w-5 text-blue-500" />
                </motion.div>
                Your Health Outlook
              </CardTitle>
              <CardDescription>
                AI-powered predictions based on your recent health patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {healthPrediction.predictions.map((prediction) => (
                  <motion.div 
                    key={prediction.metric}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => handleSelectMetric(prediction.metric)}
                    className={`p-4 border rounded-lg cursor-pointer ${getTrendColor(prediction.trend, prediction.riskLevel)} ${selectedMetric === prediction.metric ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{getMetricName(prediction.metric)}</h3>
                        <div className="flex items-center mt-1">
                          {getTrendIcon(prediction.trend)}
                          <span className="ml-1 text-sm">{prediction.trend.charAt(0).toUpperCase() + prediction.trend.slice(1)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        {renderForecastIcon(prediction.trend)}
                        <Badge className="mt-1" variant={prediction.riskLevel === 'high' ? 'destructive' : prediction.riskLevel === 'medium' ? 'default' : 'outline'}>
                          {prediction.riskLevel} risk
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-3 text-sm">
                      <div className="flex justify-between">
                        <span>Current</span>
                        <span className="font-semibold">{prediction.currentValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Predicted</span>
                        <span className="font-semibold">{prediction.predictedValue}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-right">
                      {Math.round(prediction.confidenceLevel * 100)}% confidence
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* Last updated info */}
              <div className="mt-4 text-xs text-gray-500 text-right">
                Last updated: {healthPrediction.lastUpdated.toLocaleString()}
              </div>
            </CardContent>
          </Card>
          
          {/* Selected metric detail view */}
          {selectedPrediction && (
            <Card>
              <CardHeader>
                <CardTitle>{getMetricName(selectedPrediction.metric)} Details</CardTitle>
                <CardDescription>
                  Forecast detail and contributing factors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Forecast Chart</h3>
                  <div className="h-64">
                    <InteractiveChart
                      title={getMetricName(selectedPrediction.metric)}
                      data={selectedPrediction.dataPoints}
                      dataKey="value"
                      height={240}
                      showBrush={false}
                      color="#3b82f6"
                      referenceLines={[
                        { value: selectedPrediction.currentValue, label: 'Current', color: '#9333ea' }
                      ]}
                    />
                  </div>
                  <div className="mt-2 bg-gray-50 p-3 rounded-md text-xs">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>Past data (tracked)</span>
                      <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-dotted border-blue-300 ml-4"></div>
                      <span>Future prediction</span>
                    </div>
                    <p>Predictions become less certain the further into the future they extend.</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-sm font-medium mb-2">Contributing Factors</h3>
                  <div className="space-y-2">
                    {selectedPrediction.contributingFactors.map((factor, index) => (
                      <div key={index} className="flex items-center">
                        <div className={`w-2 h-8 rounded-full mr-3 ${factor.impact > 0 ? 'bg-green-500' : 'bg-red-500'}`} 
                          style={{ height: `${Math.abs(factor.impact) * 30 + 10}px` }}
                        />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm">{factor.name}</span>
                            <span className={`text-sm font-medium ${factor.impact > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {factor.impact > 0 ? 'Positive' : 'Negative'} impact
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                            <div 
                              className={`h-2.5 rounded-full ${factor.impact > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.abs(factor.impact) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Intervention suggestions */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-md">
                <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
                Suggested Interventions
              </CardTitle>
              <CardDescription>
                Based on your health forecast, these actions may help improve your outcomes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {healthPrediction.interventions.map((intervention) => (
                  <div key={intervention.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{intervention.title}</h3>
                      <Badge variant={intervention.impact === 'high' ? 'default' : 'outline'}>
                        {intervention.impact} impact
                      </Badge>
                    </div>
                    
                    <p className="mt-2 text-sm text-gray-600">{intervention.description}</p>
                    
                    <div className="mt-3 flex flex-wrap gap-2">
                      {intervention.metrics.map((metric) => (
                        <Badge key={metric} variant="outline" className="bg-gray-100">
                          {getMetricName(metric)}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="mt-4 flex justify-between text-xs text-gray-500">
                      <span>Expected results: {intervention.timeToImpact}</span>
                      <span>Effort level: {intervention.effort}</span>
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      <Button size="sm" className="flex items-center">
                        Add to Goals <ArrowRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between bg-gray-50 text-xs">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-amber-500 mr-1" />
                <span>Predictions are based on your historical data and may not reflect future outcomes.</span>
              </div>
              <Button variant="ghost" size="sm">Refresh Predictions</Button>
            </CardFooter>
          </Card>
        </>
      )}
      
      {view === 'accuracy' && (
        <ForecastAccuracyTracker userId={userId} />
      )}
      
      {view === 'habits' && (
        <HabitFormationTracker userId={userId} onAddHabit={handleAddHabit} />
      )}
    </div>
  );
};

export default HealthForecast; 