import { hash } from "bcrypt";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../drizzle/sql";
import { users } from "../drizzle/sql/schema";

export * as Superuser from "./superadmins";

export const updateUser = z
  .function(z.tuple([z.string().uuid(), z.object({ name: z.string(), password: z.string() })]))
  .implement(async (userid, data) => {
    data.password = await hash(data.password, 10);
    await db
      .update(users)
      .set({ ...data })
      .where(eq(users.id, userid))
      .returning();
    return true;
  });

export const makeSuperadmin = z.function(z.tuple([z.string().uuid()])).implement(async (userid) => {
  const [x] = await db.update(users).set({ type: "superadmin" }).where(eq(users.id, userid)).returning();
  return x;
});

export const makeAdmin = z.function(z.tuple([z.string().uuid()])).implement(async (userid) => {
  const [x] = await db.update(users).set({ type: "admin" }).where(eq(users.id, userid)).returning();
  return x;
});

export const makeViewer = z.function(z.tuple([z.string().uuid()])).implement(async (userid) => {
  const [x] = await db.update(users).set({ type: "viewer" }).where(eq(users.id, userid)).returning();
  return x;
});

export const isUpdateValid = z.object({ name: z.string(), password: z.string() }).safeParseAsync;
