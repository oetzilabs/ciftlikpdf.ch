import { z } from "zod";
import type { Sponsor } from "../../../../core/src/entities/sponsors";
export * as Queries from "./queries";

export const Sponsors = {
  all: z
    .function(z.tuple([z.string()]))
    .implement((API_URL) =>
      fetch(`${API_URL}/sponsors/all?filter=non-deleted`).then((res) => res.json() as ReturnType<typeof Sponsor.all>)
    ),
  get: z.function(z.tuple([z.string(), z.string()])).implement((API_URL, id) =>
    fetch(`${API_URL}/sponsors/${id}`).then((res) => res.json() as ReturnType<typeof Sponsor.findById>)
  ),
  remove: z.function(z.tuple([z.string(), z.string()])).implement(async (API_URL, id) => {
    const session = document.cookie.split("; ").find((row) => row.startsWith("session="));
    if (!session) {
      throw new Error("No session found");
    }
    const result = await fetch(`${API_URL}/sponsors/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.split("=")[1]}`,
      }
    }).then((res) => res.json() as ReturnType<typeof Sponsor.remove>);
    return result;
  }
  ),
};
