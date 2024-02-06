import { TextField } from "@kobalte/core";
import { For, Match, Switch, createSignal } from "solid-js";
import { Queries } from "../utils/queries";
import { QueryClientProvider, createQuery, useQueryClient } from "@tanstack/solid-query";
import { qC } from "../utils/stores";
import { SelectSponsor } from "../components/SelectSponsor";
import { cn } from "../utils/cn";

export function SponsorsView(props: {
  initial: Awaited<ReturnType<typeof Queries.Sponsors.all>>;
  API_URL: string;
  refetchInterval?: number;
}) {
  return (
    <QueryClientProvider client={qC}>
      <Sponsors initial={props.initial} API_URL={props.API_URL} refetchInterval={props.refetchInterval} />
    </QueryClientProvider>
  );
}

export function Sponsors(props: {
  initial: Awaited<ReturnType<typeof Queries.Sponsors.all>>;
  API_URL: string;
  refetchInterval?: number;
}) {
  const qC = useQueryClient();

  const sponsors = createQuery(() => ({
    queryKey: ["sponsors"],
    queryFn: () => Queries.Sponsors.all(props.API_URL),
    initialData: props.initial,
    refetchInterval: props.refetchInterval ?? 20000,
  }));

  const [search, setSearch] = createSignal("");

  const filtered = (data: NonNullable<typeof sponsors.data>) =>
    data.filter((item) => stringify(item).toLowerCase().includes(search()));

  const stringify = (item: unknown) => {
    if (typeof item === "string") return item;
    if (typeof item === "number") return item.toString();
    if (typeof item === "boolean") return item.toString();
    if (typeof item === "object") return JSON.stringify(item);
    return "";
  };

  return (
    <div class="w-full">
      <div class="w-full flex flex-row items-center justify-between gap-2">
        <TextField.Root
          class="w-full border border-neutral-300 dark:border-neutral-700 rounded-full overflow-clip flex flex-row items-center bg-white dark:bg-black"
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
            placeholder="Ara..."
          />
        </TextField.Root>
        <button
          class="shadow-sm w-max border border-neutral-300 dark:border-neutral-700 rounded-full overflow-clip flex flex-row items-center bg-black dark:bg-white text-white dark:text-black p-2.5 text-xl"
          onClick={async () => {
            await qC.invalidateQueries({ queryKey: ["sponsors"] });
            await sponsors.refetch();
          }}
        >
          <span class="sr-only">Refresh</span>
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
              "animate-spin": sponsors.isPending,
            })}
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </button>
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
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                <For each={filtered(data())}>{(item) => <SelectSponsor sponsor={item} API_URL={props.API_URL} />}</For>
              </div>
            </div>
          )}
        </Match>
      </Switch>
    </div>
  );
}
