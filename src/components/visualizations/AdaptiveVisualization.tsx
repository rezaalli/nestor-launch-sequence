import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Maximize2, Minimize2, BarChart3, LineChart, PieChart, Zap, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';

// Import visualization libraries
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, BarChart as RechartsBarChart, 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart as RechartsPieChart, 
  Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';

export type VisualizationSize = 'mini' | 'small' | 'medium' | 'large' | 'fullscreen';
export type VisualizationType = 'line' | 'bar' | 'pie' | 'radar' | 'heatmap' | 'scatter';
export type SignificanceLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface DataPoint {
  name: string;
  value: number;
  date?: Date | string;
  category?: string;
  significance?: SignificanceLevel;
  [key: string]: any;
}

export interface Correlation {
  source: string;
  target: string;
  strength: number;
  significance: SignificanceLevel;
  description?: string;
}

export interface Threshold {
  value: number;
  label: string;
  significance: SignificanceLevel;
}

export interface AdaptiveVisualizationProps {
  title: string;
  description?: string;
  visualizationType: VisualizationType;
  data: DataPoint[] | Record<string, any>[];
  correlations?: Correlation[];
  metrics?: string[];
  thresholds?: Threshold[];
  timeRange?: 'day' | 'week' | 'month' | 'year' | 'custom';
  significance?: SignificanceLevel;
  size?: VisualizationSize;
  onSizeChange?: (size: VisualizationSize) => void;
  showControls?: boolean;
  userPreferences?: {
    colorScheme: 'default' | 'colorblind' | 'monochrome';
    animationsEnabled: boolean;
    detailLevel: 'minimal' | 'moderate' | 'detailed';
  };
}

const COLORS = {
  default: ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', '#00C49F', '#FFBB28', '#FF8042'],
  colorblind: ['#018571', '#80cdc1', '#dfc27d', '#a6611a', '#018571', '#80cdc1', '#dfc27d', '#a6611a'],
  monochrome: ['#000000', '#333333', '#666666', '#999999', '#cccccc', '#A3A3A3', '#787878', '#4D4D4D']
};

const significanceColors: Record<SignificanceLevel, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
  info: '#3b82f6'
};

/**
 * AdaptiveVisualization - A visualization component that adapts based on data significance,
 * available space, and user preferences
 */
