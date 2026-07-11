import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gestorseguros.app',
  appName: 'Gestor de Seguros',
  webDir: 'dist',
  backgroundColor: '#f4efe7',
  android: {
    allowMixedContent: false,
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_gestor',
      iconColor: '#8c6a4e',
    },
  },
};

export default config;
