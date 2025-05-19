import { v4 as uuidv4 } from 'uuid';

/**
 * FHIR Resource Types we support in our application
 */
export type FHIRResourceType = 
  | 'Patient'
  | 'Observation'
  | 'Device'
  | 'MedicationStatement'
  | 'Procedure'
  | 'DiagnosticReport';

/**
 * Interface for FHIR Resource
 */
export interface FHIRResource {
  resourceType: FHIRResourceType;
  id: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    source?: string;
    profile?: string[];
  };
  [key: string]: any;
}

/**
 * Interface for FHIR Observation specifically
 */
export interface FHIRObservation extends FHIRResource {
  resourceType: 'Observation';
  status: 'registered' | 'preliminary' | 'final' | 'amended';
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
    text?: string;
  };
  subject: {
    reference: string;
  };
  effectiveDateTime?: string;
  issued?: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  device?: {
    reference: string;
  };
}

/**
 * Main adapter for FHIR operations
 * Handles conversions between FHIR and our internal data models
 */
export class FHIRAdapter {
  private static instance: FHIRAdapter;
  
  // Systems for coding
  static readonly LOINC_SYSTEM = 'http://loinc.org';
  static readonly SNOMED_SYSTEM = 'http://snomed.info/sct';
  static readonly UCUM_SYSTEM = 'http://unitsofmeasure.org';
  
  // Common LOINC codes for health metrics
  static readonly LOINC_CODES = {
    HEART_RATE: '8867-4',
    BLOOD_PRESSURE_SYSTOLIC: '8480-6',
    BLOOD_PRESSURE_DIASTOLIC: '8462-4',
    BODY_TEMPERATURE: '8310-5',
    BODY_WEIGHT: '29463-7',
    BODY_HEIGHT: '8302-2',
    OXYGEN_SATURATION: '59408-5',
    RESPIRATORY_RATE: '9279-1',
    STEPS_COUNT: '41950-7',
    SLEEP_DURATION: '93832-4',
  };
  
  private constructor() {
    // Private constructor for singleton pattern
  }
  
  static getInstance(): FHIRAdapter {
    if (!FHIRAdapter.instance) {
      FHIRAdapter.instance = new FHIRAdapter();
    }
    return FHIRAdapter.instance;
  }
  
