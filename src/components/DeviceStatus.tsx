
import React, { useState, useEffect } from 'react';
import { Battery, WifiOff, BluetoothConnected, BluetoothOff, AlertCircle, Clock } from 'lucide-react';
import { isDeviceConnected, isDeviceWorn, getLastReading, getDeviceName } from '@/utils/bleUtils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface DeviceStatusProps {
  onReconnectClick?: () => void;
  compact?: boolean;
}

const DeviceStatus = ({ onReconnectClick, compact = false }: DeviceStatusProps) => {
  const [connected, setConnected] = useState(isDeviceConnected());
  const [worn, setWorn] = useState(isDeviceWorn());
  const [batteryLevel, setBatteryLevel] = useState(getLastReading()?.battery ?? 80);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date());
  const [deviceName, setDeviceName] = useState(getDeviceName());
  const [reconnecting, setReconnecting] = useState(false);

  useEffect(() => {
    const handleVitalUpdate = () => {
      setConnected(isDeviceConnected());
      setWorn(isDeviceWorn());
      setBatteryLevel(getLastReading()?.battery ?? batteryLevel);
      setLastUpdateTime(new Date());
    };
    
    const handleWearStateChange = (event: Event) => {
      const { worn } = (event as CustomEvent).detail;
      setWorn(worn);
    };
    
    const handleConnectionStateChange = () => {
      setConnected(isDeviceConnected());
      setReconnecting(false);
    };
    
    const handleDeviceRenamed = (event: Event) => {
      const { name } = (event as CustomEvent).detail;
      setDeviceName(name);
    };
    
    const handleReconnecting = () => {
      setReconnecting(true);
    };
    
    // Update initial state on mount
    setConnected(isDeviceConnected());
    setWorn(isDeviceWorn());
    setBatteryLevel(getLastReading()?.battery ?? 80);
    setDeviceName(getDeviceName());
    
    // Add event listeners
    window.addEventListener('nestor-vital-update', handleVitalUpdate);
    window.addEventListener('nestor-wear-state', handleWearStateChange);
    window.addEventListener('nestor-connected', handleConnectionStateChange);
    window.addEventListener('nestor-disconnected', handleConnectionStateChange);
    window.addEventListener('nestor-device-renamed', handleDeviceRenamed);
    window.addEventListener('nestor-connecting', handleReconnecting);
    
    // Check status periodically
    const interval = setInterval(() => {
      setConnected(isDeviceConnected());
    }, 5000);
    
    return () => {
      window.removeEventListener('nestor-vital-update', handleVitalUpdate);
      window.removeEventListener('nestor-wear-state', handleWearStateChange);
      window.removeEventListener('nestor-connected', handleConnectionStateChange);
      window.removeEventListener('nestor-disconnected', handleConnectionStateChange);
      window.removeEventListener('nestor-device-renamed', handleDeviceRenamed);
      window.removeEventListener('nestor-connecting', handleReconnecting);
      clearInterval(interval);
    };
  }, [batteryLevel]);

  // Format the last update time
  const getLastUpdateText = () => {
    const now = new Date();
    const diffMs = now.getTime() - lastUpdateTime.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffSecs < 60) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return lastUpdateTime.toLocaleString();
    }
  };
  
  // Battery color based on level
  const getBatteryColor = () => {
    if (batteryLevel > 50) {
      return 'text-green-600';
    } else if (batteryLevel > 20) {
      return 'text-yellow-600';
    } else {
      return 'text-red-600';
    }
  };

  // Handle reconnect click
  const handleReconnectClick = () => {
    if (onReconnectClick) {
      setReconnecting(true);
      onReconnectClick();
    }
  };

  // For compact display (used in header)
  if (compact) {
    return (
      <div className="flex items-center text-xs">
        <div className={`w-2 h-2 rounded-full ${
          reconnecting ? 'bg-yellow-500' : connected ? 'bg-green-500' : 'bg-red-500'
        } mr-1.5`}></div>
        <span className="text-nestor-gray-600">
          {deviceName} • {reconnecting ? 'Reconnecting...' : connected ? 'Connected' : 'Disconnected'}
        </span>
      </div>
    );
  }

  // Full display
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium text-nestor-gray-900">Device Status</h3>
        {(!connected || reconnecting) && onReconnectClick && (
          <button 
            onClick={handleReconnectClick}
            className="text-xs text-blue-600 font-medium"
            disabled={reconnecting}
          >
            {reconnecting ? 'Reconnecting...' : 'Reconnect'}
          </button>
        )}
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full ${
              reconnecting ? 'bg-yellow-100' : connected ? 'bg-blue-100' : 'bg-red-100'
            } flex items-center justify-center mr-2`}>
              {connected ? (
                <BluetoothConnected className="text-blue-600" size={16} />
              ) : (
                <BluetoothOff className={reconnecting ? "text-yellow-600" : "text-red-600"} size={16} />
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-nestor-gray-900">{deviceName}</div>
              <div className="flex items-center text-xs text-nestor-gray-600">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  reconnecting ? 'bg-yellow-500' : connected ? 'bg-green-500' : 'bg-red-500'
                } mr-1`}></div>
                <span>
                  {reconnecting 
                    ? 'Reconnecting...' 
                    : connected 
                      ? 'Connected' 
                      : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
          
          {connected && (
            <div className="flex items-center">
              <span className="text-sm mr-1">{batteryLevel}%</span>
              <Battery className={getBatteryColor()} size={16} />
            </div>
          )}
        </div>
        
        {reconnecting && (
          <div className="space-y-2">
            <div className="text-xs text-yellow-600">Attempting to reconnect...</div>
            <Progress value={Math.floor(Math.random() * 100)} className="h-1" />
          </div>
        )}
        
        {!worn && connected && (
          <div className="flex items-center text-yellow-600 text-xs bg-yellow-50 p-2 rounded">
            <AlertCircle className="mr-1" size={14} />
            <span>Device not worn</span>
          </div>
        )}
        
        <div className="flex items-center text-xs text-nestor-gray-500">
          <Clock className="mr-1" size={14} />
          <span>Last updated: {getLastUpdateText()}</span>
        </div>
        
        {connected && (
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full mt-2 text-xs h-8"
            onClick={() => window.location.href = '/device-settings'}
          >
            Device Settings
          </Button>
        )}
      </div>
    </div>
  );
};

export default DeviceStatus;
