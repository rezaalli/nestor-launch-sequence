
import React, { useState } from 'react';
import { ArrowLeft, MoreVertical, Heart, Moon, ArrowDown, ChartLine, HeartPulse, ChevronRight, Thermometer, FileText, AlertTriangle, Info, Check } from 'lucide-react';
import StatusBar from '@/components/StatusBar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import WeeklyTrendChart, { ReadingType } from '@/components/WeeklyTrendChart';
import BottomNavbar from '@/components/BottomNavbar';
import { getLastReading } from '@/utils/bleUtils';
import { useAssessment } from '@/contexts/AssessmentContext';
import { HealthPattern, getRecentPatterns } from '@/utils/patternDetection';
import { Badge } from '@/components/ui/badge';
import { useToast } from "@/hooks/use-toast";

const TrendsAndInsights = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMetric, setSelectedMetric] = useState<ReadingType>('heartRate');
  const lastReading = getLastReading();
  const { healthPatterns, getReadinessHistory } = useAssessment();
  
  // Get patterns from the last 7 days
  const recentPatterns = getRecentPatterns(healthPatterns, 7);
  
  // Get readiness trend data
  const readinessTrend = getReadinessHistory(7);
  
  // Handle pattern click for more details
  const handlePatternClick = (pattern: HealthPattern) => {
    toast({
      title: pattern.type,
      description: pattern.recommendation,
      duration: 5000,
    });
  };
  
  // Get icon for health pattern based on type
  const getPatternIcon = (pattern: HealthPattern) => {
    const type = pattern.type.toLowerCase();
    
    if (type.includes('sleep')) return Moon;
    if (type.includes('heart') || type.includes('cardiac')) return Heart;
    if (type.includes('alcohol') || type.includes('hydration')) return Thermometer;
    if (type.includes('exercise') || type.includes('activity')) return HeartPulse;
    if (type.includes('stress') || type.includes('anxiety')) return AlertTriangle;
    return Info;
  };
  
  // Get color for risk level
  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
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
                  <span className="text-2xl font-semibold text-nestor-gray-900">
                    {readinessTrend.length > 0 ? readinessTrend[readinessTrend.length - 1].score : (lastReading?.readiness ?? 82)}
                  </span>
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

        {/* Enhanced Chart with Metric Selection */}
        <section className="mb-8">
          <WeeklyTrendChart 
            key="trends-chart"
            dataType={selectedMetric}
            allowMetricChange={true}
            onViewAllClick={() => navigate('/trends')}
          />
        </section>
        
        {/* Health Patterns Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-nestor-gray-900 mb-4">Health Patterns</h2>
          
          {recentPatterns.length > 0 ? (
            <div className="space-y-4">
              {recentPatterns.map((pattern, index) => {
                const PatternIcon = getPatternIcon(pattern);
                const riskColorClass = getRiskColor(pattern.riskLevel);
                
                return (
                  <Card key={pattern.id || index} className="rounded-xl shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <PatternIcon className="text-blue-600" size={18} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-nestor-gray-900">{pattern.type}</h3>
                              <Badge className={riskColorClass}>{pattern.riskLevel}</Badge>
                            </div>
                            <p className="text-sm text-nestor-gray-500">{pattern.description}</p>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="rounded-full"
                          onClick={() => handlePatternClick(pattern)}
                        >
                          <ChevronRight className="text-nestor-gray-400" size={16} />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="rounded-xl shadow-sm bg-blue-50">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-2">
                  <Check className="text-blue-600" size={20} />
                </div>
                <h3 className="font-medium text-nestor-gray-900 mb-1">No Patterns Detected</h3>
                <p className="text-sm text-nestor-gray-600">
                  We'll notify you when we detect important patterns in your health data.
                </p>
              </CardContent>
            </Card>
          )}
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

          {/* Reports Button - moved to bottom */}
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2 py-5 mt-4 bg-white border-gray-200 hover:bg-gray-50"
            onClick={() => navigate('/reports')}
          >
            <FileText className="text-blue-600" size={18} />
            <span className="font-medium">View Detailed Reports</span>
          </Button>
        </section>
      </main>

      <BottomNavbar />
    </div>
  );
};

export default TrendsAndInsights;
