
import React, { useState } from 'react';
import { ArrowLeft, Calendar, MoreVertical } from 'lucide-react';
import StatusBar from '@/components/StatusBar';
import { useNavigate } from 'react-router-dom';
import { getLastReading } from '@/utils/bleUtils';
import BottomNavbar from '@/components/BottomNavbar';
import { useAssessment } from '@/contexts/AssessmentContext';
import WeeklyBarChart from '@/components/WeeklyBarChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DailyAssessmentTab from '@/components/trends/DailyAssessmentTab';
import ReadinessScore from '@/components/ReadinessScore';

const TrendsAndInsights = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'metrics' | 'assessment'>('metrics');
  const lastReading = getLastReading();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <StatusBar />
      
      {/* Header */}
      <header className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <button 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="text-gray-800" size={18} />
              </button>
              <h1 className="text-xl font-semibold text-gray-900">Trends & Insights</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
                <Calendar className="text-gray-800" size={18} />
              </button>
              <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100">
                <MoreVertical className="text-gray-800" size={18} />
              </button>
            </div>
          </div>
          
          <Tabs 
            defaultValue="metrics" 
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as 'metrics' | 'assessment')}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full bg-transparent p-0">
              <TabsTrigger 
                value="metrics"
                className={`py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'metrics' 
                  ? 'text-blue-900 border-blue-900' 
                  : 'text-gray-500 border-transparent'
                } rounded-none`}
              >
                Health Metrics
              </TabsTrigger>
              <TabsTrigger 
                value="assessment"
                className={`py-2 text-sm font-medium border-b-2 ${
                  activeTab === 'assessment' 
                  ? 'text-blue-900 border-blue-900' 
                  : 'text-gray-500 border-transparent'
                } rounded-none`}
              >
                Daily Assessment
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {activeTab === 'metrics' ? (
          <div className="px-4 py-6">
            {/* Readiness Score - passing showDetailed prop as true for the full version */}
            <section className="mb-8">
              <ReadinessScore className="mb-8" showDetailed={true} />
            </section>
            
            {/* Quick Stats */}
            <section className="mb-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Heart Rate</span>
                    <div className="text-red-500">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-semibold text-gray-900">{lastReading?.hr ?? 72}</span>
                    <span className="ml-1 text-sm text-gray-500">bpm</span>
                  </div>
                  <span className="text-xs text-green-600 flex items-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                      <path fillRule="evenodd" d="M20.03 4.72a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 11.69l6.97-6.97a.75.75 0 011.06 0z" clipRule="evenodd" />
                    </svg>
                    3% from yesterday
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-500">Sleep</span>
                    <div className="text-blue-900">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-2xl font-semibold text-gray-900">7.5</span>
                    <span className="ml-1 text-sm text-gray-500">hrs</span>
                  </div>
                  <span className="text-xs text-red-600 flex items-center mt-1">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 mr-1">
                      <path fillRule="evenodd" d="M20.03 4.72a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 11.69l6.97-6.97a.75.75 0 011.06 0z" clipRule="evenodd" />
                    </svg>
                    1hr less than avg
                  </span>
                </div>
              </div>
            </section>

            {/* Weekly Trends */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Trends</h2>
              <div className="bg-white p-4 rounded-xl shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-gray-700">Heart Rate Variation</span>
                  <div className="flex space-x-2">
                    <button className="px-2 py-1 text-xs text-blue-900 bg-blue-100 rounded-full">Week</button>
                    <button className="px-2 py-1 text-xs text-gray-500 rounded-full">Month</button>
                  </div>
                </div>
                
                <WeeklyBarChart />
              </div>
            </section>

            {/* Daily Health Metrics */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Daily Health Metrics</h2>
              
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-600">
                        <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
                        <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900">Heart Rate Variability</h3>
                        <span className="ml-2 text-green-600 text-sm">+15%</span>
                      </div>
                      <p className="text-sm text-gray-500">Improved recovery compared to yesterday</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-600">
                        <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900">Sleep Duration</h3>
                        <span className="ml-2 text-red-600 text-sm">-1.5hrs</span>
                      </div>
                      <p className="text-sm text-gray-500">Below your weekly average</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-blue-600">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-4.125 9.75a.75.75 0 01.75-.75h6.75a.75.75 0 010 1.5H8.625a.75.75 0 01-.75-.75z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center">
                        <h3 className="font-medium text-gray-900">Hydration</h3>
                        <span className="ml-2 text-blue-600 text-sm">+500ml</span>
                      </div>
                      <p className="text-sm text-gray-500">Above target for the day</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <DailyAssessmentTab />
        )}
      </main>

      <BottomNavbar />
    </div>
  );
};

export default TrendsAndInsights;
