import "solid-js";
import { Match, Show, Switch, createSignal } from "solid-js";
import { TextField } from "@kobalte/core";
import { Mutations } from "../utils/mutations";
import { QueryClient, QueryClientProvider, createMutation } from "@tanstack/solid-query";

export function LoginFormWrapper(props: { API_URL: string; session?: string }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <LoginForm API_URL={props.API_URL} session={props.session} />
    </QueryClientProvider>
  );
}

function LoginForm(props: { API_URL: string; session?: string }) {
  const authenticate = createMutation(() => ({
    mutationKey: ["authenticate"],
    mutationFn: async (data: Parameters<typeof Mutations.Authentication.login>[1]) => {
      return Mutations.Authentication.login(props.API_URL, data);
    },
  }));
  const [login, setLogin] = createSignal<Parameters<typeof Mutations.Authentication.login>[1]>({
    name: "",
    password: "",
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await authenticate.mutateAsync(login());
    if (result.jwtToken && result.user && result.expiresAt) {
      document.cookie = `session=${result.jwtToken}; path=/; expires=${result.expiresAt.toUTCString()}`;
      const url = new URL(window.location.href);
      const redirect = url.searchParams.get("redirect");
      window.location.href = redirect || "/";
    } else {
      console.error(result, authenticate.failureReason);
    }
  };

  return (
    <form class="w-full flex flex-col gap-2 items-center justify-center" onSubmit={handleSubmit}>
      <TextField.Root
        value={login().name}
        name="name"
        class="w-full border border-neutral-300 dark:border-neutral-800 rounded-md overflow-clip bg-white dark:bg-black"
        onChange={(value) => setLogin((x) => ({ ...x, name: value }))}
      >
        <TextField.Input placeholder="Username" class="w-full px-3 py-2 outline-none bg-transparent" />
      </TextField.Root>
      <TextField.Root
        name="password"
        value={login().password}
        class="w-full border border-neutral-300 dark:border-neutral-800 rounded-md overflow-clip bg-white dark:bg-black"
        onChange={(value) => setLogin((x) => ({ ...x, password: value }))}
      >
        <TextField.Input type="password" placeholder="Password" class="w-full px-3 py-2 outline-none bg-transparent" />
      </TextField.Root>
      <Show when={authenticate.isError && authenticate.error}>
        {(e) => <TextField.ErrorMessage class="text-red-500">{e().message}</TextField.ErrorMessage>}
      </Show>
      <div class="flex w-full flex-row gap-2 items-center justify-between">
        <div>
          <a
            href="/register"
            class="border border-blue-300 rounded-md px-3 py-1 bg-blue-500 dark:bg-blue-600 dark:text-black text-white w-max outline-none text-sm font-medium flex flex-row items-center gap-2"
          >
            Register
          </a>
        </div>
        <div>
          <button
            type="submit"
            class="border border-gray-300 rounded-md px-3 py-1 bg-black dark:bg-white dark:text-black text-white w-max outline-none text-sm font-medium flex flex-row items-center gap-2"
            disabled={authenticate.isPending}
          >
            <span>Login</span>
            <Switch>
              <Match when={authenticate.isPending}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
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
              </Match>
              <Match when={authenticate.isError}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>
              </Match>
              <Match when={authenticate.isSuccess}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M18 6 7 17l-5-5" />
                  <path d="m22 10-7.5 7.5L13 16" />
                </svg>
              </Match>
              <Match when={authenticate.isIdle}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" x2="3" y1="12" y2="12" />
                </svg>
              </Match>
            </Switch>
          </button>
        </div>
      </div>
    </form>
  );
}
