import { createMutation, createQueries, createQuery, useQueryClient } from "@tanstack/solid-query";
import { For, Show, createEffect, createSignal } from "solid-js";
import { useSearchParams } from "solid-start";
import { useAuth, useOfflineFirst } from "../components/providers/OfflineFirst";
import { Mutations } from "../utils/api/mutations";
import { Queries } from "../utils/api/queries";
import { cn } from "../utils/cn";

const SettingsPage = () => {
  const [user] = useAuth();
  const [sp] = useSearchParams();
  const queryClient = useQueryClient();
  const offlineFirst = useOfflineFirst();

  const [oldPassword, setOldPassword] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");

  const [errors, setErrors] = createSignal({} as Record<string, string>);

  const changePassword = createMutation(
    () => {
      const data = {
        id: user().user!.id,
        newPassword: newPassword(),
        oldPassword: oldPassword(),
      };
      const token = user().token;
      if (!token) throw new Error("Token not found");
      return fetch(`${import.meta.env.VITE_API_URL}/change-password`, {
        method: "POST",
        body: new URLSearchParams(data),
        headers: {
          authorization: `Bearer ${token}`,
        },
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

  const makeAdmin = createMutation(
    (id: string) => {
      const token = user().token;
      if (!token) throw new Error("Token not found");
      return Mutations.Superadmins.makeAdmin(token, id);
    },
    {
      async onSuccess(data) {
        await queryClient.invalidateQueries(["users"]);
      },
    }
  );

  const makeViewer = createMutation(
    (id: string) => {
      const token = user().token;
      if (!token) throw new Error("Token not found");
      return Mutations.Superadmins.makeViewer(token, id);
    },
    {
      async onSuccess(data) {
        await queryClient.invalidateQueries(["users"]);
      },
    }
  );

  const makeSuperAdmin = createMutation(
    (id: string) => {
      const token = user().token;
      if (!token) throw new Error("Token not found");
      return Mutations.Superadmins.makeSuperAdmin(token, id);
    },
    {
      async onSuccess(data) {
        await queryClient.invalidateQueries(["users"]);
      },
    }
  );

  const [name, setName] = createSignal("");
  const [password, setPassword] = createSignal("");

  const changeUser = createMutation(() => {
    const data = {
      id: user().user!.id,
      name: name(),
      password: password(),
    };
    const token = user().token;
    if (!token) throw new Error("Token not found");
    return Mutations.Superadmins.updateUser(token, data);
  });

  const users = createQuery(
    () => ["users"],
    () => {
      const token = user().token;
      if (!token) throw new Error("Token not found");
      return Queries.Superadmins.users(token);
    },
    {
      get enabled() {
        const u = user();
        return u.isAuthenticated && u.user?.type === "superadmin";
      },
    }
  );

  return (
    <div class="container mx-auto flex flex-col py-10 gap-10">
      <div class="flex w-full flex-col gap-2 items-start">
        <span class="font-bold text-3xl">Ayarlar</span>
      </div>
      <div class="max-w-[600px] w-full flex flex-col gap-10">
        <div class="w-full flex flex-col gap-4">
          <span class="font-bold text-xl">Password Deyistir</span>
          <div class="w-full flex flex-col gap-2">
            <div>
              <label class="text-sm font-bold">Isim</label>
              <input
                type="text"
                class="w-full border border-gray-300 rounded-sm p-2"
                placeholder="Eski password"
                value={oldPassword()}
                onInput={(e) => setOldPassword(e.currentTarget.value)}
              />
            </div>
            <div>
              <label class="text-sm font-bold">Yeni Password</label>
              <input
                type="password"
                class="w-full border border-gray-300 rounded-sm p-2"
                placeholder="Yeni Password"
                value={newPassword()}
                onInput={(e) => setNewPassword(e.currentTarget.value)}
              />
            </div>
            <For each={Object.keys(errors())}>
              {(key) => <div class="text-red-500 text-sm font-bold">{errors()[key]}</div>}
            </For>
          </div>
          <button
            type="button"
            class="border border-gray-300 rounded-sm p-2 bg-gray-100"
            disabled={changePassword.isLoading}
            onClick={async () => {
              changePassword.mutateAsync();
            }}
          >
            Deyistir
          </button>
        </div>
      </div>
      <Show when={user().user?.type === "superadmin"}>
        <span class="font-bold text-xl">Admin yarat</span>
        <div class="max-w-[600px] w-full flex flex-col gap-10">
          <div class="w-full flex flex-col gap-4">
            <span class="font-bold text-xl">Kisisel bilgiler</span>
            <div class="w-full flex flex-col gap-2">
              <div>
                <label class="text-sm font-bold">Isim</label>
                <input
                  type="text"
                  class="w-full border border-gray-300 rounded-sm p-2"
                  placeholder="Isim"
                  value={name()}
                  onInput={(e) => setName(e.currentTarget.value)}
                />
              </div>
              <div>
                <label class="text-sm font-bold">Password</label>
                <input
                  type="password"
                  class="w-full border border-gray-300 rounded-sm p-2"
                  placeholder="Password"
                  value={password()}
                  onInput={(e) => setPassword(e.currentTarget.value)}
                />
              </div>
              <For each={Object.keys(errors())}>
                {(key) => <div class="text-red-500 text-sm font-bold">{errors()[key]}</div>}
              </For>
            </div>
            <button
              type="button"
              class="border border-gray-300 rounded-sm p-2 bg-gray-100"
              disabled={changeUser.isLoading}
              onClick={async () => {
                await changeUser.mutateAsync();
              }}
            >
              Yarat
            </button>
          </div>
        </div>
        <div class="max-w-[600px] w-full flex flex-col gap-10">
          <div class="w-full flex flex-col gap-4">
            <div class="w-full flex flex-col gap-2">
              <span class="font-bold text-xl">Admin yap</span>
              <For each={users.data}>
                {(u) => (
                  <div
                    class={cn(
                      "text-sm font-bold text-neutral-500 w-full border border-neutral-300 rounded-sm p-2 flex flex-row items-center justify-between",
                      {
                        "text-blue-500": u.type === "superadmin",
                        "text-green-500": u.type === "admin",
                        "text-red-500": u.type === "viewer",
                      }
                    )}
                  >
                    <div class="flex w-full">
                      {u.name} ({u.type})
                    </div>
                    <div class="flex flex-row gap-2.5">
                      <button
                        type="button"
                        class="text-sm font-bold text-teal-500 border border-teal-500 px-2 py-1 w-max disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                          u.id === user().user?.id ||
                          u.type === "viewer" ||
                          (makeViewer.isLoading && makeViewer.variables === u.id)
                        }
                        onClick={async () => {
                          await makeViewer.mutateAsync(u.id);
                        }}
                      >
                        Viewer
                      </button>
                      <button
                        type="button"
                        class="text-sm font-bold text-red-500 border border-red-500 px-2 py-1 w-max disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                          u.id === user().user?.id ||
                          u.type === "admin" ||
                          (makeAdmin.isLoading && makeAdmin.variables === u.id) ||
                          (makeSuperAdmin.isLoading && makeSuperAdmin.variables === u.id)
                        }
                        onClick={async () => {
                          await makeAdmin.mutateAsync(u.id);
                        }}
                      >
                        Admin
                      </button>
                      <button
                        type="button"
                        class="text-sm font-bold text-red-500 border border-red-500 px-2 py-1 w-max disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                          u.id === user().user?.id ||
                          u.type === "superadmin" ||
                          (makeAdmin.isLoading && makeAdmin.variables === u.id) ||
                          (makeSuperAdmin.isLoading && makeSuperAdmin.variables === u.id)
                        }
                        onClick={async () => {
                          await makeSuperAdmin.mutateAsync(u.id);
                        }}
                      >
                        SüperAdmin
                      </button>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default SettingsPage;
