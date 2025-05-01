
import React from 'react';
import SignalStrength from './SignalStrength';

interface DeviceItemProps {
  name: string;
  signalStrength: 'weak' | 'medium' | 'strong';
  battery: number;
  selected?: boolean;
  onSelect?: () => void;
}

const DeviceItem = ({ name, signalStrength, battery, selected = false, onSelect }: DeviceItemProps) => {
  const getBatteryIcon = () => {
    if (battery >= 70) {
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600"><rect x="2" y="7" width="16" height="10" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="10" y2="14"/><line x1="10" x2="10" y1="10" y2="14"/><line x1="14" x2="14" y1="10" y2="14"/></svg>;
    } else if (battery >= 30) {
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-600"><rect x="2" y="7" width="16" height="10" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="10" y2="14"/><line x1="10" x2="10" y1="10" y2="14"/></svg>;
    } else {
      return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><rect x="2" y="7" width="16" height="10" rx="2" ry="2"/><line x1="22" x2="22" y1="11" y2="13"/><line x1="6" x2="6" y1="10" y2="14"/></svg>;
    }
  };

  return (
    <div 
      className={`p-4 border ${selected ? 'border-nestor-blue bg-blue-50' : 'border-gray-200'} rounded-lg flex items-center justify-between cursor-pointer transition-colors hover:bg-blue-50/50`}
      onClick={onSelect}
    >
      <div>
        <h3 className="font-medium text-gray-900">{name}</h3>
        <div className="flex items-center space-x-2 mt-1">
          <SignalStrength strength={signalStrength} label={signalStrength} />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-600">{battery}%</span>
        {getBatteryIcon()}
      </div>
    </div>
  );
};

export default DeviceItem;
