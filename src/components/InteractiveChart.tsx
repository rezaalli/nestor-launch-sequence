import React, { useState, useRef } from 'react';
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Brush, ReferenceArea, ReferenceLine,
  Label
} from 'recharts';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { spacing } from '@/styles/golden-ratio-spacing';

export type ChartDataPoint = {
  timestamp: number;
  date: string;
  label: string;
  [key: string]: any;
};

export type ComparisonDataset = {
  id: string;
  name: string;
  color: string;
  data: ChartDataPoint[];
};

export type ChartType = 'line' | 'bar' | 'area';

interface InteractiveChartProps {
  title: string;
  data: ChartDataPoint[];
  dataKey: string;
  xAxisKey?: string;
  yAxisLabel?: string;
  className?: string;
  yDomain?: [number | 'auto', number | 'auto'];
  dateFormat?: string;
  height?: number | string;
  chartType?: ChartType;
  showControls?: boolean;
  showBrush?: boolean;
  showComparison?: boolean;
  comparableDatasets?: ComparisonDataset[];
  referenceLines?: {value: number, label: string, color: string}[];
  color?: string;
  aggregationType?: 'mean' | 'sum' | 'max' | 'min';
  onDataPointClick?: (dataPoint: ChartDataPoint) => void;
}

/**
 * Enhanced interactive chart component with zoom, comparison view, and accessibility features
 */
