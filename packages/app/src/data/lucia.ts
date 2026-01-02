import { luciaAdapter } from "@ciftlikpdf/core/src/auth";
import type { SessionSelect, UserSelect } from "@ciftlikpdf/core/src/drizzle/sql/schema";
import { Lucia, TimeSpan } from "lucia";

export const lucia = new Lucia(luciaAdapter, {
  sessionExpiresIn: new TimeSpan(2, "w"),
  sessionCookie: {
    attributes: {
      // set to `true` when using HTTPS
      secure: import.meta.env.PROD,
    },
  },
  getUserAttributes: (attributes) => {
    return {
      username: attributes.name,
    };
  },
  getSessionAttributes(databaseSessionAttributes) {
    return {
      userId: databaseSessionAttributes.userId,
    };
  },
});

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
  }
}

type DatabaseUserAttributes = Omit<UserSelect, "id">;
type DatabaseSessionAttributes = Omit<SessionSelect, "id" | "expiresAt" | "updatedAt">;
