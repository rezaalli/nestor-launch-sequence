
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DeviceConnectionLostScreen from './DeviceConnectionLostScreen';

const ConnectionLostPage = () => {
  const navigate = useNavigate();
  
  // In development environment, automatically redirect to dashboard
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Development environment detected. Automatically redirecting to dashboard.');
      navigate('/dashboard');
    }
  }, [navigate]);
  
  // If we're in development, we won't even render the connection lost screen
  if (process.env.NODE_ENV === 'development') {
    return null;
  }
  
  return (
    <DeviceConnectionLostScreen
      onRetry={() => navigate('/dashboard')}
      onContinueWithoutDevice={() => navigate('/dashboard')}
    />
  );
};

export default ConnectionLostPage;
