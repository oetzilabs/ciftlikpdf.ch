import path from "node:path";
import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    preset: "aws-lambda",
    output: {
      dir: "dist",
      publicDir: "dist/client",
      serverDir: "dist/server",
    },
    esbuild: {
      options: {
        target: "esnext",
      },
    },
  },
  vite: {
    ssr: { noExternal: ["@kobalte/core", "lucide-solid"] },
    resolve: {
      alias: {
        "@": path.resolve(process.cwd(), "src"),
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        target: "esnext",
        treeShaking: true,
      },
    },
    build: {
      target: "esnext",
    },
  },
});
