import { For, Show, createSignal } from "solid-js";
import type { Sponsor } from "@ciftlikpdf/core/src/entities/sponsors";
import { createMutation } from "@tanstack/solid-query";
import { qC, sponsorAtom } from "../utils/stores";
import { cn } from "../utils/cn";
import { Mutations } from "../utils/mutations";

export const SelectSponsor = (props: { sponsor: Sponsor.Frontend; API_URL: string }) => {
  const removeSponsor = createMutation(
    () => ({
      mutationKey: ["removeSponsor"],
      mutationFn: (id: string) => Mutations.Sponsors.remove(props.API_URL, id),
      onSuccess: () => {
        qC.invalidateQueries({
          queryKey: ["sponsors"],
        });
        sponsorAtom.set(undefined);
      },
      onError: () => {
        setTimeout(() => {
          removeSponsor.reset();
        }, 5000);
      },
    }),
    () => qC,
  );

  const [currentSponsor, setCurrentSponsor] = createSignal<Sponsor.Frontend | undefined>();
  const [currentSponsorYear, setCurrentSponsorYear] = createSignal<number | undefined>();
  sponsorAtom.subscribe((sponsor) => {
    setCurrentSponsor(sponsor?.[0]);
    setCurrentSponsorYear(sponsor?.[1]);
  });

  return (
    <div class="p-4 text-black dark:text-white border border-neutral-300 dark:border-neutral-800 shadow-sm rounded-md bg-white dark:bg-black flex flex-col w-full gap-2">
      <div class="flex flex-row items-center justify-between">
        <span class="text-sm font-semibold">{props.sponsor.name}</span>
        <div class="flex flex-row items-center justify-center gap-2">
          <a
            href={`/sponsor/${props.sponsor.id}/edit`}
            class="w-full h-full text-sm font-semibold text-blue-500 bg-blue-50 px-3 py-1 border border-blue-300 rounded-md hover:bg-blue-100 flex flex-row items-center gap-2 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-500"
          >
            <span class="sr-only">Düzenle</span>
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
              <polygon points="16 3 21 8 8 21 3 21 3 16 16 3" />
            </svg>
          </a>
          <button
            class="w-full h-full text-sm font-semibold text-red-500 bg-red-50 px-3 py-1 border border-red-300 rounded-md hover:bg-red-100 flex flex-row items-center gap-2 dark:bg-red-900 dark:text-red-100 dark:border-red-500"
            onClick={async () => {
              const confirmed = confirm("Sponsoru silmek istediginize emin misiniz?");
              if (!confirmed) return;
              await removeSponsor.mutateAsync(props.sponsor.id);
            }}
          >
            <span class="sr-only">Sil</span>
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
        </div>
      </div>
      <div
        class={cn("grid grid-cols-2 gap-2", {
          "grid-cols-1": props.sponsor.donations.length === 0,
        })}
      >
        <For
          each={props.sponsor.donations}
          fallback={
            <div class="flex flex-col items-center justify-center p-4 border border-neutral-300 dark:border-neutral-800 rounded-md gap-2">
              <span class="text-sm font-semibold">Bagislar eklenmedi</span>
              <a
                href={`/sponsor/${props.sponsor.id}/donate`}
                class="w-full h-full text-sm font-semibold text-blue-500 bg-blue-50 px-3 py-1 border border-blue-300 rounded-md hover:bg-blue-100 flex flex-row items-center gap-2 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-500"
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
          }
        >
          {(donation) => (
            <button
              class={cn(
                "w-full flex flex-col items-center justify-center space-x-2 p-4 border dark:border-neutral-800 border-neutral-300 rounded-md cursor-pointer",
                {
                  "bg-black text-white dark:bg-white dark:text-black":
                    currentSponsor()?.id === props.sponsor.id && currentSponsorYear() === donation.year,
                },
              )}
              onClick={() => {
                const sponsor = currentSponsor();
                if (sponsor?.id === props.sponsor.id && currentSponsorYear() === donation.year) {
                  sponsorAtom.set(undefined);
                } else {
                  sponsorAtom.set([props.sponsor, donation.year]);
                }
              }}
            >
              <span class="gap-1 text-lg font-medium">{donation.year}</span>
              <div class="flex flex-row items-center justify-center gap-1 text-xl font-bold ">
                <span>{donation.amount}</span>
                <span>{donation.currency}</span>
              </div>
            </button>
          )}
        </For>
        <Show when={props.sponsor.donations.length >= 1}>
          <a
            href={`/sponsor/${props.sponsor.id}/donate`}
            class="w-full h-full text-sm font-semibold text-blue-500 bg-blue-50 px-3 py-1 border border-blue-300 rounded-md hover:bg-blue-100 flex flex-row items-center justify-center gap-2 dark:bg-blue-900 dark:text-blue-100 dark:border-blue-500"
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
