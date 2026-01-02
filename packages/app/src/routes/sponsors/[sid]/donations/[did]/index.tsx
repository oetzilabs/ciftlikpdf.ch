import { Button } from "@/components/ui/button";
import { getAuthenticatedSession } from "@/data/auth";
import { getSponsor, getSponsorDonation } from "@/data/sponsors";
import { A, createAsync, RouteDefinition, useParams } from "@solidjs/router";
import Loader2 from "lucide-solid/icons/loader-2";
import Pen from "lucide-solid/icons/pen";
import ArrowLeft from "lucide-solid/icons/arrow-left";
import { Show, Suspense } from "solid-js";

export const route = {
  preload: async ({ params }) => {
    if (!params.sid || !params.did) return {};
    const sponsors = await getSponsor(params.sid);
    const donation = await getSponsorDonation(params.sid, params.did);
    const session = await getAuthenticatedSession();
    return { sponsors, session, donation };
  },
} satisfies RouteDefinition;

export default function SponsorDonationPage() {
  const params = useParams();
  if (!params.sid) return <div>Sponsor not found</div>;
  if (!params.did) return <div>Donation not found</div>;
  const sponsor = createAsync(() => getSponsor(params.sid));
  const donation = createAsync(() => getSponsorDonation(params.sid, params.did));
  const session = createAsync(() => getAuthenticatedSession());

  return (
    <Suspense fallback={<Loader2 class="size-4 animate-spin" />}>
      <Show
        when={session() && session()!.user !== null && session()!.user?.type === "admin"}
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
        <main class="text-center mx-auto p-4 pt-20 container flex flex-col gap-4">
          <div class="w-full flex flex-row items-center gap-2">
            <Button as={A} href={`/sponsors/${params.sid}`} class="w-max flex flex-row items-center gap-2">
              <ArrowLeft class="size-4" />
              Geri
            </Button>
          </div>
          <Show when={sponsor()} keyed fallback={<div>Sponsor not found</div>}>
            {(s) => (
              <div class="w-full flex flex-col gap-4 items-start">
                <h1 class="text-2xl font-bold text-center">{s.name}</h1>
                <div class="flex flex-col gap-0.5 items-start">{s.address}</div>
                <Show when={donation()} keyed>
                  {(d) => (
                    <div class="w-full flex flex-col items-center justify-center space-x-2 p-4 border dark:border-neutral-900 border-neutral-200 rounded-md">
                      <span class="text-2xl font-bold">{d.year}</span>
                      <div class="flex flex-row items-center justify-center gap-2 text-xl font-bold w-full">
                        <span>{d.amount}</span>
                        <span>{d.currency}</span>
                      </div>
                      <div class="flex flex-row items-center justify-center gap-2 text-xl font-bold w-full">
                        <Button
                          as={A}
                          href={`/sponsors/${s.id}/donations/${d.id}/edit`}
                          size="sm"
                          class="flex flex-row items-center gap-2"
                        >
                          <Pen class="size-4" />
                          <span class="">Düzenle</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </Show>
              </div>
            )}
          </Show>
        </main>
      </Show>
    </Suspense>
  );
}
