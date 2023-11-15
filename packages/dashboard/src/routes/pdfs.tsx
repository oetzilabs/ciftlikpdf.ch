import { Select, DropdownMenu } from "@kobalte/core";
import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import dayjs from "dayjs";
import { For, JSX, Match, Show, Switch, createSignal } from "solid-js";
import { useAuth } from "../components/providers/OfflineFirst";
import { Mutations } from "../utils/api/mutations";
import { Queries } from "../utils/api/queries";
import { cn } from "../utils/cn";

export default function PdfsPage() {
  const [user] = useAuth();
  const queryClient = useQueryClient();

  const pdfs = createQuery(
    () => ["pdfs"],
    () => {
      const token = user().token;
      if (!token) return Promise.reject("No token found. Please login first.");
      return Queries.PDFs.all(token);
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

  const [search, setSearch] = createSignal("");

  const filteredPdfs = (s: NonNullable<typeof pdfs.data>) => {
    const searchValue = search().toLowerCase();
    if (!searchValue) return s;
    return s.filter((pdf) => pdf.s3Key?.toLowerCase().includes(searchValue));
  };

  const downloadPDF = createMutation(
    (id: string) => {
      const token = user().token;
      if (!token) return Promise.reject("No token found. Please login first.");
      return Mutations.PDFs.downloadUrl(token, id);
    },
    {
      async onSuccess(data) {
        const a = document.createElement("a");
        a.href = data.url;
        a.download = data.fileName;
        a.click();
        a.remove();
      },
    }
  );

  const removeById = createMutation(
    (id: string) => {
      const token = user().token;
      if (!token) return Promise.reject("No token found. Please login first.");
      return Mutations.PDFs.remove(token, id);
    },
    {
      async onSuccess(data) {
        await queryClient.invalidateQueries(["pdfs"]);
      },
    }
  );

  const removeByKey = createMutation(
    (id: string) => {
      const token = user().token;
      if (!token) return Promise.reject("No token found. Please login first.");
      return Mutations.PDFs.removeByKey(token, id);
    },
    {
      async onSuccess(data) {
        await queryClient.invalidateQueries(["pdfs"]);
      },
    }
  );
  const itemClass =
    "flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium items-center justify-start select-none min-w-[150px]";

  return (
    <div class="container mx-auto py-10 flex flex-col gap-6">
      <div class="flex flex-row items-center justify-between">
        <h1 class="text-3xl font-bold">PDFs</h1>
        <div class="flex flex-row gap-4">
          <input
            type="text"
            placeholder="PDF Ara"
            class="border border-neutral-300 rounded-sm px-2 py-1"
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
          />
        </div>
      </div>
      <div class="flex flex-col gap-4">
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
          <Match when={pdfs.isSuccess && typeof pdfs.data !== "undefined" && filteredPdfs(pdfs.data)}>
            {(sps) => (
              <For
                each={sps()}
                fallback={
                  <div class="col-span-full w-full flex flex-col items-center justify-center gap-4 bg-neutral-100 rounded-sm py-20 border border-neutral-200">
                    <span class="text-md font-medium text-neutral-600 select-none">PDFler bulunamadı</span>
                  </div>
                }
              >
                {(pdf) => (
                  <div class="flex flex-col gap-2 border border-neutral-300 rounded-sm p-4">
                    <div class="w-full flex flex-col gap-2.5">
                      <div class="flex flex-row items-center justify-between">
                        <div class="w-max">
                          <span class="text-lg font-bold">Sponsor Isim: {pdf.sponsor?.name}</span>
                        </div>
                        <div class="flex flex-row gap-2.5">
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger>
                              <div class="flex w-max flex-row items-center gap-1 bg-neutral-200 p-2 rounded-sm">
                                <div class="flex items-center text-sm gap-2.5 cursor-pointer">
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
                                    <line x1="4" x2="20" y1="12" y2="12" />
                                    <line x1="4" x2="20" y1="6" y2="6" />
                                    <line x1="4" x2="20" y1="18" y2="18" />
                                  </svg>
                                </div>
                              </div>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content class="z-50 self-end mt-3 w-fit bg-white dark:bg-black rounded-sm border border-neutral-200 dark:border-neutral-800 shadow-md overflow-clip">
                                <DropdownMenu.Group>
                                  <DropdownMenu.Item
                                    class={cn(
                                      itemClass,
                                      "select-none text-red-500 hover:bg-red-50 active:bg-red-100 dark:hover:bg-red-950 dark:active:bg-red-900 dark:hover:text-white dark:active:text-white"
                                    )}
                                    onSelect={async () => {
                                      await removeById.mutateAsync(pdf.id);
                                    }}
                                  >
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
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                      <line x1="10" x2="10" y1="11" y2="17" />
                                      <line x1="14" x2="14" y1="11" y2="17" />
                                    </svg>
                                    <span>Sil</span>
                                  </DropdownMenu.Item>
                                  <DropdownMenu.Item
                                    class={cn(
                                      itemClass,
                                      "select-none text-red-500 hover:bg-red-50 active:bg-red-100 dark:hover:bg-red-950 dark:active:bg-red-900 dark:hover:text-white dark:active:text-white"
                                    )}
                                    onSelect={async () => {
                                      const key = pdf.s3Key;
                                      if (!key) return;
                                      await removeByKey.mutateAsync(key);
                                    }}
                                  >
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
                                      <path d="M3 6h18" />
                                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                      <line x1="10" x2="10" y1="11" y2="17" />
                                      <line x1="14" x2="14" y1="11" y2="17" />
                                    </svg>
                                    <span>Sil (Key)</span>
                                  </DropdownMenu.Item>
                                </DropdownMenu.Group>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </div>
                      </div>
                      <span class="text-md font-bold">Sene: {pdf.year}</span>
                      <span class="text-md font-medium">Elistiren: {pdf.createdBy?.name}</span>
                      <button
                        class="border border-neutral-300 rounded-sm p-2 bg-neutral-100"
                        onClick={async () => await downloadPDF.mutateAsync(pdf.id)}
                      >
                        PDF Indir
                      </button>
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
