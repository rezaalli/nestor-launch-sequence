import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertTriangle, HelpCircle, PieChart, BarChart3, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { MetricType, TrendDirection } from './HealthForecast';

// Define types for tracking forecast accuracy
interface ForecastResult {
  id: string;
  metric: MetricType;
  predictedDate: Date;
  verifiedDate?: Date;
  predictedValue: number;
  actualValue?: number;
  predictedTrend: TrendDirection;
  actualTrend?: TrendDirection;
  accuracyScore?: number; // 0-100
  note?: string;
}

interface MetricAccuracyStats {
  metric: MetricType;
  totalForecasts: number;
  accurateForecasts: number;
  accuracyPercentage: number;
  averageDeviation: number;
  trendAccuracy: number;
  lastUpdated: Date;
}

// Helper functions
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

const getTrendIcon = (trend: TrendDirection) => {
  if (trend === 'improving') return <motion.div initial={{ y: 2 }} animate={{ y: -2 }} transition={{ repeat: 1, duration: 0.5 }}><TrendingUp className="text-green-500 h-4 w-4" /></motion.div>;
  if (trend === 'declining') return <motion.div initial={{ y: -2 }} animate={{ y: 2 }} transition={{ repeat: 1, duration: 0.5 }}><TrendingUp className="text-red-500 h-4 w-4 rotate-180" /></motion.div>;
  return <motion.div initial={{ rotate: -5 }} animate={{ rotate: 5 }} transition={{ repeat: 3, duration: 0.3 }}><TrendingUp className="text-blue-500 h-4 w-4 rotate-90" /></motion.div>;
};

const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 80) return 'text-green-600';
  if (accuracy >= 60) return 'text-amber-600';
  return 'text-red-600';
};

const getAccuracyBadge = (accuracy: number): React.ReactNode => {
  if (accuracy >= 80) {
    return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">High Accuracy</Badge>;
  }
  if (accuracy >= 60) {
    return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Moderate Accuracy</Badge>;
  }
  return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Low Accuracy</Badge>;
};

// Generate mock data for demo purposes
const generateMockForecastResults = (): ForecastResult[] => {
  const metrics: MetricType[] = ['heartRate', 'recovery', 'stress', 'sleep', 'activity'];
  const results: ForecastResult[] = [];
  
  // Create a set of 20 forecasts with varying levels of accuracy
  for (let i = 0; i < 20; i++) {
    const metric = metrics[Math.floor(Math.random() * metrics.length)];
    const predictedDate = new Date();
    predictedDate.setDate(predictedDate.getDate() - (30 + Math.floor(Math.random() * 60))); // 30-90 days ago
    
    const verifiedDate = new Date(predictedDate);
    verifiedDate.setDate(verifiedDate.getDate() + (7 + Math.floor(Math.random() * 14))); // 7-21 days after prediction
    
    const trendOptions: TrendDirection[] = ['improving', 'declining', 'stable'];
    const predictedTrend = trendOptions[Math.floor(Math.random() * trendOptions.length)];
    
    // Sometimes the actual trend matches the prediction, sometimes it doesn't
    const matchProbability = 0.7; // 70% chance the actual trend matches the prediction
    const actualTrend = Math.random() < matchProbability 
      ? predictedTrend
      : trendOptions.filter(t => t !== predictedTrend)[Math.floor(Math.random() * 2)];
    
    // Base values for predictions
    let baseValue = 0;
    switch (metric) {
      case 'heartRate': baseValue = 65; break;
      case 'recovery': baseValue = 75; break;
      case 'stress': baseValue = 40; break;
      case 'sleep': baseValue = 80; break;
      case 'activity': baseValue = 65; break;
    }
    
    const predictedValue = baseValue + Math.floor(Math.random() * 20) - 10;
    const accuracyLevel = Math.random(); // 0-1 random value to determine accuracy
    
    // Calculate actual value based on desired accuracy
    let deviation = 0;
    if (accuracyLevel > 0.8) { // High accuracy
      deviation = Math.floor(Math.random() * 6) - 3; // -3 to +3
    } else if (accuracyLevel > 0.4) { // Medium accuracy
      deviation = Math.floor(Math.random() * 14) - 7; // -7 to +7
    } else { // Low accuracy
      deviation = Math.floor(Math.random() * 24) - 12; // -12 to +12
    }
    
    const actualValue = predictedValue + deviation;
    
    // Calculate accuracy score (100 - percentage difference)
    const maxRange = metric === 'heartRate' ? 30 : 100;
    const percentageDifference = Math.abs(actualValue - predictedValue) / maxRange * 100;
    const accuracyScore = Math.max(0, Math.min(100, 100 - percentageDifference));
    
    results.push({
      id: `forecast-${i}`,
      metric,
      predictedDate,
      verifiedDate,
      predictedValue,
      actualValue,
      predictedTrend,
      actualTrend,
      accuracyScore,
      note: i % 5 === 0 ? 'Unusual external factors may have affected accuracy' : undefined
    });
  }
  
  return results;
};

