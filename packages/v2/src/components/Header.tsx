import { A, createAsync, useLocation } from "@solidjs/router";
import { JSX, Match, Show, Suspense, Switch } from "solid-js";
import { logout } from "../actions/logout";
import { getAuthenticatedSession } from "../data/auth";
import { Button } from "./ui/button";
import { cn } from "../libs/cn";
import { Loader2 } from "lucide-solid";

const HeaderLink = (props: { href: string; class?: string; children: JSX.Element }) => {
  const location = useLocation();
  const isActive = props.href === "/" ? location.pathname === props.href : location.pathname.startsWith(props.href);
  return (
    <A
      class={cn(
        "border border-neutral-300 dark:border-neutral-800 rounded-md px-3 py-1 shadow-sm font-medium text-sm",
        props.class,
        { "bg-black text-white dark:bg-white dark:text-black border-0 shadow-none": isActive },
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
    <header class="z-50 fixed top-0 w-full flex flex-row items-center justify-center border-b border-neutral-300 dark:border-neutral-800 bg-white dark:bg-black">
      <nav class="container gap-2 mx-auto flex flex-row items-center justify-between px-4 py-2">
        <div class="container flex flex-row items-center justify-center gap-2 w-max">
          <A href="/" class="w-max flex flex-row gap-4 items-center justify-center">
            <img src="/logo-small.webp" alt="logo" class="h-6" />
            <h2 class="w-max font-bold">ciftlikpdf.ch</h2>
          </A>
          {/* <HeaderLink href="/">Sponsorlar</HeaderLink> */}
        </div>
        <div class="w-max flex flex-row items-center justify-between gap-4">
          <Suspense fallback={<Loader2 class="size-4" />}>
            <Switch
              fallback={
                <Button as={A} href="/login">
                  Giriş Yap
                </Button>
              }
            >
              <Match when={session() && session()!.user}>
                <form action={logout} method="post">
                  <Button type="submit">Çıkış</Button>
                </form>
              </Match>
            </Switch>
          </Suspense>
        </div>
      </nav>
    </header>
  );
};
