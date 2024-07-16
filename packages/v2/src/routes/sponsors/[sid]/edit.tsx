import { updateSponsorAction } from "@/actions/sponsors";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/textarea";
import { TextField, TextFieldLabel, TextFieldRoot } from "@/components/ui/textfield";
import { getAuthenticatedSession } from "@/data/auth";
import { getAllSponsors, getSponsor } from "@/data/sponsors";
import type { Sponsor } from "@ciftlikpdf/core/src/entities/sponsors";
import { Title } from "@solidjs/meta";
import { A, createAsync, revalidate, RouteDefinition, useAction, useParams, useSubmission } from "@solidjs/router";
import { ArrowLeft, Loader2, Plus } from "lucide-solid";
import { Match, Show, Suspense, Switch } from "solid-js";
import { createStore } from "solid-js/store";

export const route = {
  preload: async ({ params }) => {
    const sponsors = await getSponsor(params.sid);
    const session = await getAuthenticatedSession();
    return { sponsors, session };
  },
} satisfies RouteDefinition;

export default function SponsorCreate() {
  const params = useParams();
  const session = createAsync(() => getAuthenticatedSession());

  const sponsor = createAsync(() => getSponsor(params.sid));

  const [newSponsor, setNewSponsor] = createStore<Parameters<typeof Sponsor.update>[0]>({
    id: "",
    name: "",
    address: "",
  });

  const updateSponsor = useAction(updateSponsorAction);
  const submission = useSubmission(updateSponsorAction);

  return (
    <div class=" mx-auto p-4 pt-20 container flex flex-col gap-4">
      <Suspense fallback={<Loader2 class="size-4 animate-spin" />}>
        <Show
          when={session() && session()!.user !== null && session()!.user?.type === "admin"}
          keyed
          fallback={
            <main class="text-center mx-auto p-4 pt-20">
              <span>Lütfen giriş yapınız.</span>
              <Button as={A} href="/login">
                Giriş Yap
              </Button>
            </main>
          }
        >
          <Show when={sponsor()} keyed fallback={<div>Sponsor not found</div>}>
            {(s) => {
              setNewSponsor("id", s.id);
              setNewSponsor("name", s.name);
              setNewSponsor("address", s.address);
              return (
                <>
                  <Title>{s.name} | Sponsor</Title>
                  <div class="w-full flex flex-col gap-4 items-start">
                    <div class="w-full flex flex-row items-center gap-2">
                      <Button
                        as={A}
                        href={`/sponsors/${params.sid}`}
                        size="sm"
                        class="w-max flex flex-row items-center gap-2"
                      >
                        <ArrowLeft class="size-4" />
                        Geri
                      </Button>
                    </div>
                    <TextFieldRoot
                      class="w-full flex flex-col gap-2"
                      required
                      value={newSponsor.name}
                      onChange={(value) => setNewSponsor("name", value)}
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
                      onChange={(value) => setNewSponsor("address", value)}
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
                  </div>
                </>
              );
            }}
          </Show>
          <div class="flex flex-row justify-between gap-4 items-center">
            <div></div>
            <Button
              type="submit"
              disabled={submission.pending}
              class="bg-black dark:bg-white text-white dark:text-black font-medium text-sm rounded-md px-3 py-1.5 flex flex-row items-center gap-2"
              onClick={async () => {
                await updateSponsor(newSponsor);
                await revalidate(getAllSponsors.key);
              }}
            >
              <Switch fallback={<Plus class="size-4" />}>
                <Match when={submission.pending}>
                  <Loader2 class="size-4 animate-spin" />
                </Match>
              </Switch>
              <span class="flex flex-row items-center gap-2">Güncelle</span>
            </Button>
          </div>
          <Show when={submission.result}>{(result) => <p>{result().message}</p>}</Show>
        </Show>
      </Suspense>
    </div>
  );
}
