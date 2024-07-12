import { A, createAsync, RouteDefinition, RoutePreloadFunc } from "@solidjs/router";
import { For, Show } from "solid-js";
import { getAllSponsors } from "@/data/sponsors";
import { getAuthenticatedSession } from "@/data/auth";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const sponsors = await getAllSponsors();
    return { sponsors, session };
  },
} satisfies RouteDefinition;

export default function Home() {
  const allSponsors = createAsync(() => getAllSponsors());
  return (
    <main class="text-center mx-auto p-4 pt-20 container">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Show when={allSponsors()}>
          {(sponsors) => (
            <For each={sponsors()}>
              {(sponsor) => (
                <A
                  class="flex flex-row gap-2 border border-neutral-300 dark:border-neutral-800 shadow-sm rounded-lg px-4 py-2 bg-white dark:bg-black"
                  href={`/sponsors/${sponsor.id}`}
                >
                  <div class="font-medium">{sponsor.name}:</div>
                  <div>
                    {sponsor.donations.length} bagis{sponsor.donations.length > 1 ? "lar" : ""}
                  </div>
                </A>
              )}
            </For>
          )}
        </Show>
      </div>
    </main>
  );
}
