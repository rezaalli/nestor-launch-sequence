
import React from 'react';

const StatusBar = () => {
  return (
    <div className="h-6 w-full bg-white flex justify-between items-center px-4">
      <div className="flex items-center space-x-1">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nestor-gray-900">
          <path d="M6 8.5a2.5 2.5 0 0 0 5 0 2.5 2.5 0 0 0-5 0Z"/>
          <path d="M6.5 19.5h11M10 19.5v-2.9a.6.6 0 0 1 .6-.6h2.8a.6.6 0 0 1 .6.6v2.9M8.5 2h7M14 2v6h1a2 2 0 0 1 2 2v9.5"/>
          <path d="M10 2v6H9a2 2 0 0 0-2 2v9.5"/>
          <path d="M3 8.5a7 7 0 0 0 14 0 7 7 0 0 0-14 0Z"/>
          <path d="m5 13 2.5 3 4-5 5 5"/>
        </svg>
        <span className="text-xs text-nestor-gray-900">5G</span>
      </div>
      <div className="text-xs text-nestor-gray-900">9:41</div>
      <div className="flex items-center space-x-1">
        <span className="text-xs text-nestor-gray-900">100%</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-nestor-gray-900">
          <rect width="16" height="10" x="2" y="7" rx="2" ry="2"/>
          <line x1="22" x2="22" y1="11" y2="13"/>
          <line x1="20" x2="20" y1="7" y2="17"/>
          <line x1="6" x2="6" y1="7" y2="17"/>
          <line x1="10" x2="10" y1="7" y2="17"/>
          <line x1="14" x2="14" y1="7" y2="17"/>
        </svg>
      </div>
    </div>
  );
};

export default StatusBar;
