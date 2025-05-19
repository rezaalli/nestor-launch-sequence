import { Capacitor } from '@capacitor/core';

/**
 * Platform utility to detect and work with different platforms
 */
export class Platform {
  /**
   * Get the current platform (ios, android, or web)
   */
  public static getCurrentPlatform(): 'ios' | 'android' | 'web' {
    if (Capacitor.isNativePlatform()) {
      const platform = Capacitor.getPlatform();
      if (platform === 'ios') return 'ios';
      if (platform === 'android') return 'android';
    }
    return 'web';
  }

  /**
   * Check if the app is running on iOS
   */
  public static isIOS(): boolean {
    return this.getCurrentPlatform() === 'ios';
  }

  /**
   * Check if the app is running on Android
   */
  public static isAndroid(): boolean {
    return this.getCurrentPlatform() === 'android';
  }

  /**
   * Check if the app is running on the web
   */
  public static isWeb(): boolean {
    return this.getCurrentPlatform() === 'web';
  }

  /**
   * Check if the app is running in a native container
   */
  public static isNative(): boolean {
    return Capacitor.isNativePlatform();
  }
} 