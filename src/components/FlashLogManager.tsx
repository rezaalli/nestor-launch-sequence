
import React, { useState, useEffect } from 'react';
import FlashLogUpload from './FlashLogUpload';

const FlashLogManager = () => {
  const [showFlashLogPrompt, setShowFlashLogPrompt] = useState(false);

  useEffect(() => {
    // Listen for flash log data availability
    const handleFlashDataAvailable = () => {
      setShowFlashLogPrompt(true);
    };
    
    // Add event listener
    window.addEventListener('nestor-flash-data-available', handleFlashDataAvailable);
    
    // Clean up on unmount
    return () => {
      window.removeEventListener('nestor-flash-data-available', handleFlashDataAvailable);
    };
  }, []);

  return (
    <FlashLogUpload
      open={showFlashLogPrompt}
      onOpenChange={setShowFlashLogPrompt}
    />
  );
};

export default FlashLogManager;
