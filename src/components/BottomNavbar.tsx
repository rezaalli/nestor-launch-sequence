
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Link } from 'react-router-dom';

const BottomNavbar = () => {
  const location = useLocation();
  
  return (
    <div className="mt-auto pt-4">
      <div className="h-16 px-6 border-t border-gray-200 flex items-center justify-between fixed bottom-0 left-0 right-0 bg-white">
        <Link to="/dashboard" className="flex flex-col items-center w-16">
          <i className={`fa-solid fa-house ${location.pathname === '/dashboard' ? "text-blue-900" : "text-gray-400"} text-lg`}></i>
          <span className={`text-xs ${location.pathname === '/dashboard' ? "text-blue-900 font-medium" : "text-gray-400"} mt-1`}>Home</span>
        </Link>
        
        <Link to="/trends" className="flex flex-col items-center w-16">
          <i className={`fa-solid fa-chart-line ${location.pathname === '/trends' ? "text-blue-900" : "text-gray-400"} text-lg`}></i>
          <span className={`text-xs ${location.pathname === '/trends' ? "text-blue-900 font-medium" : "text-gray-400"} mt-1`}>Insights</span>
        </Link>
        
        <Link to="/reports" className="flex flex-col items-center w-16">
          <i className={`fa-solid fa-file-lines ${location.pathname === '/reports' ? "text-blue-900" : "text-gray-400"} text-lg`}></i>
          <span className={`text-xs ${location.pathname === '/reports' ? "text-blue-900 font-medium" : "text-gray-400"} mt-1`}>Reports</span>
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
