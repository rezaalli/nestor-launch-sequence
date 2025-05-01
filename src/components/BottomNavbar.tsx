
import React from 'react';
import { Home, CalendarDays, Watch, LineChart, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const BottomNavbar = () => {
  return (
    <div className="mt-auto pt-4">
      <div className="h-16 px-6 border-t border-gray-200 flex items-center justify-between">
        <Link to="/dashboard" className="flex flex-col items-center w-16">
          <Home className="text-nestor-blue text-lg" size={20} />
          <span className="text-xs text-nestor-blue font-medium mt-1">Home</span>
        </Link>
        
        <button className="flex flex-col items-center w-16">
          <CalendarDays className="text-nestor-gray-400 text-lg" size={20} />
          <span className="text-xs text-nestor-gray-400 mt-1">Diary</span>
        </button>
        
        <button className="flex flex-col items-center w-16">
          <Watch className="text-nestor-gray-400 text-lg" size={20} />
          <span className="text-xs text-nestor-gray-400 mt-1">Devices</span>
        </button>
        
        <button className="flex flex-col items-center w-16">
          <LineChart className="text-nestor-gray-400 text-lg" size={20} />
          <span className="text-xs text-nestor-gray-400 mt-1">Reports</span>
        </button>
        
        <button className="flex flex-col items-center w-16">
          <User className="text-nestor-gray-400 text-lg" size={20} />
          <span className="text-xs text-nestor-gray-400 mt-1">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavbar;
