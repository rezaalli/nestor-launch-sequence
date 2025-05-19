import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, TrendingUp, User, Heart, Activity, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const BottomNavbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path: string) => {
    return currentPath === path;
  };
  
  // Define navigation items
  const navItems = [
    {
      path: '/dashboard',
      icon: <Home />,
      label: 'Home',
    },
    {
      path: '/log',
      icon: <Calendar />,
      label: 'Log',
    },
    {
      path: '/trends',
      icon: <TrendingUp />,
      label: 'Insights',
    },
    {
      path: '/profile',
      icon: <User />,
      label: 'Profile',
    }
  ];

  // Define additional items that aren't in the main navigation but accessible
  const additionalItems = [
    {
      path: '/ml-demo',
      icon: <Brain />,
      label: 'ML Demo',
      showIndicator: currentPath === '/ml-demo'
    }
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-1 z-50 shadow-sm">
      <div className="flex flex-col max-w-md mx-auto">
        {/* Main navigation items */}
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path} 
              className={cn(
                "flex flex-col items-center justify-center py-3 flex-1 relative",
                isActive(item.path) ? "text-blue-600" : "text-gray-400"
              )}
              aria-label={item.label}
            >
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ 
                  scale: isActive(item.path) ? 1 : 0.8,
                  y: isActive(item.path) ? -2 : 0
                }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                {React.cloneElement(item.icon, { 
                  size: 22,
                  className: cn(
                    "transition-colors",
                    isActive(item.path) && "stroke-[2.5px]"
                  )
                })}
                
                {/* Active indicator dot */}
                {isActive(item.path) && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.div>
              
              <motion.span 
                className="text-xs mt-1"
                animate={{ 
                  opacity: isActive(item.path) ? 1 : 0.7,
                  fontWeight: isActive(item.path) ? 500 : 400
                }}
                transition={{ duration: 0.2 }}
              >
                {item.label}
              </motion.span>
            </Link>
          ))}
        </div>
        
        {/* Additional items (like ML Demo) */}
        {additionalItems.some(item => item.showIndicator) && (
          <div className="flex justify-center pb-1 pt-0 -mt-1 border-t border-gray-100">
            {additionalItems
              .filter(item => item.showIndicator)
              .map(item => (
                <div key={item.path} className="text-xs text-blue-600 flex items-center">
                  <span className="mr-1">Currently viewing:</span>
                  {React.cloneElement(item.icon, { size: 12 })}
                  <span className="ml-1 font-medium">{item.label}</span>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </nav>
  );
};

export default BottomNavbar;
