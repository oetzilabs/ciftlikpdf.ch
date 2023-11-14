import { z } from "zod";
import type { PDF } from "@ciftlikpdf/core/entities/pdfs";

export * as Mutations from "./mutations";

const API_BASE = import.meta.env.VITE_API_URL;

export const PDFs = {
  downloadUrl: z.function(z.tuple([z.string()])).implement(async (key) =>
    fetch(`${API_BASE}/pdfs/public/download-url/${key}`, {
      method: "POST",
    }).then((res) => res.json() as ReturnType<typeof PDF.downloadUrl>)
  ),
};
