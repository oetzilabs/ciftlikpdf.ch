import { ApiHandler } from "sst/node/api";

export const main = ApiHandler(async (_evt) => {
  return {
    statusCode: 200,
  };
});
