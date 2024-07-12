import { User } from "@ciftlikpdf/core/src/entities/users";
import { action, redirect } from "@solidjs/router";
import { appendHeader, getEvent } from "vinxi/http";
import { lucia } from "../data/lucia";

export const login = action(async (formData: FormData) => {
  "use server";
  const event = getEvent()!;
  const name = formData.get("name");
  const password = formData.get("password");
  if (!name || !password) return;

  const user = await User.findByName(name.toString());
  if (!user) return;

  const valid = await User.validatePassword(user.id, password.toString());
  if (!valid) return new Error("Invalid password");

  const session = await lucia.createSession(user.id, {
    userId: user.id,
  });
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());

  throw redirect("/");
});
