import { Button } from "@/components/ui/button";
import { getAuthenticatedSession } from "@/data/auth";
import { getSponsor } from "@/data/sponsors";
import { A, createAsync, RouteDefinition, useParams } from "@solidjs/router";
import { Plus } from "lucide-solid";
import { Show } from "solid-js";
import { DataTable } from "../../../components/DataTable";
import { donationColumns } from "../../../components/DonationColumns";
import { Title } from "@solidjs/meta";

export const route = {
  preload: async ({ params }) => {
    const sponsors = await getSponsor(params.sid);
    const session = await getAuthenticatedSession();
    return { sponsors, session };
  },
} satisfies RouteDefinition;

export default function SponsorSIDIndex() {
  const params = useParams();
  const sponsor = createAsync(() => getSponsor(params.sid));
  const session = createAsync(() => getAuthenticatedSession());

  return (
    <main class="text-center mx-auto p-4 pt-20 container flex flex-col gap-4 ">
      <Show when={sponsor()} keyed fallback={<div>Sponsor not found</div>}>
        {(s) => (
          <>
            <Title>{s.name} | Sponsor</Title>
            <div class="w-full flex flex-col gap-4 items-start">
              <div class="w-full flex flex-row items-center justify-between gap-4">
                <h1 class="text-2xl font-bold text-center">{s.name}</h1>
                <Show when={session() && session()!.user !== null}>
                  <Button as={A} href={`/sponsors/${s.id}/donate`} class="flex flex-row items-center gap-2">
                    <Plus class="size-4" />
                    Donate
                  </Button>
                </Show>
              </div>
              <div class="flex flex-col gap-0.5 items-start">{s.address}</div>
              <div class="w-full border border-neutral-200 dark:border-neutral-800 rounded-md min-h-[calc(50svh)] flex flex-col overflow-clip">
                <DataTable
                  columns={donationColumns}
                  data={() => s.donations}
                  searchBy="year"
                  sorting={[{ id: "year", desc: false }]}
                />
              </div>
            </div>
          </>
        )}
      </Show>
    </main>
  );
}
