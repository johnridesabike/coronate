import { defineConfig } from 'vitest/config'
import react from "@vitejs/plugin-react";
import favicons from '@peterek/vite-plugin-favicons'
import reScript from '@jihchi/vite-plugin-rescript';
import { execSync } from "node:child_process";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      include: ["**/*.res.mjs"],
    }),
    favicons('graphics/logo.svg'),
    reScript({
      loader: {
        // output: './lib/bs',
        suffix: '.res.mjs',
      },
    }),
  ],
  server: {
    watch: {
      // ignore ReScript build artifacts
      ignored: ["**/lib/bs/**", "**/lib/ocaml/**", "**/lib/rescript.lock"],
    },
    port: 3000
  },
  test: {
    include: ['tests/**/*_test.res.mjs'],
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
  },
  define: {
    __LAST_COMMIT_DATE__: JSON.stringify(
      execSync("git log -1 --format=%cs").toString().trim()
    ),
  },
});