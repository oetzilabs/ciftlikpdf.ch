import { action } from "@solidjs/router";
import { withSession } from "../data/utils";
import { lucia } from "../data/lucia";

export const logout = action(async () => {
  "use server";
  const [session, event] = await withSession();
  if (!session) return;
  lucia.invalidateSession(session.session.id);
  return;
});
