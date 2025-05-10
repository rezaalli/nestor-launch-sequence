
import React from 'react';
import { CheckCircle } from 'lucide-react';

interface DeviceStatusProps {
  compact?: boolean;
}

const DeviceStatus: React.FC<DeviceStatusProps> = ({ compact = false }) => {
  // This is a simplified version that just shows a connected status
  // since we've removed the actual BLE connectivity functionality
  
  if (compact) {
    return (
      <div className="flex items-center">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
        <span className="text-xs text-green-600">Connected</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <div>
            <p className="font-medium">Nestor Device</p>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
              <span className="text-xs text-green-600">Connected</span>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <span className="text-sm font-medium">Battery: 85%</span>
        </div>
      </div>
    </div>
  );
};

export default DeviceStatus;
