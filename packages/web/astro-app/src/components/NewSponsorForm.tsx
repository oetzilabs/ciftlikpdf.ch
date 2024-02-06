import { TextField } from "@kobalte/core";
import { createMutation } from "@tanstack/solid-query";
import { Match, Switch, createSignal } from "solid-js";
import { Mutations } from "../utils/mutations";
import { qC } from "../utils/stores";

export function NewSponsorForm(props: { API_URL: string }) {
  const createSponsor = createMutation(
    () => ({
      mutationKey: ["newSponsor"],
      mutationFn: async (sponsor: Parameters<typeof Mutations.Sponsors.create>[1]) => {
        return Mutations.Sponsors.create(props.API_URL, sponsor);
      },
    }),
    () => qC,
  );
  const [newSponsor, setNewSponsor] = createSignal<Parameters<typeof Mutations.Sponsors.create>[1]>({
    name: "",
    address: "",
  });

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    const s = newSponsor();
    if (!s.name) {
      alert("Isim bos olamaz");
      return;
    }
    if (!s.address) {
      alert("Adress bos olamaz");
      return;
    }
    const sponsor = await createSponsor.mutateAsync(s);
    if (sponsor) {
      await qC.invalidateQueries({ queryKey: ["sponsors"] });
      window.location.href = `/sponsor/${sponsor.id}`;
    } else {
      console.error(sponsor, createSponsor.failureReason);
    }
  };

  return (
    <form class="flex flex-col gap-4 items-start" onSubmit={handleSubmit}>
      <TextField.Root
        class="w-full flex flex-col gap-2"
        required
        value={newSponsor().name}
        onChange={(value) => setNewSponsor((x) => ({ ...x, name: value }))}
      >
        <TextField.Label for="name" class="font-bold">
          Isim
        </TextField.Label>
        <TextField.Input
          class="w-full border border-neutral-200 dark:border-neutral-800 rounded-md flex flex-row items-center gap-2 bg-white dark:bg-black px-3 py-2"
          id="name"
          placeholder="Isim"
        />
      </TextField.Root>
      <TextField.Root
        class="w-full flex flex-col gap-2"
        value={newSponsor().address}
        onChange={(value) => setNewSponsor((x) => ({ ...x, address: value }))}
      >
        <TextField.Label for="address" class="font-bold">
          Adress
        </TextField.Label>
        <TextField.TextArea
          class="w-full border border-neutral-200 dark:border-neutral-800 rounded-md flex flex-row items-center gap-2 bg-white dark:bg-black px-3 py-2 resize-none"
          autoResize
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
