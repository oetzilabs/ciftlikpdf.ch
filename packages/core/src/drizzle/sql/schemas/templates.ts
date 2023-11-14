import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";

export const templates = sqliteTable("templates", {
  ...Entity.defaults,
  Key: text("Key").notNull(),
  default: integer("default", { mode: "boolean" })
    .notNull()
    .$defaultFn(() => false),
});

export type TemplateSelect = typeof templates.$inferSelect;
export type TemplateInsert = typeof templates.$inferInsert;
