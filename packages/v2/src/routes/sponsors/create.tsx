import { addSponsorAction } from "@/actions/sponsors";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/textarea";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import type { Sponsor } from "@ciftlikpdf/core/src/entities/sponsors";
import { revalidate, useAction, useSubmission } from "@solidjs/router";
import { Show } from "solid-js";
import { Match, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { getAllSponsors } from "../../data/sponsors";
import { Loader2, Plus } from "lucide-solid";

export default function SponsorCreate() {
  const [newSponsor, setNewSponsor] = createStore<Parameters<typeof Sponsor.create>[0]>({
    name: "",
    address: "",
  });

  const addSponsor = useAction(addSponsorAction);
  const submission = useSubmission(addSponsorAction);

  return (
    <div class=" mx-auto p-4 pt-20 container flex flex-col gap-4">
      <TextFieldRoot
        class="w-full flex flex-col gap-2"
        required
        value={newSponsor.name}
        onChange={(value) => setNewSponsor((x) => ({ ...x, name: value }))}
      >
        <TextFieldLabel for="name" class="font-bold">
          Isim
          <TextField
            class="w-full border border-neutral-200 dark:border-neutral-800 rounded-md flex flex-row items-center gap-2 bg-white dark:bg-black px-3 py-2"
            id="name"
            placeholder="Isim"
          />
        </TextFieldLabel>
      </TextFieldRoot>
      <TextFieldRoot
        class="w-full flex flex-col gap-2"
        value={newSponsor.address}
        onChange={(value) => setNewSponsor((x) => ({ ...x, address: value }))}
      >
        <TextFieldLabel for="address" class="font-bold">
          Adress
        </TextFieldLabel>
        <TextArea
          class="w-full border border-neutral-200 dark:border-neutral-800 rounded-md flex flex-row items-center gap-2 bg-white dark:bg-black px-3 py-2 resize-none"
          autoResize
          id="address"
          placeholder="Adress"
        />
      </TextFieldRoot>
      <div class="flex flex-row justify-between gap-4 items-center">
        <div></div>
        <Button
          type="submit"
          disabled={submission.pending}
          class="bg-black dark:bg-white text-white dark:text-black font-medium text-sm rounded-md px-3 py-1.5 flex flex-row items-center gap-2"
          onClick={async () => {
            await addSponsor(newSponsor);
            await revalidate(getAllSponsors.key);
          }}
        >
          <Switch fallback={<Plus class="size-4" />}>
            <Match when={submission.pending}>
              <Loader2 class="size-4 animate-spin" />
            </Match>
          </Switch>
          <span class="flex flex-row items-center gap-2">Ekle</span>
        </Button>
      </div>
      <Show when={submission.result}>{(result) => <p>{result().message}</p>}</Show>
    </div>
  );
}