// Generate aggregated accuracy statistics
const generateAccuracyStats = (results: ForecastResult[]): MetricAccuracyStats[] => {
  const metrics: MetricType[] = ['heartRate', 'recovery', 'stress', 'sleep', 'activity'];
  
  return metrics.map(metric => {
    const metricResults = results.filter(r => r.metric === metric);
    
    if (metricResults.length === 0) {
      return {
        metric,
        totalForecasts: 0,
        accurateForecasts: 0,
        accuracyPercentage: 0,
        averageDeviation: 0,
        trendAccuracy: 0,
        lastUpdated: new Date()
      };
    }
    
    // Count accurate forecasts (>75% accuracy score)
    const accurateForecasts = metricResults.filter(r => (r.accuracyScore || 0) > 75).length;
    
    // Calculate average deviation
    const totalDeviation = metricResults.reduce(
      (sum, result) => sum + Math.abs((result.actualValue || 0) - result.predictedValue), 
      0
    );
    const averageDeviation = totalDeviation / metricResults.length;
    
    // Calculate trend accuracy
    const trendMatches = metricResults.filter(r => r.actualTrend === r.predictedTrend).length;
    const trendAccuracy = (trendMatches / metricResults.length) * 100;
    
    return {
      metric,
      totalForecasts: metricResults.length,
      accurateForecasts,
      accuracyPercentage: (accurateForecasts / metricResults.length) * 100,
      averageDeviation,
      trendAccuracy,
      lastUpdated: new Date()
    };
  });
};

interface ForecastAccuracyTrackerProps {
  className?: string;
  userId?: string;
}

