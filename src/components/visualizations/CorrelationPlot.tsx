import React, { useState, useEffect, useMemo } from 'react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ZAxis,
  ReferenceLine
} from 'recharts';
import { InfoIcon, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SimpleSkeletonLoader } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type MetricType = 'heartRate' | 'sleepQuality' | 'stress' | 'steps' | 'water' | 'caffeine' | 'nutrition' | 'temperature' | 'spo2' | 'readiness' | 'hrvScore';

export interface DataPoint {
  id: string;
  date: string; // ISO date string
  xValue: number;
  yValue: number;
  anomaly?: boolean;
  weight?: number; // For size of scatter dots, 10-100
}

export interface CorrelationPlotProps {
  xMetric: MetricType;
  yMetric: MetricType;
  data: DataPoint[];
  className?: string;
  loading?: boolean;
  onMetricChange?: (xMetric: MetricType, yMetric: MetricType) => void;
  correlationStrength?: number; // -1 to 1
  correlationSignificance?: number; // p-value
  width?: number;
  height?: number;
}

const metricLabels: Record<MetricType, string> = {
  heartRate: 'Heart Rate (bpm)',
  sleepQuality: 'Sleep Quality (%)',
  stress: 'Stress Level (1-10)',
  steps: 'Steps Count',
  water: 'Water Intake (oz)',
  caffeine: 'Caffeine (mg)',
  nutrition: 'Nutrition Score',
  temperature: 'Temperature (°F)',
  spo2: 'Blood Oxygen (%)',
  readiness: 'Readiness Score',
  hrvScore: 'HRV Score (ms)'
};

const metricColors: Record<MetricType, string> = {
  heartRate: '#ef4444', // red
  sleepQuality: '#8b5cf6', // purple
  stress: '#f97316', // orange
  steps: '#22c55e', // green
  water: '#3b82f6', // blue
  caffeine: '#a16207', // amber dark
  nutrition: '#15803d', // green dark
  temperature: '#f59e0b', // amber
  spo2: '#2563eb', // blue dark
  readiness: '#0f172a', // slate dark
  hrvScore: '#7c3aed' // violet
};

// Helper to convert correlation strength to descriptive text
const getCorrelationDescription = (strength: number): string => {
  const absStrength = Math.abs(strength);
  
  if (absStrength < 0.1) return 'No correlation';
  if (absStrength < 0.3) return 'Weak correlation';
  if (absStrength < 0.5) return 'Moderate correlation';
  if (absStrength < 0.7) return 'Strong correlation';
  return 'Very strong correlation';
};

