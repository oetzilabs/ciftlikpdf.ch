import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { users } from "./users";
import { relations } from "drizzle-orm";

export const admin_requests = sqliteTable("admin_requests", {
  ...Entity.defaults,
  userId: text("userId")
    .notNull()
    .references(() => users.id),
});

export const adminRequestRelation = relations(admin_requests, ({ one }) => ({
  user: one(users, {
    fields: [admin_requests.userId],
    references: [users.id],
  }),
}));

export type AdminRequestSelect = typeof admin_requests.$inferSelect;
export type AdminRequestInsert = typeof admin_requests.$inferInsert;
