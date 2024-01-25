import { QueryClient, QueryClientProvider, createMutation } from "@tanstack/solid-query";
import { TextField, Select } from "@kobalte/core";
import { Mutations } from "../utils/mutations";
import { Match, Show, Switch, createSignal } from "solid-js";
import dayjs from "dayjs";

export function NewSponsorFormWrapper(props: { API_URL: string; session: string }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <NewSponsorForm API_URL={props.API_URL} session={props.session} />
    </QueryClientProvider>
  );
}

function NewSponsorForm(props: { API_URL: string; session: string }) {
  const createSponsor = createMutation(() => ({
    mutationKey: ["newSponsor"],
    mutationFn: async (sponsor: Parameters<typeof Mutations.Sponsors.create>[1]) => {
      return Mutations.Sponsors.create(props.API_URL, sponsor);
    },
  }));
  // const donate = createMutation(() => ({
  //   mutationKey: ["newSponsor"],
  //   mutationFn: async (data: {
  //     sponsor: Parameters<typeof Mutations.Donations.create>[1];
  //     donation: Parameters<typeof Mutations.Donations.create>[2];
  //   }) => {
  //     return Mutations.Donations.create(props.API_URL, data.sponsor, data.donation);
  //   },
  // }));
  const [newSponsor, setNewSponsor] = createSignal<Parameters<typeof Mutations.Sponsors.create>[1]>({
    name: "",
    address: "",
  });

  return (
    <form
      class="flex flex-col gap-4 items-start"
      onSubmit={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const sponsor = await createSponsor.mutateAsync(newSponsor());
        if (sponsor) {
          window.location.href = `/sponsors/${sponsor.id}`;
        } else {
          alert("Bir hata oluştu");
        }
        // const donation = await donate.mutateAsync(newDonation());
      }}
    >
      <TextField.Root
        required
        class="max-w-[600px] min-w-full border border-neutral-200 dark:border-neutral-800 rounded-md flex flex-row items-center gap-2 px-3"
        value={newSponsor().name}
        onChange={(value) => setNewSponsor((x) => ({ ...x, name: value }))}
      >
        <TextField.Input class="w-full bg-transparent px-1 py-2 outline-none" id="name" placeholder="Isim" />
      </TextField.Root>
      <TextField.Root
        class="min-w-full max-w-[600px] border border-neutral-200 dark:border-neutral-800 rounded-md flex flex-row items-center gap-2 px-3"
        value={newSponsor().address}
        onChange={(value) => setNewSponsor((x) => ({ ...x, address: value }))}
      >
        <TextField.TextArea
          class="w-full bg-transparent px-1 py-2 outline-none resize-none"
          id="address"
          placeholder="Adress"
        />
      </TextField.Root>
      <button
        type="submit"
        disabled={createSponsor.isPending}
        class="bg-black dark:bg-white text-white dark:text-black font-medium text-sm rounded-md px-3 py-1.5 flex flex-row items-center gap-2"
      >
        <span class="flex flex-row items-center gap-2">Ekle</span>
        <Switch>
          <Match when={createSponsor.isPending}>
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
          </Match>
          <Match when={createSponsor.isSuccess}>
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
              <path d="M18 6 7 17l-5-5" />
              <path d="m22 10-7.5 7.5L13 16" />
            </svg>
          </Match>
          <Match when={createSponsor.isError}>
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
              <circle cx="12" cy="12" r="10" />
              <line x1="12" x2="12" y1="8" y2="12" />
              <line x1="12" x2="12.01" y1="16" y2="16" />
            </svg>
          </Match>
          <Match when={createSponsor.isIdle}>
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
          </Match>
        </Switch>
      </button>
    </form>
  );
}
