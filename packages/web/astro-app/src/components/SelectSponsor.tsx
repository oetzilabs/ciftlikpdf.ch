import { For, Show, createSignal } from "solid-js";
import type { Sponsor } from "../../../../core/src/entities/sponsors";
import { createMutation } from "@tanstack/solid-query";
import { Queries } from "../utils/queries";
import { qC, sponsorAtom } from "../utils/stores";
import { cn } from "../utils/cn";
import { api_url } from "./Providers";

export const SelectSponsor = (props: { sponsor: Sponsor.Frontend }) => {
  const removeSponsor = createMutation(() => ({
    mutationKey: ["removeSponsor"],
    mutationFn: (id: string) => Queries.Sponsors.remove(api_url.get(), id),
    onSuccess: () => {
      qC.invalidateQueries({
        queryKey: ["sponsors"],
      });
    },
    onError: () => {
      setTimeout(() => {
        removeSponsor.reset();
      }, 5000);
    }
  }), () => qC);

  const [currentSponsor, setCurrentSponsor] = createSignal<Sponsor.Frontend | undefined>();
  const [currentSponsorYear, setCurrentSponsorYear] = createSignal<number | undefined>();
  sponsorAtom.subscribe((sponsor) => {
    setCurrentSponsor(sponsor?.[0]);
    setCurrentSponsorYear(sponsor?.[1]);
  });

  return (
    <div class="p-4 text-black dark:text-white border border-neutral-300 dark:border-neutral-800 shadow-sm rounded-md bg-white dark:bg-black flex flex-col w-full gap-2">
      <span class="text-sm font-semibold">
        {props.sponsor.name}
      </span>
      <div class={cn("grid grid-cols-2 gap-2", {
        "grid-cols-1": props.sponsor.donations.length === 0,
      })}>
        <For each={props.sponsor.donations} fallback={
          <div class="flex flex-col items-center justify-center p-4 border border-neutral-300 dark:border-neutral-800 rounded-md gap-2">
            <span class="text-sm font-semibold">Bagislar eklenmedi</span>
            <a
              href={`/sponsor/${props.sponsor.id}/donate`}
              class="ml-2 text-sm font-semibold text-blue-500 bg-blue-50 px-3 py-1 border border-blue-300 rounded-md hover:bg-blue-100 flex flex-row items-center gap-2"
            >
              <span>Ekle</span>
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
                <path d="M5 12h14" />
                <path d="M12 5v14" />
              </svg>
            </a>
          </div>
        }>
          {(donation) => (
            <button class={cn("w-full flex flex-row items-center justify-center text-xl font-bold space-x-2 p-4 border dark:border-neutral-800 border-neutral-300 rounded-md cursor-pointer", {
              "bg-black text-white dark:bg-white dark:text-black": currentSponsor()?.id === props.sponsor.id && currentSponsorYear() === donation.year,
            })}
              onClick={() => {
                const sponsor = currentSponsor();
                if (sponsor?.id === props.sponsor.id && currentSponsorYear() === donation.year) {
                  sponsorAtom.set(undefined);
                } else {
                  sponsorAtom.set([props.sponsor, donation.year]);
                }
              }}>
              <span >
                {donation.amount}
              </span>
              <span >
                {donation.currency}
              </span>
            </button>
          )}
        </For>
        <Show when={props.sponsor.donations.length >= 1}>
        <a
          href={`/sponsor/${props.sponsor.id}/donate`}
          class="ml-2 text-sm font-semibold text-blue-500 bg-blue-50 px-3 py-1 border border-blue-300 rounded-md hover:bg-blue-100 flex flex-row items-center gap-2"
        >
          <span>Bagis Ekle</span>
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
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
        </a>
        </Show>
      </div>
    </div>
  );
};
