import path from "node:path";
import { defineConfig } from "@solidjs/start/config";
/* @ts-ignore */
import pkg from "@vinxi/plugin-mdx";
const { default: mdx } = pkg;

const prod = process.env.NODE_ENV === "production";

export default defineConfig({
  extensions: ["mdx", "md", "tsx", "ts"],
  server: {
    preset: prod ? "aws-lambda" : "node-server",
    output: prod
      ? {
          dir: "dist",
          publicDir: "dist/client",
        }
      : {},
    esbuild: {
      options: {
        target: "esnext",
        treeShaking: true,
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
    plugins: [
      mdx.withImports({})({
        jsx: true,
        jsxImportSource: "solid-js",
        providerImportSource: "solid-mdx",
      }),
    ],
  },
});
