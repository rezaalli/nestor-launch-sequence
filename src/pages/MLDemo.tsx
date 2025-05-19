import React, { useEffect } from 'react';
import ActivityClassifierDemo from '@/components/demos/ActivityClassifierDemo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Brain } from 'lucide-react';

const MLDemoPage: React.FC = () => {
  // Update document title on component mount
  useEffect(() => {
    document.title = 'ML Demos | Nestor Health';
  }, []);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold flex items-center">
          <Brain className="h-8 w-8 mr-2" />
          Machine Learning Demos
        </h1>
        <p className="text-muted-foreground">
          Explore the ML capabilities of the Nestor Health app
        </p>
      </div>
      
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>About this demo</AlertTitle>
        <AlertDescription>
          These demos showcase on-device machine learning capabilities using TensorFlow.js.
          All processing happens in your browser, with no data sent to external servers.
        </AlertDescription>
      </Alert>
      
      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="w-full max-w-md mx-auto">
          <TabsTrigger value="activity" className="flex-1">Activity Recognition</TabsTrigger>
          <TabsTrigger value="insights" className="flex-1" disabled>Health Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="mt-6">
          <ActivityClassifierDemo />
        </TabsContent>
        
        <TabsContent value="insights" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Health Insights Demo</CardTitle>
              <CardDescription>Coming soon</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This demo will showcase personalized health insights based on activity patterns and health metrics.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">About the ML Framework</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            The Nestor ML Framework provides a comprehensive solution for integrating machine learning into health applications.
            Key features include:
          </p>
          
          <ul className="list-disc pl-6 space-y-2">
            <li>
              <span className="font-medium">On-device Processing</span>: All ML operations run directly on your device, ensuring privacy and real-time performance.
            </li>
            <li>
              <span className="font-medium">Model Registry</span>: Centralized management of ML models with versioning support.
            </li>
            <li>
              <span className="font-medium">Error Handling</span>: Robust error detection and reporting for ML operations.
            </li>
            <li>
              <span className="font-medium">Ethical Considerations</span>: Design principles that prioritize fairness, transparency, and user privacy.
            </li>
          </ul>
          
          <p className="text-sm text-muted-foreground">
            These demos are for educational purposes and showcase the technical capabilities of the framework.
            In production, the models would be pre-trained and fine-tuned with high-quality data.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MLDemoPage; 