
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "sonner";

export type NotificationType = 'health' | 'device' | 'lifestyle';

export interface Notification {
  id: string;
  title: string;
  description: string;
  type: NotificationType;
  icon: string;
  iconBgColor: string;
  iconColor: string;
  time: string;
  date: string;
  read: boolean;
  actions?: {
    primary?: {
      label: string;
      action: () => void;
    };
    secondary?: {
      label: string;
      action: () => void;
    };
  };
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  showEcgAlert: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider = ({ children }: NotificationsProviderProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Elevated Heart Rate',
      description: 'Your heart rate was 110 BPM while at rest. This is higher than your typical resting rate.',
      type: 'health',
      icon: 'heart-pulse',
      iconBgColor: 'bg-red-100',
      iconColor: 'text-red-600',
      time: '10:23 AM',
      date: 'Today',
      read: false,
      actions: {
        primary: {
          label: 'View Details',
          action: () => console.log('View heart rate details')
        },
        secondary: {
          label: 'Dismiss',
          action: () => console.log('Dismiss heart rate notification')
        }
      }
    },
    {
      id: '2',
      title: 'Low Battery',
      description: 'Your Nestor device battery is at 15%. Please charge soon to ensure continuous monitoring.',
      type: 'device',
      icon: 'battery-quarter',
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-nestor-blue',
      time: '8:45 AM',
      date: 'Today',
      read: false,
      actions: {
        secondary: {
          label: 'Dismiss',
          action: () => console.log('Dismiss battery notification')
        }
      }
    },
    {
      id: '3',
      title: 'Daily Step Goal Achieved',
      description: 'Congratulations! You\'ve reached your daily step goal of 10,000 steps.',
      type: 'lifestyle',
      icon: 'person-walking',
      iconBgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      time: '6:30 PM',
      date: 'Yesterday',
      read: true,
      actions: {
        secondary: {
          label: 'View Activity',
          action: () => console.log('View activity details')
        }
      }
    },
    {
      id: '4',
      title: 'Sleep Quality Alert',
      description: 'Your sleep was frequently interrupted last night. You had 8 wake periods during your sleep cycle.',
      type: 'health',
      icon: 'bed',
      iconBgColor: 'bg-orange-100',
      iconColor: 'text-orange-600',
      time: '7:15 AM',
      date: 'Yesterday',
      read: true,
      actions: {
        primary: {
          label: 'Sleep Insights',
          action: () => console.log('View sleep insights')
        },
        secondary: {
          label: 'Dismiss',
          action: () => console.log('Dismiss sleep notification')
        }
      }
    },
    {
      id: '5',
      title: 'Firmware Update Available',
      description: 'A new firmware update (v2.1.4) is available for your Nestor device with improved heart rate tracking.',
      type: 'device',
      icon: 'arrows-rotate',
      iconBgColor: 'bg-blue-100',
      iconColor: 'text-nestor-blue',
      time: 'Monday',
      date: 'Earlier This Week',
      read: true,
      actions: {
        primary: {
          label: 'Update Now',
          action: () => console.log('Update firmware')
        },
        secondary: {
          label: 'Later',
          action: () => console.log('Update later')
        }
      }
    },
    {
      id: '6',
      title: 'Hydration Reminder',
      description: 'You\'ve been less hydrated than usual today. Consider drinking more water.',
      type: 'lifestyle',
      icon: 'water',
      iconBgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
      time: 'Sunday',
      date: 'Earlier This Week',
      read: true,
      actions: {
        primary: {
          label: 'Log Water',
          action: () => console.log('Log water intake')
        },
        secondary: {
          label: 'Dismiss',
          action: () => console.log('Dismiss hydration notification')
        }
      }
    }
  ]);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
    
    toast(notification.title, {
      description: notification.description,
      duration: 5000,
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(notification => notification.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const showEcgAlert = () => {
    toast.warning("ECG Anomaly Detected", {
      description: "Your latest ECG shows an irregular pattern that may require attention.",
      duration: 0,
      action: {
        label: "Take ECG",
        onClick: () => console.log("Take ECG action")
      },
      closeButton: true,
    });
    
    addNotification({
      title: "ECG Anomaly Detected",
      description: "Your latest ECG shows an irregular pattern that may require attention.",
      type: "health",
      icon: "heart-pulse",
      iconBgColor: "bg-red-100",
      iconColor: "text-red-600",
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      date: "Today",
      actions: {
        primary: {
          label: "Take ECG",
          action: () => console.log("Take ECG action")
        },
        secondary: {
          label: "Dismiss",
          action: () => console.log("Dismiss ECG alert")
        }
      }
    });
  };

  // Simulate an ECG anomaly after the component mounts (only for demo purposes)
  useEffect(() => {
    const timer = setTimeout(() => {
      showEcgAlert();
    }, 10000); // Show ECG alert after 10 seconds

    return () => clearTimeout(timer);
  }, []);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    showEcgAlert
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
