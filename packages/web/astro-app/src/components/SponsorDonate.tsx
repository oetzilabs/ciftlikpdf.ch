import { createMutation } from "@tanstack/solid-query";
import { Mutations } from "../utils/mutations";
import { For, Match, Switch, createSignal } from "solid-js";
import { TextField } from "@kobalte/core";
import { qC } from "../utils/stores";
import dayjs from "dayjs";
import { cn } from "../utils/cn";
import { Loader2 } from "lucide-solid";

export default function SponsorDonate(props: {
  id: string;
  API_URL: string;
  alreadyDonated: {
    year: number;
    amount: number;
    currency: string;
  }[];
}) {
  const donate = createMutation(
    () => ({
      mutationFn: (data: Parameters<typeof Mutations.Donations.create>[2]) => {
        return Mutations.Donations.create(props.API_URL, props.id, data);
      },
      mutationKey: ["donate", props.id],
      onSuccess: async () => {
        await qC.invalidateQueries({
          queryKey: ["sponsors"],
        });
        window.location.href = `/sponsors`;
      },
    }),
    () => qC,
  );

  const [newDonation, setNewDonation] = createSignal<Parameters<typeof Mutations.Donations.create>[2]>({
    amount: 0,
    currency: "CHF",
    year: new Date().getFullYear(),
  });

  return (
    <div class="flex flex-col gap-4">
      <TextField.Root
        class="w-full border border-neutral-300 dark:border-neutral-700 rounded-md overflow-clip flex flex-row items-center bg-white dark:bg-black"
        value={newDonation().amount.toString()}
        onChange={(value) => setNewDonation((nd) => ({ ...nd, amount: +value }))}
      >
        <TextField.Input
          id="amount"
          type="number"
          class="w-full px-3 py-2 bg-transparent outline-none text-3xl font-bold"
          placeholder="Miktar"
        />
      </TextField.Root>
      <div class="flex flex-col gap-4">
        <div class="flex flex-row gap-4">
          <For each={["CHF", "EUR"] as ReturnType<typeof newDonation>["currency"][]}>
            {(currency) => (
              <button
                class={cn(
                  "w-full border border-neutral-300 dark:border-neutral-700 rounded-md overflow-clip flex flex-row items-center bg-white dark:bg-black p-4 text-xl",
                  {
                    "bg-black dark:bg-white text-white dark:text-black": newDonation().currency === currency,
                  },
                )}
                onClick={() => setNewDonation((nd) => ({ ...nd, currency }))}
              >
                {currency}
              </button>
            )}
          </For>
        </div>
        <div class="flex flex-row gap-4">
          <For
            each={Array.from(
              new Set(
                Array.from({ length: 5 })
                  .map((_, i) => dayjs().subtract(i, "year").year())
                  .concat(Array.from({ length: 5 }).map((_, i) => dayjs().add(i, "year").year())),
              ),
            ).sort()}
          >
            {(year) => (
              <button
                disabled={props.alreadyDonated.some((d) => d.year === year)}
                class={cn(
                  "w-full border border-neutral-300 dark:border-neutral-700 rounded-md overflow-clip flex flex-col items-center bg-white dark:bg-black p-4 text-xl justify-center disabled:opacity-50 disabled:cursor-not-allowed",
                  {
                    "bg-black dark:bg-white text-white dark:text-black": newDonation().year === year,
                  },
                )}
                onClick={() => setNewDonation((nd) => ({ ...nd, year }))}
              >
                <span>{year}</span>
                <span>
                  {props.alreadyDonated.some((d) => d.year === year) &&
                    `${props.alreadyDonated.find((d) => d.year === year)?.amount} ${props.alreadyDonated.find((d) => d.year === year)?.currency}`}
                </span>
              </button>
            )}
          </For>
        </div>
      </div>
      <button
        type="button"
        class="bg-black dark:bg-white text-white dark:text-black rounded-md px-5 py-2.5 shadow-md flex flex-row items-center gap-2 justify-center"
        onClick={async () => {
          await donate.mutateAsync(newDonation());
        }}
      >
        <Switch>
          <Match when={donate.isIdle || donate.isError}>Ekle</Match>
          <Match when={donate.isPending}>
            <span>Ekleniyor...</span>
            <Loader2 class="w-6 h-6 animate-spin" />
          </Match>
          <Match when={donate.isSuccess}>Eklendi</Match>
        </Switch>
      </button>
    </div>
  );
}
