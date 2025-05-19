import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Plus, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format, addDays, subDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { easings, presets, variants } from '@/styles/motion';
import { useToast } from '@/hooks/use-toast';
import ActivityTracker from '@/components/ActivityTracker';
import MealLogger from '@/components/MealLogger';
import StatusBar from '@/components/StatusBar';
import BottomNavbar from '@/components/BottomNavbar';

const TrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<string>("activities");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
      toast({
        title: "Date Selected",
        description: `Viewing logs for ${format(date, "MMMM d, yyyy")}`
      });
    }
  };

  const handleBackClick = () => {
    navigate('/dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
      <StatusBar />
      
      {/* Single unified header with everything included */}
      <header className="sticky top-0 z-10 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="px-4 sm:px-6 pt-4 pb-3">
          {/* Top row with title and date controls */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <button 
                className="mr-3 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                onClick={handleBackClick}
              >
                <ArrowLeft className="text-slate-700 dark:text-slate-300" size={18} />
              </button>
              <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Health Tracker</h1>
            </div>
            
            {/* Date navigation integrated into header */}
            <div className="flex items-center gap-2">
              <button 
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                onClick={() => setCurrentDate(prevDate => subDays(prevDate, 1))}
              >
                <ChevronLeft className="text-slate-700 dark:text-slate-300" size={16} />
              </button>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-9 gap-1 border-slate-200 dark:border-slate-700"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {format(currentDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd") 
                        ? "Today" 
                        : format(currentDate, "MMM d")}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar 
                    mode="single" 
                    selected={currentDate} 
                    onSelect={handleDateChange} 
                    initialFocus 
                  />
                </PopoverContent>
              </Popover>
              
              <button 
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
                onClick={() => setCurrentDate(prevDate => addDays(prevDate, 1))}
              >
                <ChevronRight className="text-slate-700 dark:text-slate-300" size={16} />
              </button>
            </div>
          </div>
          
          {/* Tab navigation included in the header */}
          <Tabs 
            defaultValue="activities" 
            value={activeTab}
            onValueChange={setActiveTab}
            className="mt-1"
          >
            <TabsList className="w-full bg-transparent h-10 p-0 justify-start space-x-6 overflow-x-auto hide-scrollbar">
              <TabsTrigger 
                value="activities" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 rounded-none bg-transparent h-10 px-1 font-medium transition-all"
              >
                Activities
              </TabsTrigger>
              <TabsTrigger 
                value="nutrition" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 rounded-none bg-transparent h-10 px-1 font-medium transition-all"
              >
                Nutrition
              </TabsTrigger>
              <TabsTrigger 
                value="wellness" 
                className="data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 dark:data-[state=active]:text-blue-400 rounded-none bg-transparent h-10 px-1 font-medium transition-all"
              >
                Wellness
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Tab content */}
      <div className="flex-1 overflow-auto pb-20">
        <TabsContent 
          value="activities" 
          className="flex-1 h-full m-0 outline-none data-[state=active]:animate-in"
          style={{ 
            animationTimingFunction: easings.standard.easeOut,
            animationDuration: '200ms'
          }}
        >
          <motion.div 
            className="h-full"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants.fade}
            transition={{ duration: 0.2, ease: easings.standard.easeOut }}
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">ACTIVITY TRACKER</h2>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  Add Activity
                </Button>
              </div>
              
              <div className="h-[550px] sm:h-[600px] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <ActivityTracker />
              </div>
            </div>
          </motion.div>
        </TabsContent>
        
        <TabsContent 
          value="nutrition" 
          className="flex-1 h-full m-0 outline-none data-[state=active]:animate-in"
          style={{ 
            animationTimingFunction: easings.standard.easeOut,
            animationDuration: '200ms'
          }}
        >
          <motion.div 
            className="h-full"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants.fade}
            transition={{ duration: 0.2, ease: easings.standard.easeOut }}
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">MEAL LOGGER</h2>
                <Button size="sm" variant="outline" className="h-8 gap-1">
                  <Plus className="h-3.5 w-3.5" />
                  Add Meal
                </Button>
              </div>
              
              <div className="h-[550px] sm:h-[600px] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <MealLogger />
              </div>
            </div>
          </motion.div>
        </TabsContent>
        
        <TabsContent 
          value="wellness" 
          className="flex-1 h-full m-0 outline-none data-[state=active]:animate-in"
          style={{ 
            animationTimingFunction: easings.standard.easeOut,
            animationDuration: '200ms'
          }}
        >
          <motion.div 
            className="h-full"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={variants.fade}
            transition={{ duration: 0.2, ease: easings.standard.easeOut }}
          >
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">WELLNESS ASSESSMENT</h2>
                <Button size="sm" variant="outline" className="h-8 gap-1" onClick={() => navigate('/dailyassessment')}>
                  Complete Assessment
                </Button>
              </div>
              
              <div className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-900">
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CalendarIcon className="h-8 w-8 text-slate-400 dark:text-slate-500" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Daily Wellness Check</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                    Complete your daily assessment to track sleep, stress, energy levels, and more for better insights.
                  </p>
                  <Button onClick={() => navigate('/dailyassessment')}>
                    Start Assessment
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </div>
      
      <BottomNavbar />
      
      {/* Styles for scrollbar hiding */}
      <style>
        {`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
    </div>
  );
};

export default TrackerPage; 