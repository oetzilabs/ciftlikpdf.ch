import { Octokit } from "@octokit/rest";
import dayjs from "dayjs";
import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import fetch from "node-fetch";
import { Config } from "sst/node/config";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { SponsorDonationsSelect, sponsors_donations, SponsorSelect } from "../drizzle/sql/schema";

export * as Sponsor from "./sponsors";

export const create = z.function(z.tuple([createInsertSchema(sponsors_donations)])).implement(async (input) => {
  const [x] = await db.insert(sponsors_donations).values(input).returning();
  return x;
});

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${sponsors_donations.id})`,
    })
    .from(sponsors_donations);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.sponsors_donations.findFirst({
    where: (fields, operations) => operations.eq(fields.id, input),
    with: {
      sponsor: true,
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
  });
});

export const findBySponsorId = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.sponsors_donations.findFirst({
    where: (fields, operations) => operations.eq(fields.sponsorId, input),
    with: {
      sponsor: true,
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
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.sponsors_donations.findMany({
    with: {
      sponsor: true,
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
  });
});

const update = z
  .function(
    z.tuple([
      createInsertSchema(sponsors_donations)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ])
  )
  .implement(async (input) => {
    await db
      .update(sponsors_donations)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(sponsors_donations.id, input.id))
      .returning();
    return true;
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: z.string().uuid() })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const updateAmount = z
  .function(z.tuple([z.object({ id: z.string().uuid(), amount: z.number() })]))
  .implement(async (input) => {
    return update({ id: input.id, amount: input.amount });
  });

export const isAllowedToSignUp = z.function(z.tuple([z.object({ email: z.string() })])).implement(async (input) => {
  return true;
});

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;

export type Profile = SponsorDonationsSelect;
