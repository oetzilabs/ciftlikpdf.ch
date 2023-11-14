import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { sponsors_donations } from "./sponsors_donations";
import { relations } from "drizzle-orm";

export const users = sqliteTable("users", {
  ...Entity.defaults,
  name: text("name").notNull(),
  password: text("password").notNull(),
  type: text("type", { enum: ["superadmin", "admin", "viewer"] })
    .notNull()
    .$defaultFn(() => "viewer"),
});

export const userRelation = relations(users, ({ many }) => ({
  donationsCreated: many(sponsors_donations),
  donationsUpdated: many(sponsors_donations),
  donationsDeleted: many(sponsors_donations),
}));

export type UserSelect = typeof users.$inferSelect;
export type UserInsert = typeof users.$inferInsert;
