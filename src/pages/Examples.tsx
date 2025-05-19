import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lightbulb, Search, Database, HeartPulse, FileWarning, Wifi, Award, Zap, Check, Trophy } from 'lucide-react';
import StatusBar from '@/components/StatusBar';
import BottomNavbar from '@/components/BottomNavbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState, NetworkErrorState, DataLoadErrorState, PermissionErrorState } from '@/components/ui/error-state';
import { Celebration, useCelebration } from '@/components/ui/celebration';
import { motion } from 'framer-motion';

const Examples = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { celebrate, celebrationComponent } = useCelebration();
  const [activeTab, setActiveTab] = useState('animations');
  
  // Show a sample toast notification
  const showToast = (variant: 'default' | 'destructive') => {
    toast({
      title: variant === 'default' ? 'Success!' : 'Error!',
      description: variant === 'default' 
        ? 'Your changes have been saved successfully.' 
        : 'There was a problem with your request.',
      variant
    });
  };
  
  // Show a celebration
  const showCelebration = (type: 'success' | 'achievement' | 'milestone') => {
    const messages = {
      success: 'Great job!',
      achievement: 'Achievement Unlocked!',
      milestone: 'New Milestone Reached!'
    };
    
    celebrate({
      variant: type,
      message: messages[type],
      duration: 3000
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <StatusBar />
      
      {/* Header */}
      <header className="bg-white px-4 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button 
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="text-gray-800" size={18} />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Phase 5 Examples</h1>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="p-4 pb-24">
        <Tabs defaultValue="animations" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="w-full">
            <TabsTrigger value="animations" className="flex-1">Animations</TabsTrigger>
            <TabsTrigger value="empty-states" className="flex-1">Empty States</TabsTrigger>
            <TabsTrigger value="error-states" className="flex-1">Error States</TabsTrigger>
            <TabsTrigger value="celebrations" className="flex-1">Celebrations</TabsTrigger>
          </TabsList>
          
          {/* Animations Examples */}
          <TabsContent value="animations" className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Button Animation</CardTitle>
                <CardDescription>Hover, click, and focus states with animations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Button className="group relative overflow-hidden">
                    <span className="relative z-10">Click Me</span>
                    <motion.span 
                      className="absolute inset-0 bg-blue-600 z-0" 
                      initial={{ scale: 0, opacity: 0 }}
                      whileTap={{ scale: 1.5, opacity: 0.4 }}
                      transition={{ duration: 0.5 }}
                    />
                  </Button>
                  
                  <Button variant="outline" className="group">
                    <motion.span
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ ease: "easeOut" }}
                    >
                      Hover Me
                    </motion.span>
                    <motion.span
                      className="ml-1 opacity-0 group-hover:opacity-100"
                      initial={{ width: 0 }}
                      whileHover={{ width: 'auto' }}
                    >
                      →
                    </motion.span>
                  </Button>
                </div>
                
                <div className="pt-4">
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div 
                      className="p-4 bg-blue-50 rounded-lg border border-blue-100 flex items-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Lightbulb className="text-blue-500 mr-3" />
                      <p className="text-sm text-blue-700">
                        This card uses spring physics for natural motion. Try clicking or hovering!
                      </p>
                    </motion.div>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Page Transitions</CardTitle>
                <CardDescription>Smooth transitions between tab content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  {['Tab 1', 'Tab 2', 'Tab 3'].map((tab, index) => (
                    <Button 
                      key={tab} 
                      variant="outline" 
                      size="sm"
                      className={activeTab === 'animations' ? 'relative border-blue-200' : ''}
                      onClick={() => {
                        // This just simulates tab switching within the animations tab
                        if (index === 0) setActiveTab('animations');
                        if (index === 1) setActiveTab('empty-states');
                        if (index === 2) setActiveTab('error-states');
                      }}
                    >
                      {tab}
                      {activeTab === (
                        index === 0 ? 'animations' : 
                        index === 1 ? 'empty-states' : 
                        'error-states'
                      ) && (
                        <motion.div 
                          className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" 
                          layoutId="tabIndicator"
                        />
                      )}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Click the tabs above to see transitions between pages. Notice the animated indicator bar.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Empty States Examples */}
          <TabsContent value="empty-states" className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Empty States</CardTitle>
                <CardDescription>Friendly empty states with recovery actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <EmptyState
                  icon={Search}
                  title="No search results"
                  description="We couldn't find anything matching your search. Try adjusting your filters or search terms."
                  actionLabel="Clear Filters"
                  onAction={() => toast({ 
                    title: "Filters cleared", 
                    description: "Your search filters have been reset."
                  })}
                  secondaryActionLabel="Browse All"
                  onSecondaryAction={() => {}}
                />
                
                <EmptyState
                  variant="card"
                  icon={Database}
                  title="No data yet"
                  description="Once you start logging your health metrics, your personal insights will appear here."
                  actionLabel="Log a Reading"
                  onAction={() => navigate('/log')}
                />
                
                <EmptyState
                  variant="subtle"
                  size="sm"
                  icon={HeartPulse}
                  title="Connect your device"
                  description="Connect your wearable device to automatically sync your health data."
                  actionLabel="Connect Device"
                  onAction={() => {}}
                  secondaryActionLabel="Do it Later"
                  onSecondaryAction={() => {}}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Error States Examples */}
          <TabsContent value="error-states" className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Error States</CardTitle>
                <CardDescription>Friendly error messages with recovery options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <NetworkErrorState
                  onRetry={() => toast({ 
                    title: "Reconnecting", 
                    description: "Attempting to reconnect to the server..." 
                  })}
                />
                
                <DataLoadErrorState
                  onRetry={() => toast({ 
                    title: "Retrying", 
                    description: "Trying to load your data again..." 
                  })}
                />
                
                <PermissionErrorState
                  onRequestPermission={() => toast({ 
                    title: "Permission Requested", 
                    description: "Opening system dialog..." 
                  })}
                  onContinueWithout={() => toast({ 
                    title: "Continuing", 
                    description: "Some features will be limited." 
                  })}
                />
                
                <ErrorState
                  variant="card"
                  severity="warning"
                  icon={FileWarning}
                  title="Unable to save your progress"
                  description="Your changes couldn't be saved due to a temporary issue. Your data is safe, but you may need to re-enter your most recent changes."
                  primaryAction={{
                    label: "Try Again",
                    onClick: () => toast({ 
                      title: "Retrying", 
                      description: "Attempting to save your progress..." 
                    })
                  }}
                  secondaryAction={{
                    label: "Discard Changes",
                    onClick: () => toast({ 
                      title: "Changes Discarded", 
                      variant: "destructive"
                    })
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Celebrations Examples */}
          <TabsContent value="celebrations" className="mt-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Micro-Celebrations</CardTitle>
                <CardDescription>Celebrate user achievements with animations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    className="flex items-center"
                    onClick={() => showCelebration('success')}
                  >
                    <Check className="mr-2 h-4 w-4" />
                    Success
                  </Button>
                  
                  <Button 
                    className="flex items-center"
                    onClick={() => showCelebration('achievement')}
                  >
                    <Award className="mr-2 h-4 w-4" />
                    Achievement
                  </Button>
                  
                  <Button 
                    className="flex items-center"
                    onClick={() => showCelebration('milestone')}
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    Milestone
                  </Button>
                </div>
                
                <div className="pt-4 space-y-4">
                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-medium mb-2">Toast Notifications</h3>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => showToast('default')}
                      >
                        Success Toast
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => showToast('destructive')}
                      >
                        Error Toast
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      
      <BottomNavbar />
      
      {/* Celebration component for the page */}
      {celebrationComponent}
    </div>
  );
};

export default Examples; 