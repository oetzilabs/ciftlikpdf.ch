import { z } from "zod";
import { db } from "../drizzle/sql";

export * as Search from "./searchs";

const SearchTypeZod = z.union([
  z.literal("sponsors"),
  z.literal("income"),
  z.literal("expenses"),
  z.literal("donations"),
]);

export const sponsorsPDFs = z.function(z.tuple([z.string()])).implement(async (query) => {
  if (query.length < 3) return [];
  const result = [];
  const x = await db.query.sponsors.findMany({
    where: (fields, operations) =>
      operations.or(operations.like(fields.name, `%${query}%`), operations.like(fields.address, `%${query}%`)),
    with: {
      donations: {
        with: {
          sponsor: true,
        },
      },
    },
  });
  // get the s3 keys from the donations
  for (const sponsor of x) {
    for (const donation of sponsor.donations) {
      if (donation.s3Key) {
        result.push(donation);
      }
    }
  }
  return result;
});

export const pdfs = z.function(z.tuple([z.string(), SearchTypeZod])).implement(async (query, type) => {
  if (query.length < 3) return [];
  const result = [];
  switch (type) {
    case "sponsors":
      {
        const x = await db.query.sponsors.findMany({
          where: (fields, operations) =>
            operations.or(operations.like(fields.name, `%${query}%`), operations.like(fields.address, `%${query}%`)),
          with: {
            donations: true,
          },
        });
        // get the s3 keys from the donations
        for (const sponsor of x) {
          for (const donation of sponsor.donations) {
            if (donation.s3Key) {
              result.push(donation);
            }
          }
        }
      }
      break;
    case "income":
      throw new Error("Not implemented");
    case "expenses":
      throw new Error("Not implemented");
    case "donations":
      const x = await db.query.sponsors_donations.findMany({
        where: (fields, operations) =>
          operations.or(operations.like(fields.amount, `%${query}%`), operations.like(fields.year, `%${query}%`)),
        with: {
          sponsor: true,
        },
      });
      // get the s3 keys from the donations
      for (const donation of x) {
        if (donation.s3Key) {
          result.push(donation);
        }
      }
      break;
    default:
      throw new Error("Invalid type");
  }

  return result;
});

export const validateType = SearchTypeZod.safeParse;
