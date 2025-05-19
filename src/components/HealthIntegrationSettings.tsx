import React, { useState, useEffect } from 'react';
import { Apple, Activity, Database, AlertCircle, ExternalLink, Check, Plus, Info, XCircle, ChevronRight, Cog, RefreshCw } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import HealthDataService, { HealthPlatform, HealthDataType } from '@/integrations/health/HealthDataService';
import EHRAdapter, { EHRSystem, EHRAuthMethod } from '@/integrations/health/EHRAdapter';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from './ui/card';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

interface HealthIntegrationSettingsProps {
  className?: string;
  onComplete?: () => void;
}

export function HealthIntegrationSettings({ className, onComplete }: HealthIntegrationSettingsProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const [availablePlatforms, setAvailablePlatforms] = useState<HealthPlatform[]>([]);
  const [configuredPlatforms, setConfiguredPlatforms] = useState<Record<HealthPlatform, boolean>>({
    [HealthPlatform.APPLE_HEALTH]: false,
    [HealthPlatform.GOOGLE_FIT]: false,
    [HealthPlatform.EHR]: false,
    [HealthPlatform.NESTOR]: true
  });
  
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showEhrDialog, setShowEhrDialog] = useState(false);
  const [ehrConfig, setEhrConfig] = useState({
    system: EHRSystem.EPIC,
    baseUrl: '',
    authMethod: EHRAuthMethod.SMART_ON_FHIR,
    clientId: '',
    clientSecret: '',
    scope: 'patient/*.read'
  });
  
  const [selectedHealthTypes, setSelectedHealthTypes] = useState<Record<HealthDataType, boolean>>({
    [HealthDataType.HEART_RATE]: true,
    [HealthDataType.BLOOD_OXYGEN]: true,
    [HealthDataType.TEMPERATURE]: true,
    [HealthDataType.STEPS]: true,
    [HealthDataType.SLEEP]: true,
    [HealthDataType.BLOOD_PRESSURE]: false,
    [HealthDataType.WEIGHT]: false,
    [HealthDataType.HEIGHT]: false,
    [HealthDataType.ACTIVITY]: true
  });
  
  // Load available platforms and configured platforms
  useEffect(() => {
    const loadPlatforms = async () => {
      try {
        if (!user?.id) return;
        
        setLoading(true);
        
        // Initialize HealthDataService for the user
        await HealthDataService.configure(user.id);
        
        // Get available platforms for this device
        const platforms = await HealthDataService.getAvailableDataSources();
        setAvailablePlatforms(platforms);
        
        // Get configured platforms
        const configs = HealthDataService.getConfiguredDataSources();
        
        const configStatus: Record<HealthPlatform, boolean> = {
          [HealthPlatform.APPLE_HEALTH]: false,
          [HealthPlatform.GOOGLE_FIT]: false,
          [HealthPlatform.EHR]: false,
          [HealthPlatform.NESTOR]: true
        };
        
        configs.forEach(config => {
          configStatus[config.platform] = config.enabled;
          
          // Load EHR config if available
          if (config.platform === HealthPlatform.EHR && config.settings) {
            setEhrConfig(config.settings);
          }
        });
        
        setConfiguredPlatforms(configStatus);
      } catch (error) {
        console.error('Error loading health platforms:', error);
        toast({
          title: 'Error',
          description: 'Failed to load health integration settings',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadPlatforms();
  }, [user?.id, toast]);
  
  // Toggle a platform
  const togglePlatform = async (platform: HealthPlatform) => {
    try {
      const isEnabled = configuredPlatforms[platform];
      
      if (isEnabled) {
        // Disable the platform
        await HealthDataService.disableDataSource(platform);
      } else {
        // Special handling for EHR platform
        if (platform === HealthPlatform.EHR) {
          setShowEhrDialog(true);
          return;
        }
        
        // Enable the platform and request permissions
        await HealthDataService.enableDataSource(platform);
        
        // Request permissions for the selected health data types
        const dataTypes = Object.entries(selectedHealthTypes)
          .filter(([_, selected]) => selected)
          .map(([type]) => type as HealthDataType);
          
        const permissionsGranted = await HealthDataService.requestPermissions(platform, dataTypes);
        
        if (!permissionsGranted) {
          toast({
            title: 'Permissions Required',
            description: `Please grant access to your health data in ${platform}`,
            variant: 'warning'
          });
          return;
        }
      }
      
      // Update UI
      setConfiguredPlatforms(prev => ({
        ...prev,
        [platform]: !isEnabled
      }));
      
      // Save configurations
      if (user?.id) {
        await HealthDataService.saveDataSourceConfigs(user.id);
      }
      
      // Show success message
      toast({
        title: isEnabled ? 'Integration Disabled' : 'Integration Enabled',
        description: `${getPlatformName(platform)} integration has been ${isEnabled ? 'disabled' : 'enabled'}`,
        variant: 'default'
      });
    } catch (error) {
      console.error(`Error toggling ${platform}:`, error);
      toast({
        title: 'Error',
        description: `Failed to ${configuredPlatforms[platform] ? 'disable' : 'enable'} ${getPlatformName(platform)} integration`,
        variant: 'destructive'
      });
    }
  };
  
  // Save EHR configuration
  const saveEhrConfig = async () => {
    try {
      // Validate required fields
      if (!ehrConfig.baseUrl || !ehrConfig.clientId) {
        toast({
          title: 'Missing Required Fields',
          description: 'Please provide all required information',
          variant: 'destructive'
        });
        return;
      }
      
      // Enable EHR data source with config
      await HealthDataService.enableDataSource(HealthPlatform.EHR, ehrConfig);
      
      // Update UI
      setConfiguredPlatforms(prev => ({
        ...prev,
        [HealthPlatform.EHR]: true
      }));
      
      // Save configurations
      if (user?.id) {
        await HealthDataService.saveDataSourceConfigs(user.id);
      }
      
      // Close dialog
      setShowEhrDialog(false);
      
      // Show success message
      toast({
        title: 'EHR Integration Configured',
        description: `Your ${ehrConfig.system} EHR integration has been set up`,
        variant: 'default'
      });
    } catch (error) {
      console.error('Error configuring EHR:', error);
      toast({
        title: 'Configuration Error',
        description: 'Failed to configure EHR integration',
        variant: 'destructive'
      });
    }
  };
  
  // Sync data from a platform
  const syncDataFromPlatform = async (platform: HealthPlatform) => {
    try {
      if (!user?.id) return;
      
      setSyncing(true);
      
      // Get selected data types
      const dataTypes = Object.entries(selectedHealthTypes)
        .filter(([_, selected]) => selected)
        .map(([type]) => type as HealthDataType);
      
      // Calculate date range (last 30 days)
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      // Import data
      const data = await HealthDataService.importData(
        platform,
        dataTypes,
        user.id,
        startDate,
        endDate
      );
      
      toast({
        title: 'Data Synced',
        description: `Imported ${data.length} data points from ${getPlatformName(platform)}`,
        variant: 'default'
      });
      
      // Save updated configurations
      await HealthDataService.saveDataSourceConfigs(user.id);
    } catch (error) {
      console.error(`Error syncing data from ${platform}:`, error);
      toast({
        title: 'Sync Error',
        description: `Failed to sync data from ${getPlatformName(platform)}`,
        variant: 'destructive'
      });
    } finally {
      setSyncing(false);
    }
  };
  
  // Helper function to get platform name
  const getPlatformName = (platform: HealthPlatform): string => {
    switch (platform) {
      case HealthPlatform.APPLE_HEALTH:
        return 'Apple Health';
      case HealthPlatform.GOOGLE_FIT:
        return 'Google Fit';
      case HealthPlatform.EHR:
        return 'Electronic Health Record';
      case HealthPlatform.NESTOR:
        return 'Nestor Health';
      default:
        return platform;
    }
  };
  
  // Helper function to get platform icon
  const getPlatformIcon = (platform: HealthPlatform) => {
    switch (platform) {
      case HealthPlatform.APPLE_HEALTH:
        return <Apple className="h-5 w-5 text-green-600" />;
      case HealthPlatform.GOOGLE_FIT:
        return <Activity className="h-5 w-5 text-blue-600" />;
      case HealthPlatform.EHR:
        return <Database className="h-5 w-5 text-purple-600" />;
      case HealthPlatform.NESTOR:
        return <Activity className="h-5 w-5 text-brand-primary" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };
  
  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Health Data Integrations</h2>
        <p className="text-muted-foreground">
          Connect Nestor with other health platforms to sync your health data.
        </p>
      </div>

      {/* Health Data Types Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Activity className="mr-2 h-5 w-5 text-brand-primary" />
            Health Data Types
          </CardTitle>
          <CardDescription>
            Select which types of health data you want to sync
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(selectedHealthTypes).map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox 
                  id={`health-type-${type}`}
                  checked={selectedHealthTypes[type as HealthDataType]} 
                  onCheckedChange={(checked) => {
                    setSelectedHealthTypes(prev => ({
                      ...prev,
                      [type]: !!checked
                    }));
                  }}
                />
                <Label htmlFor={`health-type-${type}`} className="text-sm">
                  {type === HealthDataType.HEART_RATE ? 'Heart Rate' :
                   type === HealthDataType.BLOOD_OXYGEN ? 'Blood Oxygen' :
                   type === HealthDataType.TEMPERATURE ? 'Body Temperature' :
                   type === HealthDataType.STEPS ? 'Steps' :
                   type === HealthDataType.SLEEP ? 'Sleep' :
                   type === HealthDataType.BLOOD_PRESSURE ? 'Blood Pressure' :
                   type === HealthDataType.WEIGHT ? 'Weight' :
                   type === HealthDataType.HEIGHT ? 'Height' :
                   type === HealthDataType.ACTIVITY ? 'Activity' : 
                   type}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Connected Platforms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Database className="mr-2 h-5 w-5 text-brand-primary" />
            Connected Platforms
          </CardTitle>
          <CardDescription>
            Manage health data platforms integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-6 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-brand-primary"></div>
            </div>
          ) : (
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-4">
                {availablePlatforms.map((platform) => (
                  <div key={platform} className="flex flex-col">
                    <div className="flex items-center justify-between py-3">
                      <div className="flex items-center space-x-3">
                        {getPlatformIcon(platform)}
                        <div>
                          <h3 className="font-medium">{getPlatformName(platform)}</h3>
                          {platform === HealthPlatform.APPLE_HEALTH && (
                            <p className="text-sm text-muted-foreground">Connect to Apple Health data</p>
                          )}
                          {platform === HealthPlatform.GOOGLE_FIT && (
                            <p className="text-sm text-muted-foreground">Connect to Google Fit data</p>
                          )}
                          {platform === HealthPlatform.EHR && (
                            <p className="text-sm text-muted-foreground">Connect to your medical records</p>
                          )}
                          {platform === HealthPlatform.NESTOR && (
                            <p className="text-sm text-muted-foreground">Nestor's internal health data</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {platform !== HealthPlatform.NESTOR && (
                          <Switch 
                            checked={configuredPlatforms[platform]}
                            onCheckedChange={() => togglePlatform(platform)}
                            disabled={platform === HealthPlatform.NESTOR}
                          />
                        )}
                        
                        {/* Badge to show connection status */}
                        {platform === HealthPlatform.NESTOR ? (
                          <Badge variant="outline" className="bg-brand-primary/10 text-brand-primary border-brand-primary/20">
                            <Check className="mr-1 h-3 w-3" />
                            Built-in
                          </Badge>
                        ) : configuredPlatforms[platform] ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                            <Check className="mr-1 h-3 w-3" />
                            Connected
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                            Disconnected
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {/* Show sync button if platform is connected */}
                    {configuredPlatforms[platform] && platform !== HealthPlatform.NESTOR && (
                      <div className="ml-8 mb-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => syncDataFromPlatform(platform)}
                          disabled={syncing}
                        >
                          {syncing ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Syncing...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Sync Data Now
                            </>
                          )}
                        </Button>
                        
                        {/* EHR settings button */}
                        {platform === HealthPlatform.EHR && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setShowEhrDialog(true)}
                            className="ml-2"
                          >
                            <Cog className="mr-2 h-4 w-4" />
                            Settings
                          </Button>
                        )}
                      </div>
                    )}
                    
                    <Separator className="mt-2" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <Info className="mr-2 h-4 w-4" />
            Your data is securely synchronized and stored
          </div>
          {onComplete && (
            <Button onClick={onComplete}>
              Save & Continue
            </Button>
          )}
        </CardFooter>
      </Card>
      
      {/* EHR Configuration Dialog */}
      <Dialog open={showEhrDialog} onOpenChange={setShowEhrDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configure EHR Integration</DialogTitle>
            <DialogDescription>
              Enter the details to connect to your Electronic Health Record system
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>EHR System</Label>
              <Select 
                value={ehrConfig.system} 
                onValueChange={(value) => setEhrConfig({...ehrConfig, system: value as EHRSystem})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select EHR System" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EHRSystem.EPIC}>Epic</SelectItem>
                  <SelectItem value={EHRSystem.CERNER}>Cerner</SelectItem>
                  <SelectItem value={EHRSystem.ALLSCRIPTS}>Allscripts</SelectItem>
                  <SelectItem value={EHRSystem.MEDITECH}>Meditech</SelectItem>
                  <SelectItem value={EHRSystem.ATHENAHEALTH}>athenahealth</SelectItem>
                  <SelectItem value={EHRSystem.NEXTGEN}>NextGen</SelectItem>
                  <SelectItem value={EHRSystem.GENERIC_FHIR}>Generic FHIR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Authentication Method</Label>
              <Select 
                value={ehrConfig.authMethod} 
                onValueChange={(value) => setEhrConfig({...ehrConfig, authMethod: value as EHRAuthMethod})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Authentication Method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EHRAuthMethod.SMART_ON_FHIR}>SMART on FHIR</SelectItem>
                  <SelectItem value={EHRAuthMethod.OAUTH2}>OAuth 2.0</SelectItem>
                  <SelectItem value={EHRAuthMethod.CLIENT_CREDENTIALS}>Client Credentials</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Base URL <span className="text-red-500">*</span></Label>
              <Input 
                placeholder="https://fhir.example.org/api/fhir/r4"
                value={ehrConfig.baseUrl}
                onChange={(e) => setEhrConfig({...ehrConfig, baseUrl: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                The base URL of the FHIR API
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Client ID <span className="text-red-500">*</span></Label>
              <Input 
                placeholder="client_id"
                value={ehrConfig.clientId}
                onChange={(e) => setEhrConfig({...ehrConfig, clientId: e.target.value})}
              />
            </div>
            
            {ehrConfig.authMethod === EHRAuthMethod.CLIENT_CREDENTIALS && (
              <div className="space-y-2">
                <Label>Client Secret</Label>
                <Input 
                  type="password"
                  placeholder="client_secret"
                  value={ehrConfig.clientSecret}
                  onChange={(e) => setEhrConfig({...ehrConfig, clientSecret: e.target.value})}
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Scope</Label>
              <Input 
                placeholder="patient/*.read"
                value={ehrConfig.scope}
                onChange={(e) => setEhrConfig({...ehrConfig, scope: e.target.value})}
              />
              <p className="text-xs text-muted-foreground">
                The OAuth scope(s) required for accessing health data
              </p>
            </div>
            
            <div className="flex items-center p-3 text-sm rounded-md bg-blue-50 text-blue-700">
              <Info className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>
                You may need to register this application with your healthcare provider first. 
                Contact your provider's IT department for assistance.
              </span>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowEhrDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveEhrConfig}>
              Save & Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 