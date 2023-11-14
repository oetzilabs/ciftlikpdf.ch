import { createMutation } from "@tanstack/solid-query";
import { createEffect, createSignal } from "solid-js";
import { useSearchParams } from "solid-start";
import { useOfflineFirst } from "../components/providers/OfflineFirst";
import { A } from "@solidjs/router";

const AuthPage = () => {
  const [sp] = useSearchParams();
  const offlineFirst = useOfflineFirst();

  const [name, setName] = createSignal("");
  const [password, setPassword] = createSignal("");

  const authenticate = createMutation(
    (data: { name: string; password: string }) => {
      return fetch(`${import.meta.env.VITE_AUTH_URL}`, {
        method: "POST",
        body: new URLSearchParams(data),
      }).then((r) => r.json() as Promise<{ jwtToken: string }>);
    },
    {
      async onSuccess(data, variables, context) {
        // save token to indexeddb -> offlineFirst
        await offlineFirst.saveUser(data.jwtToken);
        document.cookie = `session=${data.jwtToken}; path=/; expires=${new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
        ).toUTCString()}`;
        window.location.href = sp.redirect ?? "/";
      },
    }
  );

  return (
    <div class="max-w-[600px] w-full mx-auto flex flex-col py-10 gap-10">
      <div class="flex w-full flex-col gap-2 items-center justify-center">
        <span class="font-bold text-3xl">Login</span>
      </div>
      <div class="w-full flex flex-col gap-2 items-center justify-center">
        <input
          type="text"
          class="w-full border border-gray-300 rounded-sm p-2"
          placeholder="email"
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
        />
        <input
          type="password"
          class="w-full border border-gray-300 rounded-sm p-2"
          placeholder="password"
          value={password()}
          onInput={(e) => setPassword(e.currentTarget.value)}
        />
      </div>
      <button
        type="button"
        class="border border-gray-300 rounded-sm p-2 bg-gray-100"
        disabled={authenticate.isLoading}
        onClick={async () => {
          authenticate.mutateAsync({
            name: name(),
            password: password(),
          });
        }}
      >
        Login
      </button>
      <A href="/register" class="hover:underline">
        Register
      </A>
    </div>
  );
};

export default AuthPage;
