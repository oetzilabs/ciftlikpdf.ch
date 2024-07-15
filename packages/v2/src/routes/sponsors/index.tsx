import { getAuthenticatedSession } from "@/data/auth";
import { getAllSponsors } from "@/data/sponsors";
import { A, createAsync, revalidate, RouteDefinition } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { sponsorColumns } from "@/components/SponsorColumns";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const sponsors = await getAllSponsors();
    return { sponsors, session };
  },
} satisfies RouteDefinition;

export default function Home() {
  const session = createAsync(() => getAuthenticatedSession());
  const allSponsors = createAsync(() => getAllSponsors());

  return (
    <main class="mx-auto p-4 pt-20 container flex flex-col">
      <Show
        when={session() && session()!.user !== null}
        keyed
        fallback={
          <main class="text-center mx-auto p-4 pt-20">
            <span>Lütfen giriş yapınız.</span>
            <Button as={A} href="/login">
              Giriş Yap
            </Button>
          </main>
        }
      >
        <div class="flex flex-col w-full gap-2">
          <div class="flex flex-row items-center justify-between gap-2">
            <h1 class="text-2xl font-bold">Sponsorlar</h1>
            <div class="flex flex-row gap-2 items-center justify-center">
              <Button variant="secondary" size="lg" onClick={async () => await revalidate(getAllSponsors.key)}>
                Tekrar yükle
              </Button>
              <Button as={A} href="/sponsors/create" size="lg">
                Sponsor oluştur
              </Button>
            </div>
          </div>
          <Suspense fallback="Sponsorlar yükleniyor...">
            <Show
              when={allSponsors()}
              fallback={
                <span>
                  Şu anda sponsor yok, lütfen yeniden yükleyin veya{" "}
                  <A href="/sponsors/create">yeni bir sponsor ekleyin</A>
                </span>
              }
            >
              {(sponsors) => (
                <div class="w-full border border-neutral-200 dark:border-neutral-800 rounded-md min-h-[calc(50svh)] flex flex-col overflow-clip">
                  <DataTable columns={sponsorColumns} data={sponsors} searchBy="name" />
                </div>
              )}
            </Show>
          </Suspense>
        </div>
      </Show>
    </main>
  );
}
