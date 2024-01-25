import { TextField } from "@kobalte/core";
import dayjs from "dayjs";
import "solid-js";
import { For, Match, Show, Switch, createSignal } from "solid-js";
import { Queries } from "../utils/queries";
import { createQuery, QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/solid-query";
import { cn } from "../utils/cn";

type SortedDirection = "asc" | "desc" | undefined;
export type View = "table" | "grid";
const sortDirectionChanges = {
  asc: "desc",
  desc: undefined,
  undefined: "asc",
} as const;

function SponsorsView(props: { API_URL: string; view: View }) {
  const sponsors = createQuery(() => ({
    queryKey: ["sponsors"],
    queryFn: () => Queries.Sponsors.all(props.API_URL),
  }));
  const [search, setSearch] = createSignal("");
  const [sortedColumn, setSortedColumn] = createSignal<string | undefined>();
  const [sortedDirection, setSortedDirection] = createSignal<SortedDirection>();
  const [view, setView] = createSignal<View>(props.view);
  const sort = (column: string | undefined, data: any[], direction: SortedDirection) => {
    if (!column) return data;
    return data.sort((a, b) => {
      const aStringify = stringify(a[column]);
      const bStringify = stringify(b[column]);
      if (aStringify < bStringify) return direction === "asc" ? -1 : 1;
      if (aStringify > bStringify) return direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const filter = (
    condition: (item: NonNullable<typeof sponsors.data>[number]) => boolean
  ): NonNullable<typeof sponsors.data> => {
    return sponsors.isSuccess ? sort(sortedColumn(), sponsors.data.filter(condition), sortedDirection()) : [];
  };

  const filtered = () => filter((item) => stringify(item).toLowerCase().includes(search()));

  const stringify = (item: unknown) => {
    if (typeof item === "string") return item;
    if (typeof item === "number") return item.toString();
    if (typeof item === "boolean") return item.toString();
    if (typeof item === "object") return JSON.stringify(item);
    return "";
  };

  const queryClient = useQueryClient();
  const toggleView = () => {
    setView((t) => (t === "table" ? "grid" : "table"));
    document.cookie = `sponsor_view=${view()}`;
  };
  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-row items-center justify-between w-full">
        <div class="w-max">
          <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Sponsors</h1>
        </div>
        <div class="w-max">
          <button
            class="flex flex-row gap-1.5 items-center p-2 cursor-pointer bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md"
            onClick={() => toggleView()}
          >
            <span class="sr-only">{view()}</span>
            <Switch>
              <Match when={view() === "table"}>
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
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <line x1="3" x2="21" y1="9" y2="9" />
                  <line x1="3" x2="21" y1="15" y2="15" />
                  <line x1="9" x2="9" y1="9" y2="21" />
                  <line x1="15" x2="15" y1="9" y2="21" />
                </svg>
              </Match>
              <Match when={view() === "grid"}>
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
                  <rect width="7" height="7" x="3" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="3" rx="1" />
                  <rect width="7" height="7" x="14" y="14" rx="1" />
                  <rect width="7" height="7" x="3" y="14" rx="1" />
                </svg>
              </Match>
            </Switch>
          </button>
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
              <Switch>
                <Match when={view() === "table"}>
                  <div class="min-w-full rounded-md border border-neutral-300 dark:border-neutral-700 overflow-clip shadow-sm">
                    <table class="min-w-full divide-y divide-neutral-500 dark:divide-neutral-700 table-fixed">
                      <thead class="bg-neutral-950 dark:bg-neutral-50">
                        <tr>
                          <For each={Object.keys(data()[0]!)}>
                            {(key) =>
                              ["id", "createdAt", "deletedAt", "updatedAt", "address"].includes(key) ? (
                                <></>
                              ) : (
                                <th class="text-left text-xs font-medium text-white dark:text-black uppercase tracking-wider border-r dark:border-black border-neutral-500 last:border-r-0">
                                  <button
                                    class="flex flex-row gap-1.5 items-center p-2 cursor-pointer w-full"
                                    onClick={() => {
                                      // @ts-ignore
                                      setSortedColumn(key as keyof T);
                                      const x = sortedDirection();
                                      if (!x) setSortedDirection(sortDirectionChanges["undefined"]);
                                      setSortedDirection(sortDirectionChanges[x!]);
                                    }}
                                  >
                                    <span class="uppercase">{key}</span>
                                    <div class="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-neutral-500 dark:focus:ring-neutral-400">
                                      {sortedColumn() === key ? (
                                        sortedDirection() === "asc" ? (
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
                                            <path d="m3 8 4-4 4 4" />
                                            <path d="M7 4v16" />
                                            <path d="M20 8h-5" />
                                            <path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10" />
                                            <path d="M15 14h5l-5 6h5" />
                                          </svg>
                                        ) : (
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
                                            <path d="m3 16 4 4 4-4" />
                                            <path d="M7 20V4" />
                                            <path d="M20 8h-5" />
                                            <path d="M15 10V6.5a2.5 2.5 0 0 1 5 0V10" />
                                            <path d="M15 14h5l-5 6h5" />
                                          </svg>
                                        )
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                  </button>
                                </th>
                              )
                            }
                          </For>
                          <th class="flex text-xs font-medium text-white dark:text-black uppercase border-r border-black last:border-r-0 items-center justify-end">
                            <span class="flex text-right p-2">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-neutral-300 dark:bg-black dark:divide-neutral-700">
                        <For each={filtered()}>
                          {(item) => (
                            <tr class="hover:bg-neutral-50 dark:hover:bg-neutral-900">
                              <td class="p-2 whitespace-nowrap border-r border-neutral-300 dark:border-neutral-800 last:border-r-0">
                                {item.name}
                              </td>
                              <td class="p-2 whitespace-nowrap border-r border-neutral-300 dark:border-neutral-800 last:border-r-0">
                                {item.donations.map((p) => (
                                  <div class="flex flex-row items-center justify-center gap-0.5 text-sm font-mono bg-transparent border border-neutral-500 rounded-md px-2 py-1 w-max">
                                    {dayjs(p.createdAt).format("YYYY")}: {p.amount} {p.currency}
                                  </div>
                                ))}
                              </td>
                              <td class="p-2 whitespace-nowrap border-r border-neutral-100 dark:border-neutral-800 last:border-r-0 flex flex-row gap-2 items-center justify-end">
                                <button class="flex flex-row gap-1.5 items-center p-2 cursor-pointer bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md">
                                  <span class="sr-only">Edit</span>
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
                                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                    <path d="m15 5 4 4" />
                                  </svg>
                                </button>
                                <button class="flex flex-row gap-1.5 items-center p-2 cursor-pointer text-rose-500 hover:text-rose-700 rounded-md bg-transparent hover:bg-rose-100 dark:hover:bg-rose-900 dark:text-rose-400 dark:hover:text-rose-200">
                                  <span class="sr-only">Delete</span>
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
                                </button>
                                <button
                                  class="flex flex-row gap-1.5 items-center p-2 cursor-pointer text-neutral-500 hover:text-neutral-700 rounded-md bg-transparent hover:bg-neutral-300 dark:hover:bg-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                                  onClick={() => {
                                    console.log(item);
                                  }}
                                >
                                  <span class="sr-only">PDF</span>
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
                                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          )}
                        </For>
                      </tbody>
                    </table>
                  </div>
                </Match>
                <Match when={view() === "grid"}>
                  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    <For each={filtered()}>
                      {(item) => (
                        <div class="flex flex-col gap-4 rounded-md border border-neutral-300 dark:border-neutral-700 overflow-clip shadow-sm p-4 bg-white dark:bg-black">
                          <div class="flex flex-col gap-2">
                            <div class="flex flex-row items-center justify-between">
                              <span class="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                                {item.name}
                              </span>
                              <button class="flex flex-row gap-1.5 items-center p-2 cursor-pointer bg-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-md">
                                <span class="sr-only">Edit</span>
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
                                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                                  <path d="m15 5 4 4" />
                                </svg>
                              </button>
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
                          <div class="flex flex-row gap-2 items-center justify-end">
                            <button class="flex flex-row gap-1.5 items-center p-2 cursor-pointer text-rose-500 hover:text-rose-700 rounded-md bg-transparent hover:bg-rose-100 dark:hover:bg-rose-900 dark:text-rose-400 dark:hover:text-rose-200">
                              <span class="sr-only">Delete</span>
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
                            </button>
                            <button
                              class="flex flex-row gap-1.5 items-center p-2 cursor-pointer text-neutral-500 hover:text-neutral-700 rounded-md bg-transparent hover:bg-neutral-300 dark:hover:bg-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                              onClick={() => {
                                console.log(item);
                              }}
                            >
                              <span class="sr-only">PDF</span>
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
                                <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                                <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}
                    </For>
                  </div>
                </Match>
              </Switch>
            </div>
          )}
        </Match>
      </Switch>
    </div>
  );
}

export function SponsorsWrapper(props: { API_URL: string; view: View }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <SponsorsView API_URL={props.API_URL} view={props.view} />
    </QueryClientProvider>
  );
}