  /**
   * Convert heart rate from internal format to FHIR Observation
   */
  createHeartRateObservation(
    heartRate: number, 
    userId: string, 
    deviceId?: string, 
    timestamp = new Date()
  ): FHIRObservation {
    return {
      resourceType: 'Observation',
      id: uuidv4(),
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs',
          display: 'Vital Signs'
        }]
      }],
      code: {
        coding: [{
          system: FHIRAdapter.LOINC_SYSTEM,
          code: FHIRAdapter.LOINC_CODES.HEART_RATE,
          display: 'Heart rate'
        }],
        text: 'Heart rate'
      },
      subject: {
        reference: `Patient/${userId}`
      },
      effectiveDateTime: timestamp.toISOString(),
      issued: new Date().toISOString(),
      valueQuantity: {
        value: heartRate,
        unit: 'beats/min',
        system: FHIRAdapter.UCUM_SYSTEM,
        code: '/min'
      },
      ...(deviceId && {
        device: {
          reference: `Device/${deviceId}`
        }
      })
    };
  }
  
  /**
   * Convert blood oxygen (SpO2) from internal format to FHIR Observation
   */
  createSpO2Observation(
    spO2: number, 
    userId: string, 
    deviceId?: string, 
    timestamp = new Date()
  ): FHIRObservation {
    return {
      resourceType: 'Observation',
      id: uuidv4(),
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs',
          display: 'Vital Signs'
        }]
      }],
      code: {
        coding: [{
          system: FHIRAdapter.LOINC_SYSTEM,
          code: FHIRAdapter.LOINC_CODES.OXYGEN_SATURATION,
          display: 'Oxygen saturation in Arterial blood'
        }],
        text: 'Blood Oxygen Saturation'
      },
      subject: {
        reference: `Patient/${userId}`
      },
      effectiveDateTime: timestamp.toISOString(),
      issued: new Date().toISOString(),
      valueQuantity: {
        value: spO2,
        unit: '%',
        system: FHIRAdapter.UCUM_SYSTEM,
        code: '%'
      },
      ...(deviceId && {
        device: {
          reference: `Device/${deviceId}`
        }
      })
    };
  }
  
  /**
   * Convert body temperature from internal format to FHIR Observation
   */
  createTemperatureObservation(
    temperature: number, 
    unit: 'C' | 'F',
    userId: string, 
    deviceId?: string, 
    timestamp = new Date()
  ): FHIRObservation {
    // Convert Fahrenheit to Celsius if needed for standardization
    const tempInCelsius = unit === 'F' ? (temperature - 32) * 5/9 : temperature;
    const displayUnit = unit === 'F' ? 'F' : 'C';
    
    return {
      resourceType: 'Observation',
      id: uuidv4(),
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs',
          display: 'Vital Signs'
        }]
      }],
      code: {
        coding: [{
          system: FHIRAdapter.LOINC_SYSTEM,
          code: FHIRAdapter.LOINC_CODES.BODY_TEMPERATURE,
          display: 'Body temperature'
        }],
        text: 'Body temperature'
      },
      subject: {
        reference: `Patient/${userId}`
      },
      effectiveDateTime: timestamp.toISOString(),
      issued: new Date().toISOString(),
      valueQuantity: {
        value: tempInCelsius, // Always store in Celsius for standardization
        unit: 'C',
        system: FHIRAdapter.UCUM_SYSTEM,
        code: 'Cel'
      },
      // Store original unit in extension for reference
      extension: [{
        url: 'http://nestorhealth.com/fhir/extensions/original-unit',
        valueString: displayUnit
      }],
      ...(deviceId && {
        device: {
          reference: `Device/${deviceId}`
        }
      })
    };
  }
  
  /**
   * Convert steps count from internal format to FHIR Observation
   */
  createStepsObservation(
    steps: number, 
    userId: string, 
    deviceId?: string, 
    timestamp = new Date()
  ): FHIRObservation {
    return {
      resourceType: 'Observation',
      id: uuidv4(),
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'activity',
          display: 'Activity'
        }]
      }],
      code: {
        coding: [{
          system: FHIRAdapter.LOINC_SYSTEM,
          code: FHIRAdapter.LOINC_CODES.STEPS_COUNT,
          display: 'Steps count'
        }],
        text: 'Steps'
      },
      subject: {
        reference: `Patient/${userId}`
      },
      effectiveDateTime: timestamp.toISOString(),
      issued: new Date().toISOString(),
      valueQuantity: {
        value: steps,
        unit: 'steps',
        system: FHIRAdapter.UCUM_SYSTEM,
        code: 'steps'
      },
      ...(deviceId && {
        device: {
          reference: `Device/${deviceId}`
        }
      })
    };
  }
  
  /**
   * Convert sleep duration from internal format to FHIR Observation
   */
  createSleepObservation(
    durationMinutes: number, 
    userId: string, 
    deviceId?: string, 
    timestamp = new Date()
  ): FHIRObservation {
    return {
      resourceType: 'Observation',
      id: uuidv4(),
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'sleep',
          display: 'Sleep'
        }]
      }],
      code: {
        coding: [{
          system: FHIRAdapter.LOINC_SYSTEM,
          code: FHIRAdapter.LOINC_CODES.SLEEP_DURATION,
          display: 'Sleep duration'
        }],
        text: 'Sleep Duration'
      },
      subject: {
        reference: `Patient/${userId}`
      },
      effectiveDateTime: timestamp.toISOString(),
      issued: new Date().toISOString(),
      valueQuantity: {
        value: durationMinutes,
        unit: 'min',
        system: FHIRAdapter.UCUM_SYSTEM,
        code: 'min'
      },
      ...(deviceId && {
        device: {
          reference: `Device/${deviceId}`
        }
      })
    };
  }
  
  /**
   * Export a batch of observations to FHIR format
   */
  exportObservationsToFHIR(observations: any[]): FHIRObservation[] {
    // Implement conversion from internal format to FHIR
    // This would be customized based on your internal data structure
    return observations.map(obs => {
      switch (obs.type) {
        case 'heartRate':
          return this.createHeartRateObservation(obs.value, obs.userId, obs.deviceId, new Date(obs.timestamp));
        case 'spO2':
          return this.createSpO2Observation(obs.value, obs.userId, obs.deviceId, new Date(obs.timestamp));
        case 'temperature':
          return this.createTemperatureObservation(obs.value, obs.unit, obs.userId, obs.deviceId, new Date(obs.timestamp));
        case 'steps':
          return this.createStepsObservation(obs.value, obs.userId, obs.deviceId, new Date(obs.timestamp));
        case 'sleep':
          return this.createSleepObservation(obs.value, obs.userId, obs.deviceId, new Date(obs.timestamp));
        default:
          throw new Error(`Unsupported observation type: ${obs.type}`);
      }
    });
  }
  
  /**
   * Import FHIR observations to internal format
   */
  importObservationsFromFHIR(fhirObservations: FHIRObservation[]): any[] {
    return fhirObservations.map(obs => {
      // Extract the basic information present in all observations
      const baseObservation = {
        id: obs.id,
        userId: obs.subject.reference.split('/')[1],
        timestamp: obs.effectiveDateTime || new Date().toISOString(),
        deviceId: obs.device?.reference?.split('/')[1] || null
      };
      
      // Get the LOINC code to determine observation type
      const loincCode = obs.code.coding.find(coding => coding.system === FHIRAdapter.LOINC_SYSTEM)?.code;
      
      switch (loincCode) {
        case FHIRAdapter.LOINC_CODES.HEART_RATE:
          return {
            ...baseObservation,
            type: 'heartRate',
            value: obs.valueQuantity?.value,
            unit: 'bpm'
          };
        case FHIRAdapter.LOINC_CODES.OXYGEN_SATURATION:
          return {
            ...baseObservation,
            type: 'spO2',
            value: obs.valueQuantity?.value,
            unit: '%'
          };
        case FHIRAdapter.LOINC_CODES.BODY_TEMPERATURE:
          // Check if there's an extension with original unit
          const originalUnit = obs.extension?.find(
            ext => ext.url === 'http://nestorhealth.com/fhir/extensions/original-unit'
          )?.valueString || 'C';
          
          // Convert back to Fahrenheit if needed
          const tempValue = obs.valueQuantity?.value;
          const convertedTemp = originalUnit === 'F' ? (tempValue * 9/5) + 32 : tempValue;
          
          return {
            ...baseObservation,
            type: 'temperature',
            value: convertedTemp,
            unit: originalUnit
          };
        case FHIRAdapter.LOINC_CODES.STEPS_COUNT:
          return {
            ...baseObservation,
            type: 'steps',
            value: obs.valueQuantity?.value,
            unit: 'steps'
          };
        case FHIRAdapter.LOINC_CODES.SLEEP_DURATION:
          return {
            ...baseObservation,
            type: 'sleep',
            value: obs.valueQuantity?.value,
            unit: 'min'
          };
        default:
          console.warn(`Unsupported LOINC code: ${loincCode}`);
          return null;
      }
    }).filter(obs => obs !== null);
  }
}

export default FHIRAdapter.getInstance(); 