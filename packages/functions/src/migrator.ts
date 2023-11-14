import { migrate } from "@ciftlikpdf/core/drizzle/sql";
import { ApiHandler } from "sst/node/api";
import { Config } from "sst/node/config";

export const handler = ApiHandler(async (_evt) => {
  console.log(`Migrating to ${Config.DATABASE_URL} ...`);
  await migrate();

  return {
    body: "Migrated!",
  };
});
