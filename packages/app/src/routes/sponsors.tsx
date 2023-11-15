import { A } from "@solidjs/router";
import Logo from "../components/Logo";
import { Select } from "@kobalte/core";
import { For, Match, Show, Switch, createSignal } from "solid-js";
import { cn } from "../utils/cn";
import { createMutation, createQuery } from "@tanstack/solid-query";
import { Queries } from "../utils/api/queries";
import { debounce } from "@solid-primitives/scheduled";
import { Mutations } from "../utils/api/mutations";

export default function Home() {
  const [search, setSearch] = createSignal("");

  const donationPDFs = createQuery(
    () => ["donationPDFs", search()],
    () => {
      const se = search();
      if (se.length < 2) return [];
      return Queries.PDFs.Search.sponsors(se);
    },
    {
      refetchInterval: 1000 * 60,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
      get enabled() {
        return search().length >= 3;
      },
    }
  );

  const downloadPDF = createMutation(
    (id: string) => {
      return Mutations.PDFs.downloadUrl(id);
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
  const changeSearch = debounce(setSearch, 500);

  return (
    <div class="flex container mx-auto flex-col gap-10 py-10">
      <div class="flex flex-col gap-8">
        <div class="flex flex-row items-center justify-center py-4">
          <Logo />
        </div>
        <div class="flex flex-col gap-4 items-center justify-center">
          <span class="text-2xl font-medium">
            Bu site, Çiftlik Vakıf'ın PDFleri yayınlamak için kullandığı bir araçtır.
          </span>
          <span class="text-lg font-medium select-none">
            Çiftlik Vakıf'ın sitesine{" "}
            <A class="text-blue-500 hover:underline" href="https://ciftlik.ch">
              buradan
            </A>{" "}
            ulaşabilirsiniz.
          </span>
        </div>
      </div>
      <div class="max-w-[600px] w-full mx-auto flex flex-col gap-10 py-10">
        <div class="flex flex-row items-center justify-between">
          <div class="w-max">
            <span class="text-2xl font-medium">Sponsorların PDFleri</span>
          </div>
        </div>
        <div class="relative w-full flex flex-row items-center">
          <input
            type="text"
            class="w-full py-3 px-6 border-2 border-neutral-300 rounded-full bg-neutral-50 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ara..."
            autofocus
            onChange={(e) => changeSearch(e.currentTarget.value)}
            value={search()}
          />
          <div class="absolute top-[50%] -translate-y-[50%] right-6 text-neutral-400">
            <Show when={search().length > 0 && donationPDFs.isFetching && donationPDFs.isLoading}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
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
          </div>
        </div>
      </div>
      <div class="max-w-[600px] w-full mx-auto flex flex-col gap-10">
        <Switch
          fallback={
            <Show
              when={search().length > 2 && donationPDFs.isFetching && donationPDFs.isLoading}
              fallback={
                <div class="p-10 w-full flex items-center justify-center">
                  <span class="text-2xl font-medium">Arama kriterlerinizi seçin.</span>
                </div>
              }
            >
              <div class="p-10 w-full flex items-center justify-center">
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
              </div>
            </Show>
          }
        >
          <Match
            when={
              search().length >= 3 &&
              donationPDFs.isFetched &&
              donationPDFs.isSuccess &&
              donationPDFs.data !== undefined &&
              donationPDFs.data.length > 0 &&
              donationPDFs.data
            }
          >
            {(ps) => (
              <For
                each={ps()}
                fallback={
                  <div class="flex flex-col gap-2.5 items-center justify-center p-4">
                    <span class="text-2xl font-medium">Sonuç bulunamadı.</span>
                    <span class="text-lg font-medium">Arama kriterlerinizi değiştirin.</span>
                  </div>
                }
              >
                {(donation) => (
                  <div class="relative p-4 flex flex-col gap-4 rounded-md shadow-md overflow-clip">
                    <div class="-z-10 absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-br from-rose-100 to-teal-100">
                      <div class="absolute top-[50%] -translate-y-[50%] right-8 opacity-50">
                        <Logo small w={50} />
                      </div>
                      <div class="absolute leading-none top-[50%] -translate-y-[50%] right-10 opacity-[0.03] text-9xl font-black">
                        {donation.year}
                      </div>
                    </div>
                    <div class="flex flex-row gap-1 select-none">
                      <span class="text-lg font-bold">Sponsor:</span>
                      <span class="text-lg font-medium">{donation.sponsor.name}</span>
                    </div>
                    <div class="flex flex-col gap-1 select-none">
                      <span class="text-lg font-medium">
                        {new Intl.NumberFormat("de-CH", {
                          style: "currency",
                          currency: donation.currency,
                        }).format(donation.amount)}
                      </span>
                    </div>
                    <div class="flex flex-row gap-4">
                      <button
                        class="px-2 py-1 bg-black text-white rounded-md active:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex flex-row gap-2.5 items-center justify-center"
                        onClick={async () => {
                          await downloadPDF.mutateAsync(donation.id);
                        }}
                      >
                        <Show
                          when={downloadPDF.isLoading}
                          fallback={
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
                              class="lucide lucide-file-down"
                            >
                              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                              <polyline points="14 2 14 8 20 8" />
                              <path d="M12 18v-6" />
                              <path d="m9 15 3 3 3-3" />
                            </svg>
                          }
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
                            class="animate-spin"
                          >
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                          </svg>
                        </Show>
                        <Switch>
                          <Match when={downloadPDF.isSuccess || downloadPDF.isIdle}>
                            <span>İndir</span>
                          </Match>
                          <Match when={downloadPDF.isError}>
                            <span>Hata</span>
                          </Match>
                          <Match when={downloadPDF.isLoading}>
                            <span>İndiriliyor...</span>
                          </Match>
                        </Switch>
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
