import {defineConfig} from '@micra/vite-config/library';

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['@micra/event-emitter', '@micra/error'],
    },
  },
});
