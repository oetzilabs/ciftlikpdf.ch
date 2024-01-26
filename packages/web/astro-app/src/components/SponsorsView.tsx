import { DropdownMenu, TextField } from "@kobalte/core";
import dayjs from "dayjs";
import "solid-js";
import { For, Match, Show, Switch, createSignal } from "solid-js";
import { Queries } from "../utils/queries";
import { createQuery, QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/solid-query";
import { cn } from "../utils/cn";

function SponsorsView(props: { API_URL: string; }) {
  const sponsors = createQuery(() => ({
    queryKey: ["sponsors"],
    queryFn: () => Queries.Sponsors.all(props.API_URL),
  }));
  const [search, setSearch] = createSignal("");


  const filtered = (data: NonNullable<typeof sponsors.data>) => data.filter((item) => stringify(item).toLowerCase().includes(search()));

  const stringify = (item: unknown) => {
    if (typeof item === "string") return item;
    if (typeof item === "number") return item.toString();
    if (typeof item === "boolean") return item.toString();
    if (typeof item === "object") return JSON.stringify(item);
    return "";
  };

  const queryClient = useQueryClient();

  const itemClass =
    "flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium items-center justify-start select-none min-w-[150px]";


  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-row items-center justify-between w-full">
        <div class="w-max">
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Sponsors</h1>
        </div>
        <div class="w-max">
        </div>
      </div>
      <Switch>
        <Match when={sponsors.isLoading}>
          <div class="flex flex-col items-center justify-center">
            <h1 class="text-2xl font-semibold">Loading...</h1>
          </div>
        </Match>
        <Match when={sponsors.isSuccess && sponsors.data.length < 1}>
          <div class="flex flex-col items-center justify-center">
            <h1 class="text-2xl font-semibold">No data to display</h1>
            <p class="text-lg text-neutral-500 dark:text-neutral-400">Please add some data to display it here.</p>
          </div>
        </Match>
        <Match when={sponsors.isSuccess && sponsors.data.length >= 1 && sponsors.data}>
          {(data) => (
            <div class="flex flex-col gap-4">
              <div class="flex flex-row items-center justify-between gap-4">
                <TextField.Root
                  class="w-full border border-neutral-300 dark:border-neutral-700 rounded-md overflow-clip flex flex-row items-center bg-white dark:bg-black"
                  value={search()}
                  onChange={(value) => setSearch(value)}
                >
                  <TextField.Label class="ml-3" for="search">
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
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </TextField.Label>
                  <TextField.Input
                    id="search"
                    class="w-full px-3 py-2 bg-transparent text-sm outline-none"
                    placeholder="Search"
                  />
                </TextField.Root>
                <button
                  onClick={async () => {
                    await queryClient.invalidateQueries({
                      queryKey: ["sponsors"],
                    });
                  }}
                  class="flex flex-row gap-1.5 items-center cursor-pointer bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-neutral-900 dark:hover:bg-neutral-100 hover:text-white dark:hover:text-black p-2.5"
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
                    class={cn({
                      "animate-spin": sponsors.isFetching,
                    })}
                  >
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                  </svg>
                </button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <For each={filtered(data())}>
                  {(item) => (
                    <div class="flex flex-col gap-4 rounded-md border border-neutral-300 dark:border-neutral-700 overflow-clip shadow-sm p-4 bg-white dark:bg-black">
                      <div class="flex flex-col gap-2">
                        <div class="flex flex-row items-center justify-between">
                          <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {item.name}
                          </span>
                          <DropdownMenu.Root>
                            <DropdownMenu.Trigger class="flex flex-row gap-1.5 items-center p-1 cursor-pointer text-neutral-500 hover:text-neutral-700 rounded-md bg-transparent hover:bg-neutral-300 dark:hover:bg-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200">
                              <svg xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round">
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="19" cy="12" r="1" />
                                <circle cx="5" cy="12" r="1" />
                              </svg>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content class="z-50 self-end mt-1 w-fit bg-white dark:bg-black rounded-md border border-neutral-200 dark:border-neutral-800 shadow-sm overflow-clip">
                                <DropdownMenu.Item
                                  onSelect={() => { }}
                                  class={cn(
                                    itemClass,
                                    "select-none text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 active:bg-neutral-100 dark:hover:bg-neutral-950 dark:active:bg-neutral-900 dark:hover:text-white dark:active:text-white"
                                  )}

                                >
                                  <span class="flex flex-row items-center gap-1.5 px-2">Edit</span>
                                </DropdownMenu.Item>
                                <DropdownMenu.Item
                                  onSelect={() => { }}
                                  class={cn(
                                    itemClass,
                                    "select-none text-neutral-900 dark:text-neutral-100 hover:bg-neutral-50 active:bg-neutral-100 dark:hover:bg-neutral-950 dark:active:bg-neutral-900 dark:hover:text-white dark:active:text-white"
                                  )}

                                >
                                  <span class="flex flex-row items-center gap-1.5 px-2">PDF</span>
                                </DropdownMenu.Item>
                                <DropdownMenu.Separator class="border-neutral-200 dark:border-neutral-800" />
                                <DropdownMenu.Item
                                  onSelect={() => { }}
                                  class={cn(
                                    itemClass,
                                    "select-none text-red-500 hover:bg-red-50 active:bg-red-100 dark:hover:bg-red-950 dark:active:bg-red-900 dark:hover:text-white dark:active:text-white"
                                  )}

                                >
                                  <span class="flex flex-row items-center gap-1.5 px-2">Delete</span>
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </div>
                        <div class="flex flex-row gap-2 min-h-full">
                          <span class="text-xs text-neutral-500 dark:text-neutral-400">
                            {item.donations.map((p) => (
                              <div class="flex flex-row items-center justify-center gap-0.5 text-xs font-mono bg-transparent border border-neutral-500 rounded-md px-2 py-1 w-max">
                                {dayjs(p.createdAt).format("YYYY")}: {p.amount} {p.currency}
                              </div>
                            ))}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </div>
          )}
        </Match>
      </Switch>
    </div>
  );
}

export function SponsorsWrapper(props: { API_URL: string; }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <SponsorsView API_URL={props.API_URL} />
    </QueryClientProvider>
  );
}
