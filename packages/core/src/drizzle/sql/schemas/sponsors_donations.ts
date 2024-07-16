import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Entity } from "./entity";
import { relations, sql } from "drizzle-orm";
import { sponsors } from "./sponsors";
import { users } from "./users";

export const sponsors_donations = sqliteTable("sponsors_donations", {
  ...Entity.defaults,
  sponsorId: text("sponsorId")
    .notNull()
    .references(() => sponsors.id),
  amount: integer("amount").notNull(),
  currency: text("currency", {
    enum: ["CHF", "EUR"],
  })
    .notNull()
    .$defaultFn(() => "CHF"),
  year: integer("year").notNull(),
  admin_id: text("admin_id")
    .references(() => users.id)
    .default(sql`NULL`),
});

export type SponsorDonationsSelect = typeof sponsors_donations.$inferSelect;
export type SponsorDonationsInsert = typeof sponsors_donations.$inferInsert;

export const sponsorDonationRelation = relations(sponsors_donations, ({ one }) => ({
  sponsor: one(sponsors, {
    fields: [sponsors_donations.sponsorId],
    references: [sponsors.id],
  }),
  admin: one(users, {
    fields: [sponsors_donations.admin_id],
    references: [users.id],
  }),
}));
