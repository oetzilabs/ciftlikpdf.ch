import { getAuthenticatedSession } from "@/data/auth";
import { getAllSponsors } from "@/data/sponsors";
import { A, createAsync, RouteDefinition } from "@solidjs/router";
import { For, Show, Suspense } from "solid-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-solid";

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
        <Suspense fallback={<Loader2 class="size-4" />}>
          <Show when={allSponsors()}>
            {(sponsors) => (
              <For
                each={sponsors()}
                fallback={
                  <div class="w-full col-span-full flex flex-col items-center justify-center gap-4 p-4 border border-neutral-200 dark:border-neutral-900 rounded-lg">
                    <span>Sponsorlarınız yok</span>
                    <Button as={A} href="/sponsors/create" variant="secondary" size="lg">
                      Sponsor oluştur
                    </Button>
                  </div>
                }
              >
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
        </Suspense>
      </div>
    </main>
  );
}
