import { StatusCodes } from "http-status-codes";
import { ApiHandler, useFormData, useQueryParam } from "sst/node/api";
import { getUser, error, json } from "./utils";

export const get = ApiHandler(async (event) => {
  const user = await getUser();
  if (!user) {
    return error("User not found", StatusCodes.NOT_FOUND);
  }
  return json(user);
});
