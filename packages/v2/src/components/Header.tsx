import { A, createAsync, useLocation } from "@solidjs/router";
import { Loader2, LogOut } from "lucide-solid";
import { JSX, Match, Suspense, Switch } from "solid-js";
import { logout } from "../actions/logout";
import { getAuthenticatedSession } from "../data/auth";
import { cn } from "../libs/cn";
import { Button } from "./ui/button";

const HeaderLink = (props: { href: string; class?: string; children: JSX.Element }) => {
  const location = useLocation();
  const isActive = props.href === "/" ? location.pathname === props.href : location.pathname.startsWith(props.href);
  return (
    <A
      class={cn(
        "border border-neutral-300 dark:border-neutral-800 rounded-md px-3 py-1 shadow-sm font-medium text-sm",
        props.class,
        { "bg-black text-white dark:bg-white dark:text-black border-0 shadow-none": isActive }
      )}
      {...props}
      href={props.href}
    >
      {props.children}
    </A>
  );
};

export const Header = () => {
  const session = createAsync(() => getAuthenticatedSession());

  return (
    <header class="z-50 fixed top-0 w-screen flex flex-row items-center justify-center border-b border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black">
      <nav class="w-screen md:container gap-2 mx-auto flex flex-row items-center justify-between px-4 py-2">
        <div class="flex flex-row items-center justify-center gap-2 w-max">
          <A href="/" class="w-max flex flex-row gap-4 items-center justify-center">
            <img src="/logo-small.webp" alt="logo" class="h-6" />
            <h2 class="w-max font-bold">ciftlikpdf.ch</h2>
          </A>
        </div>
        <div class="w-max flex flex-row items-center justify-between gap-4">
          <Suspense fallback={<Loader2 class="size-4 animate-spin" />}>
            <Switch
              fallback={
                <Button as={A} href="/login">
                  Giriş Yap
                </Button>
              }
            >
              <Match when={session() && session()!.user}>
                <form action={logout} method="post">
                  <Button size="sm" type="submit" class="flex flex-row items-center gap-2">
                    Çıkış
                    <LogOut class="size-4" />
                  </Button>
                </form>
              </Match>
            </Switch>
          </Suspense>
        </div>
      </nav>
    </header>
  );
};
