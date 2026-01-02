import { domain } from "./domain";

new sst.cloudflare.x.SolidStart("MySolidStart", {
  path: "packages/web",
  link: [api],
  domain,
  environment: {
    SST_STAGE: $app.stage,
    VITE_API_URL: api.customDomainUrl || api.url,
  },
});
