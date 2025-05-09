
import React from 'react';
import { useNavigate } from 'react-router-dom';
import DeviceConnectionLostScreen from './DeviceConnectionLostScreen';

const ConnectionLostPage = () => {
  const navigate = useNavigate();
  
  return (
    <DeviceConnectionLostScreen
      onRetry={() => navigate('/dashboard')}
      onContinueWithoutDevice={() => navigate('/dashboard')}
    />
  );
};

export default ConnectionLostPage;
