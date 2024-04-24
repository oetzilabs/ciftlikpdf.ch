import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import solidJs from "@astrojs/solid-js";
import sitemap from "@astrojs/sitemap";
import aws from "astro-sst";

export default defineConfig({
  integrations: [tailwind(), solidJs(), sitemap()],
  output: "server",
  adapter: aws(),
  site: "https://ciftlikpdf.ch",
  vite: {
    ssr: { external: ["html2pdf.js"] },
  },
});
