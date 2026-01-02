import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { SponsorDonationsSelect, sponsors_donations } from "../drizzle/sql/schema";

export * as Donation from "./donations";

export const create = z
  .function({ input: z.tuple([createInsertSchema(sponsors_donations)]) })
  .implement(async (input) => {
    const [x] = await db.insert(sponsors_donations).values(input).returning();
    return x;
  });

export const countAll = z.function().implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${sponsors_donations.id})`,
    })
    .from(sponsors_donations);
  return x.count;
});

export const findById = z.function({ input: z.tuple([z.string()]) }).implement(async (input) => {
  return db.query.sponsors_donations.findFirst({
    where: (fields, operations) => operations.eq(fields.id, input),
    with: {
      sponsor: true,
      admin: {
        columns: {
          password: false,
        },
      },
    },
  });
});

export const findBySponsorId = z.function({ input: z.tuple([z.string()]) }).implement(async (input) => {
  return db.query.sponsors_donations.findMany({
    where: (fields, operations) =>
      operations.and(operations.eq(fields.sponsorId, input), operations.isNull(fields.deletedAt)),
    with: {
      sponsor: true,
      admin: {
        columns: {
          password: false,
        },
      },
    },
  });
});

export const all = z.function().implement(async () => {
  return db.query.sponsors_donations.findMany({
    with: {
      sponsor: true,
      admin: {
        columns: {
          password: false,
        },
      },
    },
  });
});

export const update = z
  .function({
    input: z.tuple([
      createInsertSchema(sponsors_donations)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.uuid() })),
    ]),
  })
  .implement(async (input) => {
    await db
      .update(sponsors_donations)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(sponsors_donations.id, input.id))
      .returning();
    return true;
  });

export const markAsDeleted = z.function({ input: z.tuple([z.object({ id: z.uuid() })]) }).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const updateAmount = z
  .function({ input: z.tuple([z.object({ id: z.uuid(), amount: z.number() })]) })
  .implement(async (input) => {
    return update({ id: input.id, amount: input.amount });
  });

export const isAllowedToSignUp = z
  .function({ input: z.tuple([z.object({ email: z.string() })]) })
  .implement(async (input) => {
    return true;
  });

export const remove = z.function({ input: z.tuple([z.uuid()]) }).implement(async (input) => {
  const [x] = await db.delete(sponsors_donations).where(eq(sponsors_donations.id, input)).returning();
  return x;
});

export const findBySponsorIdAndYear = z
  .function({ input: z.tuple([z.uuid(), z.number()]) })
  .implement(async (sponsorId, year) => {
    return db.query.sponsors_donations.findFirst({
      where: (fields, operations) =>
        operations.and(operations.eq(fields.sponsorId, sponsorId), operations.eq(fields.year, year)),
      with: {
        sponsor: true,
        admin: {
          columns: {
            password: false,
          },
        },
      },
    });
  });

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;

export type Profile = SponsorDonationsSelect;
