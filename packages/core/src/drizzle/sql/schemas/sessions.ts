import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const sessionTable = sqliteTable("session", {
  id: text("id").notNull().primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: integer("expires_at").notNull(),
});

export const SessionSelect = sessionTable.$inferSelect;
export type SessionSelect = typeof sessionTable.$inferSelect;
export const SessionInsert = sessionTable.$inferInsert;
export type SessionInsert = typeof sessionTable.$inferInsert;
