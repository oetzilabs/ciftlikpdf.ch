/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "ciftlikpdf",
      home: "cloudflare",
    };
  },
  async run() {
    await import("./stacks/solid-start.js");
  },
});
