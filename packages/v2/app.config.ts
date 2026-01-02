import { resolve } from "node:path";
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  vite: {
    ssr: { noExternal: ["@kobalte/core", "@internationalized/message"] },
    resolve: {
      alias: {
        "@": resolve(process.cwd(), "src"),
      },
    },
    build: {
      rollupOptions: {
        external: ["cloudflare:workers"],
      },
    },
  },
  server: {
    baseURL: undefined,
    preset: "cloudflare_module",
    compatibilityDate: "2024-09-19",
    cloudflare: {
      nodeCompat: true,
    },
  },
});
