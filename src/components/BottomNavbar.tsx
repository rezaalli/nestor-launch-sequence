
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useNotifications } from '@/contexts/NotificationsContext';
import { Link } from 'react-router-dom';

const BottomNavbar = () => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  
  return (
    <div className="mt-auto pt-4">
      <div className="h-16 px-6 border-t border-gray-200 flex items-center justify-between">
        <Link to="/dashboard" className="flex flex-col items-center w-16">
          <i className={`fa-solid fa-house ${location.pathname === '/dashboard' ? "text-blue-900" : "text-gray-400"} text-lg`}></i>
          <span className={`text-xs ${location.pathname === '/dashboard' ? "text-blue-900 font-medium" : "text-gray-400"} mt-1`}>Home</span>
        </Link>
        
        <button className="flex flex-col items-center w-16">
          <i className="fa-regular fa-calendar-days text-gray-400 text-lg"></i>
          <span className="text-xs text-gray-400 mt-1">Log</span>
        </button>
        
        <button className="flex flex-col items-center w-16">
          <i className="fa-solid fa-watch text-gray-400 text-lg"></i>
          <span className="text-xs text-gray-400 mt-1">Devices</span>
        </button>
        
        <Link to="/notifications" className="flex flex-col items-center w-16 relative">
          <i className={`fa-solid fa-bell ${location.pathname === '/notifications' ? "text-blue-900" : "text-gray-400"} text-lg`}></i>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
          <span className={`text-xs ${location.pathname === '/notifications' ? "text-blue-900 font-medium" : "text-gray-400"} mt-1`}>Alerts</span>
        </Link>
        
        <button className="flex flex-col items-center w-16">
          <i className="fa-regular fa-user text-gray-400 text-lg"></i>
          <span className="text-xs text-gray-400 mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavbar;
