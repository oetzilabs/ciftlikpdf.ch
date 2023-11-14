import { and, eq, isNull, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { SponsorSelect, sponsors, sponsors_donations } from "../drizzle/sql/schema";

export * as Sponsor from "./sponsors";

export const create = z.function(z.tuple([createInsertSchema(sponsors)])).implement(async (input) => {
  const [x] = await db.insert(sponsors).values(input).returning();
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
          createdByAdmin: z.string().uuid(),
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
  .implement(async (sponsorId, donationId, deletedByAdmin) => {
    const [x] = await db
      .update(sponsors_donations)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
        deletedByAdmin,
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
              createdBy: {
                columns: {
                  password: false,
                },
              },
              updatedBy: {
                columns: {
                  password: false,
                },
              },
              deletedBy: {
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
        with: {
          createdBy: {
            columns: {
              password: false,
            },
          },
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
          createdBy: {
            columns: {
              password: false,
            },
          },
          updatedBy: {
            columns: {
              password: false,
            },
          },
          deletedBy: {
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
          createdBy: {
            columns: {
              password: false,
            },
          },
          updatedBy: {
            columns: {
              password: false,
            },
          },
          deletedBy: {
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
          createdBy: {
            columns: {
              password: false,
            },
          },
          updatedBy: {
            columns: {
              password: false,
            },
          },
          deletedBy: {
            columns: {
              password: false,
            },
          },
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

export const isCreateValid = createInsertSchema(sponsors).safeParseAsync;

export const isCreateWithDonationValid = z.object({
  name: z.string(),
  address: z.string(),
  amount: z.string().transform((x) => Number(x)),
  currency: z.union([z.literal("CHF"), z.literal("EUR")]),
  year: z.string().transform((x) => Number(x)),
  createdByAdmin: z.string().uuid(),
}).safeParseAsync;

export const isDonateValid = z.object({
  amount: z.string().transform((x) => Number(x)),
  currency: z.union([z.literal("CHF"), z.literal("EUR")]),
  year: z.string().transform((x) => Number(x)),
  createdByAdmin: z.string().uuid(),
}).safeParseAsync;

export const isUpdateDonationValid = z.object({
  id: z.string().uuid(),
  sponsorId: z.string().uuid(),
  amount: z.string().transform((x) => Number(x)),
  currency: z.union([z.literal("CHF"), z.literal("EUR")]),
  year: z.string().transform((x) => Number(x)),
}).safeParseAsync;

export const remove = z.function(z.tuple([z.string().uuid()])).implement(async (input) => {
  const [x] = await db
    .update(sponsors)
    .set({
      deletedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(sponsors.id, input))
    .returning();
  return x;
});

export const isUpdateValid = createInsertSchema(sponsors)
  .omit({
    createdAt: true,
    updatedAt: true,
  })
  .extend({ id: z.string() }).safeParseAsync;

export const invalidateDonations = z.function(z.tuple([z.string().uuid()])).implement(async (input) => {
  const [x] = await db
    .update(sponsors_donations)
    .set({
      s3Key: null,
      updatedAt: new Date(),
    })
    .where(eq(sponsors_donations.sponsorId, input))
    .returning();
  return x;
});

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;

export type Profile = SponsorSelect;
