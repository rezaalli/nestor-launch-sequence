import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import { useLocalStorage } from './useLocalStorage';
import { networkStatus } from '@/utils/networkUtils';

interface SyncItem {
  id: string;
  timestamp: number;
  entity: string;
  data: any;
  synced: boolean;
}

export function useCloudSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [offlineMode, setOfflineMode] = useState(false);
  const [pendingSyncItems, setPendingSyncItems] = useLocalStorage<SyncItem[]>('nestor_pending_sync', []);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [autoSyncInterval, setAutoSyncInterval] = useState(15); // minutes
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'poor' | 'offline'>('good');
  const [offlineDataSize, setOfflineDataSize] = useState(0);
  
  // Check network status on load and set up monitoring
  useEffect(() => {
    const checkNetworkAndUpdateStatus = async () => {
      const status = await networkStatus.check();
      setOfflineMode(!status.connected);
      
      // Update connection quality
      if (!status.connected) {
        setConnectionQuality('offline');
      } else if (status.speed && status.speed > 5) {
        setConnectionQuality('excellent');
      } else if (status.speed && status.speed > 1) {
        setConnectionQuality('good');
      } else {
        setConnectionQuality('poor');
      }
      
      // Calculate pending data size
      const totalSize = pendingSyncItems.reduce((size, item) => {
        return size + (JSON.stringify(item).length / 1024); // Size in KB
      }, 0);
      
      setOfflineDataSize(Math.round(totalSize * 10) / 10); // Round to 1 decimal
    };
    
    // Check initial status
    checkNetworkAndUpdateStatus();
    
    // Set up listeners for online/offline events
    window.addEventListener('online', () => {
      setOfflineMode(false);
      checkNetworkAndUpdateStatus();
      
      if (autoSyncEnabled) {
        sync(); // Auto-sync when coming back online
      }
    });
    
    window.addEventListener('offline', () => {
      setOfflineMode(true);
      setConnectionQuality('offline');
    });
    
    // Regular check for connection quality
    const intervalId = setInterval(checkNetworkAndUpdateStatus, 60000);
    
    // Set up autosync if enabled
    let autoSyncId: number;
    if (autoSyncEnabled) {
      autoSyncId = window.setInterval(() => {
        if (!offlineMode) {
          sync();
        }
      }, autoSyncInterval * 60 * 1000);
    }
    
    return () => {
      window.removeEventListener('online', () => {});
      window.removeEventListener('offline', () => {});
      clearInterval(intervalId);
      if (autoSyncId) clearInterval(autoSyncId);
    };
  }, [autoSyncEnabled, autoSyncInterval, pendingSyncItems]);
  
  // Queue an item for sync - works in both online and offline mode
  const queueForSync = useCallback((entity: string, data: any) => {
    const syncItem: SyncItem = {
      id: `${entity}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now(),
      entity,
      data,
      synced: false
    };
    
    setPendingSyncItems(prev => [...prev, syncItem]);
    
    // If online and auto sync enabled, sync immediately
    if (!offlineMode && autoSyncEnabled) {
      sync();
    }
    
    return syncItem.id; // Return ID for potential tracking
  }, [offlineMode, autoSyncEnabled, setPendingSyncItems]);
  
  // Sync all pending items
  const sync = useCallback(async () => {
    if (isSyncing || pendingSyncItems.length === 0) return;
    
    // If offline, don't attempt to sync
    if (offlineMode) {
      toast.error("Cannot sync while offline", {
        description: "Your changes will be saved locally and synced when you're back online."
      });
      return;
    }
    
    setIsSyncing(true);
    
    try {
      // Process all pending sync items
      const updatedItems = [...pendingSyncItems];
      
      for (let i = 0; i < updatedItems.length; i++) {
        const item = updatedItems[i];
        
        if (item.synced) continue;
        
        // Perform sync based on entity type
        switch (item.entity) {
          case 'health_metrics':
            await supabase.from('health_metrics').insert(item.data);
            break;
          case 'user_activity':
            await supabase.from('user_activities').insert(item.data);
            break;
          case 'notifications':
            await supabase.from('notifications').insert(item.data);
            break;
          // Handle other entity types
          default:
            console.warn(`Unknown entity type: ${item.entity}`);
        }
        
        // Mark as synced
        updatedItems[i] = { ...item, synced: true };
      }
      
      // Update local state with synced items
      setPendingSyncItems(updatedItems.filter(item => !item.synced));
      
      // Update last sync time
      const syncTime = new Date();
      setLastSyncTime(syncTime);
      localStorage.setItem('nestor_last_sync_time', syncTime.toISOString());
      
      return true;
    } catch (error) {
      console.error('Sync error:', error);
      toast.error("Sync failed", {
        description: "We couldn't sync your data. Will try again later."
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, offlineMode, pendingSyncItems, setPendingSyncItems]);
  
  // Enable auto sync
  const enableAutoSync = useCallback(() => {
    setAutoSyncEnabled(true);
    localStorage.setItem('nestor_auto_sync', 'true');
  }, []);
  
  // Disable auto sync
  const disableAutoSync = useCallback(() => {
    setAutoSyncEnabled(false);
    localStorage.setItem('nestor_auto_sync', 'false');
  }, []);
  
  // Update auto sync interval
  const updateAutoSyncInterval = useCallback((minutes: number) => {
    setAutoSyncInterval(minutes);
    localStorage.setItem('nestor_auto_sync_interval', minutes.toString());
  }, []);
  
  // Get a user-friendly connection quality label
  const connectionQualityLabel = {
    excellent: 'Excellent Connection',
    good: 'Good Connection',
    poor: 'Poor Connection',
    offline: 'Offline Mode'
  }[connectionQuality];
  
  // Clear synced data (mostly for testing)
  const clearSyncedData = useCallback(() => {
    setPendingSyncItems(prev => prev.filter(item => !item.synced));
  }, [setPendingSyncItems]);
  
  // Force set offline mode (useful for testing)
  const setForceOfflineMode = useCallback((offline: boolean) => {
    setOfflineMode(offline);
  }, []);
  
  return {
    sync,
    queueForSync,
    isSyncing,
    lastSyncTime,
    offlineMode,
    pendingSyncItems,
    autoSyncEnabled,
    autoSyncInterval,
    enableAutoSync,
    disableAutoSync,
    updateAutoSyncInterval,
    connectionQuality,
    connectionQualityLabel,
    offlineDataSize,
    clearSyncedData,
    setForceOfflineMode
  };
} 