import { ApiHandler, usePathParam, useQueryParam } from "sst/node/api";
import { error, getUser, json } from "./utils";
import { PDF } from "@ciftlikpdf/core/entities/pdfs";
import { StatusCodes } from "http-status-codes";
import { useQueryParams } from "sst/node/api";

export const all = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  const pdfs = await PDF.all();

  return json(pdfs);
});

export const downloadUrl = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  const id = usePathParam("id");
  if (!id) {
    return error("No id");
  }
  try {
    const d = await PDF.downloadUrl(id);
    return json(d);
  } catch (e) {
    const _error = e as Error;
    return error(_error.message);
  }
});

export const publicDownloadUrl = ApiHandler(async () => {
  const did = usePathParam("did");
  if (!did) {
    return error("No did");
  }
  try {
    const d = await PDF.downloadUrl(did);
    return json(d);
  } catch (e) {
    const _error = e as Error;
    return error(_error.message);
  }
});

export const remove = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  const id = usePathParam("id");
  if (!id) {
    return error("No id");
  }
  const pdfs = await PDF.remove(id);

  return json(pdfs);
});

export const removeByKey = ApiHandler(async () => {
  const user = await getUser();
  if (!user) {
    return error("User not authorized", StatusCodes.UNAUTHORIZED);
  }
  const key = useQueryParam("key");
  if (!key) {
    return error("No key");
  }
  const pdfs = await PDF.removeByKey(key);

  return json(pdfs);
});
