import { z } from "zod";
import type { Sponsor } from "../../../../core/src/entities/sponsors";
export * as Queries from "./queries";

export const Sponsors = {
  all: z
    .function(z.tuple([z.string()]))
    .implement((API_URL) =>
      fetch(`${API_URL}/sponsors/all?filter=non-deleted`,{
        // disable caching
        headers: {
          "Cache-Control": "no-cache",
        },
      }).then((res) => res.json() as ReturnType<typeof Sponsor.all>)
    ),
  get: z.function(z.tuple([z.string(), z.string()])).implement((API_URL, id) =>
    fetch(`${API_URL}/sponsors/${id}`,{
      // disable caching
      headers: {
        "Cache-Control": "no-cache",
      },
    }).then((res) => res.json() as ReturnType<typeof Sponsor.findById>)
  ),
};
