import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.palabracantada.app',
  appName: 'Musical Showdown',
  webDir: 'www',
  backgroundColor: '#141833',
  // Origen propio (en vez de "localhost"): la app no hereda el service worker
  // ni la caché de versiones anteriores, aunque Android las restaure (04-10-2026).
  server: {
    hostname: 'musicalshowdown.app',
  },
  android: {
    backgroundColor: '#141833'
  }
};

export default config;
