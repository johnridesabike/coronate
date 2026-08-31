import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import favicons from "@peterek/vite-plugin-favicons";
import reScript from "@jihchi/vite-plugin-rescript";
import { execSync } from "node:child_process";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  let plugins = [
    react({ include: ["**/*.res.mjs"] }),
    favicons("graphics/logo.svg"),
  ];
  // https://github.com/jihchi/vite-plugin-rescript/issues/231
  // Tests run on the compiled .res.mjs files, so they don't need the plugin;
  // its `rescript watch` child also breaks vitest's exit code at teardown.
  if (mode !== "test") {
    plugins.push(
      reScript({
        loader: {
          // output: './lib/bs',
          suffix: ".res.mjs",
        },
      }),
    );
  }
  return {
    plugins: plugins,
    server: {
      watch: {
        // ignore ReScript build artifacts
        ignored: ["**/lib/bs/**", "**/lib/ocaml/**", "**/lib/rescript.lock"],
      },
      port: 3000,
    },
    test: {
      include: ["tests/**/*_test.res.mjs"],
      globals: true,
      environment: "jsdom",
      setupFiles: "./tests/setup.js",
    },
    define: {
      __LAST_COMMIT_DATE__: JSON.stringify(
        execSync("git log -1 --format=%cs").toString().trim(),
      ),
      __IS_TEST__: JSON.stringify(mode === "test"),
    },
  };
});
