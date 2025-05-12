
import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';

interface ProfileImageUploaderProps {
  size?: 'sm' | 'md' | 'lg';
  onImageChange?: (url: string) => void;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({ 
  size = 'md',
  onImageChange 
}) => {
  const { user, updateAvatar } = useUser();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine avatar size based on prop
  const avatarSize = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32'
  }[size];

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select a valid image file",
        variant: "destructive",
      });
      return;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsUploading(true);
      const avatarUrl = await updateAvatar(file);
      
      if (onImageChange) {
        onImageChange(avatarUrl);
      }
      
      toast({
        title: "Profile picture updated",
        description: "Your profile picture has been updated successfully",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };
  
  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <Avatar className={`${avatarSize} border-2 border-white shadow-md`}>
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>
            {user.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <button
          onClick={triggerFileInput}
          disabled={isUploading}
          className="absolute bottom-0 right-0 bg-blue-500 h-8 w-8 rounded-full flex items-center justify-center shadow-md border-2 border-white"
          aria-label="Change profile picture"
        >
          <Camera size={16} className="text-white" />
        </button>
      </div>
      
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        aria-label="Upload profile picture"
      />
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={triggerFileInput} 
        disabled={isUploading}
        className="mt-3 text-sm"
      >
        {isUploading ? (
          <>Uploading...</>
        ) : (
          <>
            <Upload size={14} className="mr-1" />
            Change Photo
          </>
        )}
      </Button>
    </div>
  );
};

export default ProfileImageUploader;
