import { domain } from "./domain";
import { SECRET } from "./secrets";

new sst.cloudflare.x.SolidStart("MySolidStart", {
  path: "packages/web",
  link: [SECRET],
  domain,
  environment: {
    SST_STAGE: $app.stage,
  },
});
