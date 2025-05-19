import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Check, Clock, LineChart, Plus, Target, Trophy, X, CheckCircle2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

// Types for habit tracking
interface HabitDay {
  date: Date;
  completed: boolean;
  skipped: boolean;
  note?: string;
}

interface Habit {
  id: string;
  title: string;
  description: string;
  category: 'sleep' | 'activity' | 'nutrition' | 'mindfulness' | 'other';
  daysTracked: HabitDay[];
  streakCurrent: number;
  streakLongest: number;
  targetDays: number;
  startDate: Date;
  completionRate: number; // 0-100
  forecastImpact?: {
    metrics: string[];
    impactEstimate: 'high' | 'medium' | 'low';
    timeToResult: string;
  };
  status: 'active' | 'completed' | 'abandoned';
}

// Helper functions
const getFormattedDate = (date: Date): string => {
  return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
};

const getDaysBetween = (start: Date, end: Date): number => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((start.getTime() - end.getTime()) / oneDay));
};

const getCategoryIcon = (category: string): React.ReactNode => {
  switch (category) {
    case 'sleep':
      return <span className="text-blue-500">😴</span>;
    case 'activity':
      return <span className="text-green-500">🏃</span>;
    case 'nutrition':
      return <span className="text-orange-500">🍎</span>;
    case 'mindfulness':
      return <span className="text-purple-500">🧘</span>;
    default:
      return <span className="text-gray-500">📝</span>;
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'active':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'abandoned':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Generate mock data
const generateMockHabits = (): Habit[] => {
  const today = new Date();
  const habits: Habit[] = [];
  
  // Create some habits
  const habitData = [
    {
      title: 'Daily Meditation',
      description: 'Practice 10 minutes of meditation daily for stress reduction',
      category: 'mindfulness',
      days: 30,
      forecastImpact: {
        metrics: ['Stress', 'Recovery', 'Sleep'],
        impactEstimate: 'high',
        timeToResult: '3-4 weeks'
      }
    },
    {
      title: 'Sleep Schedule',
      description: 'Go to bed and wake up at consistent times',
      category: 'sleep',
      days: 60,
      forecastImpact: {
        metrics: ['Sleep', 'Recovery'],
        impactEstimate: 'high',
        timeToResult: '2 weeks'
      }
    },
    {
      title: 'Daily Water Intake',
      description: 'Drink at least 8 glasses of water daily',
      category: 'nutrition',
      days: 21,
      forecastImpact: {
        metrics: ['Recovery', 'Heart Rate'],
        impactEstimate: 'medium',
        timeToResult: '1-2 weeks'
      }
    },
    {
      title: 'Movement Breaks',
      description: 'Take a 5 minute walk every hour of sitting',
      category: 'activity',
      days: 14,
      forecastImpact: {
        metrics: ['Activity', 'Stress'],
        impactEstimate: 'medium',
        timeToResult: '3 weeks'
      }
    }
  ];
  
  habitData.forEach((data, index) => {
    // Create random tracking data
    const startDate = new Date();
    startDate.setDate(today.getDate() - Math.floor(Math.random() * 20) - 5);
    
    const daysTracked: HabitDay[] = [];
    let currentDate = new Date(startDate);
    let daysCompleted = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    
    while (currentDate <= today) {
      // Determine if the habit was completed on this day (with high probability)
      const completed = Math.random() > 0.3;
      const skipped = !completed && Math.random() > 0.7;
      
      if (completed) {
        daysCompleted++;
        currentStreak++;
        if (currentStreak > maxStreak) {
          maxStreak = currentStreak;
        }
      } else if (!skipped) {
        currentStreak = 0;
      }
      
      daysTracked.push({
        date: new Date(currentDate),
        completed,
        skipped,
        note: completed && Math.random() > 0.8 ? 'Felt great today!' : undefined
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const daysTotal = daysTracked.length;
    const completionRate = daysTotal > 0 ? (daysCompleted / daysTotal) * 100 : 0;
    
    // Set status based on completion
    let status: 'active' | 'completed' | 'abandoned' = 'active';
    if (completionRate < 30 && daysTotal > 7) {
      status = 'abandoned';
    } else if (daysTotal >= data.days) {
      status = 'completed';
    }
    
    habits.push({
      id: `habit-${index}`,
      title: data.title,
      description: data.description,
      category: data.category as any,
      daysTracked,
      streakCurrent: currentStreak,
      streakLongest: maxStreak,
      targetDays: data.days,
      startDate,
      completionRate,
      forecastImpact: data.forecastImpact as any,
      status
    });
  });
  
  return habits;
};

interface HabitFormationTrackerProps {
  className?: string;
  userId?: string;
  onAddHabit?: () => void;
}

const HabitFormationTracker: React.FC<HabitFormationTrackerProps> = ({ className, userId, onAddHabit }) => {
  const [habits, setHabits] = useState<Habit[]>(generateMockHabits);
  const [activeView, setActiveView] = useState<'all' | 'active' | 'completed'>('active');
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  
  // Filter habits based on active view
  const filteredHabits = habits.filter(habit => {
    if (activeView === 'all') return true;
    if (activeView === 'active') return habit.status === 'active';
    if (activeView === 'completed') return habit.status === 'completed';
    return true;
  });
  
  // Get selected habit
  const selectedHabit = selectedHabitId 
    ? habits.find(h => h.id === selectedHabitId) 
    : null;
  
  // Handle habit selection
  const handleSelectHabit = (habitId: string) => {
    setSelectedHabitId(selectedHabitId === habitId ? null : habitId);
  };
  
  // Handle marking today's habit
  const handleMarkToday = (habitId: string, completed: boolean) => {
    setHabits(prevHabits => 
      prevHabits.map(habit => {
        if (habit.id !== habitId) return habit;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Check if we already have an entry for today
        const todayEntry = habit.daysTracked.find(day => 
          day.date.getDate() === today.getDate() &&
          day.date.getMonth() === today.getMonth() &&
          day.date.getFullYear() === today.getFullYear()
        );
        
        if (todayEntry) {
          // Update today's entry
          const updatedDays = habit.daysTracked.map(day => {
            if (
              day.date.getDate() === today.getDate() &&
              day.date.getMonth() === today.getMonth() &&
              day.date.getFullYear() === today.getFullYear()
            ) {
              return { ...day, completed, skipped: !completed };
            }
            return day;
          });
          
          // Recalculate stats
          let daysCompleted = 0;
          let currentStreak = 0;
          let maxStreak = habit.streakLongest;
          
          // Start from the end (most recent days)
          for (let i = updatedDays.length - 1; i >= 0; i--) {
            const day = updatedDays[i];
            if (day.completed) {
              daysCompleted++;
              currentStreak++;
              if (currentStreak > maxStreak) {
                maxStreak = currentStreak;
              }
            } else if (!day.skipped) {
              // Break streak on missed days (not skipped)
              break;
            }
          }
          
          const completionRate = (daysCompleted / updatedDays.length) * 100;
          
          return {
            ...habit,
            daysTracked: updatedDays,
            streakCurrent: currentStreak,
            streakLongest: maxStreak,
            completionRate
          };
        } else {
          // Add new entry for today
          const newDay: HabitDay = {
            date: today,
            completed,
            skipped: !completed
          };
          
          const updatedDays = [...habit.daysTracked, newDay];
          
          // Calculate the new streak
          const newStreak = completed ? habit.streakCurrent + 1 : 0;
          const newLongestStreak = Math.max(habit.streakLongest, newStreak);
          
          // Calculate completion rate
          const daysCompleted = updatedDays.filter(d => d.completed).length;
          const completionRate = (daysCompleted / updatedDays.length) * 100;
          
          return {
            ...habit,
            daysTracked: updatedDays,
            streakCurrent: newStreak,
            streakLongest: newLongestStreak,
            completionRate
          };
        }
      })
    );
  };
  
  // Generate calendar for habit tracking
  const generateCalendar = (habit: Habit) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get date range to display (up to 4 weeks)
    const endDate = new Date(today);
    let startDate = new Date(today);
    startDate.setDate(today.getDate() - 27); // Show 4 weeks
    
    if (habit.startDate > startDate) {
      startDate = new Date(habit.startDate);
    }
    
    const days = [];
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      // Find if we have data for this day
      const dayData = habit.daysTracked.find(day => 
        day.date.getDate() === currentDate.getDate() &&
        day.date.getMonth() === currentDate.getMonth() &&
        day.date.getFullYear() === currentDate.getFullYear()
      );
      
      const isToday = 
        currentDate.getDate() === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();
      
      days.push({
        date: new Date(currentDate),
        dayOfWeek: currentDate.toLocaleDateString(undefined, { weekday: 'short' }),
        dayOfMonth: currentDate.getDate(),
        isToday,
        completed: dayData?.completed || false,
        skipped: dayData?.skipped || false,
        note: dayData?.note
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };
  
  // Calculate impact score from forecast impact
  const getImpactScore = (impact: 'high' | 'medium' | 'low'): number => {
    switch (impact) {
      case 'high': return 80 + Math.floor(Math.random() * 20);
      case 'medium': return 50 + Math.floor(Math.random() * 30);
      case 'low': return 30 + Math.floor(Math.random() * 20);
      default: return 50;
    }
  };
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Habit Formation</h2>
        <Button size="sm" onClick={onAddHabit} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          <span>Add Habit</span>
        </Button>
      </div>
      
      <Tabs defaultValue="active" value={activeView} onValueChange={(value) => setActiveView(value as any)}>
        <TabsList className="grid grid-cols-3 w-[300px]">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="space-y-3">
        {filteredHabits.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-gray-500">No habits found in this category</p>
              <Button className="mt-4" size="sm" onClick={onAddHabit}>Add New Habit</Button>
            </CardContent>
          </Card>
        ) : (
          filteredHabits.map(habit => (
            <Card 
              key={habit.id} 
              className={`cursor-pointer transition-all ${selectedHabitId === habit.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => handleSelectHabit(habit.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(habit.category)}
                    <CardTitle className="text-md">{habit.title}</CardTitle>
                  </div>
                  <Badge className={getStatusColor(habit.status)}>
                    {habit.status.charAt(0).toUpperCase() + habit.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription>{habit.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Current</div>
                      <div className="text-xl font-bold text-blue-600">
                        {habit.streakCurrent}
                        <span className="text-xs ml-1">days</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-500">Longest</div>
                      <div className="text-xl font-bold text-green-600">
                        {habit.streakLongest}
                        <span className="text-xs ml-1">days</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Progress</div>
                    <div className="flex items-center">
                      <Progress value={habit.completionRate} className="h-2 w-24 mr-2" />
                      <span className="text-sm font-medium">{Math.round(habit.completionRate)}%</span>
                    </div>
                  </div>
                </div>
                
                {habit.forecastImpact && (
                  <div className="mt-3 bg-blue-50 p-2 rounded-md text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Target className="h-3 w-3 text-blue-600" />
                        <span className="text-blue-700">Forecast Impact</span>
                      </div>
                      <Badge variant="outline" className="text-[9px] h-4 bg-white">
                        {habit.forecastImpact.impactEstimate.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="mt-1">
                      <span className="text-gray-600">Expected results in: </span>
                      <span className="font-medium">{habit.forecastImpact.timeToResult}</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {habit.forecastImpact.metrics.map(metric => (
                        <Badge key={metric} variant="outline" className="text-[9px] h-4 bg-white">
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedHabitId === habit.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 pt-4 border-t"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Tracking Calendar
                      </h4>
                      {habit.status === 'active' && (
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkToday(habit.id, true);
                            }}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Complete Today
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkToday(habit.id, false);
                            }}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Skip Today
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="overflow-x-auto py-2">
                      <div className="flex gap-1" style={{ minWidth: '650px' }}>
                        {generateCalendar(habit).map((day, index) => (
                          <div 
                            key={index} 
                            className={`w-8 flex flex-col items-center ${
                              day.isToday ? 'bg-blue-50 rounded-md' : ''
                            }`}
                          >
                            <div className="text-xs text-gray-500">{day.dayOfWeek.slice(0, 1)}</div>
                            <div className="text-xs">{day.dayOfMonth}</div>
                            <div className="mt-1 h-8 w-8 flex items-center justify-center">
                              {day.completed ? (
                                <div className="h-7 w-7 rounded-full bg-green-100 flex items-center justify-center">
                                  <Check className="h-4 w-4 text-green-600" />
                                </div>
                              ) : day.skipped ? (
                                <div className="h-7 w-7 rounded-full bg-gray-100 flex items-center justify-center">
                                  <Clock className="h-4 w-4 text-gray-400" />
                                </div>
                              ) : day.date <= new Date() ? (
                                <div className="h-7 w-7 rounded-full bg-red-100 flex items-center justify-center">
                                  <X className="h-4 w-4 text-red-600" />
                                </div>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Impact chart */}
                    {habit.forecastImpact && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                          <LineChart className="h-4 w-4" />
                          Predicted Impact
                        </h4>
                        <div className="h-24 border rounded-md p-3">
                          <div className="flex items-end h-full">
                            {habit.forecastImpact.metrics.map((metric, idx) => {
                              const impactScore = getImpactScore(habit.forecastImpact!.impactEstimate);
                              const height = `${impactScore}%`;
                              const colors = [
                                'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-amber-500'
                              ];
                              
                              return (
                                <div key={metric} className="flex-1 flex flex-col items-center justify-end h-full">
                                  <div 
                                    className={`w-6 ${colors[idx % colors.length]} rounded-t-sm transition-all duration-500`} 
                                    style={{ height }}
                                  />
                                  <div className="mt-2 text-xs text-center">{metric}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Rewards */}
                    {habit.streakCurrent > 0 && (
                      <div className="mt-4 bg-amber-50 p-3 rounded-md flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-amber-600" />
                          <div>
                            <h4 className="text-sm font-medium">Keep Going!</h4>
                            <p className="text-xs text-gray-600">
                              {habit.streakCurrent === 1 
                                ? "You've started your streak. The first day is always the hardest!" 
                                : `You're on a ${habit.streakCurrent}-day streak. Great consistency!`}
                            </p>
                          </div>
                        </div>
                        <div className="text-2xl font-bold text-amber-600">+{habit.streakCurrent}</div>
                      </div>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default HabitFormationTracker; 