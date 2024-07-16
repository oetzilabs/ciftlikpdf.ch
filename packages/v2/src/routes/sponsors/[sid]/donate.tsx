import { donateAction } from "@/actions/sponsors";
import { Button } from "@/components/ui/button";
import {
  NumberField,
  NumberFieldDecrementTrigger,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldInput,
} from "@/components/ui/number-field";
import { getAuthenticatedSession } from "@/data/auth";
import { getSponsor } from "@/data/sponsors";
import type { Sponsor } from "@ciftlikpdf/core/src/entities/sponsors";
import { Title } from "@solidjs/meta";
import {
  A,
  createAsync,
  revalidate,
  RouteDefinition,
  useAction,
  useNavigate,
  useParams,
  useSubmission,
} from "@solidjs/router";
import dayjs from "dayjs";
import { ArrowLeft, CheckCheck, Loader2, Plus } from "lucide-solid";
import { For, Match, Show, Suspense, Switch } from "solid-js";
import { createStore } from "solid-js/store";

export const route = {
  preload: async ({ params }) => {
    const sponsors = await getSponsor(params.sid);
    const session = await getAuthenticatedSession();
    return { sponsors, session };
  },
} satisfies RouteDefinition;

export default function SponsorSIDDonate() {
  const params = useParams();
  const sponsor = createAsync(() => getSponsor(params.sid));
  const session = createAsync(() => getAuthenticatedSession());

  const [newDonation, setNewDonation] = createStore<Omit<Parameters<typeof Sponsor.donate>[1], "admin_id">>({
    amount: 0,
    currency: "CHF",
    year: new Date().getFullYear(),
  });

  const donate = useAction(donateAction);
  const donateState = useSubmission(donateAction);

  const navigate = useNavigate();

  return (
    <Suspense fallback={<Loader2 class="size-4 animate-spin" />}>
      <Show
        when={session() && session()!.user !== null && session()!.user?.type === "admin"}
        fallback={
          <main class="text-center mx-auto p-4 pt-20">
            <span>Lütfen giriş yapınız.</span>
            <Button as={A} href="/login">
              Giriş Yap
            </Button>
          </main>
        }
      >
        <main class="text-center mx-auto p-4 pt-20 container flex flex-col gap-4">
          <div class="w-full flex flex-row items-center gap-2">
            <Button as={A} href={`/sponsors/${params.sid}`} size="sm" class="w-max flex flex-row items-center gap-2">
              <ArrowLeft class="size-4" />
              Geri
            </Button>
          </div>
          <div class="w-full flex flex-col gap-4 items-start">
            <Show when={sponsor()} keyed fallback={<div>Sponsor not found</div>}>
              {(s) => (
                <>
                  <Title>
                    {s.name} | {newDonation.amount} {newDonation.currency} | Sponsor
                  </Title>
                  <div class="w-full flex flex-col gap-4 items-start">
                    <h1 class="text-2xl font-bold text-center">Güncelle {s.name}</h1>
                    <div class="flex flex-col gap-0.5 items-start">{s.address}</div>
                    <NumberField
                      value={newDonation.amount.toString()}
                      onChange={(value) => setNewDonation("amount", +value)}
                      step={50}
                      class="w-full"
                    >
                      <NumberFieldGroup>
                        <NumberFieldDecrementTrigger aria-label="Decrement" class="[&_svg]:size-7 px-4" />
                        <NumberFieldInput placeholder="Miktar" class="text-3xl font-bold !px-3 !py-10 w-full" />
                        <NumberFieldIncrementTrigger aria-label="Increment" class="[&_svg]:size-7 px-4" />
                      </NumberFieldGroup>
                    </NumberField>
                    <div class="flex flex-col gap-4 w-full">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <For each={["CHF", "EUR"] as (typeof newDonation)["currency"][]}>
                          {(currency) => (
                            <Button
                              variant={newDonation.currency === currency ? "default" : "outline"}
                              onClick={() => setNewDonation("currency", currency)}
                              class="flex flex-row items-center gap-2 !h-20 text-2xl"
                              size="sm"
                            >
                              <Show when={newDonation.currency === currency}>
                                <CheckCheck class="size-4" />
                              </Show>
                              {currency}
                            </Button>
                          )}
                        </For>
                      </div>
                      <div class="grid grid-cols-1 md:grid-cols-9 gap-4">
                        <For
                          each={Array.from(
                            new Set(
                              Array.from({ length: 5 })
                                .map((_, i) => dayjs().subtract(i, "year").year())
                                .concat(Array.from({ length: 5 }).map((_, i) => dayjs().add(i, "year").year()))
                            )
                          ).sort()}
                        >
                          {(year) => (
                            <Button
                              disabled={s.donations.some((d) => d.year === year)}
                              variant={newDonation.year === year ? "default" : "outline"}
                              onClick={() => setNewDonation("year", year)}
                              class="flex flex-row items-center gap-2 justify-center px-3"
                              size="sm"
                            >
                              <div class="flex flex-row items-center justify-center gap-2">
                                <span>{year}</span>
                                <Show when={s.donations.find((d) => d.year === year)} keyed>
                                  {(d) => <span class="w-full flex-1">{`${d.amount} ${d.currency}`}</span>}
                                </Show>
                              </div>
                            </Button>
                          )}
                        </For>
                      </div>
                    </div>
                    <div class="flex flex-row items-center gap-2 justify-end w-full">
                      <Button
                        size="sm"
                        onClick={async () => {
                          const x = await donate(s.id, newDonation);
                          await revalidate(getSponsor.keyFor(s.id));
                          if (x) navigate(`/sponsors/${s.id}`);
                        }}
                        class="flex flex-row items-center gap-2"
                      >
                        <Switch
                          fallback={
                            <>
                              <Plus class="size-5" />
                              <span>Ekle</span>
                            </>
                          }
                        >
                          <Match when={donateState.pending}>
                            <Loader2 class="size-4 animate-spin" />
                            <span>Ekleniyor...</span>
                          </Match>
                          <Match when={donateState.result}>Eklendi</Match>
                        </Switch>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Show>
          </div>
        </main>
      </Show>
    </Suspense>
  );
}
