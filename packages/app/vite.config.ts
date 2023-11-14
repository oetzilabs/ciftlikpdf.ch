import solid from "solid-start/vite";
import { defineConfig } from "vite";
import aws from "solid-start-sst";

export default defineConfig({
  plugins: [
    solid({
      adapter: aws(),
    }),
  ],
  ssr: {
    noExternal: ["@kobalte/core", "@internationalized/message"],
  },
});
