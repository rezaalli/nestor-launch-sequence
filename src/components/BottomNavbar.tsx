
import React from 'react';
import { Home, CalendarDays, Watch, LineChart, Bell, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationsContext';

const BottomNavbar = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  
  return (
    <div className="mt-auto pt-4">
      <div className="h-16 px-6 border-t border-gray-200 flex items-center justify-between">
        <Link to="/dashboard" className="flex flex-col items-center w-16">
          <Home className={location.pathname === '/dashboard' ? "text-nestor-blue" : "text-nestor-gray-400"} size={20} />
          <span className={`text-xs ${location.pathname === '/dashboard' ? "text-nestor-blue font-medium" : "text-nestor-gray-400"} mt-1`}>Home</span>
        </Link>
        
        <button className="flex flex-col items-center w-16">
          <CalendarDays className="text-nestor-gray-400" size={20} />
          <span className="text-xs text-nestor-gray-400 mt-1">Diary</span>
        </button>
        
        <button className="flex flex-col items-center w-16">
          <Watch className="text-nestor-gray-400" size={20} />
          <span className="text-xs text-nestor-gray-400 mt-1">Devices</span>
        </button>
        
        <Link to="/notifications" className="flex flex-col items-center w-16 relative">
          <Bell className={location.pathname === '/notifications' ? "text-nestor-blue" : "text-nestor-gray-400"} size={20} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          <span className={`text-xs ${location.pathname === '/notifications' ? "text-nestor-blue font-medium" : "text-nestor-gray-400"} mt-1`}>Alerts</span>
        </Link>
        
        <button className="flex flex-col items-center w-16">
          <User className="text-nestor-gray-400" size={20} />
          <span className="text-xs text-nestor-gray-400 mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavbar;
