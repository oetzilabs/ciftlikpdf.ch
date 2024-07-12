import { User } from "@ciftlikpdf/core/src/entities/users";
import { cache } from "@solidjs/router";
import { withSession } from "./utils";

export type UserSession = {
  id: string | null;
  expiresAt: Date | null;
  user: User.Frontend | null;
};

export const getAuthenticatedSession = cache(async () => {
  "use server";
  let userSession = {
    id: null,
    expiresAt: null,
    user: null,
  } as UserSession;
  const [session] = await withSession();
  if (!session) {
    return userSession;
  }
  if (!session.session) {
    return userSession;
  }

  userSession.id = session.session.id;
  if (session.session.userId) {
    const u = await User.findById(session.session.userId);
    if (u) {
      userSession.user = u;
    }
  }
  return userSession;
}, "session");
