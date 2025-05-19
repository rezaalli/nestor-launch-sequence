import React, { useState, useMemo } from 'react';
import { ArrowUpDown, SplitSquareHorizontal, CalendarDays, BarChart3, InfoIcon, ChevronDown } from 'lucide-react';
import { format, parseISO, subDays, eachDayOfInterval } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SimpleSkeletonLoader } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Line,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { cn } from '@/lib/utils';
import { CircularProgress } from '@/components/ui/circular-progress';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type MetricType = 'heartRate' | 'sleepQuality' | 'stress' | 'steps' | 'water' | 'caffeine' | 'readiness' | 'hrvScore' | 'recovery';
export type TimeRangeType = 'day' | 'week' | 'month' | 'year' | 'custom';

export interface ComparisonData {
  metrics: {
    [key in MetricType]?: {
      current: {
        value: number;
        label: string;
        details?: { [key: string]: number | string };
      };
      previous: {
        value: number;
        label: string;
        details?: { [key: string]: number | string };
      };
      delta: number;
      deltaPercentage: number;
      trend: 'up' | 'down' | 'flat';
      status: 'positive' | 'negative' | 'neutral';
      significance?: number; // p-value for statistical significance
    };
  };
  timeRanges: {
    current: { start: string; end: string }; // ISO date strings
    previous: { start: string; end: string }; // ISO date strings
  };
  dailyData?: {
    current: Array<{ date: string; value: number }>; // ISO date strings
    previous: Array<{ date: string; value: number }>; // ISO date strings
  };
}

export interface ComparativeAnalysisProps {
  data: ComparisonData;
  className?: string;
  loading?: boolean;
  primaryMetric: MetricType;
  onMetricChange?: (metric: MetricType) => void;
  onTimeRangeChange?: (range: TimeRangeType) => void;
  timeRange: TimeRangeType;
}

const metricLabels: Record<MetricType, string> = {
  heartRate: 'Heart Rate (bpm)',
  sleepQuality: 'Sleep Quality (%)',
  stress: 'Stress Level (1-10)',
  steps: 'Steps Count',
  water: 'Water Intake (oz)',
  caffeine: 'Caffeine (mg)',
  readiness: 'Readiness Score',
  hrvScore: 'HRV Score (ms)',
  recovery: 'Recovery (%)'
};

const timeRangeLabels: Record<TimeRangeType, string> = {
  day: 'Daily',
  week: 'Weekly',
  month: 'Monthly',
  year: 'Yearly',
  custom: 'Custom'
};

const metricColors: Record<MetricType, { primary: string; secondary: string }> = {
  heartRate: { primary: '#ef4444', secondary: '#fee2e2' }, // red
  sleepQuality: { primary: '#8b5cf6', secondary: '#ede9fe' }, // purple
  stress: { primary: '#f97316', secondary: '#ffedd5' }, // orange
  steps: { primary: '#22c55e', secondary: '#dcfce7' }, // green
  water: { primary: '#3b82f6', secondary: '#dbeafe' }, // blue
  caffeine: { primary: '#a16207', secondary: '#fef3c7' }, // amber
  readiness: { primary: '#0f172a', secondary: '#f8fafc' }, // slate
  hrvScore: { primary: '#7c3aed', secondary: '#f3e8ff' }, // violet
  recovery: { primary: '#0ea5e9', secondary: '#e0f2fe' } // sky
};

// Format percentage changes with + or - sign
const formatDeltaPercentage = (value: number): string => {
  const prefix = value > 0 ? '+' : value < 0 ? '-' : '';
  return `${prefix}${Math.abs(value).toFixed(1)}%`;
};

