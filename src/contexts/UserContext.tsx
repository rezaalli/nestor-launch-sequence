
import React, { createContext, useContext, useState } from 'react';

// Define the shape of the user data
interface User {
  name: string;
  email: string;
  avatar: string;
  unitPreference: 'metric' | 'imperial';
}

// Define the shape of the context
interface UserContextType {
  user: User;
  updateUser: (user: Partial<User>) => void;
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
  const [user, setUser] = useState<User>(defaultUser);

  const updateUser = (newData: Partial<User>) => {
    setUser(prev => ({ ...prev, ...newData }));
  };

  return (
    <UserContext.Provider value={{ user, updateUser }}>
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
