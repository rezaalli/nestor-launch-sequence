
import React, { useState } from 'react';
import { ArrowLeft, Camera, Tag, Image, File } from 'lucide-react';
import OnboardingLayout from '../components/OnboardingLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface DeviceNameScreenProps {
  onNext: () => void;
}

const DeviceNameScreen = ({ onNext }: DeviceNameScreenProps) => {
  const [deviceName, setDeviceName] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('Luxury');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Available watch tags
  const watchTags = ['Luxury', 'Sport', 'Smart', 'Dress'];
  
  // Handle image source selection
  const handleImageSourceSelection = (source: string) => {
    console.log(`Selected image source: ${source}`);
    // Here you would implement the actual image picking functionality
    // based on the selected source (camera, gallery, or file)
    setDialogOpen(false);
  };
  
  return (
    <OnboardingLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h2 className="text-lg font-medium text-nestor-gray-900">Name Your Device</h2>
        <div className="w-10"></div>
      </div>
      
      {/* Device Photo */}
      <div className="mt-4 flex items-center justify-center mb-6">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-gray-400"
            >
              <circle cx="12" cy="12" r="6" />
              <path d="M12 8v4l1.5 2" />
              <path d="M6 12a6 6 0 0 0 11.78 1.778c.16-.396.296-.8.306-1.221L18 13" />
              <path d="M17.7 8.3A6 6 0 0 0 6.21 9.7l-.047.095L6 10" />
            </svg>
          </div>
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-nestor-blue flex items-center justify-center shadow-lg">
                <Camera size={18} className="text-white" />
              </button>
            </DialogTrigger>
            <DialogContent className="p-0 max-w-[320px] rounded-xl bg-white border-none overflow-hidden">
              <div className="flex flex-col w-full">
                <h3 className="text-center text-xl font-medium py-4 border-b border-gray-200">
                  Add Activity
                </h3>

                <div className="overflow-y-auto max-h-[300px]">
                  {/* Photo Library option */}
                  <button
                    className="flex items-center justify-center w-full py-5 hover:bg-gray-50 border-b border-gray-100"
                    onClick={() => handleImageSourceSelection('gallery')}
                  >
                    <span className="text-base">Photo Library</span>
                  </button>
                  
                  {/* Take Photo option */}
                  <button
                    className="flex items-center justify-center w-full py-5 hover:bg-gray-50 border-b border-gray-100"
                    onClick={() => handleImageSourceSelection('camera')}
                  >
                    <span className="text-base">Take Photo</span>
                  </button>
                  
                  {/* Choose Files option */}
                  <button
                    className="flex items-center justify-center w-full py-5 hover:bg-gray-50"
                    onClick={() => handleImageSourceSelection('file')}
                  >
                    <span className="text-base">Choose Files</span>
                  </button>
                </div>

                <div className="p-4">
                  <Button
                    className="w-full py-4 bg-blue-800 text-white font-medium rounded-lg"
                    onClick={() => setDialogOpen(false)}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Device Name Input */}
      <div className="space-y-4 mb-4">
        <div>
          <label htmlFor="device-name" className="block text-sm font-medium text-nestor-gray-700 mb-2">
            Device Name
          </label>
          <Input
            id="device-name"
            type="text"
            placeholder="e.g. My Rolex Datejust"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-nestor-blue focus:border-nestor-blue"
          />
        </div>
        
        {/* Watch Tag Selection */}
        <div>
          <label className="block text-sm font-medium text-nestor-gray-700 mb-2">
            Watch Tag (Optional)
          </label>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {watchTags.map((tag) => (
              <button 
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`p-3 border rounded-lg flex items-center ${
                  selectedTag === tag 
                    ? 'border-nestor-blue bg-blue-50' 
                    : 'border-gray-200'
                }`}
              >
                <Tag 
                  size={16} 
                  className={`mr-2 ${
                    selectedTag === tag 
                      ? 'text-nestor-blue' 
                      : 'text-gray-400'
                  }`} 
                />
                <span 
                  className={`${
                    selectedTag === tag 
                      ? 'text-nestor-blue' 
                      : 'text-gray-600'
                  }`}
                >
                  {tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Spacer to push the button to the bottom */}
      <div className="flex-1"></div>
      
      {/* Save Button */}
      <Button
        onClick={onNext}
        className="w-full py-4 bg-nestor-blue text-white font-medium rounded-lg"
      >
        Save Device
      </Button>
    </OnboardingLayout>
  );
};

export default DeviceNameScreen;
