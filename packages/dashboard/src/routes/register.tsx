import { createMutation } from "@tanstack/solid-query";
import { For, createEffect, createSignal } from "solid-js";
import { useSearchParams } from "solid-start";
import { useOfflineFirst } from "../components/providers/OfflineFirst";

const AuthPage = () => {
  const [sp] = useSearchParams();
  const offlineFirst = useOfflineFirst();

  const [name, setName] = createSignal("");
  const [password, setPassword] = createSignal("");

  const [errors, setErrors] = createSignal({} as Record<string, string>);

  const register = createMutation(
    (data: { password: string; name: string }) => {
      return fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        body: new URLSearchParams(data),
      })
        .then((r) => r.json() as Promise<{ jwtToken: string }>)
        .catch((e) => {
          // console.log(e.message);
          return {
            jwtToken: null,
          };
        });
    },
    {
      async onSuccess(data) {
        if (!data.jwtToken) return;
        // save token to indexeddb -> offlineFirst
        await offlineFirst.saveUser(data.jwtToken);
        document.cookie = `session=${data.jwtToken}; path=/; expires=${new Date(
          Date.now() + 1000 * 60 * 60 * 24 * 7 // 7 days
        ).toUTCString()}`;
        window.location.href = sp.redirect ?? "/";
      },
      async onError(data) {
        // console.log(data);
        setErrors(data as Record<string, string>);
      },
    }
  );
  const errorKeys = () => Object.keys(errors());

  return (
    <div class="max-w-[600px] w-full mx-auto flex flex-col py-10 gap-10">
      <div class="flex w-full flex-col gap-2 items-center justify-center">
        <span class="font-bold text-3xl">Register</span>
      </div>
      <div class="w-full flex flex-col gap-2 items-center justify-center">
        <input
          type="text"
          class="w-full border border-gray-300 rounded-sm p-2"
          placeholder="Isim"
          value={name()}
          onInput={(e) => setName(e.currentTarget.value)}
        />
        <input
          type="password"
          class="w-full border border-gray-300 rounded-sm p-2"
          placeholder="Password"
          value={password()}
          onInput={(e) => setPassword(e.currentTarget.value)}
        />
        <For each={errorKeys()}>{(key) => <div class="text-red-500 text-sm font-bold">{errors()[key]}</div>}</For>
      </div>
      <button
        type="button"
        class="border border-gray-300 rounded-sm p-2 bg-gray-100"
        disabled={register.isLoading}
        onClick={async () => {
          register.mutateAsync({
            password: password(),
            name: name(),
          });
        }}
      >
        Register
      </button>
    </div>
  );
};

export default AuthPage;
