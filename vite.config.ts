import { defineConfig } from "vitest/config";

// Bundles the CLI into a single self-contained lib/start.js (Docker copies only
// lib/, so all deps must be inlined — hence ssr.noExternal).
export default defineConfig({
  build: {
    target: "node24",
    minify: true,
    outDir: "lib",
    ssr: "src/bin/start.ts",
    rollupOptions: {
      output: {
        entryFileNames: "start.js",
        // Single self-contained file, matching the old esbuild bundle.
        codeSplitting: false,
      },
    },
  },
  ssr: {
    noExternal: true,
  },
  test: {
    setupFiles: ["./setupTests.ts"],
  },
});