const InteractiveChart: React.FC<InteractiveChartProps> = ({
  title,
  data,
  dataKey,
  xAxisKey = 'label',
  yAxisLabel = '',
  className = '',
  yDomain = ['auto', 'auto'],
  dateFormat = 'MM/dd',
  height = 300,
  chartType = 'line',
  showControls = true,
  showBrush = true,
  showComparison = false,
  comparableDatasets = [],
  referenceLines = [],
  color = '#3b82f6',
  aggregationType = 'mean',
  onDataPointClick
}) => {
  const { colorMode, animationsEnabled } = useTheme();
  const [activeType, setActiveType] = useState<ChartType>(chartType);
  const [zoomActive, setZoomActive] = useState(false);
  const [refAreaLeft, setRefAreaLeft] = useState('');
  const [refAreaRight, setRefAreaRight] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<[number | 'auto', number | 'auto'] | null>(null);
  const [selectedComparisonIds, setSelectedComparisonIds] = useState<string[]>([]);
  
  // Get formatted colors based on theme
  const getColorByMode = () => {
    return colorMode === 'dark' || colorMode === 'night' ? 
      'hsl(220, 60%, 65%)' : color;
  };
  
  // Tooltip backgrounds based on theme
  const tooltipBg = colorMode === 'dark' || colorMode === 'night' ? 
    'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  
  const tooltipBorder = colorMode === 'dark' || colorMode === 'night' ? 
    'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
  const chartColor = getColorByMode();
  
  // For a11y - keypress zoom handling
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle keyboard navigation when zoom is active
    if (zoomActive) {
      switch (e.key) {
        case 'Escape':
          // Cancel zoom
          setZoomActive(false);
          setRefAreaLeft('');
          setRefAreaRight('');
          break;
      }
    }
  };
  
  const handleMouseDown = (e: any) => {
    if (!zoomActive) return;
    setRefAreaLeft(e?.activeLabel || '');
    setRefAreaRight('');
  };
  
  const handleMouseMove = (e: any) => {
    if (!zoomActive || !refAreaLeft) return;
    setRefAreaRight(e?.activeLabel || '');
  };
  
  const handleMouseUp = () => {
    if (!zoomActive || !refAreaLeft || !refAreaRight) {
      setRefAreaLeft('');
      return;
    }
    
    // Compute zoom area
    let indexLeft = data.findIndex(d => d[xAxisKey] === refAreaLeft);
    let indexRight = data.findIndex(d => d[xAxisKey] === refAreaRight);
    
    // Ensure the order is correct (swap if needed)
    if (indexLeft > indexRight) {
      [indexLeft, indexRight] = [indexRight, indexLeft];
    }
    
    // Get the data within zoom area
    const zoomed = data.slice(indexLeft, indexRight + 1);
    if (zoomed.length < 2) {
      setRefAreaLeft('');
      setRefAreaRight('');
      return;
    }
    
    // Extract min and max values for Y domain
    const values = zoomed.map(d => d[dataKey]);
    const minY = Math.min(...values) * 0.9; // Add some padding
    const maxY = Math.max(...values) * 1.1; // Add some padding
    
    setSelectedDomain([minY, maxY]);
    setRefAreaLeft('');
    setRefAreaRight('');
  };
  
  // Reset zoom
  const handleZoomReset = () => {
    setSelectedDomain(null);
  };
  
  // Toggle zoom mode
  const toggleZoom = () => {
    setZoomActive(!zoomActive);
    if (zoomActive) {
      // Turn off zoom mode
      setRefAreaLeft('');
      setRefAreaRight('');
    }
  };
  
  // Toggle chart type
  const handleChartTypeChange = (type: ChartType) => {
    setActiveType(type);
  };
  
  // Toggle comparison dataset
  const handleComparisonToggle = (datasetId: string) => {
    if (selectedComparisonIds.includes(datasetId)) {
      setSelectedComparisonIds(selectedComparisonIds.filter(id => id !== datasetId));
    } else {
      setSelectedComparisonIds([...selectedComparisonIds, datasetId]);
    }
  };
  
  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    
    const formattedDate = payload[0].payload.date || label;
    
    return (
      <div 
        className="rounded-lg shadow-lg p-3 border text-sm"
        style={{ 
          backgroundColor: tooltipBg, 
          borderColor: tooltipBorder,
          border: `1px solid ${tooltipBorder}`
        }}
        role="tooltip"
        aria-live="polite"
      >
        <p className="font-medium mb-1">{formattedDate}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center mb-1">
            <div 
              className="w-3 h-3 mr-2 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="mr-2">{entry.name || dataKey}:</span>
            <span className="font-medium">
              {entry.value} {yAxisLabel}
            </span>
          </div>
        ))}
        
        {/* Reference values if applicable */}
        {referenceLines.length > 0 && (
          <div className="mt-2 pt-2 border-t" style={{ borderColor: tooltipBorder }}>
            {referenceLines.map((ref, idx) => (
              <div key={`ref-${idx}`} className="flex items-center text-xs">
                <div 
                  className="w-2 h-2 mr-1 rounded-full opacity-70"
                  style={{ backgroundColor: ref.color }}
                />
                <span className="opacity-70">{ref.label}: {ref.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  // Custom legend that supports screenreaders
  const CustomLegend = ({ payload }: any) => {
    if (!payload || !payload.length) return null;
    
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4" aria-label="Chart Legend">
        {payload.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center">
            <div 
              className="w-3 h-3 mr-2 rounded-sm"
              style={{ backgroundColor: entry.color }}
              aria-hidden="true"
            />
            <span>{entry.value}</span>
          </li>
        ))}
      </ul>
    );
  };
  
  // Handle data point click - ensuring type safety
  const handleDataPointClick = (point: any) => {
    if (onDataPointClick && point && point.payload) {
      onDataPointClick(point.payload as ChartDataPoint);
    }
  };
  
  // Generate appropriate chart based on type
  const renderChart = () => {
    const chartProps = {
      data,
      margin: { top: 10, right: 30, left: 0, bottom: 5 },
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp
    };
    
    // Common chart elements
    const chartElements = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
        <XAxis 
          dataKey={xAxisKey}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => {
            // If it's a timestamp, format it
            if (typeof value === 'number' && value > 1000000000) {
              const date = new Date(value);
              return date.toLocaleDateString(undefined, { 
                month: 'short', 
                day: 'numeric' 
              });
            }
            return value;
          }}
          padding={{ left: 10, right: 10 }}
        />
        <YAxis 
          domain={selectedDomain || yDomain}
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => {
            // Format large numbers
            if (value >= 1000) {
              return `${(value / 1000).toFixed(1)}k`;
            }
            return value;
          }}
          label={{ 
            value: yAxisLabel, 
            angle: -90, 
            position: 'insideLeft',
            style: { textAnchor: 'middle', fontSize: 12 }
          }}
        />
        <Tooltip 
          content={<CustomTooltip />}
          animationDuration={animationsEnabled ? 300 : 0} 
        />
        {showControls && <Legend content={<CustomLegend />} />}
        
        {/* Reference lines */}
        {referenceLines.map((line, index) => (
          <ReferenceLine 
            key={`ref-line-${index}`}
            y={line.value}
            stroke={line.color}
            strokeDasharray="3 3"
            name={line.label}
          >
            <Label 
              value={line.label} 
              position="right" 
              fill={line.color}
              fontSize={10}
            />
          </ReferenceLine>
        ))}
        
        {/* Zoom selection area */}
        {refAreaLeft && refAreaRight && (
          <ReferenceArea 
            x1={refAreaLeft} 
            x2={refAreaRight} 
            strokeOpacity={0.3} 
            fill={chartColor}
            fillOpacity={0.3}
          />
        )}
        
        {/* Comparison datasets */}
        {showComparison && selectedComparisonIds.map(id => {
          const dataset = comparableDatasets.find(d => d.id === id);
          if (!dataset) return null;
          
          if (activeType === 'line') {
            return (
              <Line
                key={`comp-${id}`}
                type="monotone"
                dataKey={dataKey}
                data={dataset.data}
                name={dataset.name}
                stroke={dataset.color}
                strokeWidth={2}
                dot={{ r: 3, strokeWidth: 1 }}
                activeDot={{ r: 5, strokeWidth: 0 }}
                animationDuration={animationsEnabled ? 1500 : 0}
              />
            );
          } else if (activeType === 'bar') {
            return (
              <Bar
                key={`comp-${id}`}
                dataKey={dataKey}
                data={dataset.data}
                name={dataset.name}
                fill={dataset.color}
                animationDuration={animationsEnabled ? 1500 : 0}
              />
            );
          } else if (activeType === 'area') {
            return (
              <Area
                key={`comp-${id}`}
                type="monotone"
                dataKey={dataKey}
                data={dataset.data}
                name={dataset.name}
                stroke={dataset.color}
                fill={dataset.color}
                fillOpacity={0.2}
                animationDuration={animationsEnabled ? 1500 : 0}
              />
            );
          }
          return null;
        })}
        
        {/* Main data */}
        {activeType === 'line' && (
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke={chartColor}
            strokeWidth={2}
            dot={{ r: 3, strokeWidth: 1 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
            animationDuration={animationsEnabled ? 1500 : 0}
            onClick={onDataPointClick ? handleDataPointClick : undefined}
            name={title}
          />
        )}
        
        {/* Brush for time range selection */}
        {showBrush && (
          <Brush 
            dataKey={xAxisKey} 
            height={30} 
            stroke={chartColor}
            fill="var(--background)"
            travellerWidth={8}
            startIndex={Math.max(0, data.length - 15)}
          />
        )}
      </>
    );
    
    // Render different chart types
    switch (activeType) {
      case 'bar':
        return (
          <BarChart {...chartProps}>
            {chartElements}
            <Bar 
              dataKey={dataKey} 
              fill={chartColor}
              animationDuration={animationsEnabled ? 1500 : 0}
              onClick={onDataPointClick ? handleDataPointClick : undefined}
              name={title}
            />
          </BarChart>
        );
      case 'area':
        return (
          <AreaChart {...chartProps}>
            {chartElements}
            <Area 
              type="monotone" 
              dataKey={dataKey} 
              stroke={chartColor}
              fill={chartColor}
              fillOpacity={0.2}
              animationDuration={animationsEnabled ? 1500 : 0}
              onClick={onDataPointClick ? handleDataPointClick : undefined}
              name={title}
            />
          </AreaChart>
        );
      case 'line':
      default:
        return (
          <LineChart {...chartProps}>
            {chartElements}
          </LineChart>
        );
    }
  };
  
  // Calculate derived stats
  const calculateStats = () => {
    if (!data || data.length === 0) return { avg: 0, min: 0, max: 0 };
    
    const values = data.map(item => item[dataKey]);
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    return {
      avg: Math.round(avg * 10) / 10,
      min,
      max
    };
  };
  
  const stats = calculateStats();
  
  return (
    <div 
      className={`w-full rounded-lg overflow-hidden ${className}`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      aria-label={`${title} chart with ${data.length} data points`}
    >
      <div className="px-1 py-2 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          {/* ARIA live for screenreaders */}
          <div aria-live="polite" className="sr-only">
            {zoomActive ? 'Zoom mode active. Click and drag to zoom in on an area.' : ''}
          </div>
        </div>
        
        {showControls && (
          <div className="flex items-center gap-2">
            {/* Chart type selector */}
            <Tabs defaultValue={activeType} onValueChange={(value) => handleChartTypeChange(value as ChartType)}>
              <TabsList aria-label="Chart type">
                <TabsTrigger value="line" aria-label="Line chart">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 16.5L8 11L13 16.5L21 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </TabsTrigger>
                <TabsTrigger value="bar" aria-label="Bar chart">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 20V10M12 20V4M6 20V14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </TabsTrigger>
                <TabsTrigger value="area" aria-label="Area chart">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 16.5L8 11L13 16.5L21 8M21 8V19.4M3 17V19.4M3 19.4H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Zoom controls */}
            <Button 
              variant={zoomActive ? "default" : "outline"} 
              size="sm"
              onClick={toggleZoom}
              aria-pressed={zoomActive}
              aria-label="Toggle zoom mode"
              className="ml-2"
            >
              {zoomActive ? (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 16h18M3 8h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.5 15.5L19 19M10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 13.866 13.866 17 10 17Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </Button>
            
            {/* Reset zoom */}
            {selectedDomain && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleZoomReset}
                aria-label="Reset zoom"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 20V4M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Button>
            )}
          </div>
        )}
      </div>
      
      {/* Chart Comparison Controls - Only show if comparison is enabled */}
      {showComparison && comparableDatasets.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm font-medium">Compare with:</span>
          {comparableDatasets.map(dataset => (
            <Badge
              key={dataset.id}
              variant={selectedComparisonIds.includes(dataset.id) ? "default" : "outline"}
              style={{
                backgroundColor: selectedComparisonIds.includes(dataset.id) ? dataset.color : 'transparent',
                borderColor: dataset.color,
                color: selectedComparisonIds.includes(dataset.id) ? 'white' : dataset.color,
                cursor: 'pointer'
              }}
              onClick={() => handleComparisonToggle(dataset.id)}
            >
              {dataset.name}
            </Badge>
          ))}
        </div>
      )}
      
      {/* Main chart section */}
      <div 
        style={{ height }}
        className={`${zoomActive ? 'cursor-crosshair' : 'cursor-default'}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
      
      {/* Stats section */}
      <div className="flex justify-between items-center mt-4 text-sm px-4">
        <div>
          <span className="text-muted-foreground">Avg</span>
          <span className="ml-2 font-medium">{stats.avg} {yAxisLabel}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Max</span>
          <span className="ml-2 font-medium">{stats.max} {yAxisLabel}</span>
        </div>
        <div>
          <span className="text-muted-foreground">Min</span>
          <span className="ml-2 font-medium">{stats.min} {yAxisLabel}</span>
        </div>
      </div>
      
      {/* Zoom instructions */}
      {zoomActive && (
        <div className="text-xs text-center mt-4 text-muted-foreground">
          Click and drag across the chart to zoom in on an area
        </div>
      )}
    </div>
  );
};

export default InteractiveChart; 