const ComparativeAnalysis: React.FC<ComparativeAnalysisProps> = ({
  data,
  className,
  loading = false,
  primaryMetric,
  onMetricChange,
  onTimeRangeChange,
  timeRange
}) => {
  const [activeTab, setActiveTab] = useState<'split' | 'bar' | 'timeline'>('split');
  const [showDetails, setShowDetails] = useState(false);
  const [availableMetrics] = useState<MetricType[]>([
    'heartRate', 'sleepQuality', 'steps', 'readiness', 'recovery', 'hrvScore'
  ]);
  
  const metricData = data.metrics[primaryMetric];
  
  // Prepare timeline data for the chart
  const timelineData = useMemo(() => {
    if (!data.dailyData) return [];
    
    // Create combined dataset with labels for "current" and "previous" periods
    const combinedData: Array<{
      date: string;
      current?: number;
      previous?: number;
      formattedDate: string;
    }> = [];
    
    // Process current period data
    data.dailyData.current.forEach(day => {
      const formattedDate = format(parseISO(day.date), 'MMM d');
      combinedData.push({
        date: day.date,
        current: day.value,
        formattedDate
      });
    });
    
    // Process previous period data and merge with current
    data.dailyData.previous.forEach(day => {
      const formattedDate = format(parseISO(day.date), 'MMM d');
      const existingDay = combinedData.find(d => d.formattedDate === formattedDate);
      
      if (existingDay) {
        existingDay.previous = day.value;
      } else {
        combinedData.push({
          date: day.date,
          previous: day.value,
          formattedDate
        });
      }
    });
    
    // Sort by date
    return combinedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data.dailyData]);
  
  // Prepare data for comparison bar chart
  const barChartData = useMemo(() => {
    if (!metricData) return [];
    
    return [
      {
        name: metricData.current.label,
        value: metricData.current.value,
        fill: metricColors[primaryMetric].primary
      },
      {
        name: metricData.previous.label,
        value: metricData.previous.value,
        fill: '#94a3b8' // Slate-400 for previous period
      }
    ];
  }, [metricData, primaryMetric]);
  
  // Determine if the change is significant
  const isSignificant = useMemo(() => {
    return metricData?.significance !== undefined && metricData.significance < 0.05;
  }, [metricData]);
  
  // Custom tooltip for the charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-neutral-200 rounded-md shadow-sm text-xs">
          <p className="font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
          {payload.length === 2 && (
            <p className="text-neutral-600 text-[10px] mt-1">
              Difference: {payload[0].value - payload[1].value}
            </p>
          )}
        </div>
      );
    }
    return null;
  };
  
  if (loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <SimpleSkeletonLoader className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <SimpleSkeletonLoader className="h-8 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <SimpleSkeletonLoader className="h-48 w-full" />
              <SimpleSkeletonLoader className="h-48 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // If no data for the selected metric
  if (!metricData) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <ArrowUpDown className="mr-2 h-5 w-5 text-brand-blue-500" />
            Comparative Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-48 text-neutral-500">
            <p className="mb-2">No comparison data available for {metricLabels[primaryMetric]}</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onMetricChange && onMetricChange(availableMetrics[0])}
            >
              Switch Metric
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <ArrowUpDown className="mr-2 h-5 w-5 text-brand-blue-500" />
            Comparative Analysis
          </CardTitle>
          <Badge 
            variant={
              metricData.status === 'positive' ? "success" : 
              metricData.status === 'negative' ? "destructive" : 
              "outline"
            }
            className="text-xs"
          >
            {formatDeltaPercentage(metricData.deltaPercentage)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Controls */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <span className="text-neutral-500 mr-2 text-xs">Metric:</span>
            <select 
              className="bg-neutral-100 border-none rounded-md px-2 py-1 text-xs"
              value={primaryMetric}
              onChange={(e) => onMetricChange && onMetricChange(e.target.value as MetricType)}
            >
              {availableMetrics.map(m => (
                <option key={m} value={m}>{metricLabels[m]}</option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center">
            <span className="text-neutral-500 mr-2 text-xs">Period:</span>
            <select 
              className="bg-neutral-100 border-none rounded-md px-2 py-1 text-xs"
              value={timeRange}
              onChange={(e) => onTimeRangeChange && onTimeRangeChange(e.target.value as TimeRangeType)}
            >
              {Object.entries(timeRangeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* View Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'split' | 'bar' | 'timeline')}>
          <TabsList className="mb-4">
            <TabsTrigger value="split" className="flex items-center">
              <SplitSquareHorizontal className="h-3 w-3 mr-1" />
              <span>Split View</span>
            </TabsTrigger>
            <TabsTrigger value="bar" className="flex items-center">
              <BarChart3 className="h-3 w-3 mr-1" />
              <span>Bar Chart</span>
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center">
              <CalendarDays className="h-3 w-3 mr-1" />
              <span>Timeline</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Split View Tab Content */}
          <TabsContent value="split">
            <div className="grid grid-cols-2 gap-4">
              {/* Current Period */}
              <div className="flex flex-col items-center p-4 bg-white rounded-md border border-neutral-200">
                <div className="mb-2 text-sm font-medium">{metricData.current.label}</div>
                <CircularProgress 
                  value={metricData.current.value}
                  max={
                    primaryMetric === 'sleepQuality' || primaryMetric === 'recovery' || primaryMetric === 'readiness' 
                      ? 100
                      : Math.max(metricData.current.value, metricData.previous.value) * 1.2
                  }
                  size="md"
                  thickness={8}
                  status={metricData.status === 'positive' ? 'success' : metricData.status === 'negative' ? 'error' : 'neutral'}
                  animated
                />
                
                {metricData.current.details && showDetails && (
                  <div className="mt-4 w-full text-xs">
                    {Object.entries(metricData.current.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between mt-1">
                        <span className="text-neutral-500">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Previous Period */}
              <div className="flex flex-col items-center p-4 bg-neutral-50 rounded-md border border-neutral-200">
                <div className="mb-2 text-sm font-medium text-neutral-600">{metricData.previous.label}</div>
                <CircularProgress 
                  value={metricData.previous.value}
                  max={
                    primaryMetric === 'sleepQuality' || primaryMetric === 'recovery' || primaryMetric === 'readiness' 
                      ? 100
                      : Math.max(metricData.current.value, metricData.previous.value) * 1.2
                  }
                  size="md"
                  thickness={8}
                  status="neutral"
                  animated
                />
                
                {metricData.previous.details && showDetails && (
                  <div className="mt-4 w-full text-xs">
                    {Object.entries(metricData.previous.details).map(([key, value]) => (
                      <div key={key} className="flex justify-between mt-1">
                        <span className="text-neutral-500">{key}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Comparison Summary */}
            <div className="mt-4 p-3 bg-neutral-50 rounded-md border border-neutral-100">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm font-medium">
                    {metricData.deltaPercentage > 0 ? 'Increased by ' : metricData.deltaPercentage < 0 ? 'Decreased by ' : 'No change '}
                    <span className={cn(
                      "font-semibold",
                      metricData.status === 'positive' ? 'text-status-success-600' : 
                      metricData.status === 'negative' ? 'text-status-error-600' : 
                      'text-neutral-600'
                    )}>
                      {formatDeltaPercentage(metricData.deltaPercentage)}
                    </span>
                  </span>
                  {isSignificant && (
                    <Badge variant="outline" className="ml-2 text-[10px]">Significant</Badge>
                  )}
                </div>
                
                <TooltipProvider>
                  <UITooltip>
                    <TooltipTrigger>
                      <InfoIcon className="h-4 w-4 text-neutral-400" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">
                        {metricData.status === 'positive' 
                          ? 'This change is positive for your health'
                          : metricData.status === 'negative'
                            ? 'This change is negative for your health'
                            : 'This change has no significant impact on your health'
                        }
                      </p>
                      {isSignificant && (
                        <p className="text-xs mt-1">
                          This change is statistically significant (p &lt; 0.05)
                        </p>
                      )}
                    </TooltipContent>
                  </UITooltip>
                </TooltipProvider>
              </div>
              
              {metricData.current.details && (
                <div className="mt-2 flex justify-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-6 px-2"
                    onClick={() => setShowDetails(!showDetails)}
                  >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                    <ChevronDown className={cn(
                      "h-3 w-3 ml-1 transition-transform",
                      showDetails && "transform rotate-180"
                    )} />
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          {/* Bar Chart Tab Content */}
          <TabsContent value="bar">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barChartData}
                  margin={{ top: 10, right: 10, bottom: 30, left: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis 
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    domain={[0, 'auto']}
                    tick={{ fontSize: 12 }}
                    axisLine={{ stroke: '#e5e7eb' }}
                    tickLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar 
                    dataKey="value" 
                    fill={metricColors[primaryMetric].primary}
                    radius={[4, 4, 0, 0]}
                    name={metricLabels[primaryMetric]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {metricData.delta !== 0 && (
              <div className="mt-4 p-3 bg-neutral-50 rounded-md border border-neutral-100 text-center">
                <span className="text-sm">
                  Absolute difference: {' '}
                  <span className={cn(
                    "font-semibold",
                    metricData.status === 'positive' ? 'text-status-success-600' : 
                    metricData.status === 'negative' ? 'text-status-error-600' : 
                    'text-neutral-600'
                  )}>
                    {metricData.delta > 0 ? '+' : ''}{metricData.delta}
                  </span>
                </span>
              </div>
            )}
          </TabsContent>
          
          {/* Timeline Tab Content */}
          <TabsContent value="timeline">
            {data.dailyData ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={timelineData}
                    margin={{ top: 10, right: 10, bottom: 30, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="formattedDate"
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{ fontSize: 12 }}
                      axisLine={{ stroke: '#e5e7eb' }}
                      tickLine={{ stroke: '#e5e7eb' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="current" 
                      fill={metricColors[primaryMetric].primary}
                      fillOpacity={0.8}
                      radius={[4, 4, 0, 0]}
                      name={`Current ${timeRange}`}
                    />
                    <Line
                      type="monotone"
                      dataKey="previous"
                      stroke="#94a3b8"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name={`Previous ${timeRange}`}
                    />
                    {metricData && (
                      <ReferenceLine
                        y={metricData.current.value}
                        stroke={metricColors[primaryMetric].primary}
                        strokeDasharray="3 3"
                        label={{
                          value: `Avg: ${metricData.current.value}`,
                          fill: metricColors[primaryMetric].primary,
                          fontSize: 12
                        }}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-neutral-500">
                <p>No daily data available for this comparison</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Time Range Display */}
        <div className="mt-4 flex justify-between items-center text-xs text-neutral-500">
          <div>
            Current: {format(parseISO(data.timeRanges.current.start), 'MMM d')} - {format(parseISO(data.timeRanges.current.end), 'MMM d, yyyy')}
          </div>
          <div>
            Previous: {format(parseISO(data.timeRanges.previous.start), 'MMM d')} - {format(parseISO(data.timeRanges.previous.end), 'MMM d, yyyy')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ComparativeAnalysis; 