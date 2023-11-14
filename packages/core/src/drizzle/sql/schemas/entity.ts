import { integer, text } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import * as uuid from "uuid";

export * as Entity from "./entity";

export const defaults = {
  id: text("id", { mode: "text" })
    .primaryKey()
    .$default(() => uuid.v4()),
  createdAt: integer("created_at", {
    mode: "timestamp",
  })
    .notNull()
    .default(sql`(strftime('%s', 'now'))`),
  updatedAt: integer("updated_at", {
    mode: "timestamp",
  }),
  deletedAt: integer("deleted_at", {
    mode: "timestamp",
  }),
};
