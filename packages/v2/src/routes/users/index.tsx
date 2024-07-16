import { getAuthenticatedSession } from "@/data/auth";
import { getAllUsers } from "@/data/users";
import { A, createAsync, revalidate, RouteDefinition } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { userColumns } from "@/components/UserColumns";
import { ArrowLeft, Plus, RotateCcw } from "lucide-solid";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const users = await getAllUsers();
    return { users, session };
  },
} satisfies RouteDefinition;

export default function UsersList() {
  const session = createAsync(() => getAuthenticatedSession());
  const allUsers = createAsync(() => getAllUsers());

  return (
    <main class="mx-auto p-4 pt-20 container flex flex-col gap-4">
      <div class="w-full flex flex-row items-center gap-2">
        <Button as={A} href={`/`} size="sm" class="flex flex-row items-center gap-2">
          <ArrowLeft class="size-4" />
          Geri
        </Button>
      </div>
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
            <h1 class="text-2xl font-bold">User</h1>
            <div class="flex flex-row gap-2 items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => await revalidate(getAllUsers.key)}
                class="px-3 md:px-4 flex flex-row items-center gap-2"
              >
                <RotateCcw class="size-4" />
                <span class="sr-only md:not-sr-only">Tekrar yükle</span>
              </Button>
              <Button as={A} href="/users/create" size="sm" class="px-3 md:px-4 flex flex-row items-center gap-2">
                <Plus class="size-4" />
                <span class="sr-only md:not-sr-only">User oluştur</span>
              </Button>
            </div>
          </div>
          <Suspense fallback="Sponsorlar yükleniyor...">
            <Show
              when={allUsers()}
              fallback={
                <span>
                  Şu anda sponsor yok, lütfen yeniden yükleyin veya <A href="/users/create">yeni bir sponsor ekleyin</A>
                </span>
              }
            >
              {(users) => (
                <div class="w-full border border-neutral-200 dark:border-neutral-800 rounded-md min-h-[calc(50svh)] flex flex-col overflow-clip">
                  <DataTable columns={userColumns} data={users} searchBy="name" />
                </div>
              )}
            </Show>
          </Suspense>
        </div>
      </Show>
    </main>
  );
}
