
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.15b77aa5a5c94dc39c9413bd93baee55',
  appName: 'feathered-finance-launch',
  webDir: 'dist',
  server: {
    url: "https://15b77aa5-a5c9-4dc3-9c94-13bd93baee55.lovableproject.com?forceHideBadge=true",
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000
    }
  }
};

export default config;
