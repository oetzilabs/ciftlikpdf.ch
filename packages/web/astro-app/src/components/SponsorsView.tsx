import { TextField } from "@kobalte/core";
import "solid-js";
import { For, Match, Switch, createSignal } from "solid-js";
import { Queries } from "../utils/queries";
import { createQuery } from "@tanstack/solid-query";
import { API_URL, qC } from "../utils/stores";
import { SelectSponsor } from "../components/SelectSponsor";

export function SponsorsView() {
  const sponsors = createQuery(() => ({
    queryKey: ["sponsors"],
    queryFn: () => Queries.Sponsors.all(API_URL.get()),
  }), () => qC);

  const [search, setSearch] = createSignal("");

  const filtered = (data: NonNullable<typeof sponsors.data>) => data.filter((item) => stringify(item).toLowerCase().includes(search()));

  const stringify = (item: unknown) => {
    if (typeof item === "string") return item;
    if (typeof item === "number") return item.toString();
    if (typeof item === "boolean") return item.toString();
    if (typeof item === "object") return JSON.stringify(item);
    return "";
  };

  return (
    <div class="w-full">
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
              <div class="grid grid-cols-2 gap-4 py-2">
                <For each={filtered(data())}>
                  {(item) => (<SelectSponsor sponsor={item} />)}
                </For>
              </div>
            </div>
          )}
        </Match>
      </Switch>
    </div>
  );
}
