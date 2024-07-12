import { atom } from "nanostores";
import { QueryClient } from "@tanstack/solid-query";
import type { Sponsor } from "@ciftlikpdf/core/src/entities/sponsors";

export const qC = new QueryClient();

export const sponsorAtom = atom<[Sponsor.Frontend, number] | undefined>();

export const API_URL = atom(import.meta.env.VITE_API_URL as string);
