import path from "node:path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: false,
    setupFiles: ["./vitest.setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: [
        "data/**/*.ts",
        "components/post-image-carousel/PostImageCarousel.tsx",
      ],
      exclude: ["data/types.ts", "**/*.test.*", "**/*.spec.*"],
      thresholds: {
        lines: 100,
        functions: 100,
        statements: 100,
        /** Una rama depende de `"timeout" in AbortSignal` (API reciente); no forzamos entornos sin ella. */
        branches: 99,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
