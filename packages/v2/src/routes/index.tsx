import { getAuthenticatedSession } from "@/data/auth";
import { getAllSponsors } from "@/data/sponsors";
import { A, createAsync, RouteDefinition } from "@solidjs/router";
import { For, Show } from "solid-js";
import { Button } from "../components/ui/button";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    return { session };
  },
} satisfies RouteDefinition;

export default function Home() {
  return (
    <main class="text-center mx-auto p-4 pt-20 container">
      <div class="flex flex-col gap-4 items-center justify-center w-full">
        <A
          class="flex flex-row gap-2 border border-neutral-300 dark:border-neutral-800 shadow-sm rounded-lg px-4 py-2 bg-white dark:bg-black text-lg items-center justify-center w-full max-w-md"
          href="/sponsors"
        >
          Sponsorlar
        </A>
        <A
          class="flex flex-row gap-2 border border-neutral-300 dark:border-neutral-800 shadow-sm rounded-lg px-4 py-2 bg-white dark:bg-black text-lg items-center justify-center w-full max-w-md"
          href="/users"
        >
          Userlar
        </A>
      </div>
    </main>
  );
}
