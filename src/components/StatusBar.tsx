import React from 'react';
import { Battery, Signal, BatteryWarning } from 'lucide-react';
import { useCloudSync } from '@/hooks/useCloudSync';
import { useNetworkStatus } from '@/utils/networkUtils';
import { OfflineIndicatorCompact } from './ui/offline-indicator';
import AccessibilityControls from './AccessibilityControls';

interface StatusBarProps {
  className?: string;
}

const StatusBar: React.FC<StatusBarProps> = ({ className }) => {
  const { offlineMode, connectionQuality } = useCloudSync();
  const networkStatus = useNetworkStatus();
  
  const getSignalStrength = () => {
    // Determine signal strength based on connection quality
    if (offlineMode || !networkStatus.connected) {
      return 0;
    }
    
    if (connectionQuality === 'excellent') {
      return 4;
    } else if (connectionQuality === 'good') {
      return 3;
    } else if (connectionQuality === 'poor') {
      return 1;
    }
    
    return 2; // default to medium
  };
  
  const getBatteryLevel = () => {
    // Simulated battery level - in a real app, you would use the Battery API
    // if supported, or get this from your device integration
    return 75;
  };
  
  const batteryLevel = getBatteryLevel();
  const signalStrength = getSignalStrength();
  
  return (
    <div className={`relative w-full h-10 bg-white flex items-center justify-between px-4 ${className}`}>
      <div className="flex items-center space-x-1">
        <Signal 
          className={signalStrength === 0 ? "text-red-500 h-4 w-4" : "text-green-500 h-4 w-4"} 
        />
        {/* Show connection quality label */}
        {signalStrength > 0 ? (
          <span className="text-xs text-neutral-500">{signalStrength}/4</span>
        ) : (
          <span className="text-xs text-red-500">No Signal</span>
        )}
      </div>
      
      <div className="absolute left-1/2 transform -translate-x-1/2 text-xs text-neutral-600">
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Accessibility Controls */}
        <AccessibilityControls showLabel={false} />
        
        {/* Show offline indicator when necessary */}
        <OfflineIndicatorCompact 
          offlineMode={offlineMode} 
          connectionQuality={connectionQuality}
        />
        
        {batteryLevel < 20 ? (
          <BatteryWarning className="text-red-500 h-4 w-4" />
        ) : (
          <Battery className="text-green-500 h-4 w-4" />
        )}
        <span className="text-xs text-neutral-500">{batteryLevel}%</span>
      </div>
    </div>
  );
};

export default StatusBar;
