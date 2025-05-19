import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

interface SwipeNavigationProps {
  children: React.ReactNode;
  routes: string[];
}

const SwipeNavigation: React.FC<SwipeNavigationProps> = ({ children, routes }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  // Required min swipe distance
  const minSwipeDistance = 50;

  useEffect(() => {
    // Reset direction after navigation
    setDirection(null);
  }, [location.pathname]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    // Find current route index
    const currentIndex = routes.indexOf(location.pathname);
    if (currentIndex === -1) return;
    
    if (isLeftSwipe && currentIndex < routes.length - 1) {
      // Navigate to next route
      setDirection('left');
      navigate(routes[currentIndex + 1]);
    } else if (isRightSwipe && currentIndex > 0) {
      // Navigate to previous route
      setDirection('right');
      navigate(routes[currentIndex - 1]);
    }
  };

  const variants = {
    enter: (direction: 'left' | 'right' | null) => {
      return {
        x: direction === 'right' ? -300 : direction === 'left' ? 300 : 0,
        opacity: 0
      };
    },
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: 'left' | 'right' | null) => {
      return {
        x: direction === 'left' ? -300 : direction === 'right' ? 300 : 0,
        opacity: 0
      };
    }
  };

  return (
    <div 
      className="swipe-container"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={location.pathname}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 }
          }}
          className="w-full h-full"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default SwipeNavigation; 