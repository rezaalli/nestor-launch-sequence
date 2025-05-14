
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Define the shape of the user data
interface User {
  name: string;
  email: string;
  avatar: string;
  unitPreference: 'metric' | 'imperial';
}

// Define the shape of the context
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  updateUser: (user: Partial<User>) => Promise<void>;
  updateAvatar: (file: File) => Promise<string>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

// Create the context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user: authUser } = useAuth();
  const { toast } = useToast();

  // Load user data from Supabase when authUser changes
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!authUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          throw error;
        }

        // Transform from DB schema to component schema
        setUser({
          name: data.name || '',
          email: data.email || '',
          avatar: data.avatar_url || '',
          unitPreference: data.unit_preference as 'metric' | 'imperial' || 'imperial' // Default to imperial if not set
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load user profile',
          variant: 'destructive',
        });
        // Set user to null on error to avoid undefined issues
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    if (authUser) {
      fetchUserProfile();
    } else {
      setIsLoading(false);
    }
  }, [authUser, toast]);

  // Update user profile in Supabase
  const updateUser = async (userData: Partial<User>) => {
    if (!authUser || !user) return;

    try {
      // Transform from component schema to DB schema
      const updateData: Record<string, any> = {};
      if (userData.name !== undefined) updateData.name = userData.name;
      if (userData.email !== undefined) updateData.email = userData.email;
      if (userData.unitPreference !== undefined) updateData.unit_preference = userData.unitPreference;

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', authUser.id);

      if (error) throw error;

      // Update local state if Supabase update succeeds
      setUser(prev => prev ? { ...prev, ...userData } : null);
      
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  // Handle avatar upload to Supabase Storage
  const updateAvatar = async (file: File): Promise<string> => {
    if (!authUser || !user) {
      throw new Error('User not authenticated');
    }

    try {
      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${authUser.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profiles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('profiles')
        .getPublicUrl(filePath);

      // Update the user profile with the new avatar URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ avatar_url: urlData.publicUrl })
        .eq('id', authUser.id);

      if (updateError) throw updateError;

      // Update local state
      setUser(prev => prev ? { ...prev, avatar: urlData.publicUrl } : null);
      
      toast({
        title: 'Success',
        description: 'Avatar updated successfully',
      });

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Error',
        description: 'Failed to update avatar',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Update password through Supabase Auth
  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!authUser) {
      throw new Error('User not authenticated');
    }

    try {
      // First verify the current password by signing in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: authUser.email!,
        password: currentPassword,
      });

      if (signInError) {
        toast({
          title: 'Error',
          description: 'Current password is incorrect',
          variant: 'destructive',
        });
        return false;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: 'Password updated successfully',
      });
      return true;
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: 'Error',
        description: 'Failed to update password',
        variant: 'destructive',
      });
      return false;
    }
  };

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        isLoading, 
        updateUser, 
        updateAvatar, 
        updatePassword 
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the user context
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
