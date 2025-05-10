
import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, Heart, Moon, ArrowDown, ChartLine, HeartPulse, ChevronRight, Thermometer } from 'lucide-react';
import StatusBar from '@/components/StatusBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import WeeklyTrendChart, { ReadingType } from '@/components/WeeklyTrendChart';
import BottomNavbar from '@/components/BottomNavbar';
import { getLastReading } from '@/utils/bleUtils';

const TrendsAndInsights = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const lastReading = getLastReading();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <StatusBar />
      
      {/* Header */}
      <header className="bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full" 
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="text-nestor-gray-800" size={18} />
            </Button>
            <h1 className="text-xl font-semibold text-nestor-gray-900">Trends & Insights</h1>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <MoreVertical className="text-nestor-gray-800" size={18} />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-6 py-6 pb-20">
        {/* Quick Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-4">
            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-nestor-gray-500">Heart Rate</span>
                  <Heart className="text-red-500" size={16} />
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-semibold text-nestor-gray-900">{lastReading?.hr ?? 72}</span>
                  <span className="ml-1 text-sm text-nestor-gray-500">bpm</span>
                </div>
                <span className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowDown className="mr-1" size={12} />
                  3% from yesterday
                </span>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-nestor-gray-500">Readiness</span>
                  <ChartLine className="text-blue-600" size={16} />
                </div>
                <div className="flex items-baseline">
                  <span className="text-2xl font-semibold text-nestor-gray-900">{lastReading?.readiness ?? 82}</span>
                  <span className="ml-1 text-sm text-nestor-gray-500">/ 100</span>
                </div>
                <span className="text-xs text-green-600 flex items-center mt-1">
                  <ArrowDown className="mr-1" size={12} />
                  4% improvement
                </span>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Period Selector */}
        <section className="mb-4">
          <div className="flex justify-center space-x-4">
            <Button 
              variant={selectedPeriod === 'week' ? 'default' : 'outline'} 
              className="rounded-full"
              onClick={() => setSelectedPeriod('week')}
            >
              Week
            </Button>
            <Button 
              variant={selectedPeriod === 'month' ? 'default' : 'outline'} 
              className="rounded-full"
              onClick={() => setSelectedPeriod('month')}
            >
              Month
            </Button>
          </div>
        </section>

        {/* Enhanced Chart with Metric Selection */}
        <section className="mb-8">
          <WeeklyTrendChart 
            days={selectedPeriod === 'week' ? 7 : 30}
            allowMetricChange={true}
          />
        </section>

        {/* Daily Highlights */}
        <section>
          <h2 className="text-lg font-semibold text-nestor-gray-900 mb-4">Daily Highlights</h2>
          
          <div className="space-y-4">
            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <HeartPulse className="text-green-600" size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium text-nestor-gray-900">Optimal Recovery</h3>
                      <p className="text-sm text-nestor-gray-500">Your resting heart rate is lower than usual</p>
                    </div>
                  </div>
                  <ChevronRight className="text-nestor-gray-400" size={16} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Moon className="text-yellow-600" size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium text-nestor-gray-900">Sleep Pattern Change</h3>
                      <p className="text-sm text-nestor-gray-500">You went to bed 1.5 hours later than usual</p>
                    </div>
                  </div>
                  <ChevronRight className="text-nestor-gray-400" size={16} />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Thermometer className="text-blue-600" size={18} />
                    </div>
                    <div>
                      <h3 className="font-medium text-nestor-gray-900">Temperature Trend</h3>
                      <p className="text-sm text-nestor-gray-500">Your temperature has been stable for the past week</p>
                    </div>
                  </div>
                  <ChevronRight className="text-nestor-gray-400" size={16} />
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <BottomNavbar />
    </div>
  );
};

export default TrendsAndInsights;