const CorrelationPlot: React.FC<CorrelationPlotProps> = ({
  xMetric,
  yMetric,
  data,
  className,
  loading = false,
  onMetricChange,
  correlationStrength = 0,
  correlationSignificance = 1,
  width = 350,
  height = 300
}) => {
  const [availableMetrics, setAvailableMetrics] = useState<MetricType[]>([
    'heartRate', 'sleepQuality', 'stress', 'steps', 'water', 'caffeine', 'nutrition', 'temperature', 'spo2', 'readiness'
  ]);
  
  // Correlation description
  const correlationDescription = useMemo(() => {
    return getCorrelationDescription(correlationStrength);
  }, [correlationStrength]);
  
  // Determine if correlation is significant (p < 0.05)
  const isSignificant = useMemo(() => {
    return correlationSignificance < 0.05;
  }, [correlationSignificance]);
  
  // Calculate trendline data if correlation is significant
  const trendLineData = useMemo(() => {
    if (!isSignificant || !data.length) return [];
    
    // Simple linear regression
    const n = data.length;
    const sumX = data.reduce((sum, point) => sum + point.xValue, 0);
    const sumY = data.reduce((sum, point) => sum + point.yValue, 0);
    const sumXY = data.reduce((sum, point) => sum + (point.xValue * point.yValue), 0);
    const sumXX = data.reduce((sum, point) => sum + (point.xValue * point.xValue), 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Find min and max x values
    const minX = Math.min(...data.map(d => d.xValue));
    const maxX = Math.max(...data.map(d => d.xValue));
    
    // Create line data
    return [
      { x: minX, y: minX * slope + intercept },
      { x: maxX, y: maxX * slope + intercept }
    ];
  }, [data, isSignificant]);
  
  // Custom tooltip content
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-neutral-200 rounded-md shadow-sm text-xs">
          <p className="font-medium">{point.date}</p>
          <p className="text-neutral-600">{metricLabels[xMetric]}: {point.xValue}</p>
          <p className="text-neutral-600">{metricLabels[yMetric]}: {point.yValue}</p>
          {point.anomaly && (
            <p className="text-red-500 font-medium mt-1">Anomaly detected</p>
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
          <div style={{ width, height }} className="flex items-center justify-center">
            <SimpleSkeletonLoader className="h-full w-full" />
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
            <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
            Correlation Analysis
          </CardTitle>
          <Badge 
            variant={isSignificant ? (correlationStrength > 0 ? "success" : "destructive") : "outline"}
            className="text-xs"
          >
            {correlationDescription}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4 text-sm">
          <div className="flex items-center">
            <span className="text-neutral-500 mr-2">X:</span>
            <select 
              className="bg-neutral-100 border-none rounded-md px-2 py-1 text-xs"
              value={xMetric}
              onChange={(e) => onMetricChange && onMetricChange(e.target.value as MetricType, yMetric)}
            >
              {availableMetrics.map(metric => (
                <option key={metric} value={metric}>{metricLabels[metric]}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <span className="text-neutral-500 mr-2">Y:</span>
            <select 
              className="bg-neutral-100 border-none rounded-md px-2 py-1 text-xs"
              value={yMetric}
              onChange={(e) => onMetricChange && onMetricChange(xMetric, e.target.value as MetricType)}
            >
              {availableMetrics.map(metric => (
                <option key={metric} value={metric}>{metricLabels[metric]}</option>
              ))}
            </select>
          </div>
        </div>
       
        <div style={{ width, height }} className="mx-auto">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 10, right: 10, bottom: 40, left: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                type="number" 
                dataKey="xValue" 
                name={metricLabels[xMetric]} 
                label={{ 
                  value: metricLabels[xMetric], 
                  position: 'bottom',
                  style: { fontSize: 11, fill: '#6b7280' }
                }}
                tick={{ fontSize: 11 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                type="number" 
                dataKey="yValue" 
                name={metricLabels[yMetric]} 
                label={{ 
                  value: metricLabels[yMetric], 
                  angle: -90, 
                  position: 'left',
                  style: { fontSize: 11, fill: '#6b7280' }
                }}
                tick={{ fontSize: 11 }}
                axisLine={{ stroke: '#e5e7eb' }}
                tickLine={{ stroke: '#e5e7eb' }}
              />
              <ZAxis range={[40, 400]} />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Scatter plot with anomalies highlighted */}
              <Scatter
                name="Data Points"
                data={data}
                fill={metricColors[xMetric]}
                shape={(props: any) => {
                  const { cx, cy, payload } = props;
                  return payload.anomaly ? (
                    <path
                      d={`M${cx-6},${cy-6} L${cx+6},${cy+6} M${cx+6},${cy-6} L${cx-6},${cy+6}`}
                      stroke="#ef4444"
                      strokeWidth={2}
                      fill="none"
                    />
                  ) : (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={payload.weight ? Math.sqrt(payload.weight) / 2 : 4}
                      fill={metricColors[xMetric]}
                      opacity={0.7}
                    />
                  );
                }}
              />
              
              {/* Trend line if significant correlation */}
              {isSignificant && trendLineData.length > 0 && (
                <Scatter
                  name="Trend"
                  data={trendLineData}
                  line={{ stroke: correlationStrength > 0 ? '#22c55e' : '#ef4444', strokeWidth: 2 }}
                  shape={() => null}
                  legendType="none"
                />
              )}
              
              {/* Legend for anomalies */}
              <Legend 
                content={() => (
                  <div className="flex justify-end items-center mt-2 text-xs">
                    {data.some(d => d.anomaly) && (
                      <div className="flex items-center mr-4">
                        <svg width="12" height="12" className="mr-1">
                          <path
                            d="M1,1 L11,11 M11,1 L1,11"
                            stroke="#ef4444"
                            strokeWidth={2}
                          />
                        </svg>
                        <span className="text-xs text-red-600">Anomaly</span>
                      </div>
                    )}
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: metricColors[xMetric], opacity: 0.7 }} />
                      <span className="text-xs text-neutral-600">Data point</span>
                    </div>
                  </div>
                )}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex justify-between items-center mt-4 text-xs text-neutral-500">
          <div className="flex items-center">
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger>
                  <InfoIcon className="h-3 w-3 text-neutral-400 mr-1" />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">
                    {correlationStrength > 0 
                      ? "Positive correlation: as one metric increases, the other tends to increase" 
                      : "Negative correlation: as one metric increases, the other tends to decrease"}
                  </p>
                  <p className="text-xs mt-1">
                    {isSignificant 
                      ? "This correlation is statistically significant" 
                      : "This correlation is not statistically significant"}
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
            <span>r = {correlationStrength.toFixed(2)}</span>
          </div>
          <div>
            <span>p {correlationSignificance < 0.05 ? '<' : '>'} 0.05</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CorrelationPlot; 