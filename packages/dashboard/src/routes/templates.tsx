import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import { useAuth } from "../components/providers/OfflineFirst";
import { Queries } from "../utils/api/queries";
import { For, Match, Switch, createSignal } from "solid-js";
import { Mutations } from "../utils/api/mutations";
import { cn } from "../utils/cn";
import { Show } from "solid-js";

export default function TemplatesPage() {
  const [user] = useAuth();
  const queryClient = useQueryClient();

  const templates = createQuery(
    () => ["templates"],
    () => {
      const token = user().token;
      if (!token) return Promise.reject("No token found. Please login first.");
      return Queries.Templates.all(token);
    },
    {
      get enabled() {
        return user().isAuthenticated;
      },
      refetchInterval: 1000 * 60,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
    }
  );

  const fileUpload = createMutation(
    async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const token = user().token;
      if (!token) return Promise.reject("No token found. Please login first.");
      const { url } = await Mutations.Templates.presignedUrl(token, file.name);
      const uploaded = await Mutations.Templates.upload(url, formData);
      if (!uploaded) return Promise.reject("Upload failed.");
      const synced = await Mutations.Templates.syncOld(token);
      return synced;
    },
    {
      async onSuccess(data) {
        await queryClient.invalidateQueries(["templates"]);
      },
    }
  );

  const syncOld = createMutation(
    async () => {
      const token = user().token;
      if (!token) return Promise.reject("No token found. Please login first.");
      return Mutations.Templates.syncOld(token);
    },
    {
      async onSuccess(data) {
        await queryClient.invalidateQueries(["templates"]);
      },
    }
  );

  const [search, setSearch] = createSignal("");

  const filteredSponsors = (ts: NonNullable<typeof templates.data>) => {
    const searchValue = search().toLowerCase();
    if (!searchValue) return ts;
    return ts.filter((template) => template.Key.toLowerCase().includes(searchValue));
  };

  const setDefault = createMutation(
    (templateId: string) => {
      const token = user().token;
      if (!token) return Promise.reject("No token found. Please login first.");
      return Mutations.Templates.setAsDefault(token, templateId);
    },
    {
      async onSuccess(data) {
        await queryClient.invalidateQueries(["templates"]);
      },
    }
  );

  const removeTemplate = createMutation(
    (templateId: string) => {
      const token = user().token;
      if (!token) return Promise.reject("No token found. Please login first.");
      return Mutations.Templates.remove(token, templateId);
    },
    {
      async onSuccess(data) {
        await queryClient.invalidateQueries(["templates"]);
      },
    }
  );

  return (
    <div class="container mx-auto py-10 flex flex-col gap-6">
      <div class="flex flex-row items-center justify-between">
        <h1 class="text-3xl font-bold">Templates</h1>
        <div class="flex flex-row gap-4">
          <input
            type="text"
            placeholder="Template Ara"
            class="border border-neutral-300 rounded-sm px-2 py-1"
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
          />
          <input
            type="file"
            id="file"
            class="hidden"
            accept=".docx"
            disabled={fileUpload.isLoading}
            onChange={async (e) => {
              const file = e.currentTarget.files?.[0];
              if (!file) return;
              await fileUpload.mutateAsync(file);
              // reset input
              e.currentTarget.value = "";
              // console.log(result);
            }}
          />
          <button
            type="button"
            class="z-50 shadow-sm fixed bottom-4 right-4 md:bottom-0 md:right-0 w-12 h-12 rounded-full bg-blue-700 text-white md:relative md:w-auto md:h-auto md:px-2 md:py-1 md:rounded-sm flex flex-row items-center justify-center gap-2.5"
            onClick={() => document.getElementById("file")?.click()}
            disabled={fileUpload.isLoading}
          >
            <Show
              when={fileUpload.isLoading}
              fallback={
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
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              }
            >
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
            </Show>
            <span class="sr-only md:not-sr-only">Yükle</span>
          </button>
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Switch
          fallback={
            <div class="col-span-full w-full flex flex-col items-center justify-center gap-4 bg-neutral-100 rounded-sm py-20 border border-neutral-200">
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
              <span class="text-xl font-bold">Hazirliyor...</span>
            </div>
          }
        >
          <Match
            when={templates.isSuccess && typeof templates.data !== "undefined" && filteredSponsors(templates.data)}
          >
            {(sps) => (
              <For
                each={sps()}
                fallback={
                  <div class="col-span-full w-full flex flex-col items-center justify-center gap-4 bg-neutral-100 rounded-sm py-20 border border-neutral-200">
                    <span class="text-md font-medium text-neutral-600 select-none">Templateler bulunamadı</span>
                  </div>
                }
              >
                {(t) => (
                  <div
                    class={cn("flex flex-col gap-2 border border-neutral-300 rounded-sm px-4 py-2", {
                      "border-teal-300": t.default,
                      "border-red-300 bg-red-50": t.deletedAt !== null,
                    })}
                  >
                    <div class="w-full flex flex-row gap-2.5 items-center justify-between">
                      <div class="w-full">
                        <span
                          class={cn("text-md font-bold", {
                            "text-teal-600": t.default,
                            "text-neutral-600": !t.default,
                            "text-red-500": t.deletedAt !== null,
                          })}
                        >
                          {t.Key.replace("templates/", "")}
                        </span>
                      </div>
                      <div class="flex flex-row gap-2.5">
                        <button
                          class="text-red-500 hover:text-red-600 border border-red-300 rounded-sm px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={removeTemplate.isLoading || t.default || t.deletedAt !== null}
                          onClick={async () => {
                            await removeTemplate.mutateAsync(t.id);
                          }}
                        >
                          <span class="font-bold">Sil</span>
                        </button>
                        <button
                          class={cn(
                            "text-neutral-500 hover:text-neutral-600 border border-neutral-300 rounded-sm px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed",
                            {
                              "bg-teal-200 border-teal-300 text-teal-600 hover:text-teal-600": t.default,
                            }
                          )}
                          disabled={
                            removeTemplate.isLoading || setDefault.isLoading || t.default || t.deletedAt !== null
                          }
                          onClick={async () => {
                            await setDefault.mutateAsync(t.id);
                          }}
                        >
                          <span class="font-bold">Standard</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </For>
            )}
          </Match>
        </Switch>
      </div>
    </div>
  );
}
