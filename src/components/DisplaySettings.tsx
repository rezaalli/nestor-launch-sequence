import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card } from '@/components/ui/card';
import { Sun, Moon, Monitor } from 'lucide-react';

export interface DisplaySettingsValues {
  textSize: number;
  highContrast: boolean;
  reduceMotion: boolean;
  theme: 'light' | 'dark' | 'system';
}

interface DisplaySettingsProps {
  onClose: () => void;
  onSave: (settings: DisplaySettingsValues) => void;
  initialSettings?: Partial<DisplaySettingsValues>;
}

const DisplaySettings: React.FC<DisplaySettingsProps> = ({
  onClose,
  onSave,
  initialSettings
}) => {
  const [activeTab, setActiveTab] = useState<'display' | 'navigation'>('display');
  const [settings, setSettings] = useState<DisplaySettingsValues>({
    textSize: initialSettings?.textSize || 100,
    highContrast: initialSettings?.highContrast || false,
    reduceMotion: initialSettings?.reduceMotion || false,
    theme: initialSettings?.theme || 'system'
  });
  
  const handleSave = () => {
    onSave(settings);
    onClose();
  };
  
  const handleReset = () => {
    setSettings({
      textSize: 100,
      highContrast: false,
      reduceMotion: false,
      theme: 'system'
    });
  };
  
  return (
    <Card className="w-full max-w-md mx-auto border rounded-lg overflow-hidden">
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="navigation">Navigation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="display" className="space-y-6 min-h-[350px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="high-contrast" className="flex-1">High Contrast</Label>
                <Switch
                  id="high-contrast"
                  checked={settings.highContrast}
                  onCheckedChange={(checked) => setSettings({ ...settings, highContrast: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="reduce-motion" className="flex-1">Reduce Motion</Label>
                <Switch
                  id="reduce-motion"
                  checked={settings.reduceMotion}
                  onCheckedChange={(checked) => setSettings({ ...settings, reduceMotion: checked })}
                />
              </div>
            </div>
            
            <Separator className="my-4" />
            
            <div className="space-y-3">
              <Label>Theme</Label>
              <RadioGroup
                value={settings.theme}
                onValueChange={(value) => setSettings({ ...settings, theme: value as 'light' | 'dark' | 'system' })}
                className="grid grid-cols-3 gap-2"
              >
                <div className="relative flex items-center space-x-2">
                  <RadioGroupItem value="light" id="theme-light" className="sr-only" />
                  <Label
                    htmlFor="theme-light"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer"
                  >
                    <Sun className="h-4 w-4 text-orange-500" />
                    <span className="text-xs mt-1">Light</span>
                  </Label>
                </div>
                
                <div className="relative flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="theme-dark" className="sr-only" />
                  <Label
                    htmlFor="theme-dark"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer"
                  >
                    <Moon className="h-4 w-4 text-blue-700" />
                    <span className="text-xs mt-1">Dark</span>
                  </Label>
                </div>
                
                <div className="relative flex items-center space-x-2">
                  <RadioGroupItem value="system" id="theme-system" className="sr-only" />
                  <Label
                    htmlFor="theme-system"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-white p-4 hover:bg-gray-50 peer-data-[state=checked]:border-blue-500 [&:has([data-state=checked])]:border-blue-500 cursor-pointer"
                  >
                    <Monitor className="h-4 w-4 text-gray-600" />
                    <span className="text-xs mt-1">System</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </TabsContent>
          
          <TabsContent value="navigation" className="min-h-[350px]">
            <div className="text-center py-12">
              <p className="text-muted-foreground">Navigation settings coming soon</p>
            </div>
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

export default DisplaySettings; 