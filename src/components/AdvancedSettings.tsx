import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Info } from 'lucide-react';

export interface AdvancedSettingsValues {
  powerSaving: boolean;
  dataSyncFrequency: number; // minutes
  locationTracking: boolean;
  developerMode: boolean;
  dataCollection: boolean;
}

interface AdvancedSettingsProps {
  onClose: () => void;
  onSave: (settings: AdvancedSettingsValues) => void;
  initialSettings?: Partial<AdvancedSettingsValues>;
}

const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({
  onClose,
  onSave,
  initialSettings,
}) => {
  const [settings, setSettings] = useState<AdvancedSettingsValues>({
    powerSaving: initialSettings?.powerSaving ?? true,
    dataSyncFrequency: initialSettings?.dataSyncFrequency ?? 30,
    locationTracking: initialSettings?.locationTracking ?? false,
    developerMode: initialSettings?.developerMode ?? false,
    dataCollection: initialSettings?.dataCollection ?? true
  });

  const [activeTab, setActiveTab] = useState<'general' | 'privacy' | 'developer'>('general');

  const handleSave = () => {
    onSave(settings);
    onClose();
  };

  return (
    <Card className="w-full max-w-md mx-auto border rounded-lg overflow-hidden">
      <div className="p-4">
        <h2 className="text-lg font-medium mb-4 text-center">Advanced Settings</h2>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="developer">Developer</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4 min-h-[250px]">
            <div className="flex items-center justify-between">
              <Label htmlFor="power-saving" className="flex-1">
                Power Saving Mode
                <p className="text-xs text-muted-foreground mt-1">Extends battery life by reducing feature usage</p>
              </Label>
              <Switch
                id="power-saving"
                checked={settings.powerSaving}
                onCheckedChange={(checked) => setSettings({ ...settings, powerSaving: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Data Sync Frequency: Every {settings.dataSyncFrequency} minutes</Label>
              </div>
              <Slider
                value={[settings.dataSyncFrequency]}
                min={5}
                max={60}
                step={5}
                onValueChange={(value) => setSettings({ ...settings, dataSyncFrequency: value[0] })}
                className="py-4"
              />
              <p className="text-xs text-muted-foreground">
                More frequent syncing uses more battery but keeps data up-to-date
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="privacy" className="space-y-4 min-h-[250px]">
            <div className="flex items-center justify-between">
              <Label htmlFor="location-tracking" className="flex-1">
                Location Tracking
                <p className="text-xs text-muted-foreground mt-1">Allow device to track your location for activity mapping</p>
              </Label>
              <Switch
                id="location-tracking"
                checked={settings.locationTracking}
                onCheckedChange={(checked) => setSettings({ ...settings, locationTracking: checked })}
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <Label htmlFor="data-collection" className="flex-1">
                Anonymized Data Collection
                <p className="text-xs text-muted-foreground mt-1">Help improve the device by sharing anonymous usage data</p>
              </Label>
              <Switch
                id="data-collection"
                checked={settings.dataCollection}
                onCheckedChange={(checked) => setSettings({ ...settings, dataCollection: checked })}
              />
            </div>
            
            <div className="bg-amber-50 p-3 rounded-md mt-4 flex items-start gap-2">
              <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">
                Your privacy is important to us. All data is anonymized and encrypted. You can request deletion of your data at any time.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="developer" className="space-y-4 min-h-[250px]">
            <div className="bg-red-50 p-3 rounded-md mb-4 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                These settings are intended for developers only. Changes may affect device functionality and stability.
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="developer-mode" className="flex-1">
                Developer Mode
                <p className="text-xs text-muted-foreground mt-1">Enable advanced debugging and testing features</p>
              </Label>
              <Switch
                id="developer-mode"
                checked={settings.developerMode}
                onCheckedChange={(checked) => setSettings({ ...settings, developerMode: checked })}
              />
            </div>
            
            {settings.developerMode && (
              <div className="mt-4 space-y-2">
                <Button variant="outline" size="sm" className="w-full">Debug Logs</Button>
                <Button variant="outline" size="sm" className="w-full">Factory Reset</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <div className="flex justify-end border-t p-4">
        <Button 
          variant="outline" 
          className="mr-2"
          onClick={onClose}
        >
          Close
        </Button>
        <Button onClick={handleSave}>
          Save Changes
        </Button>
      </div>
    </Card>
  );
};

export default AdvancedSettings; 