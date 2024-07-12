import { migrate } from "@ciftlikpdf/core/drizzle/sql";
import { ApiHandler } from "sst/node/api";
import { Config } from "sst/node/config";
import { error, json } from "./utils";

export const handler = ApiHandler(async (_evt) => {
  console.log(`Migrating to ${Config.DATABASE_URL} ...`);
  try {
    await migrate();
  } catch (e) {
    return error((e as Error).message);
  }

  return json({ message: "Migration successful" });
});
