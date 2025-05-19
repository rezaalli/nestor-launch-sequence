/**
 * Repository exports
 * This file exports all repository classes for easy importing
 */

export { DeviceRepository } from './deviceRepository';
export { BiometricRepository } from './biometricRepository';
export { AssessmentRepository } from './assessmentRepository';

// Create a RepositoryManager class to provide a single entry point for all repositories
import { DeviceRepository } from './deviceRepository';
import { BiometricRepository } from './biometricRepository';
import { AssessmentRepository } from './assessmentRepository';

/**
 * Repository Manager
 * Provides a single entry point for all repositories
 */
export class RepositoryManager {
  public readonly device: DeviceRepository;
  public readonly biometric: BiometricRepository;
  public readonly assessment: AssessmentRepository;
  
  constructor() {
    this.device = new DeviceRepository();
    this.biometric = new BiometricRepository();
    this.assessment = new AssessmentRepository();
  }
}

/**
 * Create and export a singleton instance of the repository manager
 */
export const repositories = new RepositoryManager(); 