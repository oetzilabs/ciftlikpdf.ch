import { ApiHandler, useFormData, usePathParam } from "sst/node/api";
import { error, json, getUser } from "./utils";
import { StatusCodes } from "http-status-codes";
import { Superuser } from "@ciftlikpdf/core/entities/superadmins";
import { User } from "@ciftlikpdf/core/entities/users";

export const updateUser = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  if (user.type !== "superadmin") {
    return error("Not authorized", StatusCodes.UNAUTHORIZED);
  }
  const body = useFormData();
  if (!body) {
    return error("No body");
  }
  const data = Object.fromEntries(body.entries());
  const validation = await Superuser.isUpdateValid(data);
  if (!validation.success) {
    return error(validation.error.message);
  }
  const u = await User.findByName(validation.data.name);
  if (!u) {
    return error("User not found", StatusCodes.NOT_FOUND);
  }
  const updated = await Superuser.updateUser(u.id, validation.data);
  return json(updated);
});

export const makeSuperadmin = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  if (user.type !== "superadmin") {
    return error("Not authorized", StatusCodes.UNAUTHORIZED);
  }
  const id = usePathParam("id");
  if (!id) {
    return error("No id");
  }
  const updated = await Superuser.makeSuperadmin(id);
  return json(updated);
});

export const makeAdmin = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  if (user.type !== "superadmin") {
    return error("Not authorized", StatusCodes.UNAUTHORIZED);
  }
  const id = usePathParam("id");
  if (!id) {
    return error("No id");
  }
  const updated = await Superuser.makeAdmin(id);
  return json(updated);
});

export const makeViewer = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  if (user.type !== "superadmin") {
    return error("Not authorized", StatusCodes.UNAUTHORIZED);
  }
  const id = usePathParam("id");
  if (!id) {
    return error("No id");
  }
  const updated = await Superuser.makeViewer(id);
  return json(updated);
});

export const allUsers = ApiHandler(async (event) => {
  const user = await getUser();
  if (!user) {
    return error("User not found", StatusCodes.NOT_FOUND);
  }
  const users = await User.all();
  return json(users);
});
