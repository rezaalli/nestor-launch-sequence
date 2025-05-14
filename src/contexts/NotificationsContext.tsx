import React, { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

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
  user_id?: string;
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

// Conversion functions between database and application models
function dbToAppNotification(dbNotification: DatabaseNotification): Notification {
  return {
    id: dbNotification.id,
    title: dbNotification.title,
    description: dbNotification.description,
    type: dbNotification.type as NotificationType,
    icon: dbNotification.icon,
    iconBgColor: dbNotification.icon_bg_color,
    iconColor: dbNotification.icon_color,
    time: dbNotification.time,
    date: dbNotification.date,
    read: dbNotification.read,
    user_id: dbNotification.user_id,
    actions: dbNotification.actions as Notification['actions']
  };
}

function appToDbNotification(notification: Omit<Notification, 'id'>): Omit<DatabaseNotification, 'id' | 'created_at'> {
  return {
    title: notification.title,
    description: notification.description,
    type: notification.type,
    icon: notification.icon,
    icon_bg_color: notification.iconBgColor,
    icon_color: notification.iconColor,
    time: notification.time,
    date: notification.date,
    read: notification.read, // Make sure we include the read property
    user_id: notification.user_id || '',
    actions: notification.actions as Json
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
  showHeartRateAlert: (heartRate: number) => void;
  showTemperatureAlert: (temperature: number, type: 'high' | 'low') => void;
  showSpO2Alert: (spO2Level: number) => void;
  loading: boolean;
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Load notifications from Supabase on initial render
  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          // Convert database model to application model
          const appNotifications = data.map(dbToAppNotification);
          setNotifications(appNotifications);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' }, 
        (payload) => {
          const newDbNotification = payload.new as DatabaseNotification;
          const newNotification = dbToAppNotification(newDbNotification);
          
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show toast for new notification
          toast(newNotification.title, {
            description: newNotification.description,
            duration: 5000,
            closeButton: true,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const addNotification = async (notification: Omit<Notification, 'id' | 'read'>) => {
    try {
      // Get current user ID if available (in production)
      const { data: { session } } = await supabase.auth.getSession();
      const user_id = session?.user?.id;
      
      // Convert to database model - add the read property which was missing
      const dbNotification = appToDbNotification({
        ...notification,
        read: false, // Add the missing read property with default value false
        user_id: user_id || undefined,
      });
      
      // Insert into Supabase
      const { data, error } = await supabase
        .from('notifications')
        .insert([dbNotification])
        .select();
        
      if (error) throw error;
      
      if (data && data[0]) {
        // Convert back to app model for local state
        const newNotification = dbToAppNotification(data[0]);
        
        // Update local state
        setNotifications(prev => [newNotification, ...prev]);
      
        // Show toast notification
        toast(notification.title, {
          description: notification.description,
          duration: 5000,
          closeButton: true,
        });
      }
    } catch (error) {
      console.error('Error adding notification:', error);
      toast.error('Failed to add notification');
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(
        notifications.map(notification =>
          notification.id === id ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Get IDs of unread notifications
      const unreadIds = notifications
        .filter(notification => !notification.read)
        .map(notification => notification.id);
        
      if (unreadIds.length === 0) return;
      
      // Update all unread notifications
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(
        notifications.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(notifications.filter(notification => notification.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
      toast.error('Failed to delete notification');
    }
  };

  const clearAll = async () => {
    try {
      // Get all notification IDs
      const ids = notifications.map(notification => notification.id);
      
      if (ids.length === 0) return;
      
      // Delete all notifications
      const { error } = await supabase
        .from('notifications')
        .delete()
        .in('id', ids);
        
      if (error) throw error;
      
      // Update local state
      setNotifications([]);
    } catch (error) {
      console.error('Error clearing notifications:', error);
      toast.error('Failed to clear notifications');
    }
  };

  const showEcgAlert = () => {
    toast.warning("ECG Anomaly Detected", {
      description: "Your latest ECG shows an irregular pattern that may require attention.",
      duration: 10000,
      closeButton: true,
      action: {
        label: "Take ECG",
        onClick: () => console.log("Take ECG action")
      },
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

  const showHeartRateAlert = (heartRate: number) => {
    toast.warning("High Heart Rate Alert", {
      description: `Your heart rate is ${heartRate} BPM, which is above your normal resting range.`,
      duration: 10000,
      closeButton: true,
      action: {
        label: "Monitor",
        onClick: () => console.log("Monitor heart rate")
      },
    });
    
    addNotification({
      title: "High Heart Rate Alert",
      description: `Your heart rate was ${heartRate} BPM, which is above your normal resting range.`,
      type: "health",
      icon: "heart-pulse",
      iconBgColor: "bg-red-100",
      iconColor: "text-red-600",
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      date: "Today",
      actions: {
        primary: {
          label: "Monitor",
          action: () => console.log("Monitor heart rate")
        },
        secondary: {
          label: "Dismiss",
          action: () => console.log("Dismiss heart rate notification")
        }
      }
    });
  };

  const showTemperatureAlert = (temperature: number, type: 'high' | 'low') => {
    const tempF = (temperature * 9/5) + 32;
    const isHigh = type === 'high';
    
    const title = isHigh ? "High Temperature Alert" : "Low Temperature Alert";
    const description = isHigh 
      ? `Your body temperature is ${temperature}°C (${tempF.toFixed(1)}°F), which is above normal range.`
      : `Your body temperature is ${temperature}°C (${tempF.toFixed(1)}°F), which is below normal range.`;
    
    const iconBgColor = isHigh ? "bg-red-100" : "bg-blue-100";
    const iconColor = isHigh ? "text-red-600" : "text-blue-600";
    
    toast.warning(title, {
      description: description,
      duration: 10000,
      closeButton: true,
      action: {
        label: "Track",
        onClick: () => console.log("Track temperature")
      },
    });
    
    addNotification({
      title: title,
      description: description,
      type: "health",
      icon: isHigh ? "temperature-high" : "temperature-low",
      iconBgColor: iconBgColor,
      iconColor: iconColor,
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      date: "Today",
      actions: {
        primary: {
          label: "Track",
          action: () => console.log("Track temperature")
        },
        secondary: {
          label: "Dismiss",
          action: () => console.log("Dismiss temperature notification")
        }
      }
    });
  };

  const showSpO2Alert = (spO2Level: number) => {
    toast.warning("Low Blood Oxygen Alert", {
      description: `Your SpO2 level is ${spO2Level}%, which is below the normal range of 95-100%.`,
      duration: 10000,
      closeButton: true,
      action: {
        label: "Take Reading",
        onClick: () => console.log("Take SpO2 reading")
      },
    });
    
    addNotification({
      title: "Low Blood Oxygen Alert",
      description: `Your SpO2 level is ${spO2Level}%, which is below the normal range of 95-100%.`,
      type: "health",
      icon: "lungs",
      iconBgColor: "bg-red-100",
      iconColor: "text-red-600",
      time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      date: "Today",
      actions: {
        primary: {
          label: "Take Reading",
          action: () => console.log("Take SpO2 reading")
        },
        secondary: {
          label: "Dismiss",
          action: () => console.log("Dismiss SpO2 notification")
        }
      }
    });
  };

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    showEcgAlert,
    showHeartRateAlert,
    showTemperatureAlert,
    showSpO2Alert,
    loading
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};
