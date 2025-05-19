import React, { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';

interface ProfileImageUploaderProps {
  size?: 'sm' | 'md' | 'lg';
  onImageChange?: (url: string) => void;
  centered?: boolean;
}

const ProfileImageUploader: React.FC<ProfileImageUploaderProps> = ({ 
  size = 'md',
  onImageChange,
  centered = true
}) => {
  const { user, updateAvatar } = useUser();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine avatar size based on prop
  const avatarSize = {
    sm: 'h-16 w-16',
    md: 'h-20 w-20',
    lg: 'h-24 w-24'
  }[size];

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update your profile picture",
        variant: "destructive",
      });
      return;
    }
    
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

  // Get initials for avatar fallback
  const getInitials = () => {
    if (!user || !user.name) return "?";
    return user.name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`flex flex-col ${centered ? 'items-center' : ''}`}>
      <div className="relative">
        <Avatar className={`${avatarSize} bg-blue-500 border border-blue-100`}>
          {user?.avatar ? (
            <AvatarImage src={user.avatar} alt={user?.name || 'User'} />
          ) : (
            <AvatarFallback className="bg-blue-500 text-white">
              {getInitials()}
            </AvatarFallback>
          )}
        </Avatar>
        
        <div className="absolute -bottom-1 -right-1 rounded-full bg-white p-0.5">
          <Button
            size="icon"
            variant="ghost"
            onClick={triggerFileInput}
            disabled={isUploading}
            className="h-6 w-6 bg-primary text-white hover:bg-primary/90 rounded-full"
            aria-label="Change profile picture"
          >
            <Camera size={12} />
          </Button>
        </div>
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
        className="mt-4 text-xs font-normal rounded-full h-8 px-4 border-gray-200"
      >
        {isUploading ? "Uploading..." : "Change Photo"}
      </Button>
    </div>
  );
};

export default ProfileImageUploader;
