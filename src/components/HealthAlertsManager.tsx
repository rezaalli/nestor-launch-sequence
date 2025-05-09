
import React, { useState, useEffect } from 'react';
import SpO2AlertDialog from "./SpO2AlertDialog";
import TemperatureAlertDialog from "./TemperatureAlertDialog";
import { detectLowSpO2, analyzeSpO2, detectAbnormalTemperature } from "../utils/healthUtils";

const HealthAlertsManager = () => {
  const [showSpO2Alert, setShowSpO2Alert] = useState(false);
  const [spO2Level, setSpO2Level] = useState(92);
  const [showTempAlert, setShowTempAlert] = useState(false);
  const [tempData, setTempData] = useState({ temperature: 38.4, type: 'high' as 'high' | 'low' });

  useEffect(() => {
    // Listen for vital updates
    const handleVitalUpdate = (event: Event) => {
      const vitalData = (event as CustomEvent).detail;
      
      // Update SpO2 if needed
      if (vitalData.spo2 < 92) {
        setSpO2Level(vitalData.spo2);
        setShowSpO2Alert(true);
      }
    };
    
    // Listen for fever alerts
    const handleFeverAlert = (event: Event) => {
      const feverData = (event as CustomEvent).detail;
      setTempData({
        temperature: feverData.temperature,
        type: feverData.type
      });
      setShowTempAlert(true);
    };
    
    // Add event listeners
    window.addEventListener('nestor-vital-update', handleVitalUpdate);
    window.addEventListener('nestor-fever-alert', handleFeverAlert);
    
    // Simulate SpO2 and temperature alerts for demo purposes
    const checkSpO2 = () => {
      const { detected, spO2Level: level } = detectLowSpO2();
      if (detected) {
        setSpO2Level(level);
        setShowSpO2Alert(true);
      }
    };
    
    const checkTemperature = () => {
      const { detected, temperature, type } = detectAbnormalTemperature();
      if (detected && (type === 'high' || type === 'low')) {
        setTempData({ temperature, type });
        setShowTempAlert(true);
      }
    };

    // For demo purposes, check SpO2 and temp occasionally
    const spO2Timer = setInterval(checkSpO2, 30000);
    const tempTimer = setInterval(checkTemperature, 45000);
    
    // Initial checks after a delay for demo purposes
    const initialSpO2Timer = setTimeout(checkSpO2, 15000);
    const initialTempTimer = setTimeout(checkTemperature, 25000);
    
    // Clean up on unmount
    return () => {
      window.removeEventListener('nestor-vital-update', handleVitalUpdate);
      window.removeEventListener('nestor-fever-alert', handleFeverAlert);
      clearInterval(spO2Timer);
      clearInterval(tempTimer);
      clearTimeout(initialSpO2Timer);
      clearTimeout(initialTempTimer);
    };
  }, []);

  return (
    <>
      <SpO2AlertDialog 
        open={showSpO2Alert} 
        onOpenChange={setShowSpO2Alert} 
        spO2Level={spO2Level}
        onDismiss={() => setShowSpO2Alert(false)}
        onTakeReading={() => {
          // Simulate taking a new reading
          const newLevel = Math.floor(Math.random() * 6) + 95; // Generate a normal reading after "taking" a new one
          setSpO2Level(newLevel);
          setTimeout(() => setShowSpO2Alert(false), 2000);
        }}
      />
      
      <TemperatureAlertDialog 
        open={showTempAlert}
        onOpenChange={setShowTempAlert}
        temperature={tempData.temperature}
        temperatureType={tempData.type}
        onDismiss={() => setShowTempAlert(false)}
        onMonitor={() => {
          // Simulate taking a new reading
          setTimeout(() => setShowTempAlert(false), 2000);
        }}
      />
    </>
  );
};

export default HealthAlertsManager;
