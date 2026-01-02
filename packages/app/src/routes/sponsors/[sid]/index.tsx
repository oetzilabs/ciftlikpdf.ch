import { deleteSponsorAction } from "@/actions/sponsors";
import { DataTable } from "@/components/DataTable";
import { donationColumns } from "@/components/DonationColumns";
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
import { Button } from "@/components/ui/button";
import { getAuthenticatedSession } from "@/data/auth";
import { getAllSponsors, getSponsor } from "@/data/sponsors";
import { Title } from "@solidjs/meta";
import { A, createAsync, revalidate, RouteDefinition, useAction, useParams, useSubmission } from "@solidjs/router";
import ArrowLeft from "lucide-solid/icons/arrow-left";
import Loader2 from "lucide-solid/icons/loader-2";
import Pen from "lucide-solid/icons/pen";
import Plus from "lucide-solid/icons/plus";
import RotateCcw from "lucide-solid/icons/rotate-ccw";
import Trash from "lucide-solid/icons/trash";
import { createSignal, Match, Show, Suspense, Switch } from "solid-js";

export const route = {
  preload: async ({ params }) => {
    if (!params.sid) return {};
    const sponsors = await getSponsor(params.sid);
    const session = await getAuthenticatedSession();
    return { sponsors, session };
  },
} satisfies RouteDefinition;

export default function SponsorSIDIndex() {
  const params = useParams();
  if (!params.sid) return <div>Sponsor not found</div>;
  const sponsor = createAsync(() => getSponsor(params.sid));
  const session = createAsync(() => getAuthenticatedSession());

  const [openDeleteDialog, setOpenDeleteDialog] = createSignal(false);

  const deleteSponsor = useAction(deleteSponsorAction);
  const submission = useSubmission(deleteSponsorAction);

  return (
    <main class="text-center mx-auto p-4 pt-20 container flex flex-col gap-4 ">
      <div class="w-full flex flex-row items-center gap-2">
        <Button as={A} href={`/sponsors`} size="sm" class="w-max flex flex-row items-center gap-2">
          <ArrowLeft class="size-4" />
          Geri
        </Button>
      </div>
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
          <Show when={sponsor()} keyed fallback={<div>Sponsor not found</div>}>
            {(s) => (
              <>
                <Title>{s.name} | Sponsor</Title>
                <div class="w-full flex flex-col gap-4 items-start">
                  <div class="w-full flex flex-row items-center justify-between gap-4">
                    <h1 class="text-2xl font-bold text-center">{s.name}</h1>
                    <div class="flex flex-row gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={async () => await revalidate(getSponsor.keyFor(s.id))}
                        class="px-3 md:px-4 flex flex-row items-center gap-2"
                      >
                        <RotateCcw class="size-5" />
                        <span class="sr-only md:not-sr-only">Tekrar yükle</span>
                      </Button>
                      <Button
                        as={A}
                        href={`/sponsors/${s.id}/donate`}
                        size="sm"
                        class="px-3 md:px-4 flex flex-row items-center gap-2"
                      >
                        <Plus class="size-5" />
                        <span class="sr-only md:not-sr-only">Donate</span>
                      </Button>
                      <Button
                        as={A}
                        href={`/sponsors/${s.id}/edit`}
                        class="px-3 md:px-4 flex flex-row items-center gap-2"
                        size="sm"
                        variant="secondary"
                      >
                        <Pen class="size-5" />
                        <span class="sr-only md:not-sr-only">Güncelle</span>
                      </Button>
                      <AlertDialog open={openDeleteDialog()} onOpenChange={setOpenDeleteDialog}>
                        <AlertDialogTrigger
                          as={Button}
                          variant="destructive"
                          size="sm"
                          class="px-3 md:px-4 flex flex-row items-center gap-2"
                        >
                          <Trash class="size-5" />
                          <span class="sr-only md:not-sr-only">Sil</span>
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
