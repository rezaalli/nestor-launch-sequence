
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, Bell, TrendingUp, User, Clock } from 'lucide-react';

const BottomNavbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => {
    return currentPath === path;
  };
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around">
        <Link 
          to="/dashboard" 
          className={`flex flex-col items-center justify-center py-2 flex-1 ${isActive('/dashboard') ? 'text-blue-900' : 'text-gray-600'}`}
        >
          <Home size={20} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        
        <Link 
          to="/lifestyle-checkin" 
          className={`flex flex-col items-center justify-center py-2 flex-1 ${isActive('/lifestyle-checkin') ? 'text-blue-900' : 'text-gray-600'}`}
        >
          <Calendar size={20} />
          <span className="text-xs mt-1">Check-In</span>
        </Link>
        
        <Link 
          to="/history" 
          className={`flex flex-col items-center justify-center py-2 flex-1 ${isActive('/history') ? 'text-blue-900' : 'text-gray-600'}`}
        >
          <Clock size={20} />
          <span className="text-xs mt-1">History</span>
        </Link>
        
        <Link 
          to="/trends" 
          className={`flex flex-col items-center justify-center py-2 flex-1 ${isActive('/trends') ? 'text-blue-900' : 'text-gray-600'}`}
        >
          <TrendingUp size={20} />
          <span className="text-xs mt-1">Trends</span>
        </Link>
        
        <Link 
          to="/profile" 
          className={`flex flex-col items-center justify-center py-2 flex-1 ${isActive('/profile') ? 'text-blue-900' : 'text-gray-600'}`}
        >
          <User size={20} />
          <span className="text-xs mt-1">Profile</span>
        </Link>
      </div>
    </nav>
  );
};

export default BottomNavbar;
