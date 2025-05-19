import React, { useState, useEffect } from 'react';
import activityClassifier, { ActivityType, AccelerometerData, ActivityClassification } from '@/lib/ml/models/activityClassifier';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Info, Activity, BarChart2, Play, Pause, Save, RotateCcw } from 'lucide-react';
import mlService from '@/services/ml';
import * as tf from '@tensorflow/tfjs';
import tfService from '@/services/ml/tfService';

// Generate mock accelerometer data for testing
const generateMockAccData = (activityType: ActivityType): AccelerometerData[] => {
  const data: AccelerometerData[] = [];
  const now = Date.now();
  
  // Generate 3 data points
  for (let i = 0; i < 3; i++) {
    let x, y, z;
    
    switch (activityType) {
      case ActivityType.STATIONARY:
        // Low movement values
        x = Math.random() * 0.3 - 0.15;
        y = Math.random() * 0.3 - 0.15;
        z = 9.8 + (Math.random() * 0.3 - 0.15); // Gravity + small noise
        break;
      case ActivityType.WALKING:
        // Moderate regular movement
        x = Math.sin(i) * 2 + (Math.random() * 0.5 - 0.25);
        y = Math.cos(i) * 2 + (Math.random() * 0.5 - 0.25);
        z = 9.8 + Math.sin(i) * 1.5;
        break;
      case ActivityType.RUNNING:
        // Higher amplitude, higher frequency
        x = Math.sin(i * 2) * 4 + (Math.random() * 1 - 0.5);
        y = Math.cos(i * 2) * 4 + (Math.random() * 1 - 0.5);
        z = 9.8 + Math.sin(i * 2) * 3;
        break;
      case ActivityType.CYCLING:
        // Regular circular motion
        x = Math.sin(i * 1.5) * 3 + (Math.random() * 0.7 - 0.35);
        y = Math.cos(i * 1.5) * 1 + (Math.random() * 0.7 - 0.35);
        z = 9.8 + Math.sin(i * 0.5) * 0.7;
        break;
      default:
        x = Math.random() * 2 - 1;
        y = Math.random() * 2 - 1;
        z = 9.8 + (Math.random() * 2 - 1);
        break;
    }
    
    data.push({
      x,
      y,
      z,
      timestamp: now + (i * 100) // 100ms intervals
    });
  }
  
  return data;
};

// Generate training dataset with labels
const generateTrainingData = () => {
  const trainingData: AccelerometerData[][] = [];
  const labels: ActivityType[] = [];
  
  // Generate 40 samples for each activity type
  for (let activity = 0; activity < 4; activity++) {
    for (let i = 0; i < 40; i++) {
      trainingData.push(generateMockAccData(activity as ActivityType));
      labels.push(activity as ActivityType);
    }
  }
  
  return { trainingData, labels };
};

