import { getCookie, getEvent } from "vinxi/http";
import { lucia } from "./lucia";

export const withSession = async () => {
  "use server";
  const event = getEvent()!;

  const sessionId = getCookie(event, lucia.sessionCookieName) ?? null;

  if (!sessionId) {
    return [null, event] as const;
  }

  const session = await lucia.validateSession(sessionId);

  if (!session) {
    return [null, event] as const;
  }
  if (!session.session) {
    return [null, event] as const;
  }

  if (!session.user) {
    return [null, event] as const;
  }

  return [session, event] as const;
};
