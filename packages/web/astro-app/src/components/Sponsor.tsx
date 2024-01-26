import {} from "@kobalte/core";
import {QueryClient, QueryClientProvider, createQuery} from "@tanstack/solid-query";
import { Queries } from "../utils/queries";
import { Match, Switch } from "solid-js";

export function SponsorWrapper(props: { id: string, API_URL: string}) { 
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <Sponsor id={props.id} API_URL={props.API_URL} />
    </QueryClientProvider>
  );
}

function Sponsor(props: { id: string, API_URL: string}) {
  const sponsor = createQuery(() =>({
    queryKey: ["sponsor"],
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
        <div class="flex flex-row gap-4">
          <div class="flex flex-col gap-4">
            <div class="flex flex-row gap-4">
              <div class="flex flex-col gap-4">
                <div class="text-2xl font-bold">{props.data.name}</div>
                <div class="text-xl">{props.data.address}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
