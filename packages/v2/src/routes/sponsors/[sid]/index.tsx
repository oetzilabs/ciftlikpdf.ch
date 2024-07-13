import { DataTable } from "@/components/DataTable";
import { donationColumns } from "@/components/DonationColumns";
import { Button } from "@/components/ui/button";
import { getAuthenticatedSession } from "@/data/auth";
import { getSponsor } from "@/data/sponsors";
import { Title } from "@solidjs/meta";
import { A, createAsync, revalidate, RouteDefinition, useAction, useParams, useSubmission } from "@solidjs/router";
import { Loader2, Plus, Trash } from "lucide-solid";
import { createSignal, Match, Show, Suspense, Switch } from "solid-js";
import { getAllSponsors } from "../../../data/sponsors";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteSponsorAction } from "../../../actions/sponsors";

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

  const [openDeleteDialog, setOpenDeleteDialog] = createSignal(false);

  const deleteSponsor = useAction(deleteSponsorAction);
  const submission = useSubmission(deleteSponsorAction);

  return (
    <main class="text-center mx-auto p-4 pt-20 container flex flex-col gap-4 ">
      <Suspense fallback={<Loader2 class="size-4" />}>
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
          <Show when={sponsor()} keyed fallback={<div>Sponsor not found</div>}>
            {(s) => (
              <>
                <Title>{s.name} | Sponsor</Title>
                <div class="w-full flex flex-col gap-4 items-start">
                  <div class="w-full flex flex-row items-center justify-between gap-4">
                    <h1 class="text-2xl font-bold text-center">{s.name}</h1>
                    <div class="flex flex-row gap-2">
                      <Show when={session() && session()!.user !== null}>
                        <Button as={A} href={`/sponsors/${s.id}/donate`} class="flex flex-row items-center gap-2">
                          <Plus class="size-4" />
                          Donate
                        </Button>
                      </Show>
                      <AlertDialog open={openDeleteDialog()} onOpenChange={setOpenDeleteDialog}>
                        <AlertDialogTrigger as={Button} class="flex flex-row items-center gap-2" variant="destructive">
                          <Trash class="size-4" />
                          Sil
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Gercek Silmek istediğinize emin misiniz?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Bu bağlantıyı silindikten sonra bizim sistemimizden silinecek ve gerceklerinizi
                              kaybedeceğiz.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogClose>Kapat</AlertDialogClose>
                            <Button
                              variant="destructive"
                              onClick={async () => {
                                await deleteSponsor(s.id);
                                await revalidate(getAllSponsors.key);
                                setOpenDeleteDialog(false);
                              }}
                            >
                              <Switch fallback={<span>Evet, Sil</span>}>
                                <Match when={submission.pending}>
                                  <span>Siliniyor...</span>
                                  <Loader2 class="size-4 animate-spin" />
                                </Match>
                                <Match when={submission.result}>{(result) => <span>{result().message}</span>}</Match>
                              </Switch>
                            </Button>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
        </Show>
      </Suspense>
    </main>
  );
}
