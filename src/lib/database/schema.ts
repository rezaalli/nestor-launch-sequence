/**
 * Database schema definitions for Nestor Health app
 * This file defines the structure of the local database tables and their relationships
 */

/**
 * Device schema - represents a physical Nestor device attached to a watch
 */
export interface Device {
  device_id: string;            // Unique identifier for the device
  device_name: string;          // User-assigned name for the device
  device_type: string;          // Type/model of the device
  firmware_version: string;     // Current firmware version
  last_sync: string;            // ISO timestamp of last successful sync
  battery_level: number;        // Battery percentage (0-100)
  is_active: boolean;           // Whether this is the currently active device
  associated_watch: string;     // Name of the watch this device is attached to
  mac_address: string;          // Bluetooth MAC address
  created_at: string;           // When the device was first paired
  updated_at: string;           // When the device record was last updated
}

/**
 * BiometricData schema - represents a single biometric data point
 */
export interface BiometricData {
  id: string;                   // Unique identifier for this data point
  device_id: string;            // Device that recorded this data
  user_id: string;              // User this data belongs to
  timestamp: string;            // When this data was recorded (ISO string)
  data_type: BiometricType;     // Type of biometric data
  value: number;                // The actual value
  metadata: Record<string, any>; // Additional contextual information
  is_synced: boolean;           // Whether this has been synced to the cloud
  created_at: string;           // When this record was created locally
}

/**
 * Assessment schema - represents a daily assessment submission
 */
export interface Assessment {
  id: string;                   // Unique identifier
  user_id: string;              // User who completed the assessment
  date: string;                 // Date of the assessment (YYYY-MM-DD)
  responses: AssessmentResponse[]; // Individual question responses
  readiness_score: number | null; // Calculated readiness score (0-100)
  completed_at: string;         // When the assessment was completed
  created_at: string;           // When this record was created locally
  updated_at: string;           // When this record was last updated
  is_synced: boolean;           // Whether this has been synced to the cloud
}

/**
 * AssessmentResponse schema - represents a response to a single assessment question
 */
export interface AssessmentResponse {
  question_id: string;          // Question identifier
  question_text: string;        // Text of the question
  response_type: string;        // Type of response (single, multiple, etc.)
  response: any;                // The user's response
  notes?: string;               // Optional additional notes
}

/**
 * NutritionLog schema - represents a daily nutrition tracking entry
 */
export interface NutritionLog {
  id: string;                   // Unique identifier
  user_id: string;              // User this log belongs to
  date: string;                 // Date of the log (YYYY-MM-DD)
  calories_consumed: number;    // Total calories consumed
  calories_target: number;      // Calorie target for the day
  protein_consumed: number;     // Grams of protein consumed
  protein_target: number;       // Protein target for the day
  carbs_consumed: number;       // Grams of carbs consumed
  carbs_target: number;         // Carbs target for the day
  fat_consumed: number;         // Grams of fat consumed
  fat_target: number;           // Fat target for the day
  created_at: string;           // When this record was created
  updated_at: string;           // When this record was last updated
  is_synced: boolean;           // Whether this has been synced to the cloud
}

/**
 * Meal schema - represents a single meal entry
 */
export interface Meal {
  id: string;                   // Unique identifier
  user_id: string;              // User this meal belongs to
  nutrition_log_id: string;     // Associated nutrition log
  name: string;                 // Name/description of the meal
  meal_type: string;            // Type of meal (breakfast, lunch, etc.)
  timestamp: string;            // When the meal was consumed
  calories: number;             // Calories in the meal
  protein: number;              // Grams of protein
  carbs: number;                // Grams of carbs
  fat: number;                  // Grams of fat
  image_url?: string;           // Optional image of the meal
  created_at: string;           // When this record was created
  is_synced: boolean;           // Whether this has been synced to the cloud
}

/**
 * LifestyleLog schema - represents daily lifestyle tracking
 */
export interface LifestyleLog {
  id: string;                   // Unique identifier
  user_id: string;              // User this log belongs to
  date: string;                 // Date of the log (YYYY-MM-DD)
  mood?: string;                // User's reported mood
  energy_level?: string;        // User's reported energy level
  sleep_quality?: string;       // User's reported sleep quality
  exercise_type?: string;       // Type of exercise performed
  notes?: string;               // Additional notes
  created_at: string;           // When this record was created
  updated_at: string;           // When this record was last updated
  is_synced: boolean;           // Whether this has been synced to the cloud
}

/**
 * HapticSettings schema - represents user's haptic feedback preferences
 */
export interface HapticSettings {
  id: string;                   // Unique identifier
  user_id: string;              // User these settings belong to
  haptics_enabled: boolean;     // Whether haptics are enabled
  strength: string;             // Haptic strength (low, medium, high)
  thresholds: Record<string, any>; // Alert thresholds for different metrics
  created_at: string;           // When these settings were created
  updated_at: string;           // When these settings were last updated
  is_synced: boolean;           // Whether this has been synced to the cloud
}

/**
 * Notification schema - represents a system notification
 */
export interface Notification {
  id: string;                   // Unique identifier
  user_id: string;              // User this notification is for
  title: string;                // Notification title
  description: string;          // Notification description
  type: string;                 // Type of notification
  icon: string;                 // Icon to display
  icon_color: string;           // Color of the icon
  icon_bg_color: string;        // Background color of the icon
  date: string;                 // Date the notification was generated
  time: string;                 // Time the notification was generated
  read: boolean;                // Whether the notification has been read
  actions?: Record<string, any>; // Optional actions that can be taken
  created_at: string;           // When this notification was created
}

/**
 * Types of biometric data supported by the system
 */
export enum BiometricType {
  HEART_RATE = 'heart_rate',
  HRV = 'hrv',
  TEMPERATURE = 'temperature',
  SPO2 = 'spo2',
  RESPIRATORY_RATE = 'respiratory_rate',
  MOVEMENT = 'movement',
  SLEEP = 'sleep'
}

/**
 * Full database schema
 */
export interface NestorDBSchema {
  devices: Device[];
  biometric_data: BiometricData[];
  assessments: Assessment[];
  nutrition_logs: NutritionLog[];
  meals: Meal[];
  lifestyle_logs: LifestyleLog[];
  haptic_settings: HapticSettings[];
  notifications: Notification[];
} 