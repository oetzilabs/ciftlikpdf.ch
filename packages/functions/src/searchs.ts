import { Search } from "@ciftlikpdf/core/entities/searchs";
import { ApiHandler, useQueryParams } from "sst/node/api";
import { error, json } from "./utils";

export const pdfs = ApiHandler(async () => {
  const qp = useQueryParams();
  if (!qp) {
    return error("No query params");
  }
  const query = qp.q;
  if (!query) {
    return error("No query");
  }
  const qtype = qp.type;
  if (!qtype) {
    return error("No query type");
  }
  const validation = await Search.validateType(qtype);
  if (!validation.success) {
    return error(validation.error.message);
  }
  switch (validation.data) {
    case "sponsors":
      const result = await Search.sponsorsPDFs(query);
      return json(result);
    case "income":
      return error("Not implemented");
    case "expenses":
      return error("Not implemented");
    case "donations":
      return error("Not implemented");
    default:
      return error("Unknown query type");
  }

  return error("Unknown error");
});
