import { QueryClientProvider, createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { For, Show, createSignal } from "solid-js";
import { cn } from "../utils/cn";
import { Mutations } from "../utils/mutations";
import { Queries } from "../utils/queries";
import { qC } from "../utils/stores";

export default function Settings(props: {
  searchParams: URLSearchParams;
  username: string;
  sessionId: string;
  session: string;
  API_URL: string;
}) {
  return (
    <QueryClientProvider client={qC}>
      <SettingsPage {...props} />
    </QueryClientProvider>
  );
}

const SettingsPage = (props: {
  searchParams: URLSearchParams;
  username: string;
  sessionId: string;
  session: string;
  API_URL: string;
}) => {
  const queryClient = useQueryClient();

  const [oldPassword, setOldPassword] = createSignal("");
  const [newPassword, setNewPassword] = createSignal("");

  const changePassword = createMutation(() => ({
    mutationKey: ["change-password"],
    mutationFn: async () => {
      const data = {
        id: props.sessionId,
        newPassword: newPassword(),
        oldPassword: oldPassword(),
      };
      return fetch(`${import.meta.env.VITE_API_URL}/change-password`, {
        method: "POST",
        body: new URLSearchParams(data),
        headers: {
          authorization: `Bearer ${props.session}`,
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
    async onSuccess(data) {
      if (!data.jwtToken) return;
      document.cookie = `session=${data.jwtToken}; path=/; expires=${new Date(
        Date.now() + 1000 * 60 * 60 * 24 * 7, // 7 days
      ).toUTCString()}`;
      window.location.reload();
    },
  }));

  const makeAdmin = createMutation(() => ({
    mutationKey: ["make-admin"],
    mutationFn: async (id: string) => {
      return Mutations.Superadmins.makeAdmin(props.API_URL, id);
    },
    async onSuccess(data) {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  }));

  const makeViewer = createMutation(() => ({
    mutationKey: ["make-viewer"],
    mutationFn: async (id: string) => {
      return Mutations.Superadmins.makeViewer(props.API_URL, id);
    },
    async onSuccess(data) {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  }));

  const makeSuperAdmin = createMutation(() => ({
    mutationKey: ["make-superadmin"],
    mutationFn: async (id: string) => {
      return Mutations.Superadmins.makeSuperAdmin(props.API_URL, id);
    },
    async onSuccess(data) {
      await queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  }));

  const [name, setName] = createSignal("");
  const [password, setPassword] = createSignal("");

  const changeUser = createMutation(() => ({
    mutationKey: ["change-user"],
    mutationFn: async () => {
      const data = {
        id: props.sessionId,
        name: name(),
        password: password(),
      };
      return Mutations.Superadmins.updateUser(props.API_URL, data);
    },
  }));

  const users = createQuery(() => ({
    queryKey: ["users"],
    queryFn: async () => {
      return Queries.Superadmins.users(props.API_URL);
    },
    refetchInterval: 1000 * 5,
    refetchIntervalInBackground: true,
    refetchOnWindowFocus: false,
  }));

  return (
    <div class="container mx-auto flex flex-col py-10 gap-10">
      <div class="flex w-full flex-col gap-2 items-start">
        <span class="font-bold text-3xl">Ayarlar ({props.username})</span>
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
          </div>
          <button
            type="button"
            class="border border-gray-300 rounded-sm p-2 bg-gray-100"
            disabled={changePassword.isPending}
            onClick={async () => {
              changePassword.mutateAsync();
            }}
          >
            Deyistir
          </button>
        </div>
      </div>
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
          </div>
          <button
            type="button"
            class="border border-gray-300 rounded-sm p-2 bg-gray-100"
            disabled={changeUser.isPending}
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
            <Show when={users.isSuccess && typeof users.data !== "undefined" && users.data}>
              {(u) => (
                <For each={u()}>
                  {(u) => (
                    <div
                      class={cn(
                        "text-sm font-bold text-neutral-500 w-full border border-neutral-300 rounded-sm p-2 flex flex-row items-center justify-between",
                        {
                          "text-blue-500": u.type === "superadmin",
                          "text-green-500": u.type === "admin",
                          "text-red-500": u.type === "viewer",
                        },
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
                            u.id === props.sessionId ||
                            u.type === "viewer" ||
                            (makeViewer.isPending && makeViewer.variables === u.id)
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
                            u.id === props.sessionId ||
                            u.type === "admin" ||
                            (makeAdmin.isPending && makeAdmin.variables === u.id) ||
                            (makeSuperAdmin.isPending && makeSuperAdmin.variables === u.id)
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
                            u.id === props.sessionId ||
                            u.type === "superadmin" ||
                            (makeAdmin.isPending && makeAdmin.variables === u.id) ||
                            (makeSuperAdmin.isPending && makeSuperAdmin.variables === u.id)
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
              )}
            </Show>
          </div>
        </div>
      </div>
    </div>
  );
};
