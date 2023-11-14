import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { relations } from "drizzle-orm";
import { sponsors_donations } from "./sponsors_donations";

export const sponsors = sqliteTable("sponsors", {
  ...Entity.defaults,
  name: text("name").notNull(),
  address: text("address").notNull(),
});

export type SponsorSelect = typeof sponsors.$inferSelect;
export type SponsorInsert = typeof sponsors.$inferInsert;

export const sponsorRelation = relations(sponsors, ({ one, many }) => ({
  donations: many(sponsors_donations),
}));
