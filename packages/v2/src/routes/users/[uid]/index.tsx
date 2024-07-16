import { deleteUserAction } from "@/actions/users";
import { DataTable } from "@/components/DataTable";
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
import { userDonationColumns } from "@/components/UserDonationColumns";
import { getAuthenticatedSession } from "@/data/auth";
import { getAllUsers, getUser } from "@/data/users";
import { Title } from "@solidjs/meta";
import { A, createAsync, revalidate, RouteDefinition, useAction, useParams, useSubmission } from "@solidjs/router";
import { ArrowLeft, Loader2, Pen, Trash } from "lucide-solid";
import { createSignal, Match, Show, Suspense, Switch } from "solid-js";

export const route = {
  preload: async ({ params }) => {
    const sponsors = await getUser(params.uid);
    const session = await getAuthenticatedSession();
    return { sponsors, session };
  },
} satisfies RouteDefinition;

export default function UserUIDIndex() {
  const params = useParams();
  const user = createAsync(() => getUser(params.uid));
  const session = createAsync(() => getAuthenticatedSession());

  const [openDeleteDialog, setOpenDeleteDialog] = createSignal(false);

  const deleteUser = useAction(deleteUserAction);
  const submission = useSubmission(deleteUserAction);

  return (
    <main class="text-center mx-auto p-4 pt-20 container flex flex-col gap-4 ">
      <div class="w-full flex flex-row items-center gap-2">
        <Button as={A} href={`/users`} size="sm" class="flex flex-row items-center gap-2">
          <ArrowLeft class="size-4" />
          Geri
        </Button>
      </div>
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
          <Show when={user()} keyed fallback={<div>User not found</div>}>
            {(s) => (
              <>
                <Title>{s.name} | User</Title>
                <div class="w-full flex flex-col gap-4 items-start">
                  <div class="w-full flex flex-row items-center justify-between gap-4">
                    <h1 class="text-2xl font-bold text-center">{s.name}</h1>
                    <div class="flex flex-row gap-2">
                      <Button
                        as={A}
                        href={`/users/${s.id}/edit`}
                        class="flex flex-row items-center gap-2"
                        variant="secondary"
                      >
                        <Pen class="size-4" />
                        Güncelle
                      </Button>
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
                                await deleteUser(s.id);
                                await revalidate(getAllUsers.key);
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
                  <div class="flex flex-col gap-0.5 items-start">{s.type}</div>
                  <div class="w-full border border-neutral-200 dark:border-neutral-800 rounded-md min-h-[calc(50svh)] flex flex-col overflow-clip">
                    <DataTable
                      columns={userDonationColumns}
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
