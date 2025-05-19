import React from 'react';
import { Wifi, WifiOff, Database, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OfflineIndicatorProps {
  offlineMode: boolean;
  connectionQuality?: 'excellent' | 'good' | 'poor' | 'offline';
  offlineDataSize?: number;
  onSyncNow?: () => void;
  className?: string;
}

export function OfflineIndicator({
  offlineMode,
  connectionQuality = 'good',
  offlineDataSize = 0,
  onSyncNow,
  className
}: OfflineIndicatorProps) {
  const statusColors = {
    excellent: 'bg-green-100 text-green-800 border-green-200',
    good: 'bg-blue-100 text-blue-800 border-blue-200',
    poor: 'bg-amber-100 text-amber-800 border-amber-200',
    offline: 'bg-red-100 text-red-800 border-red-200'
  };

  const statusIcons = {
    excellent: <Wifi className="h-4 w-4 mr-1" />,
    good: <Wifi className="h-4 w-4 mr-1" />,
    poor: <Wifi className="h-4 w-4 mr-1 opacity-50" />,
    offline: <WifiOff className="h-4 w-4 mr-1" />
  };

  const statusText = {
    excellent: 'Connected',
    good: 'Connected',
    poor: 'Poor Connection',
    offline: 'Offline'
  };

  return (
    <div 
      className={cn(
        'flex items-center justify-between rounded-md border p-2 text-xs transition-all duration-300',
        statusColors[connectionQuality],
        offlineMode ? 'shadow-md' : '',
        className
      )}
    >
      <div className="flex items-center">
        {statusIcons[connectionQuality]}
        <span>{statusText[connectionQuality]}</span>
      </div>
      
      {offlineMode && offlineDataSize > 0 && (
        <div className="flex items-center ml-2">
          <Database className="h-3 w-3 mr-1" />
          <span>{offlineDataSize}KB pending</span>
          
          {onSyncNow && (
            <button 
              onClick={onSyncNow}
              className="ml-2 p-1 rounded-md bg-white bg-opacity-50 hover:bg-opacity-80 transition-colors"
              disabled={connectionQuality === 'offline'}
              title={connectionQuality === 'offline' ? 'Cannot sync while offline' : 'Sync now'}
            >
              <RefreshCw className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export function OfflineIndicatorCompact({
  offlineMode,
  connectionQuality = 'good',
  className
}: Omit<OfflineIndicatorProps, 'offlineDataSize' | 'onSyncNow'>) {
  const statusColors = {
    excellent: 'bg-green-500',
    good: 'bg-blue-500',
    poor: 'bg-amber-500',
    offline: 'bg-red-500'
  };

  if (!offlineMode && (connectionQuality === 'excellent' || connectionQuality === 'good')) {
    return null; // Don't show indicator when online with good connection
  }

  return (
    <div 
      className={cn(
        'flex items-center rounded-full text-white text-xs px-2 py-0.5',
        statusColors[connectionQuality],
        className
      )}
    >
      {connectionQuality === 'offline' ? (
        <WifiOff className="h-3 w-3 mr-1" />
      ) : (
        <Wifi className="h-3 w-3 mr-1" />
      )}
      <span>
        {connectionQuality === 'offline' ? 'Offline' : 'Poor Connection'}
      </span>
    </div>
  );
} 