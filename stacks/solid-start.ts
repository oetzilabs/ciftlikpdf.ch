import { domain } from "./domain";
import { SECRET } from "./secrets";

new sst.cloudflare.x.SolidStart("MySolidStart", {
  path: "packages/app",
  domain,
  environment: {
    SST_STAGE: $app.stage,
    DATABASE_URL: SECRET.DATABASE_URL.value,
    DATABASE_TOKEN: SECRET.DATABASE_AUTH_TOKEN.value,
    JWT_SECRET: SECRET.JWT_SECRET.value,
  },
});
