import { DrizzleSQLiteAdapter } from "@lucia-auth/adapter-drizzle";
import { db } from "./drizzle/sql";
import { sessionTable, users } from "./drizzle/sql/schema";

export const luciaAdapter = new DrizzleSQLiteAdapter(db, sessionTable, users);
