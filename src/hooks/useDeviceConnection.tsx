
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { connectToDevice, isDeviceConnected, getLastReading, handleReconnection, isBleAvailable, requestBlePermissions } from "@/utils/bleUtils";
import { BleClient } from '@capacitor-community/bluetooth-le';

export const useDeviceConnection = () => {
  // ALWAYS default to connected state in development environment
  const isDevelopment = process.env.NODE_ENV === 'development';
  const [connectionState, setConnectionState] = useState<'connected' | 'disconnected' | 'reconnecting'>(
    isDevelopment ? 'connected' : 'disconnected'
  );
  const [lastVitalUpdate, setLastVitalUpdate] = useState<number>(Date.now());
  const navigate = useNavigate();

  useEffect(() => {
    // Always stay connected in development environment
    if (isDevelopment) {
      console.log('Development environment detected. BLE connection ALWAYS bypassed.');
      setConnectionState('connected');
      return; // Skip all BLE initialization in development
    }

    // Rest of the effect logic only runs in production
    const initializeConnection = async () => {
      try {
        // First check if BLE is available
        const bleAvailable = await isBleAvailable();
        
        if (!bleAvailable) {
          console.log('Bluetooth LE is not available on this device');
          setConnectionState('disconnected');
          return;
        }
        
        // Request permissions
        const hasPermissions = await requestBlePermissions();
        
        if (!hasPermissions) {
          console.log('Bluetooth permissions not granted');
          setConnectionState('disconnected');
          return;
        }
        
        // Initialize BLE client
        await BleClient.initialize();
        
        // Try to connect
        const connected = await connectToDevice();
        setConnectionState(connected ? 'connected' : 'disconnected');
      } catch (error) {
        console.error('Failed to initialize BLE connection:', error);
        setConnectionState('disconnected');
      }
    };
    
    // Only run in production
    if (!isDevelopment) {
      initializeConnection();
    }
    
    // Listen for Nestor vital updates
    const handleVitalUpdate = (event: Event) => {
      const vitalData = (event as CustomEvent).detail;
      setLastVitalUpdate(Date.now());
    };
    
    // Add event listeners
    window.addEventListener('nestor-vital-update', handleVitalUpdate);
    
    // Check connection status periodically
    const connectionCheckInterval = setInterval(() => {
      // Always stay connected in development
      if (isDevelopment) {
        setConnectionState('connected');
        return;
      }

      const connected = isDeviceConnected();
      const wasDisconnected = connectionState === 'disconnected' || connectionState === 'reconnecting';
      
      if (connected && wasDisconnected) {
        // Device was disconnected but now reconnected
        setConnectionState('connected');
        handleReconnection();
      } else if (connected) {
        setConnectionState('connected');
      } else if (!connected && connectionState === 'connected') {
        // Device just disconnected
        setConnectionState('reconnecting');
      } else if (!connected && connectionState === 'reconnecting' && Date.now() - lastVitalUpdate > 30000) {
        // Device has been disconnected for more than 30 seconds
        setConnectionState('disconnected');
      }
      
      // If we haven't received data in 30 seconds, try to reconnect
      if (connected && Date.now() - lastVitalUpdate > 30000) {
        connectToDevice().then(success => {
          if (!success) {
            setConnectionState('disconnected');
          }
        });
      }
    }, 15000); // Check every 15 seconds

    // Clean up on unmount
    return () => {
      window.removeEventListener('nestor-vital-update', handleVitalUpdate);
      clearInterval(connectionCheckInterval);
    };
  }, [connectionState, lastVitalUpdate, isDevelopment]);

  // Function to attempt device reconnection
  const attemptReconnection = async () => {
    // In development, always return true to simulate successful connection
    if (isDevelopment) {
      setConnectionState('connected');
      return true;
    }
    
    const connected = await connectToDevice();
    setConnectionState(connected ? 'connected' : 'disconnected');
    return connected;
  };

  // Function to bypass connection requirement
  const continueWithoutDevice = () => {
    console.log('Continuing without device connection');
    setConnectionState('connected');
    // Automatically navigate to dashboard when continuing without device
    navigate('/dashboard');
  };

  return {
    connectionState,
    setConnectionState,
    attemptReconnection,
    continueWithoutDevice
  };
};
