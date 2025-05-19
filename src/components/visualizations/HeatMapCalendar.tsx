import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, InfoIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SimpleSkeletonLoader } from "@/components/ui/skeleton";
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type MetricType = 'heartRate' | 'sleepQuality' | 'stress' | 'steps' | 'water' | 'caffeine' | 'readiness' | 'hrvScore' | 'recovery';

export interface DayData {
  date: string; // ISO date string
  value: number;
  percentile?: number; // 0-100 for positioning relative to normal range
  annotation?: string; // Optional text note for significant events
  highlight?: boolean; // Flag for visually highlighting this day
}

export interface HeatMapCalendarProps {
  metric: MetricType;
  data: DayData[];
  className?: string;
  loading?: boolean;
  onMetricChange?: (metric: MetricType) => void;
  showAnnotations?: boolean;
  showWeekdayLabels?: boolean;
  highlightToday?: boolean;
  minValue?: number;
  maxValue?: number;
  colorScale?: 'monochrome' | 'gradient' | 'diverging';
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

const metricColors: Record<MetricType, { base: string, light: string, dark: string }> = {
  heartRate: { base: '#ef4444', light: '#fee2e2', dark: '#b91c1c' }, // red
  sleepQuality: { base: '#8b5cf6', light: '#ede9fe', dark: '#6d28d9' }, // purple
  stress: { base: '#f97316', light: '#ffedd5', dark: '#c2410c' }, // orange
  steps: { base: '#22c55e', light: '#dcfce7', dark: '#15803d' }, // green
  water: { base: '#3b82f6', light: '#dbeafe', dark: '#1d4ed8' }, // blue
  caffeine: { base: '#a16207', light: '#fef3c7', dark: '#854d0e' }, // amber
  readiness: { base: '#0f172a', light: '#f8fafc', dark: '#0f172a' }, // slate
  hrvScore: { base: '#7c3aed', light: '#f3e8ff', dark: '#6d28d9' }, // violet
  recovery: { base: '#0ea5e9', light: '#e0f2fe', dark: '#0369a1' } // sky
};

// Function to determine the intensity of the color based on the value
const getColorIntensity = (
  value: number,
  minValue: number,
  maxValue: number,
  colorScale: 'monochrome' | 'gradient' | 'diverging',
  metricColor: { base: string, light: string, dark: string }
) => {
  // Normalize the value between 0 and 1
  let normalizedValue = Math.max(0, Math.min(1, (value - minValue) / (maxValue - minValue || 1)));
  
  if (colorScale === 'monochrome') {
    // For monochrome, return a shade of the base color
    const opacity = 0.2 + (normalizedValue * 0.8);
    return `${metricColor.base}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
  } else if (colorScale === 'diverging') {
    // For diverging scale (e.g., below/above average)
    const midPoint = 0.5;
    if (normalizedValue < midPoint) {
      // Below average - use a different color (e.g., blue to represent "cool")
      return `rgba(59, 130, 246, ${normalizedValue * 2})`;
    } else {
      // Above average - use the metric color
      return `rgba(${parseInt(metricColor.base.slice(1, 3), 16)}, ${parseInt(metricColor.base.slice(3, 5), 16)}, ${parseInt(metricColor.base.slice(5, 7), 16)}, ${(normalizedValue - 0.5) * 2})`;
    }
  } else {
    // For gradient, interpolate between light and dark colors
    return normalizedValue < 0.5 
      ? metricColor.light
      : normalizedValue < 0.7
        ? metricColor.base
        : metricColor.dark;
  }
};

const HeatMapCalendar: React.FC<HeatMapCalendarProps> = ({
  metric,
  data,
  className,
  loading = false,
  onMetricChange,
  showAnnotations = true,
  showWeekdayLabels = true,
  highlightToday = true,
  minValue,
  maxValue,
  colorScale = 'gradient'
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);
  const [availableMetrics, setAvailableMetrics] = useState<MetricType[]>([
    'heartRate', 'sleepQuality', 'stress', 'steps', 'water', 'caffeine', 'readiness', 'hrvScore', 'recovery'
  ]);
  
  // Calculate the days to display in the calendar
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);
  
  // Get the min and max values from data if not provided
  const dataRange = useMemo(() => {
    if (minValue !== undefined && maxValue !== undefined) {
      return { min: minValue, max: maxValue };
    }
    
    if (!data.length) return { min: 0, max: 100 };
    
    const values = data.map(d => d.value);
    return {
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }, [data, minValue, maxValue]);
  
  // Navigation functions
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToCurrentMonth = () => setCurrentDate(new Date());
  
  // Find data for a specific day
  const getDayData = (day: Date) => {
    return data.find(d => isSameDay(parseISO(d.date), day));
  };
  
  if (loading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <SimpleSkeletonLoader className="h-6 w-3/4" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <SimpleSkeletonLoader className="h-8 w-28" />
              <SimpleSkeletonLoader className="h-8 w-28" />
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Array(7).fill(0).map((_, i) => (
                <SimpleSkeletonLoader key={`header-${i}`} className="h-6" />
              ))}
              {Array(35).fill(0).map((_, i) => (
                <SimpleSkeletonLoader key={`day-${i}`} className="h-12 rounded-md" />
              ))}
            </div>
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
            <Calendar className="mr-2 h-5 w-5 text-brand-blue-500" />
            {metricLabels[metric]} Calendar
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {format(currentDate, 'MMMM yyyy')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={goToPreviousMonth}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-sm font-medium" 
              onClick={goToCurrentMonth}
            >
              Today
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={goToNextMonth}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center">
            <span className="text-neutral-500 mr-2 text-xs">Metric:</span>
            <select 
              className="bg-neutral-100 border-none rounded-md px-2 py-1 text-xs"
              value={metric}
              onChange={(e) => onMetricChange && onMetricChange(e.target.value as MetricType)}
            >
              {availableMetrics.map(m => (
                <option key={m} value={m}>{metricLabels[m]}</option>
              ))}
            </select>
          </div>
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Weekday Headers */}
          {showWeekdayLabels && (
            <>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <div 
                  key={day} 
                  className="text-center text-xs font-medium text-neutral-500 pb-1"
                >
                  {day}
                </div>
              ))}
            </>
          )}
          
          {/* Calendar Days */}
          {calendarDays.map((day, i) => {
            const dayData = getDayData(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isToday = highlightToday && isSameDay(day, new Date());
            
            // Determine the background color based on the value
            const bgColor = dayData 
              ? getColorIntensity(
                  dayData.value, 
                  dataRange.min, 
                  dataRange.max, 
                  colorScale,
                  metricColors[metric]
                )
              : undefined;
            
            return (
              <div 
                key={i}
                className={cn(
                  "aspect-square rounded-md p-1 relative transition-all duration-200",
                  isCurrentMonth ? "" : "opacity-30",
                  isToday && "ring-2 ring-brand-blue-500 ring-opacity-50",
                  dayData?.highlight && "ring-2 ring-yellow-400",
                  !dayData && "bg-neutral-50"
                )}
                style={{ 
                  backgroundColor: bgColor,
                }}
                onMouseEnter={() => dayData && setHoveredDay(dayData)}
                onMouseLeave={() => setHoveredDay(null)}
              >
                <div className={cn(
                  "text-xs font-medium",
                  dayData ? (parseFloat(bgColor || '') > 0.7 ? "text-white" : "text-neutral-800") : "text-neutral-400"
                )}>
                  {format(day, 'd')}
                </div>
                
                {dayData && (
                  <div className={cn(
                    "text-[10px] pt-1",
                    parseFloat(bgColor || '') > 0.7 ? "text-white/80" : "text-neutral-600"
                  )}>
                    {dayData.value}
                  </div>
                )}
                
                {showAnnotations && dayData?.annotation && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-yellow-400"></div>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p className="text-xs">{dayData.annotation}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center text-xs">
            <div className="w-3 h-3 rounded-sm bg-neutral-50 mr-1"></div>
            <span className="text-neutral-500 mr-4">No data</span>
            
            <div className="flex items-center">
              <div className="w-20 h-3 rounded-sm bg-gradient-to-r from-[#f8f9fa] via-[${metricColors[metric].base}] to-[${metricColors[metric].dark}]"></div>
              <div className="flex justify-between w-20 text-[10px] text-neutral-500">
                <span>{dataRange.min}</span>
                <span>{dataRange.max}</span>
              </div>
            </div>
          </div>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-3 w-3 text-neutral-400" />
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-xs">
                  Calendar showing daily {metricLabels[metric].toLowerCase()} values. 
                  Darker colors represent higher values.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        
        {/* Hovered day details */}
        {hoveredDay && (
          <div className="mt-2 p-2 border border-neutral-200 rounded-md text-xs">
            <div className="font-medium">{format(parseISO(hoveredDay.date), 'MMMM d, yyyy')}</div>
            <div className="flex justify-between mt-1">
              <span className="text-neutral-500">{metricLabels[metric]}:</span>
              <span className="font-medium">{hoveredDay.value}</span>
            </div>
            {hoveredDay.percentile !== undefined && (
              <div className="flex justify-between mt-1">
                <span className="text-neutral-500">Percentile:</span>
                <span className="font-medium">{hoveredDay.percentile}%</span>
              </div>
            )}
            {hoveredDay.annotation && (
              <div className="mt-1 text-neutral-700">{hoveredDay.annotation}</div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HeatMapCalendar; 