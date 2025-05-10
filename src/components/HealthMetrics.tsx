import React, { useState, useEffect, useRef } from 'react';
import { HeartPulse, Droplet, Activity, Thermometer, Move, Activity as HrvIcon, Wind, Footprints, Flame } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { getLastReading, isDeviceWorn, formatTemperature } from '@/utils/bleUtils';
import MacroNutrientMetric from './MacroNutrientMetric';

interface HealthMetricsProps {
  customizeMode?: boolean;
  availableMetrics?: {
    heartRate: boolean;
    spo2: boolean;
    ecg: boolean;
    temperature: boolean;
    hrv: boolean;
    respiratoryRate: boolean;
    steps: boolean;
    caloriesBurned: boolean;
    macronutrients: boolean;
    [key: string]: boolean;
  };
}

const HealthMetrics = ({ 
  customizeMode = false,
  availableMetrics = {
    heartRate: true,
    spo2: true,
    ecg: true,
    temperature: true,
    hrv: false,
    respiratoryRate: false,
    steps: false,
    caloriesBurned: false,
    macronutrients: false
  }
}: HealthMetricsProps) => {
  // Get unit preference from user context
  const { user } = useUser();
  const unitPreference = user.unitPreference || 'imperial'; // Default to imperial (Fahrenheit)
  
  const [lastReading, setLastReading] = useState(getLastReading());
  const [deviceWorn, setDeviceWorn] = useState(isDeviceWorn());
  const gridRef = useRef<HTMLDivElement>(null);
  
  // Subscribe to vital updates
  useEffect(() => {
    const handleVitalUpdate = () => {
      setLastReading(getLastReading());
      setDeviceWorn(isDeviceWorn());
    };
    
    const handleWearStateChange = (event: Event) => {
      const { worn } = (event as CustomEvent).detail;
      setDeviceWorn(worn);
    };
    
    window.addEventListener('nestor-vital-update', handleVitalUpdate);
    window.addEventListener('nestor-wear-state', handleWearStateChange);
    
    return () => {
      window.removeEventListener('nestor-vital-update', handleVitalUpdate);
      window.removeEventListener('nestor-wear-state', handleWearStateChange);
    };
  }, []);
  
  // Effect for setting up drag-and-drop functionality
  useEffect(() => {
    if (!customizeMode || !gridRef.current) return;

    let dragSrcEl: HTMLElement | null = null;
    
    const handleDragStart = (e: DragEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      
      dragSrcEl = e.target.closest('.metric-card');
      if (!dragSrcEl) return;
      
      e.dataTransfer?.setData('text/plain', ''); // Required for Firefox
      
      setTimeout(() => {
        if (dragSrcEl) dragSrcEl.classList.add('opacity-50');
      }, 0);
    };
    
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };
    
    const handleDragEnter = (e: DragEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      
      const targetCard = e.target.closest('.metric-card');
      if (targetCard) {
        targetCard.classList.add('bg-gray-100');
      }
    };
    
    const handleDragLeave = (e: DragEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      
      const targetCard = e.target.closest('.metric-card');
      if (targetCard) {
        targetCard.classList.remove('bg-gray-100');
      }
    };
    
    const handleDrop = (e: DragEvent) => {
      e.stopPropagation();
      
      if (!(e.target instanceof HTMLElement) || !dragSrcEl) return;
      
      const targetCard = e.target.closest('.metric-card');
      
      if (targetCard && dragSrcEl !== targetCard && gridRef.current) {
        // Determine if we're inserting before or after the target
        const rect = targetCard.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        const midY = rect.top + rect.height / 2;
        
        // If pointer is before the middle of the card, insert before, otherwise insert after
        if (e.clientX < midX && e.clientY < midY) {
          gridRef.current.insertBefore(dragSrcEl, targetCard);
        } else {
          gridRef.current.insertBefore(dragSrcEl, targetCard.nextSibling);
        }
        
        // Store the new order in localStorage
        saveCardOrder();
      }
      
      // Clean up
      if (targetCard) targetCard.classList.remove('bg-gray-100');
      if (dragSrcEl) dragSrcEl.classList.remove('opacity-50');
      
      return false;
    };
    
    const handleDragEnd = (e: DragEvent) => {
      if (!(e.target instanceof HTMLElement)) return;
      
      const cards = gridRef.current?.querySelectorAll('.metric-card');
      if (cards) {
        cards.forEach(card => {
          (card as HTMLElement).classList.remove('bg-gray-100', 'opacity-50');
        });
      }
    };
    
    // Save the card order to localStorage
    const saveCardOrder = () => {
      const cards = gridRef.current?.querySelectorAll('.metric-card');
      if (!cards) return;
      
      const order = Array.from(cards).map(card => card.id);
      localStorage.setItem('metricsOrder', JSON.stringify(order));
    };
    
    // Load saved order
    const loadCardOrder = () => {
      const container = gridRef.current;
      if (!container) return;
      
      const savedOrder = localStorage.getItem('metricsOrder');
      if (!savedOrder) return;
      
      try {
        const order = JSON.parse(savedOrder);
        // Get all current cards
        const cards = Array.from(container.querySelectorAll('.metric-card'));
        
        // Reorder cards according to saved order
        order.forEach((id: string) => {
          const card = cards.find(card => card.id === id);
          if (card) container.appendChild(card);
        });
      } catch (e) {
        console.error('Error loading card order:', e);
      }
    };
    
    // Add event listeners to all cards
    const cards = gridRef.current.querySelectorAll('.metric-card');
    cards.forEach(card => {
      card.setAttribute('draggable', customizeMode ? 'true' : 'false');
      card.addEventListener('dragstart', handleDragStart);
      card.addEventListener('dragover', handleDragOver);
      card.addEventListener('dragenter', handleDragEnter);
      card.addEventListener('dragleave', handleDragLeave);
      card.addEventListener('drop', handleDrop);
      card.addEventListener('dragend', handleDragEnd);
    });
    
    // Load saved card order on mount
    loadCardOrder();
    
    // Cleanup event listeners on component unmount or when customizeMode changes
    return () => {
      if (!gridRef.current) return;
      
      const cards = gridRef.current.querySelectorAll('.metric-card');
      cards.forEach(card => {
        card.removeEventListener('dragstart', handleDragStart);
        card.removeEventListener('dragover', handleDragOver);
        card.removeEventListener('dragenter', handleDragEnter);
        card.removeEventListener('dragleave', handleDragLeave);
        card.removeEventListener('drop', handleDrop);
        card.removeEventListener('dragend', handleDragEnd);
      });
    };
  }, [customizeMode]);
  
  // If device is not worn, show a message
  if (!deviceWorn) {
    return (
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white border border-gray-200 rounded-xl col-span-2 text-center">
          <div className="py-6 text-gray-500">
            <p className="mb-2">Device not being worn</p>
            <p className="text-sm">Put on your device to see real-time metrics</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Get values from last reading or use defaults
  const heartRate = lastReading?.hr ?? 72;
  const spo2 = lastReading?.spo2 ?? 98;
  const tempCelsius = (lastReading?.temp ?? 367) / 10;
  const caloriesBurned = lastReading?.calories ?? 475; // Default calories if not available
  
  // Display temperature based on user preference
  const tempDisplay = formatTemperature(lastReading?.temp ?? 367, unitPreference);

  // Helper function to render the drag handle when in customize mode
  const renderDragHandle = () => {
    if (!customizeMode) return null;
    
    return (
      <div className="absolute top-2 right-2 text-gray-400 cursor-move">
        <Move size={14} />
      </div>
    );
  };

  // Count how many metrics are visible to determine grid layout
  const visibleMetricsCount = Object.values(availableMetrics).filter(Boolean).length;
  const gridCols = visibleMetricsCount <= 1 ? "grid-cols-1" : "grid-cols-2";

  // Apply enhanced styles to tiles
  const tileStyles = "p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 metric-card relative";

  return (
    <div ref={gridRef} className={`grid ${gridCols} gap-3`}>
      {availableMetrics.heartRate && (
        <div className={tileStyles} id="heartRate">
          {renderDragHandle()}
          <div className="flex items-center mb-2">
            <HeartPulse className="text-red-500 mr-2" size={17} />
            <span className="text-sm font-medium text-gray-700">Heart Rate</span>
          </div>
          <div className="flex items-end">
            <span className="text-2xl font-semibold text-gray-900">{heartRate}</span>
            <span className="text-sm text-gray-600 ml-1 mb-0.5">bpm</span>
          </div>
          <div className="mt-2 h-8">
            <div className="relative h-full">
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between space-x-1">
                {[2, 3, 4, 5, 7, 5, 3, 2, 1].map((height, index) => (
                  <div 
                    key={index} 
                    className={`w-1 bg-red-${height === 7 ? '500' : height >= 4 ? '400' : height >= 3 ? '300' : '200'} rounded-t`} 
                    style={{height: `${height * 4}px`}}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {availableMetrics.spo2 && (
        <div className={tileStyles} id="spo2">
          {renderDragHandle()}
          <div className="flex items-center mb-2">
            <Droplet className="text-blue-500 mr-2" size={17} />
            <span className="text-sm font-medium text-gray-700">SpO₂</span>
          </div>
          <div className="flex items-end">
            <span className="text-2xl font-semibold text-gray-900">{spo2}</span>
            <span className="text-sm text-gray-600 ml-1 mb-0.5">%</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{width: `${spo2}%`}}></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">90</span>
              <span className="text-xs text-gray-500">100</span>
            </div>
          </div>
        </div>
      )}
      
      {availableMetrics.ecg && (
        <div className={tileStyles} id="ecg">
          {renderDragHandle()}
          <div className="flex items-center mb-2">
            <Activity className="text-purple-500 mr-2" size={17} />
            <span className="text-sm font-medium text-gray-700">ECG</span>
          </div>
          <div className="text-sm text-gray-900 font-medium">Normal Sinus</div>
          <div className="mt-2 h-10">
            <div className="relative h-full flex items-center">
              <div className="absolute inset-0">
                <svg viewBox="0 0 100 30" className="w-full h-full">
                  <path d="M0,15 L10,15 L15,5 L20,25 L25,15 L30,15 L35,15 L40,5 L45,25 L50,15 L55,15 L60,15 L65,5 L70,25 L75,15 L80,15 L85,15 L90,5 L95,25 L100,15" 
                        fill="none" stroke="#a855f7" strokeWidth="1.5"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {availableMetrics.temperature && (
        <div className={tileStyles} id="temperature">
          {renderDragHandle()}
          <div className="flex items-center mb-2">
            <Thermometer className="text-orange-500 mr-2" size={17} />
            <span className="text-sm font-medium text-gray-700">Temperature</span>
          </div>
          <div className="flex items-end">
            <span className="text-2xl font-semibold text-gray-900">{tempDisplay.value}</span>
            <span className="text-sm text-gray-600 ml-1 mb-0.5">{tempDisplay.unit}</span>
          </div>
          <div className="mt-2 flex items-center">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div 
                className={`h-1.5 rounded-full ${tempCelsius > 37.5 ? 'bg-red-500' : 'bg-orange-500'}`} 
                style={{width: `${Math.min(100, Math.max(0, ((tempCelsius - 35) / 3) * 100))}%`}}
              ></div>
            </div>
            <span className="text-xs text-gray-500 ml-2">
              {tempCelsius > 37.5 ? 'Elevated' : 'Normal'}
            </span>
          </div>
        </div>
      )}
      
      {/* New Macronutrient metric */}
      {availableMetrics.macronutrients && (
        <MacroNutrientMetric 
          className="metric-card col-span-2" 
          id="macronutrients"
          showDragHandle={customizeMode}
        />
      )}
      
      {/* Existing metrics below */}
      {availableMetrics.hrv && (
        <div className={tileStyles} id="hrv">
          {renderDragHandle()}
          <div className="flex items-center mb-2">
            <HrvIcon className="text-green-500 mr-2" size={17} />
            <span className="text-sm font-medium text-gray-700">HRV</span>
          </div>
          <div className="flex items-end">
            <span className="text-2xl font-semibold text-gray-900">48</span>
            <span className="text-sm text-gray-600 ml-1 mb-0.5">ms</span>
          </div>
          <div className="mt-2 h-8">
            <div className="relative h-full">
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between space-x-1">
                {[3, 4, 5, 6, 7, 5, 4, 3, 2].map((height, index) => (
                  <div 
                    key={index} 
                    className={`w-1 bg-green-${height === 7 ? '500' : height >= 5 ? '400' : height >= 4 ? '300' : '200'} rounded-t`} 
                    style={{height: `${height * 4}px`}}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {availableMetrics.respiratoryRate && (
        <div className={tileStyles} id="respiratoryRate">
          {renderDragHandle()}
          <div className="flex items-center mb-2">
            <Wind className="text-blue-400 mr-2" size={17} />
            <span className="text-sm font-medium text-gray-700">Respiratory Rate</span>
          </div>
          <div className="flex items-end">
            <span className="text-2xl font-semibold text-gray-900">16</span>
            <span className="text-sm text-gray-600 ml-1 mb-0.5">bpm</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-blue-400 h-1.5 rounded-full" style={{width: `60%`}}></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">12</span>
              <span className="text-xs text-gray-500">20</span>
            </div>
          </div>
        </div>
      )}
      
      {availableMetrics.steps && (
        <div className={tileStyles} id="steps">
          {renderDragHandle()}
          <div className="flex items-center mb-2">
            <Footprints className="text-purple-400 mr-2" size={17} />
            <span className="text-sm font-medium text-gray-700">Steps</span>
          </div>
          <div className="flex items-end">
            <span className="text-2xl font-semibold text-gray-900">8,432</span>
            <span className="text-sm text-gray-600 ml-1 mb-0.5">steps</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-purple-400 h-1.5 rounded-full" style={{width: `84%`}}></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">0</span>
              <span className="text-xs text-gray-500">10k</span>
            </div>
          </div>
        </div>
      )}
      
      {availableMetrics.caloriesBurned && (
        <div className={tileStyles} id="caloriesBurned">
          {renderDragHandle()}
          <div className="flex items-center mb-2">
            <Flame className="text-orange-400 mr-2" size={17} />
            <span className="text-sm font-medium text-gray-700">Calories Burned</span>
          </div>
          <div className="flex items-end">
            <span className="text-2xl font-semibold text-gray-900">{caloriesBurned}</span>
            <span className="text-sm text-gray-600 ml-1 mb-0.5">kcal</span>
          </div>
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-orange-400 h-1.5 rounded-full" style={{width: `${Math.min(100, (caloriesBurned / 2000) * 100)}%`}}></div>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-500">0</span>
              <span className="text-xs text-gray-500">2000</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthMetrics;
