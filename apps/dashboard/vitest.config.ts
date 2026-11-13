import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [
    react(), // 🟢 Required to parse JSX in tests
    tsconfigPaths(), // 🟢 Reads path aliases from tsconfig.json
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    // 🟢 Lock Vitest to the unit folder only
    include: ['test/unit/**/*.{test,spec}.{ts,tsx}'],
  },
});
