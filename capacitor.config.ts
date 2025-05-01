
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.d060442585854716bdb491caa4a5cf16',
  appName: 'nestor-launch-sequence',
  webDir: 'dist',
  server: {
    url: 'https://d0604425-8585-4716-bdb4-91caa4a5cf16.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#FFFFFF",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;
