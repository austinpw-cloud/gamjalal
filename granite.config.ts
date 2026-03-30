import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'lunosoft-gamesolympic',
  brand: {
    displayName: '겜잘알',
    primaryColor: '#39FF14',
    icon: '',
  },
  web: {
    host: '192.168.35.109',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
  webViewProps: {
    type: 'game',
  },
});
