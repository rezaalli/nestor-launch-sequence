
import React from 'react';
import Toggle from './Toggle';
import { Apple, Bluetooth, Bell, HeartPulse } from 'lucide-react';

interface PermissionItemProps {
  icon: 'bluetooth' | 'bell' | 'heart-pulse';
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const PermissionItem = ({ icon, title, description, checked, onChange }: PermissionItemProps) => {
  const getIcon = () => {
    switch (icon) {
      case 'bluetooth':
        return <Bluetooth className="text-nestor-blue" size={20} />;
      case 'bell':
        return <Bell className="text-nestor-blue" size={20} />;
      case 'heart-pulse':
        return <HeartPulse className="text-nestor-blue" size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="nestor-icon-container">
          {getIcon()}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">{title}</h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
};

export default PermissionItem;