const ActivityClassifierDemo: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentActivity, setCurrentActivity] = useState<ActivityClassification | null>(null);
  const [collecting, setCollecting] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>(ActivityType.STATIONARY);
  const [collectedData, setCollectedData] = useState<{
    [key in ActivityType]: AccelerometerData[][]
  }>({
    [ActivityType.STATIONARY]: [],
    [ActivityType.WALKING]: [],
    [ActivityType.RUNNING]: [],
    [ActivityType.CYCLING]: []
  });
  const [trainingProgress, setTrainingProgress] = useState<{progress: number, status: string} | null>(null);
  const [modelInfo, setModelInfo] = useState<any>(null);
  
  // Initialize the activity classifier
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const success = await activityClassifier.initialize();
        if (success) {
          setInitialized(true);
          // Try to get model info
          const models = mlService.listModels();
          const activityModel = models.find(m => m.name === 'activity-classifier');
          if (activityModel) {
            setModelInfo(activityModel);
          }
        } else {
          setError('Failed to initialize activity classifier');
        }
      } catch (err) {
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
    
    init();
  }, []);
  
  // Simulate data collection when collecting is true
  useEffect(() => {
    let interval: number;
    
    if (collecting) {
      interval = window.setInterval(() => {
        const newData = generateMockAccData(selectedActivity);
        
        setCollectedData(prev => ({
          ...prev,
          [selectedActivity]: [...prev[selectedActivity], newData]
        }));
      }, 500);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [collecting, selectedActivity]);
  
  // Classify based on most recent data
  const classifyActivity = async () => {
    setLoading(true);
    try {
      // Generate a single data point
      const mockData = generateMockAccData(Math.floor(Math.random() * 4) as ActivityType);
      const result = await activityClassifier.classifyActivity(mockData);
      setCurrentActivity(result);
    } catch (err) {
      setError(`Classification error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };
  
  // Train the model with collected data
  const trainModel = async () => {
    setTrainingProgress({ progress: 0, status: 'Preparing training data...' });
    
    try {
      // Prepare training data
      let allData: AccelerometerData[][] = [];
      let allLabels: ActivityType[] = [];
      
      // Check if we have collected data
      const hasCollectedData = Object.values(collectedData).some(data => data.length > 0);
      
      if (hasCollectedData) {
        // Use collected data
        Object.entries(collectedData).forEach(([activityType, dataArray]) => {
          dataArray.forEach(data => {
            allData.push(data);
            allLabels.push(parseInt(activityType) as ActivityType);
          });
        });
        
        setTrainingProgress({ progress: 10, status: 'Using collected data for training' });
      } else {
        // Use generated data
        setTrainingProgress({ progress: 10, status: 'Generating synthetic training data' });
        const { trainingData, labels } = generateTrainingData();
        allData = trainingData;
        allLabels = labels;
      }
      
      setTrainingProgress({ progress: 20, status: 'Starting training...' });
      
      // Train the model
      const success = await activityClassifier.trainModel(
        allData,
        allLabels,
        20, // epochs
      );
      
      if (success) {
        setTrainingProgress({ progress: 100, status: 'Training completed successfully!' });
        // Update model info
        const models = mlService.listModels();
        const activityModel = models.find(m => m.name === 'activity-classifier');
        if (activityModel) {
          setModelInfo(activityModel);
        }
      } else {
        setTrainingProgress({ progress: 100, status: 'Training failed.' });
        setError('Model training failed');
      }
    } catch (err) {
      setTrainingProgress({ progress: 100, status: 'Training error' });
      setError(`Training error: ${err instanceof Error ? err.message : String(err)}`);
    }
    
    // Reset progress after a delay
    setTimeout(() => {
      setTrainingProgress(null);
    }, 3000);
  };
  
  // Reset collected data
  const resetData = () => {
    setCollectedData({
      [ActivityType.STATIONARY]: [],
      [ActivityType.WALKING]: [],
      [ActivityType.RUNNING]: [],
      [ActivityType.CYCLING]: []
    });
    setCurrentActivity(null);
  };
  
  // Toggle data collection
  const toggleCollection = () => {
    setCollecting(!collecting);
  };
  
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          <span>Activity Classifier Demo</span>
        </CardTitle>
        <CardDescription>
          Demonstrates ML capabilities using TensorFlow.js for activity classification
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="mb-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-medium mb-2">Model Status</h3>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant={initialized ? "success" : "destructive"}>
                  {initialized ? "Initialized" : "Not Initialized"}
                </Badge>
                {loading && <Badge variant="outline">Processing...</Badge>}
              </div>
              
              {modelInfo && (
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Name:</span> {modelInfo.name}</p>
                  <p><span className="font-medium">Version:</span> {modelInfo.version}</p>
                  <p><span className="font-medium">Last Updated:</span> {new Date(modelInfo.updatedAt).toLocaleString()}</p>
                  {modelInfo.metrics && modelInfo.metrics.accuracy && (
                    <p><span className="font-medium">Accuracy:</span> {Math.round(modelInfo.metrics.accuracy * 100)}%</p>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <h3 className="text-sm font-medium mb-2">Latest Prediction</h3>
              {currentActivity ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{activityClassifier.getActivityName(currentActivity.activityType)}</span>
                    <Badge variant="outline">{Math.round(currentActivity.confidence * 100)}% confidence</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Predicted at: {currentActivity.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">
                  No prediction yet. Click "Classify Activity" to test the model.
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="predict" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="predict" className="flex-1">Predict</TabsTrigger>
            <TabsTrigger value="collect" className="flex-1">Collect Data</TabsTrigger>
            <TabsTrigger value="train" className="flex-1">Train Model</TabsTrigger>
          </TabsList>
          
          <TabsContent value="predict" className="py-4">
            <div className="flex flex-col items-center space-y-4">
              <p className="text-sm text-center max-w-md">
                Click the button below to generate random accelerometer data and classify the activity.
              </p>
              <Button 
                onClick={classifyActivity} 
                disabled={!initialized || loading}
                className="w-full max-w-xs"
              >
                <BarChart2 className="h-4 w-4 mr-2" />
                Classify Activity
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="collect" className="py-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(collectedData).map((activity, index) => (
                  <Button
                    key={activity}
                    variant={selectedActivity === Number(activity) ? "default" : "outline"}
                    onClick={() => setSelectedActivity(Number(activity) as ActivityType)}
                    className="justify-between"
                  >
                    <span>{activityClassifier.getActivityName(Number(activity) as ActivityType)}</span>
                    <Badge variant="secondary">
                      {collectedData[Number(activity) as ActivityType].length} samples
                    </Badge>
                  </Button>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={toggleCollection}
                  variant={collecting ? "destructive" : "default"}
                  className="flex-1"
                >
                  {collecting ? (
                    <>
                      <Pause className="h-4 w-4 mr-2" />
                      Stop Collection
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Start Collection
                    </>
                  )}
                </Button>
                <Button
                  onClick={resetData}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset Data
                </Button>
              </div>
              
              {collecting && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Collecting Data</AlertTitle>
                  <AlertDescription>
                    Capturing simulated accelerometer data for {activityClassifier.getActivityName(selectedActivity)}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="train" className="py-4">
            <div className="space-y-4">
              <p className="text-sm">
                Train the activity classifier with collected data. If no data has been collected,
                synthetic training data will be generated.
              </p>
              
              {trainingProgress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{trainingProgress.status}</span>
                    <span>{trainingProgress.progress}%</span>
                  </div>
                  <Progress value={trainingProgress.progress} />
                </div>
              )}
              
              <Button
                onClick={trainModel}
                disabled={loading || trainingProgress !== null}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Train Model
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <div>
          Using TensorFlow.js v{tf.version_core || '4.x'} with {tfService.getBackend()} backend
        </div>
        <div>
          Powered by Nestor ML Framework
        </div>
      </CardFooter>
    </Card>
  );
};

export default ActivityClassifierDemo; 