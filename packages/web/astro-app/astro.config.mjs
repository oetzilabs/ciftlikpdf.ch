import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import solidJs from "@astrojs/solid-js";
import aws from "astro-sst";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  output: "server",
  adapters: aws({ deploymentStrategy: "regional" }),
  integrations: [tailwind(), solidJs(), sitemap()],
  site: "https://ciftlikpdf.ch",
});
