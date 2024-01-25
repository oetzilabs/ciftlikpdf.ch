import { z } from "zod";
import type { Sponsor } from "../../../../core/src/entities/sponsors";
export * as Mutations from "./mutations";

export const Sponsors = {
  create: z
    .function(z.tuple([z.string(), z.custom<Parameters<typeof Sponsor.create>[0]>()]))
    .implement((API_URL, data) =>
      fetch(`${API_URL}/sponsors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }).then((res) => res.json() as ReturnType<typeof Sponsor.create>)
    ),
};
export const Donations = {
  create: z
    .function(
      z.tuple([
        z.string(),
        z.custom<Parameters<typeof Sponsor.donate>[0]>(),
        z.custom<Omit<Parameters<typeof Sponsor.donate>[1], "createdByAdmin">>(),
      ])
    )
    .implement((API_URL, id, data) =>
      fetch(`${API_URL}/donations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          id,
        }),
      }).then((res) => res.json() as ReturnType<typeof Sponsor.create>)
    ),
};
