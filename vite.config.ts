/// <reference types="vitest" />
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "."),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== "true",
    },
    build: {
      sourcemap: true,
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/setupTests.ts"],
      globals: true,
      testTimeout: 15000,
      coverage: {
        provider: "v8",
        exclude: [
          "src/blogMeta.json",
          "src/main.tsx",
          "src/setupTests.ts",
          "src/types.ts",
          "**/*.test.ts",
          "**/*.test.tsx",
          "node_modules/**",
          "dist/**",
          "vite.config.ts",
        ],
      },
    },
  };
});
