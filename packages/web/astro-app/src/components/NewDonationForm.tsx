import { createMutation } from "@tanstack/solid-query";
import { TextField, Select } from "@kobalte/core";
import { Mutations, Donations } from "../utils/mutations";
import { Match, Show, Switch, createSignal } from "solid-js";
import dayjs from "dayjs";
import { qC } from "../utils/stores";

export function NewSponsorForm(props: { API_URL: string; session: string; sponsorId: string }) {
  const createDonation = createMutation(
    () => ({
      mutationKey: ["newSponsor"],
      mutationFn: async (donation: Parameters<typeof Mutations.Donations.create>[2]) => {
        return Mutations.Donations.create(props.API_URL, props.sponsorId, donation);
      },
    }),
    () => qC,
  );
  const [newDonation, setNewDonation] = createSignal<Parameters<typeof Mutations.Donations.create>[2]>({
    amount: 0,
    year: dayjs().year(),
    currency: "CHF",
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const s = newDonation();
    if (!s.amount) {
      alert("Miqdor bos olamaz");
      return;
    }
    if (!s.year) {
      alert("Yil bos olamaz");
      return;
    }
    if (!s.currency) {
      alert("Valyuta bos olamaz");
      return;
    }
    const donation = await createDonation.mutateAsync(s);
    if (donation) {
      await qC.invalidateQueries({ queryKey: ["sponsors"] });
      window.location.href = `/sponsor/${donation.id}`;
    } else {
      console.error(donation, createDonation.failureReason);
    }
  };

  return (
    <form class="flex flex-col gap-4 items-start" onSubmit={handleSubmit}>
      <TextField.Root
        required
        class="max-w-[600px] min-w-full border border-neutral-200 dark:border-neutral-800 rounded-md flex flex-row items-center gap-2 px-3 bg-white dark:bg-black"
        value={String(newDonation().amount)}
        onChange={(value) => setNewDonation((x) => ({ ...x, amount: +value }))}
      >
        <TextField.Input
          class="w-full bg-transparent px-1 py-2 outline-none"
          id="amount"
          placeholder="Miqdor"
          type="number"
        />
      </TextField.Root>
      <Select.Root
        placeholder="Para Birimi"
        name="currency"
        placement="bottom-start"
        required
        options={Array.from({ length: 10 }, (_, i) => dayjs().year() - i)}
        value={newDonation().year}
        onChange={(value) => setNewDonation((d) => ({ ...d, year: value }))}
        disallowEmptySelection={false}
        itemComponent={(props) => (
          <Select.Item
            item={props.item}
            class="flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium select-none min-w-[150px] items-center justify-between"
          >
            <Select.ItemLabel class="capitalize">{props.item.rawValue}</Select.ItemLabel>
            <Select.ItemIndicator class="">
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
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </Select.ItemIndicator>
          </Select.Item>
        )}
      >
        <Select.Trigger>
          <div class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-sm border border-neutral-200 dark:border-neutral-800 flex flex-row gap-2 items-center justify-center">
            <Select.Value<string> class="font-bold select-none capitalize">
              {(state) => state.selectedOption()}
            </Select.Value>
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
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content class="z-50 self-end w-fit bg-white dark:bg-black rounded-sm border border-neutral-200 dark:border-neutral-800 shadow-md overflow-clip">
            <Select.Listbox />
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <Select.Root
        placeholder="Para Birimi"
        name="currency"
        placement="bottom-start"
        required
        options={["CHF", "EUR"]}
        value={newDonation().currency}
        onChange={(value) => setNewDonation((d) => ({ ...d, currency: value }))}
        disallowEmptySelection={false}
        itemComponent={(props) => (
          <Select.Item
            item={props.item}
            class="flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium select-none min-w-[150px] items-center justify-between"
          >
            <Select.ItemLabel class="capitalize">{props.item.rawValue}</Select.ItemLabel>
            <Select.ItemIndicator class="">
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
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </Select.ItemIndicator>
          </Select.Item>
        )}
      >
        <Select.Trigger>
          <div class="p-2 py-1 w-full bg-neutral-50 dark:bg-neutral-950 rounded-sm border border-neutral-200 dark:border-neutral-800 flex flex-row gap-2 items-center justify-center">
            <Select.Value<string> class="font-bold select-none capitalize">
              {(state) => state.selectedOption()}
            </Select.Value>
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
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content class="z-50 self-end w-fit bg-white dark:bg-black rounded-sm border border-neutral-200 dark:border-neutral-800 shadow-md overflow-clip">
            <Select.Listbox />
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <button
        type="submit"
        disabled={createDonation.isPending}
        class="bg-black dark:bg-white text-white dark:text-black font-medium text-sm rounded-md px-3 py-1.5 flex flex-row items-center gap-2"
      >
        <span class="flex flex-row items-center gap-2">Ekle</span>
        <Switch>
          <Match when={createDonation.isPending}>
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
          <Match when={createDonation.isSuccess}>
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
          <Match when={createDonation.isError}>
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
          <Match when={createDonation.isIdle}>
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
