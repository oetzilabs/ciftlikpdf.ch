import { User } from "@ciftlikpdf/core/src/entities/users";
import { action, redirect } from "@solidjs/router";
import { appendHeader, getEvent } from "vinxi/http";
import { lucia } from "../data/lucia";

export const register = action(async (formData: FormData) => {
  "use server";
  const event = getEvent()!;
  const name = formData.get("name");
  const password = formData.get("password");
  if (!name || !password) return;

  const user = await User.findByName(name.toString());
  if (user) return new Error("User already exists");

  const created = await User.create({
    name: name.toString(),
    password: password.toString(),
    type: "viewer",
  });

  const session = await lucia.createSession(created.id, {
    userId: created.id,
  });
  appendHeader(event, "Set-Cookie", lucia.createSessionCookie(session.id).serialize());

  throw redirect("/");
});
