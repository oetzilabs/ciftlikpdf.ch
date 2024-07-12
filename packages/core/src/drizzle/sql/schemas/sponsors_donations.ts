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
  createdByAdmin: text("createdBy")
    .references(() => users.id)
    .default(sql`NULL`),
  updatedByAdmin: text("updatedBy")
    .references(() => users.id)
    .default(sql`NULL`),
  deletedByAdmin: text("deletedBy")
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
  createdBy: one(users, {
    fields: [sponsors_donations.createdByAdmin],
    references: [users.id],
  }),
  updatedBy: one(users, {
    fields: [sponsors_donations.updatedByAdmin],
    references: [users.id],
  }),
  deletedBy: one(users, {
    fields: [sponsors_donations.deletedByAdmin],
    references: [users.id],
  }),
}));
