import crypto from "crypto";
import { eq, sql } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { users } from "../drizzle/sql/schema";

export * as User from "./users";

// Configurable constants for hashing
const SALT_LENGTH = 16;
const HASH_ALGORITHM = "sha256";
const HASH_ITERATIONS = 100;
const KEY_LENGTH = 64;

export const create = z.function(z.tuple([createInsertSchema(users)])).implement(async (userInput) => {
  // Generate a salt
  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");
  // Hash the password with the salt
  const pwd = crypto.pbkdf2Sync(userInput.password, salt, HASH_ITERATIONS, KEY_LENGTH, HASH_ALGORITHM).toString("hex");
  userInput.password = `${salt}:${pwd}`;
  const [x] = await db.insert(users).values(userInput).returning({
    id: users.id,
    name: users.name,
    createdAt: users.createdAt,
    type: users.type,
  });

  return x;
});

export const validatePassword = z.function(z.tuple([z.string(), z.string()])).implement(async (input, pass) => {
  const [u] = await db.select({ pwd: users.password }).from(users).where(eq(users.id, input));

  const [salt, storedHash] = u.pwd.split(":");
  const hash = crypto.pbkdf2Sync(pass, salt, HASH_ITERATIONS, KEY_LENGTH, HASH_ALGORITHM).toString("hex");

  return storedHash === hash;
});

export const countAll = z.function(z.tuple([])).implement(async () => {
  const [x] = await db
    .select({
      count: sql`COUNT(${users.id})`,
    })
    .from(users);
  return x.count;
});

export const findById = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.users.findFirst({
    where: (users, operations) => operations.eq(users.id, input),
    with: {},
    columns: {
      password: false,
    },
  });
});

export const findByName = z.function(z.tuple([z.string()])).implement(async (input) => {
  return db.query.users.findFirst({
    where: (users, operations) => operations.eq(users.name, input),
    with: {},
    columns: {
      password: false,
    },
  });
});

export const all = z.function(z.tuple([])).implement(async () => {
  return db.query.users.findMany({
    with: {},
    columns: {
      password: false,
    },
  });
});

const update = z
  .function(
    z.tuple([
      createInsertSchema(users)
        .partial()
        .omit({ createdAt: true, updatedAt: true })
        .merge(z.object({ id: z.string().uuid() })),
    ]),
  )
  .implement(async (input) => {
    await db
      .update(users)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(users.id, input.id))
      .returning();
    return true;
  });

export const markAsDeleted = z.function(z.tuple([z.object({ id: z.string().uuid() })])).implement(async (input) => {
  return update({ id: input.id, deletedAt: new Date() });
});

export const updateName = z
  .function(z.tuple([z.object({ id: z.string().uuid(), name: z.string() })]))
  .implement(async (input) => {
    return update({ id: input.id, name: input.name });
  });

export const isAllowedToSignUp = z.function(z.tuple([z.object({ email: z.string() })])).implement(async (input) => {
  return true;
});

export type Frontend = NonNullable<Awaited<ReturnType<typeof findById>>>;
