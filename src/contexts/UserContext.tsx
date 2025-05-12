
import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of the user data
interface User {
  name: string;
  email: string;
  avatar: string;
  unitPreference: 'metric' | 'imperial';
  password?: string; // Added for password management
}

// Define the shape of the context
interface UserContextType {
  user: User;
  updateUser: (user: Partial<User>) => void;
  updateAvatar: (file: File) => Promise<string>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
}

// Create the context with default values
const UserContext = createContext<UserContextType | undefined>(undefined);

// Initial user data
const defaultUser: User = {
  name: 'Emma',
  email: 'alex.morgan@example.com',
  avatar: 'https://storage.googleapis.com/uxpilot-auth.appspot.com/avatars/avatar-5.jpg',
  unitPreference: 'imperial'  // Set default to imperial
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load user data from localStorage or use default
  const [user, setUser] = useState<User>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : defaultUser;
  });

  // Save to localStorage whenever user changes
  useEffect(() => {
    localStorage.setItem('user', JSON.stringify(user));
  }, [user]);

  const updateUser = (newData: Partial<User>) => {
    setUser(prev => {
      const updatedUser = { ...prev, ...newData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  // Handle avatar upload and return URL
  const updateAvatar = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64String = reader.result as string;
          updateUser({ avatar: base64String });
          resolve(base64String);
        };
        
        reader.onerror = () => {
          reject(new Error('Failed to read file'));
        };
        
        reader.readAsDataURL(file);
      } catch (error) {
        reject(error);
      }
    });
  };

  // Password update function (simplified for demo)
  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    // In a real app, this would validate against stored password and/or API
    // For this demo, we'll simulate a successful password change
    return Promise.resolve(true);
  };

  return (
    <UserContext.Provider value={{ user, updateUser, updateAvatar, updatePassword }}>
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