const ForecastAccuracyTracker: React.FC<ForecastAccuracyTrackerProps> = ({ className, userId }) => {
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('stats');
  const [selectedMetric, setSelectedMetric] = useState<MetricType | 'all'>('all');
  
  // Generate mock data
  const forecastResults = generateMockForecastResults();
  const accuracyStats = generateAccuracyStats(forecastResults);
  
  // Filter results by selected metric
  const filteredResults = selectedMetric === 'all' 
    ? forecastResults 
    : forecastResults.filter(r => r.metric === selectedMetric);
  
  // Sort by date (most recent first)
  const sortedResults = [...filteredResults].sort(
    (a, b) => new Date(b.verifiedDate || b.predictedDate).getTime() - 
              new Date(a.verifiedDate || a.predictedDate).getTime()
  );
  
  // Calculate overall accuracy
  const overallAccuracy = accuracyStats.reduce(
    (sum, stat) => sum + stat.accuracyPercentage, 
    0
  ) / accuracyStats.length;
  
  // Calculate overall trend accuracy
  const overallTrendAccuracy = accuracyStats.reduce(
    (sum, stat) => sum + stat.trendAccuracy, 
    0
  ) / accuracyStats.length;
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Forecast Accuracy</h2>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'list' | 'stats')}>
          <TabsList className="grid grid-cols-2 w-[180px]">
            <TabsTrigger value="stats">
              <PieChart className="h-4 w-4 mr-1" />
              Stats
            </TabsTrigger>
            <TabsTrigger value="list">
              <BarChart3 className="h-4 w-4 mr-1" />
              History
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Prediction Reliability</CardTitle>
          <CardDescription>
            See how accurate our health forecasts have been over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TabsContent value="stats" className="mt-0 space-y-6">
            {/* Overall accuracy summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <div className="text-sm text-gray-500">Overall Accuracy</div>
                <div className="mt-1 flex items-baseline">
                  <span className={`text-2xl font-bold ${getAccuracyColor(overallAccuracy)}`}>
                    {Math.round(overallAccuracy)}%
                  </span>
                  <span className="ml-1 text-xs text-gray-500">
                    ({forecastResults.length} forecasts)
                  </span>
                </div>
                <div className="mt-3">
                  {getAccuracyBadge(overallAccuracy)}
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <div className="text-sm text-gray-500">Trend Prediction</div>
                <div className="mt-1 flex items-baseline">
                  <span className={`text-2xl font-bold ${getAccuracyColor(overallTrendAccuracy)}`}>
                    {Math.round(overallTrendAccuracy)}%
                  </span>
                  <span className="ml-1 text-xs text-gray-500">
                    correctness
                  </span>
                </div>
                <div className="mt-3">
                  {getAccuracyBadge(overallTrendAccuracy)}
                </div>
              </div>
            </div>
            
            {/* Per-metric accuracy breakdown */}
            <div>
              <h3 className="text-sm font-medium mb-3">Accuracy by Metric</h3>
              <div className="space-y-3">
                {accuracyStats.map((stat) => (
                  <div key={stat.metric} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{getMetricName(stat.metric)}</div>
                      <div className={`font-semibold ${getAccuracyColor(stat.accuracyPercentage)}`}>
                        {Math.round(stat.accuracyPercentage)}%
                      </div>
                    </div>
                    <div className="mt-2 bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-2 rounded-full ${
                          stat.accuracyPercentage >= 80 ? 'bg-green-500' : 
                          stat.accuracyPercentage >= 60 ? 'bg-amber-500' : 
                          'bg-red-500'
                        }`}
                        style={{ width: `${stat.accuracyPercentage}%` }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-xs text-gray-500">
                      <span>Value Δ: {stat.averageDeviation.toFixed(1)} points</span>
                      <span>Trends: {Math.round(stat.trendAccuracy)}% correct</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="text-xs text-gray-500 mt-4">
              These statistics help you understand how reliable our predictions have been for different health metrics.
              Higher accuracy percentages indicate more trustworthy forecasts.
            </div>
          </TabsContent>
          
          <TabsContent value="list" className="mt-0">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-medium">Forecast History</h3>
                <select 
                  className="text-sm border rounded px-2 py-1"
                  value={selectedMetric}
                  onChange={(e) => setSelectedMetric(e.target.value as MetricType | 'all')}
                >
                  <option value="all">All Metrics</option>
                  <option value="heartRate">Heart Rate</option>
                  <option value="recovery">Recovery</option>
                  <option value="stress">Stress</option>
                  <option value="sleep">Sleep</option>
                  <option value="activity">Activity</option>
                </select>
              </div>
              
              <div className="space-y-2">
                {sortedResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-3">
                    <div className="flex justify-between">
                      <div>
                        <span className="font-medium">{getMetricName(result.metric)}</span>
                        <div className="text-xs text-gray-500 mt-1">
                          Predicted on {result.predictedDate.toLocaleDateString()}
                          {result.verifiedDate && ` • Verified on ${result.verifiedDate.toLocaleDateString()}`}
                        </div>
                      </div>
                      {result.accuracyScore && (
                        <div className={`text-sm font-semibold ${getAccuracyColor(result.accuracyScore)}`}>
                          {Math.round(result.accuracyScore)}% accuracy
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div className="bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-500 mb-1">Predicted:</div>
                        <div className="flex justify-between items-center">
                          <div className="font-medium">{result.predictedValue}</div>
                          <div className="flex items-center text-xs">
                            {getTrendIcon(result.predictedTrend)}
                            <span className="ml-1 capitalize">{result.predictedTrend}</span>
                          </div>
                        </div>
                      </div>
                      
                      {result.actualValue && result.actualTrend && (
                        <div className="bg-gray-50 p-2 rounded">
                          <div className="text-xs text-gray-500 mb-1">Actual:</div>
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{result.actualValue}</div>
                            <div className="flex items-center text-xs">
                              {getTrendIcon(result.actualTrend)}
                              <span className="ml-1 capitalize">{result.actualTrend}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {result.note && (
                      <div className="mt-2 text-xs text-amber-600 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        {result.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForecastAccuracyTracker; 