import { ApiHandler, useFormData, useQueryParam, useQueryParams } from "sst/node/api";
import { error, getUser, json } from "./utils";
import { User } from "@ciftlikpdf/core/entities/users";
import { generateJwt } from "@ciftlikpdf/core/auth";
import dayjs from "dayjs";

export type SessionResult =
  | {
      success: true;
      user: Awaited<ReturnType<typeof User.findById>>;
      expiresAt: Date;
    }
  | {
      success: false;
      error: string;
    };

export const handler = ApiHandler(async (event, ctx) => {
  const formData = useFormData();
  if (!formData) return error("No query params");
  const name = formData.get("name");
  const password = formData.get("password");
  if (!name) return error("No name");
  if (!password) return error("No password");

  const user = await User.findByName(name);
  if (!user) return error("No user found");
  const valid = await User.validatePassword(user.id, password);
  if (!valid) return error("Invalid password");

  const jwtToken = await generateJwt(user.id);

  return json({ jwtToken, expiresAt: dayjs().add(1, "week").toDate().toString(), user });
});

export const session = ApiHandler(async () => {
  const user = await getUser();
  if (!user)
    return error({
      success: false,
      error: "No user found",
    } as SessionResult);
  return json({ success: true, user, expiresAt: dayjs().add(1, "week").toDate() } as SessionResult);
});

export const register = ApiHandler(async () => {
  const qp = useFormData();
  if (!qp) return error("No query params");
  const password = qp.get("password");
  const name = qp.get("name");
  if (!name) return error("No name");
  if (!password) return error("No password");

  const user = await User.create({ name, password });

  const jwtToken = await generateJwt(user.id);

  return json({ jwtToken, expiresAt: dayjs().add(1, "week").toDate().toString(), user });
});
