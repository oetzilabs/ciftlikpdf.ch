import { z } from "zod";
import type { Sponsor } from "../../../../core/src/entities/sponsors";
import type { User } from "@ciftlikpdf/core/src/entities/users";
import type { Donation } from "@ciftlikpdf/core/src/entities/donations";
export * as Queries from "./queries";

export const Sponsors = {
  all: z
    .function(z.tuple([z.string()]))
    .implement((API_URL) =>
      fetch(`${API_URL}/sponsors/all?filter=non-deleted`, {}).then(
        (res) => res.json() as ReturnType<typeof Sponsor.all>,
      ),
    ),
  get: z
    .function(z.tuple([z.string(), z.string()]))
    .implement((API_URL, id) =>
      fetch(`${API_URL}/sponsors/${id}`, {}).then((res) => res.json() as ReturnType<typeof Sponsor.findById>),
    ),
};

export const Donations = {
  findBySponsorId: z
    .function(z.tuple([z.string(), z.string()]))
    .implement((API_URL, sponsorId) =>
      fetch(`${API_URL}/sponsor/${sponsorId}/donations`, {}).then(
        (res) => res.json() as ReturnType<typeof Donation.findBySponsorId>,
      ),
    ),
};

export const Superadmins = {
  users: z.function(z.tuple([z.string()])).implement(async (API_BASE) => {
    const session = document.cookie.split("; ").find((x) => x.startsWith("session="));
    if (!session) return Promise.reject("No session found");
    return fetch(`${API_BASE}/superadmin/users/all`, {
      method: "GET",
      headers: {
        authorization: `Bearer ${session.split("=")[1]}`,
      },
    }).then((res) => res.json() as ReturnType<typeof User.all>);
  }),
};
