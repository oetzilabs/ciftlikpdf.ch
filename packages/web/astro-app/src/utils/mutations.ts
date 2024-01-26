import { z } from "zod";
import type { Sponsor } from "../../../../core/src/entities/sponsors";
import type { SessionResult } from "../../../../functions/src/auth";
import type { User } from "../../../../core/src/entities/users";
export * as Mutations from "./mutations";

export const Sponsors = {
  create: z
    .function(z.tuple([z.string(), z.custom<Parameters<typeof Sponsor.create>[0]>()]))
    .implement(async (API_URL, data) => {
      const session = document.cookie.split("; ").find((x) => x.startsWith("session="));
      if (!session) return Promise.reject("No session found");
      return fetch(`${API_URL}/sponsors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.split("=")[1]}`,
        },
        body: JSON.stringify(data),
      }).then((res) => res.json() as ReturnType<typeof Sponsor.create>);
    }),
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

export const Authentication = {
  login: z
    .function(
      z.tuple([
        z.string(),
        z.object({
          name: z.string(),
          password: z.string(),
        }),
      ])
    )
    .implement((API_URL, data) =>
      fetch(`${API_URL}/auth`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: new URLSearchParams(data),
      })
        .then((res) => res.json() as Promise<{ jwtToken: string; expiresAt: string; user: User.Frontend }>)
        .then((res) => ({
          ...res,
          expiresAt: new Date(res.expiresAt),
        }))
    ),
  register: z
    .function(
      z.tuple([
        z.string(),
        z.object({
          name: z.string(),
          password: z.string(),
          passwordConfirm: z.string(),
        }),
      ])
    )
    .implement((API_URL, data) =>
      fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: new URLSearchParams(data),
      })
        .then((res) => res.json() as Promise<{ jwtToken: string; expiresAt: string; user: User.Frontend }>)
        .then((res) => ({
          ...res,
          expiresAt: new Date(res.expiresAt),
        }))
    ),
};