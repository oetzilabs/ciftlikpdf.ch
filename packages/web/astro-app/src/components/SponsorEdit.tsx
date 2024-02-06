import type { Sponsor } from "@ciftlikpdf/core/src/entities/sponsors";
import { QueryClientProvider, createMutation } from "@tanstack/solid-query";
import { Mutations } from "../utils/mutations";
import { Match, Switch, createSignal } from "solid-js";
import { Loader } from "lucide-solid";
import { qC } from "../utils/stores";
import { TextField } from "@kobalte/core";

export default function SE(props: { sponsor: Sponsor.Frontend; API_URL: string }) {
  return (
    <QueryClientProvider client={qC}>
      <SponsorEdit sponsor={props.sponsor} API_URL={props.API_URL} />
    </QueryClientProvider>
  );
}

function SponsorEdit(props: { sponsor: Sponsor.Frontend; API_URL: string }) {
  const saveSponsor = createMutation(() => ({
    mutationKey: ["saveSponsor"],
    mutationFn: (sponsor: Sponsor.Frontend) => {
      return Mutations.Sponsors.update(props.API_URL, sponsor.id, sponsor);
    },
    async onSuccess(data, variables, context) {
      await qC.invalidateQueries({ queryKey: ["sponsors"] });
    },
  }));
  const [sponsor, setSponsor] = createSignal(props.sponsor);

  return (
    <div class="w-full flex flex-col gap-2 items-start">
      <div class="flex flex-col gap-4 items-start">
        <TextField.Root
          class="w-full flex flex-col gap-2"
          required
          value={sponsor().name}
          onChange={(value) => setSponsor((x) => ({ ...x, name: value }))}
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
          value={sponsor().address}
          onChange={(value) => setSponsor((x) => ({ ...x, address: value }))}
        >
          <TextField.Label for="address" class="font-bold">
            Adress
          </TextField.Label>
          <TextField.TextArea
            class="w-full border border-neutral-200 dark:border-neutral-800 rounded-md flex flex-row items-center gap-2 bg-white dark:bg-black px-3 py-2 resize-none"
            autoResize
            id="address"
            placeholder="Adress"
          >
            {sponsor().address}
          </TextField.TextArea>
        </TextField.Root>
        <button
          onClick={async () => {
            const s = sponsor();
            if (!s.name) {
              alert("Isim bos olamaz");
              return;
            }
            if (!s.address) {
              alert("Adress bos olamaz");
              return;
            }
            const updatedSponsor = await saveSponsor.mutateAsync(s);
          }}
          class="w-max px-3 py-1 bg-black text-white bg-primary-500 rounded-md flex flex-row items-center justify-center gap-2"
        >
          <Switch>
            <Match when={saveSponsor.isPending}>
              <span>Kaydetiyor...</span>
              <Loader class="animate-spin" size="16" />
            </Match>
            <Match when={saveSponsor.isError}>Kaydetemedik</Match>
            <Match when={saveSponsor.isSuccess}>Kaydetildi</Match>
            <Match when={saveSponsor.isIdle}>Kaydet</Match>
          </Switch>
        </button>
      </div>
    </div>
  );
}
