import { and, eq, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { SponsorSelect, sponsors, sponsors_donations } from "../drizzle/sql/schema";

export * as Sponsor from "./sponsors";

export const create = z
  .function(
    z.tuple([
      createInsertSchema(sponsors).omit({
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      }),
    ])
  )
  .implement(async (input) => {
    const [x] = await db.insert(sponsors).values(input).returning();
    const y = await findById(x.id);
    return y!;
  });

export const hasDonated = z.function(z.tuple([z.string().uuid(), z.number()])).implement(async (sponsorId, year) => {
  const [x] = await db
    .select()
    .from(sponsors_donations)
    .where(and(eq(sponsors_donations.sponsorId, sponsorId), eq(sponsors_donations.year, year)));
  return x;
});

export const donate = z
  .function(
    z.tuple([
      z.string().uuid(),
      createInsertSchema(sponsors_donations)
        .omit({
          sponsorId: true,
        })
        .extend({
          admin_id: z.string().uuid(),
        }),
    ])
  )
  .implement(async (sponsorId, input) => {
    const [x] = await db
      .insert(sponsors_donations)
      .values({ ...input, sponsorId })
      .returning();
    return x;
  });

export const removeDonation = z
  .function(z.tuple([z.string().uuid(), z.string().uuid(), z.string().uuid()]))
  .implement(async (sponsorId, donationId, admin_id) => {
    const [x] = await db
      .update(sponsors_donations)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
        admin_id,
      })
      .where(and(eq(sponsors_donations.sponsorId, sponsorId), eq(sponsors_donations.id, donationId)))
      .returning();
    return x;
  });

export const updateDonation = z
  .function(
    z.tuple([
      z.string().uuid(),
      z.string().uuid(),
      createInsertSchema(sponsors_donations).partial().omit({
        sponsorId: true,
      }),
    ])
  )
  .implement(async (sponsorId, donationId, input) => {
    const [x] = await db
      .update(sponsors_donations)
      .set({ ...input, updatedAt: new Date() })
      .where(and(eq(sponsors_donations.sponsorId, sponsorId), eq(sponsors_donations.id, donationId)))
      .returning();
    return x;
  });

export const createWithDonation = z
  .function(
    z.tuple([
      createInsertSchema(sponsors).extend(createInsertSchema(sponsors_donations).omit({ sponsorId: true }).shape),
    ])
  )
  .implement(async (input) => {
    const x = await db.transaction(async (trx) => {
      const { name, address, ...donation } = input;
      const [sponsor] = await trx
        .insert(sponsors)
        .values({
          name,
          address,
        })
        .returning();
      await trx
        .insert(sponsors_donations)
        .values({ sponsorId: sponsor.id, ...donation })
        .returning();
      return trx.query.sponsors.findFirst({
        where: (fields, operations) => operations.eq(fields.id, sponsor.id),
        with: {
          donations: {
            with: {
              admin: {
                columns: {
                  password: false,
                },
              },
            },
          },
        },
      });
    });
    return x;
  });

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${sponsors.id})`,
    })
    .from(sponsors);
  return x.count;
});

export const countAllWithoutDeleted = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${sponsors.id})`,
    })
    .from(sponsors)
    .where(isNull(sponsors.deletedAt));
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.sponsors.findFirst({
    where: (fields, operations) => operations.eq(fields.id, input),
    with: {
      donations: {
        where(fields, operators) {
          return operators.isNull(fields.deletedAt);
        },
        with: {
          admin: {
            columns: {
              password: false,
            },
          },
          sponsor: true,
        },
      },
    },
  });
});

export const findByName = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.sponsors.findFirst({
    where: (fields, operations) => operations.eq(fields.name, input),
    with: {
      donations: {
        with: {
          admin: {
            columns: {
              password: false,
            },
          },
        },
      },
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.sponsors.findMany({
    with: {
      donations: {
        where(fields, operators) {
          return operators.isNull(fields.deletedAt);
        },
        orderBy(fields, operators) {
          return operators.asc(fields.year);
        },
        with: {
          admin: {
            columns: {
              password: false,
            },
          },
        },
      },
    },
  });
});

export const allWithoutDeleted = z.function(z.tuple([])).implement(async () => {
  return db.query.sponsors.findMany({
    where(fields, operators) {
      return operators.isNull(fields.deletedAt);
    },
    with: {
      donations: {
        where(fields, operators) {
          return operators.isNull(fields.deletedAt);
        },
        orderBy(fields, operators) {
          return operators.asc(fields.year);
        },
        with: {
          admin: {
            columns: {
              password: false,
            },
          },
          sponsor: true,
        },
      },
    },
  });
});

export const update = z
  .function(
    z.tuple([
      createInsertSchema(sponsors)
        .partial()
        .omit({ createdAt: true, updatedAt: true, deletedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    const [x] = await db
      .update(sponsors)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(sponsors.id, input.id))
      .returning();
    return x;
  });

export const updateName = z
  .function(z.tuple([z.object({ id: z.string().uuid(), name: z.string() })]))
  .implement(async (input) => {
    return update({ id: input.id, name: input.name });
  });

export const safeParse = createInsertSchema(sponsors).omit({
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
}).safeParse;

export const isCreateWithDonationValid = z.object({
  name: z.string(),
  address: z.string(),
  amount: z.string().transform((x) => Number(x)),
  currency: z.union([z.literal("CHF"), z.literal("EUR")]),
  year: z.string().transform((x) => Number(x)),
  adminAdmin: z.string().uuid(),
}).safeParseAsync;

export const isDonateValid = z.object({
  amount: z.number().or(z.string().transform((x) => Number(x))),
  currency: z.union([z.literal("CHF"), z.literal("EUR")]),
  year: z.number().or(z.string().transform((x) => Number(x))),
  adminAdmin: z.string().uuid(),
}).safeParseAsync;

export const isUpdateDonationValid = z.object({
  id: z.string().uuid(),
  sponsorId: z.string().uuid(),
  amount: z.number().or(z.string().transform((x) => Number(x))),
  currency: z.union([z.literal("CHF"), z.literal("EUR")]),
  year: z.number().or(z.string().transform((x) => Number(x))),
}).safeParseAsync;

export const remove = z.function(z.tuple([z.string().uuid()])).implement(async (input) => {
  const [x] = await db.delete(sponsors).where(eq(sponsors.id, input)).returning();
  return x;
});

export const isUpdateValid = createInsertSchema(sponsors)
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({ id: z.string() }).safeParseAsync;

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;

export type Profile = SponsorSelect;
