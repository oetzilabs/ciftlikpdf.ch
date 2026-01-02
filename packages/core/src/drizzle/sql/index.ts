import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { migrate as mig } from "drizzle-orm/libsql/migrator";
import { join } from "path";
import { Resource } from "sst";
import * as schema from "./schema";

const client = createClient({ url: process.env.DATABASE_URL!, authToken: process.env.DATABASE_TOKEN! });

export const db = drizzle(client, {
  schema,
});
