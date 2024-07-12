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
      <div class="flex flex-col gap-4">
        {/* <A
          class="flex flex-row gap-2 border border-neutral-300 dark:border-neutral-800 shadow-sm rounded-lg px-4 py-2 bg-white dark:bg-black text-lg"
          href="/sponsors"
        >
          Sponsorları görüntüle
        </A> */}
        Merhaba, bu site için çalışıyoruz. Başka zamana geri dönüş yapin. Iyi günler!
      </div>
    </main>
  );
}
