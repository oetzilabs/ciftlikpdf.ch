import { FileRoutes, Routes } from "solid-start";
import { cn } from "../utils/cn";
import { useHeader } from "./providers/Header";
import { useAuth } from "./providers/OfflineFirst";
import { Match, Switch } from "solid-js";
import { A, useLocation, useIsRouting } from "@solidjs/router";
import type { UserSelect } from "../../../core/src/drizzle/sql/schemas/users";

export default function Content() {
  const { visible } = useHeader();
  const [user] = useAuth();

  const url = () => useLocation().pathname;
  const isRouting = useIsRouting();

  return (
    <Switch
      fallback={
        <div class="flex w-full items-center justify-center py-28 h-[100svh] px-4 md:px-0 flex-col gap-2.5">
          <Switch>
            <Match when={user().isAuthenticated}>
              <Switch>
                <Match when={user().user?.type === "admin"}>
                  <span class="font-bold">Yönetici sayfası</span>
                </Match>
                <Match when={user().user?.type === "superadmin"}>
                  <span class="font-bold">Süper yönetici sayfası</span>
                </Match>
                <Match when={user().user?.type === "viewer"}>
                  <span class="font-bold">İzleyici sayfası. Malum, izleyici olunca bir şey yapamazsınız.</span>
                  <span class="font-medium">
                    Bir yönetici veya süper yönetici tarafından yetkilendirilmeniz gerekiyor.
                  </span>
                </Match>
              </Switch>
            </Match>
            <Match when={!user().isAuthenticated}>
              <span class="font-bold">Lütfen giriş yapın.</span>
              <A
                href={`/auth?redirect=${url() === "/auth" || url() === "/register" ? "/" : encodeURIComponent(url())}`}
                class="text-teal-600 font-bold"
              >
                Giriş yap
              </A>
            </Match>
          </Switch>
        </div>
      }
    >
      <Match when={user().isLoading || isRouting()}>
        <div class="flex flex-col gap-2 items-center justify-center h-[100svh]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="animate-spin"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
          <span class="font-bold">Bir saniye...</span>
        </div>
      </Match>
      <Match
        when={
          (user().isAuthenticated &&
            (["admin", "superadmin"] as Array<UserSelect["type"]>).includes(user().user!.type)) ||
          url() === "/auth" ||
          url() === "/register"
        }
      >
        <div
          class={cn("pt-[49px] h-[100svh] px-4 md:px-0", {
            "pt-0": !visible(),
          })}
        >
          <Routes>
            <FileRoutes />
          </Routes>
        </div>
      </Match>
    </Switch>
  );
}
