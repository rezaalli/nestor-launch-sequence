
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Download, FileJson, FileText } from "lucide-react";
import { exportDataAsJSON, exportDataAsCSV } from '@/utils/bleUtils';
import { useToast } from '@/hooks/use-toast';

interface DataExportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DataExport = ({ open, onOpenChange }: DataExportProps) => {
  const { toast } = useToast();
  const [exportFormat, setExportFormat] = useState<'json' | 'csv'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = () => {
    setIsExporting(true);
    
    try {
      // Get data based on selected format
      const data = exportFormat === 'json' ? exportDataAsJSON() : exportDataAsCSV();
      
      // Create filename with current date
      const date = new Date().toISOString().split('T')[0];
      const filename = `nestor-data-${date}.${exportFormat}`;
      
      // Create blob and download link
      const blob = new Blob([data], { type: exportFormat === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      toast({
        title: "Export Successful",
        description: `Data exported as ${filename}`,
      });
      
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Could not export data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Health Data</DialogTitle>
          <DialogDescription>
            Export your health data in your preferred format for backup or analysis.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 my-4">
          <div className="space-y-3">
            <Label>Select Export Format</Label>
            <RadioGroup value={exportFormat} onValueChange={(value: 'json' | 'csv') => setExportFormat(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv" className="flex items-center cursor-pointer">
                  <FileText className="mr-2 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">CSV Format</p>
                    <p className="text-sm text-gray-500">Compatible with Excel and other spreadsheet apps</p>
                  </div>
                </Label>
              </div>
              
              <div className="flex items-center space-x-2 mt-3">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json" className="flex items-center cursor-pointer">
                  <FileJson className="mr-2 h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">JSON Format</p>
                    <p className="text-sm text-gray-500">Raw data format for developers and data analysis</p>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              Your export will contain all health data stored on this device, including heart rate, SpO2, temperature, and readiness scores.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleExport}
            disabled={isExporting}
          >
            <Download className="mr-2 h-4 w-4" />
            {isExporting ? "Exporting..." : "Export Data"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DataExport;
