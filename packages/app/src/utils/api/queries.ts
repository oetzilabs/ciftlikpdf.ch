import type { Search } from "@ciftlikpdf/core/entities/searchs";
import { z } from "zod";

export * as Queries from "./queries";

const API_BASE = import.meta.env.VITE_API_URL;

export const PDFs = {
  Search: {
    sponsors: z
      .function(z.tuple([z.string()]))
      .implement(async (query) =>
        fetch(`${API_BASE}/search/pdf?q=${query}&type=sponsors`).then(
          (res) => res.json() as ReturnType<typeof Search.sponsorsPDFs>
        )
      ),
  },
};
