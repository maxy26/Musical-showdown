import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.musicalshowdown.app',
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
  },
  plugins: {
    // Con la app abierta en pantalla, Android no muestra la notificación: se la
    // pasa a la app. Con "alert", el complemento la muestra igual arriba
    // (usuario, 11-10-2026: los avisos importantes salen siempre).
    PushNotifications: {
      presentationOptions: ['alert', 'sound'],
    },
  },
};

export default config;