const AdaptiveVisualization: React.FC<AdaptiveVisualizationProps> = ({
  title,
  description,
  visualizationType,
  data,
  correlations,
  metrics,
  thresholds = [],
  timeRange = 'week',
  significance = 'medium',
  size = 'medium',
  onSizeChange,
  showControls = true,
  userPreferences = {
    colorScheme: 'default',
    animationsEnabled: true,
    detailLevel: 'moderate'
  }
}) => {
  const [currentSize, setCurrentSize] = useState<VisualizationSize>(size);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDetails, setShowDetails] = useState(
    userPreferences.detailLevel === 'detailed' || 
    userPreferences.detailLevel === 'moderate'
  );
  
  // Determine if this visualization is of high importance based on significance
  const isHighImportance = significance === 'critical' || significance === 'high';
  const colors = COLORS[userPreferences.colorScheme] || COLORS.default;
  
  // Handle size change
  useEffect(() => {
    setCurrentSize(size);
  }, [size]);
  
  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    const newSize = isFullscreen ? 'medium' : 'fullscreen';
    setIsFullscreen(!isFullscreen);
    setCurrentSize(newSize);
    if (onSizeChange) onSizeChange(newSize);
  };
  
  // Calculate the height based on the size
  const getHeight = () => {
    switch (currentSize) {
      case 'mini': return 80;
      case 'small': return 150;
      case 'medium': return 250;
      case 'large': return 400;
      case 'fullscreen': return window.innerHeight * 0.8;
      default: return 250;
    }
  };
  
  // Choose the visualization component based on the type and size
  const renderVisualization = () => {
    // Get height based on size
    const height = getHeight();
    
    // For mini visualizations, we show simplified versions
    if (currentSize === 'mini') {
      return renderMiniVisualization();
    }
    
    switch (visualizationType) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsLineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              {userPreferences.detailLevel === 'detailed' && <Legend />}
              {thresholds.map((threshold, index) => (
                <RechartsTooltip
                  key={`threshold-${index}`}
                  content={<CustomThresholdTooltip threshold={threshold} />}
                />
              ))}
              {metrics ? (
                metrics.map((metric, index) => (
                  <Line 
                    key={metric}
                    type="monotone" 
                    dataKey={metric} 
                    stroke={colors[index % colors.length]} 
                    strokeWidth={isHighImportance ? 2.5 : 1.5}
                    dot={currentSize !== 'small'}
                    activeDot={{ r: 8 }}
                    isAnimationActive={userPreferences.animationsEnabled}
                  />
                ))
              ) : (
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={colors[0]} 
                  strokeWidth={isHighImportance ? 2.5 : 1.5}
                  activeDot={{ r: 8 }}
                  isAnimationActive={userPreferences.animationsEnabled}
                />
              )}
              {thresholds.map((threshold, index) => (
                <RechartsTooltip
                  key={`threshold-line-${index}`}
                  content={<CustomThresholdTooltip threshold={threshold} />}
                />
              ))}
            </RechartsLineChart>
          </ResponsiveContainer>
        );
      
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsBarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip />
              {userPreferences.detailLevel === 'detailed' && <Legend />}
              {metrics ? (
                metrics.map((metric, index) => (
                  <Bar 
                    key={metric}
                    dataKey={metric} 
                    fill={colors[index % colors.length]} 
                    isAnimationActive={userPreferences.animationsEnabled}
                  />
                ))
              ) : (
                <Bar 
                  dataKey="value" 
                  fill={significanceColors[significance]} 
                  isAnimationActive={userPreferences.animationsEnabled}
                >
                  {data.map((entry, index) => {
                    const entrySignificance = entry.significance || significance;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={significanceColors[entrySignificance]} 
                      />
                    );
                  })}
                </Bar>
              )}
            </RechartsBarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={currentSize !== 'small'}
                label={currentSize !== 'small' ? renderCustomizedLabel : undefined}
                outerRadius={currentSize === 'small' ? 60 : 100}
                fill="#8884d8"
                dataKey="value"
                isAnimationActive={userPreferences.animationsEnabled}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              {userPreferences.detailLevel === 'detailed' && <Legend />}
              <RechartsTooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        );
      
      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart cx="50%" cy="50%" outerRadius={100} data={data}>
              <PolarGrid />
              <PolarAngleAxis dataKey="name" />
              <PolarRadiusAxis />
              {metrics ? (
                metrics.map((metric, index) => (
                  <Radar
                    key={metric}
                    name={metric}
                    dataKey={metric}
                    stroke={colors[index % colors.length]}
                    fill={colors[index % colors.length]}
                    fillOpacity={0.3}
                    isAnimationActive={userPreferences.animationsEnabled}
                  />
                ))
              ) : (
                <Radar
                  name="Value"
                  dataKey="value"
                  stroke={significanceColors[significance]}
                  fill={significanceColors[significance]}
                  fillOpacity={0.3}
                  isAnimationActive={userPreferences.animationsEnabled}
                />
              )}
              {userPreferences.detailLevel === 'detailed' && <Legend />}
              <RechartsTooltip />
            </RadarChart>
          </ResponsiveContainer>
        );
      
      case 'heatmap':
      case 'scatter':
        // For now, just render a placeholder
        return (
          <div 
            className="flex items-center justify-center h-full" 
            style={{ height: height, backgroundColor: '#f9fafb' }}
          >
            <p className="text-gray-400">
              {visualizationType === 'heatmap' ? 'Heatmap' : 'Scatter'} visualization
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };
  
  // Custom label for pie charts
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };
  
  // Custom tooltip for displaying thresholds
  const CustomThresholdTooltip = ({ active, payload, threshold }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-gray-200 shadow-sm rounded-md">
          <p className="text-sm font-medium">{`${threshold.label}: ${threshold.value}`}</p>
        </div>
      );
    }
    
    return null;
  };
  
  // Simplified visualizations for mini size
  const renderMiniVisualization = () => {
    // Get the latest or most significant data point
    const latestData = data[data.length - 1];
    const maxValue = Math.max(...data.map(d => typeof d.value === 'number' ? d.value : 0));
    const mostSignificantData = data.reduce((prev, curr) => {
      const prevSig = prev.significance || 'info';
      const currSig = curr.significance || 'info';
      const sigOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return sigOrder[currSig] < sigOrder[prevSig] ? curr : prev;
    }, data[0]);
    
    // Choose what to display based on visualization type
    switch (visualizationType) {
      case 'line':
      case 'bar':
        // Show a mini sparkline or bar with the latest value
        return (
          <div className="flex flex-col h-full w-full">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">{latestData?.name}</span>
              <span className={cn(
                "text-xs font-bold",
                isHighImportance ? "text-red-600" : "text-blue-600"
              )}>
                {latestData?.value}
              </span>
            </div>
            <div className="relative h-3 bg-gray-100 rounded overflow-hidden">
              <div 
                className={cn(
                  "absolute left-0 top-0 h-full",
                  isHighImportance ? "bg-red-500" : "bg-blue-500"
                )}
                style={{ width: `${(latestData?.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        );
      
      case 'pie':
        // Show a small distribution indicator
        return (
          <div className="flex items-center justify-center h-full">
            <div className="grid grid-cols-4 gap-1 w-full">
              {data.slice(0, 4).map((d, i) => (
                <div 
                  key={i} 
                  className="rounded-sm" 
                  style={{ 
                    backgroundColor: colors[i % colors.length],
                    height: '8px',
                    width: `${Math.max(15, Math.min(100, (d.value / maxValue) * 100))}%`
                  }}
                />
              ))}
            </div>
          </div>
        );
      
      case 'radar':
        // Show the most significant metric
        return (
          <div className="flex items-center">
            <div className={cn(
              "w-3 h-3 rounded-full mr-1",
              isHighImportance ? "bg-red-500" : "bg-blue-500"
            )} />
            <span className="text-xs truncate">
              {mostSignificantData?.name}: {mostSignificantData?.value}
            </span>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <span className="text-xs text-gray-500">Data preview</span>
          </div>
        );
    }
  };
  
  // Get the icon for the visualization type
  const getVisualizationIcon = () => {
    switch (visualizationType) {
      case 'line': return <LineChart className="w-4 h-4" />;
      case 'bar': return <BarChart3 className="w-4 h-4" />;
      case 'pie': return <PieChart className="w-4 h-4" />;
      case 'radar': return <Zap className="w-4 h-4" />;
      default: return <BarChart3 className="w-4 h-4" />;
    }
  };
  
  // Add a ref to the container for potential size calculations
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <Card
      ref={containerRef}
      className={cn(
        "overflow-hidden transition-all duration-300",
        isFullscreen && "fixed inset-0 z-50 max-w-none rounded-none",
        isHighImportance && currentSize !== 'mini' && "border border-red-300"
      )}
    >
      {currentSize !== 'mini' && (
        <CardHeader className={cn(
          "py-3 px-4 flex flex-row items-center justify-between",
          isHighImportance && "bg-red-50"
        )}>
          <div className="flex items-center">
            {getVisualizationIcon()}
            <CardTitle className="text-base font-medium ml-2">{title}</CardTitle>
            {isHighImportance && (
              <Badge className="ml-2 bg-red-100 text-red-700 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {significance}
              </Badge>
            )}
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-1">
              {currentSize !== 'mini' && userPreferences.detailLevel !== 'minimal' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          )}
        </CardHeader>
      )}
      
      <CardContent className={cn("p-4", currentSize === 'mini' && "p-2")}>
        {currentSize !== 'mini' && description && (
          <p className="text-sm text-gray-600 mb-4">{description}</p>
        )}
        
        {renderVisualization()}
        
        {/* Additional details shown when expanded */}
        <AnimatePresence>
          {showDetails && currentSize !== 'mini' && userPreferences.detailLevel !== 'minimal' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              {/* Display correlations if available */}
              {correlations && correlations.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Related Factors</h4>
                  <div className="space-y-1">
                    {correlations.map((correlation, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Badge 
                            variant="outline" 
                            className={cn(
                              "mr-2",
                              correlation.significance === 'critical' && "bg-red-50 text-red-700",
                              correlation.significance === 'high' && "bg-orange-50 text-orange-700",
                              correlation.significance === 'medium' && "bg-yellow-50 text-yellow-700",
                              correlation.significance === 'low' && "bg-green-50 text-green-700",
                              correlation.significance === 'info' && "bg-blue-50 text-blue-700"
                            )}
                          >
                            {correlation.source}
                          </Badge>
                          <span className="text-xs text-gray-500">affects</span>
                          <Badge 
                            variant="outline" 
                            className="ml-2"
                          >
                            {correlation.target}
                          </Badge>
                        </div>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="flex items-center">
                                <span className="text-xs mr-1">
                                  {Math.abs(correlation.strength).toFixed(2)}
                                </span>
                                <Progress 
                                  value={Math.abs(correlation.strength) * 100} 
                                  className="w-16 h-1.5" 
                                />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>
                                Correlation strength: {Math.abs(correlation.strength) < 0.3 ? 'Weak' : 
                                Math.abs(correlation.strength) < 0.6 ? 'Moderate' : 'Strong'}
                              </p>
                              {correlation.description && <p>{correlation.description}</p>}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Display thresholds if available */}
              {thresholds && thresholds.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Thresholds</h4>
                  <div className="space-y-1">
                    {thresholds.map((threshold, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-xs">{threshold.label}: {threshold.value}</span>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            threshold.significance === 'critical' && "bg-red-50 text-red-700",
                            threshold.significance === 'high' && "bg-orange-50 text-orange-700",
                            threshold.significance === 'medium' && "bg-yellow-50 text-yellow-700",
                            threshold.significance === 'low' && "bg-green-50 text-green-700",
                            threshold.significance === 'info' && "bg-blue-50 text-blue-700"
                          )}
                        >
                          {threshold.significance}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default AdaptiveVisualization; 