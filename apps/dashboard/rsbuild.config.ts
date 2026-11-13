import { defineConfig } from '@rsbuild/core';
import { pluginReact } from '@rsbuild/plugin-react';
import { config as loadEnv } from 'dotenv';
import path from 'node:path';

// Centralized env: the monorepo keeps all secrets in the repo-root .env
// (see /.env.example section 8). Load it before reading process.env below.
// Explicit shell exports and CI secrets still take precedence (dotenv never
// overrides already-set variables).
loadEnv({ path: path.resolve(import.meta.dirname, '..', '..', '.env') });

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact()],
  source: {
    // This tells the compiler: "Whenever you see 'process.env.PUBLIC_WS_URL'
    // in the code, replace it with the string value found in the system environment."
    define: {
      'process.env.PUBLIC_WS_URL': JSON.stringify(process.env.PUBLIC_WS_URL),
    },
  },
  output: {
    publicPath: '/',
  },
  server: {
    port: 3000,
    open: true,
  },
});
