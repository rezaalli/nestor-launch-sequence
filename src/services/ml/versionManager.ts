import { ModelMetadata } from './modelRegistry';

/**
 * Version comparison result
 */
export enum VersionComparisonResult {
  NEWER = 1,
  SAME = 0,
  OLDER = -1,
}

/**
 * Model Version Manager
 * Provides utilities for managing model versions
 */
export class VersionManager {
  private static instance: VersionManager;

  private constructor() {}

  /**
   * Get the singleton instance of VersionManager
   */
  public static getInstance(): VersionManager {
    if (!VersionManager.instance) {
      VersionManager.instance = new VersionManager();
    }
    return VersionManager.instance;
  }

  /**
   * Compare two version strings
   * Returns 1 if version1 is newer, 0 if they are the same, -1 if version1 is older
   */
  public compareVersions(version1: string, version2: string): VersionComparisonResult {
    const v1Parts = version1.split('.').map(part => parseInt(part, 10));
    const v2Parts = version2.split('.').map(part => parseInt(part, 10));
    
    // Ensure both arrays have the same length
    const maxLength = Math.max(v1Parts.length, v2Parts.length);
    
    while (v1Parts.length < maxLength) v1Parts.push(0);
    while (v2Parts.length < maxLength) v2Parts.push(0);
    
    // Compare each part
    for (let i = 0; i < maxLength; i++) {
      const part1 = v1Parts[i] || 0;
      const part2 = v2Parts[i] || 0;
      
      if (part1 > part2) return VersionComparisonResult.NEWER;
      if (part1 < part2) return VersionComparisonResult.OLDER;
    }
    
    return VersionComparisonResult.SAME;
  }

  /**
   * Increment version according to semantic versioning
   * @param version Current version
   * @param type 'major', 'minor', or 'patch'
   */
  public incrementVersion(
    version: string, 
    type: 'major' | 'minor' | 'patch' = 'patch'
  ): string {
    const versionParts = version.split('.').map(part => parseInt(part, 10));
    
    // Ensure we have at least 3 parts (major.minor.patch)
    while (versionParts.length < 3) versionParts.push(0);
    
    switch (type) {
      case 'major':
        versionParts[0]++;
        versionParts[1] = 0;
        versionParts[2] = 0;
        break;
      case 'minor':
        versionParts[1]++;
        versionParts[2] = 0;
        break;
      case 'patch':
      default:
        versionParts[2]++;
        break;
    }
    
    return versionParts.join('.');
  }

  /**
   * Create initial version
   */
  public initialVersion(): string {
    return '0.1.0';
  }

  /**
   * Sort model metadata by version (newest first)
   */
  public sortByVersion(models: ModelMetadata[]): ModelMetadata[] {
    return [...models].sort((a, b) => {
      return this.compareVersions(b.version, a.version);
    });
  }

  /**
   * Find latest version from a list of models
   */
  public findLatestVersion(models: ModelMetadata[]): ModelMetadata | null {
    if (models.length === 0) {
      return null;
    }
    
    return this.sortByVersion(models)[0];
  }

  /**
   * Validate if a version string follows semantic versioning
   */
  public isValidVersion(version: string): boolean {
    const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    return semverRegex.test(version);
  }

  /**
   * Get next version based on current version and update type
   */
  public getNextVersion(
    currentVersion: string,
    updateType: 'major' | 'minor' | 'patch' = 'patch'
  ): string {
    if (!this.isValidVersion(currentVersion)) {
      console.warn(`Invalid version format: ${currentVersion}, using initial version`);
      return this.initialVersion();
    }
    
    return this.incrementVersion(currentVersion, updateType);
  }
}

export default VersionManager.getInstance(); 