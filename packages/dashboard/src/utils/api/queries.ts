import { Sponsor } from "@ciftlikpdf/core/entities/sponsors";
import { z } from "zod";
import type { SessionResult } from "../../../../functions/src/auth";
import { Template } from "@ciftlikpdf/core/entities/templates";
import { PDF } from "@ciftlikpdf/core/entities/pdfs";
import { User } from "@ciftlikpdf/core/entities/users";

export * as Queries from "./queries";

const API_BASE = import.meta.env.VITE_API_URL;

export const session = z.function(z.tuple([z.string()])).implement(async (token) =>
  fetch(`${API_BASE}/session`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  }).then((res) => res.json() as Promise<SessionResult>)
);

export const Sponsors = {
  all: z.function(z.tuple([z.string()])).implement(async (token) =>
    fetch(`${API_BASE}/sponsors/all?filter=non-deleted`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as ReturnType<typeof Sponsor.allWithoutDeleted>)
  ),
  count: z.function(z.tuple([z.string()])).implement(async (token) =>
    fetch(`${API_BASE}/sponsors/count?filter=non-deleted`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as Promise<{ count: number }>)
  ),
};

export const Templates = {
  all: z.function(z.tuple([z.string()])).implement(async (token) =>
    fetch(`${API_BASE}/templates/all`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as ReturnType<typeof Template.all>)
  ),
  getDefault: z.function(z.tuple([z.string()])).implement(async (token) =>
    fetch(`${API_BASE}/templates/default`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as ReturnType<typeof Template.getDefault>)
  ),
};

export const PDFs = {
  all: z.function(z.tuple([z.string()])).implement(async (token) =>
    fetch(`${API_BASE}/pdfs/all`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as ReturnType<typeof PDF.all>)
  ),
};

export const Superadmins = {
  users: z.function(z.tuple([z.string()])).implement(async (token) =>
    fetch(`${API_BASE}/superadmin/users/all`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json() as ReturnType<typeof User.all>)
  ),
};
