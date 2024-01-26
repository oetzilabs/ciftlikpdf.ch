import { } from "@kobalte/core";
import { QueryClient, QueryClientProvider, createQuery } from "@tanstack/solid-query";
import { Queries } from "../utils/queries";
import { For, Match, Switch } from "solid-js";

export function SponsorWrapper(props: { id: string, API_URL: string }) {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Sponsor id={props.id} API_URL={props.API_URL} />
    </QueryClientProvider>
  );
}

function Sponsor(props: { id: string, API_URL: string }) {
  const sponsor = createQuery(() => ({
    queryKey: ["sponsor", props.id],
    queryFn: () => Queries.Sponsors.get(props.API_URL, props.id),
  }));

  return (
    <div class="w-full flex flex-col gap-4">
      <Switch fallback={<div>Loading...</div>}>
        <Match when={sponsor.isLoading}>Loading...</Match>
        <Match when={sponsor.isError && sponsor.error}>{(e) => <div class="">{e().message}</div>}</Match>
        <Match when={sponsor.isSuccess && sponsor.data && sponsor.data}>{(data) => <SponsorView data={data()} />}</Match>
      </Switch>
    </div>
  );
}

function SponsorView(props: { data: NonNullable<Awaited<ReturnType<typeof Queries.Sponsors.get>>> }) {
  return (
    <div class="w-full flex flex-col gap-4">
      <div class="flex flex-col gap-4">
        <div class="text-2xl font-bold">{props.data.name}</div>
        <div class="flex flex-col gap-0.5">
          <For each={props.data.address.split("\n")}>{(a) => <div class="text-xl">{a}</div>}</For>
        </div>
      </div>
      <div class="flex flex-row gap-4">
        <div class="w-full">
          <For each={props.data.donations}>
            {(donation) => (<div class="flex flex-row gap-4 border border-neutral-300 p-4 dark:border-neutral-800 rounded-md bg-white dark:bg-black shadow-sm w-max">
              <div class="text-xl">{donation.year}: {donation.amount} {donation.currency}</div>
            </div>
            )}
          </For>
        </div>
      </div>
    </div>
  );
}
