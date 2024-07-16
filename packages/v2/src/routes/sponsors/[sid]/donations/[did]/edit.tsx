import { Button } from "@/components/ui/button";
import {
  NumberField,
  NumberFieldDecrementTrigger,
  NumberFieldGroup,
  NumberFieldIncrementTrigger,
  NumberFieldInput,
} from "@/components/ui/number-field";
import { getAuthenticatedSession } from "@/data/auth";
import { getSponsor, getSponsorDonation } from "@/data/sponsors";
import type { Donation } from "@ciftlikpdf/core/src/entities/donations";
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
import { CheckCheck, Loader2, Pen, Plus, Save } from "lucide-solid";
import { For, Match, Show, Suspense, Switch } from "solid-js";
import { createStore } from "solid-js/store";
import { updateDonationAction } from "../../../../../actions/sponsors";

export const route = {
  preload: async ({ params }) => {
    const sponsors = await getSponsor(params.sid);
    const donation = await getSponsorDonation(params.sid, params.did);
    const session = await getAuthenticatedSession();
    return { sponsors, session, donation };
  },
} satisfies RouteDefinition;

export default function SponsorSIDIndex() {
  const params = useParams();
  const sponsor = createAsync(() => getSponsor(params.sid));
  const donation = createAsync(() => getSponsorDonation(params.sid, params.did));
  const session = createAsync(() => getAuthenticatedSession());

  const [donationEdit, setDonationEdit] = createStore<Parameters<typeof Donation.update>[0]>({
    id: "",
  });

  const updateDonation = useAction(updateDonationAction);
  const donateState = useSubmission(updateDonationAction);

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
          <Show when={sponsor()} keyed fallback={<div>Sponsor not found</div>}>
            {(s) => (
              <div class="w-full flex flex-col gap-4 items-start">
                <h1 class="text-2xl font-bold text-center">Güncelle {s.name}</h1>
                <div class="flex flex-col gap-0.5 items-start">{s.address}</div>
                <Show when={donation()} keyed>
                  {(d) => {
                    setDonationEdit(d);
                    return (
                      <div class="w-full flex flex-col items-center justify-center">
                        <div class="flex flex-col gap-4 w-full">
                          <NumberField
                            value={donationEdit.amount?.toString() ?? ""}
                            onChange={(value) => setDonationEdit("amount", +value)}
                            step={50}
                            class="w-full"
                          >
                            <NumberFieldGroup>
                              <NumberFieldDecrementTrigger aria-label="Decrement" class="[&_svg]:size-7 px-4" />
                              <NumberFieldInput placeholder="Miktar" class="text-3xl font-bold !px-3 !py-10 w-full" />
                              <NumberFieldIncrementTrigger aria-label="Increment" class="[&_svg]:size-7 px-4" />
                            </NumberFieldGroup>
                          </NumberField>
                          <div class="flex flex-col gap-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <For each={["CHF", "EUR"] as (typeof donationEdit)["currency"][]}>
                                {(currency) => (
                                  <Button
                                    variant={donationEdit.currency === currency ? "default" : "outline"}
                                    onClick={() => setDonationEdit("currency", currency)}
                                    class="flex flex-row items-center gap-2 !h-20 text-2xl"
                                    size="sm"
                                  >
                                    <Show when={donationEdit.currency === currency}>
                                      <CheckCheck class="size-8" />
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
                                    variant={donationEdit.year === year ? "default" : "outline"}
                                    onClick={() => setDonationEdit("year", year)}
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
                                await updateDonation(donationEdit);
                                await revalidate([
                                  getSponsor.keyFor(s.id),
                                  getSponsorDonation.keyFor(s.id, donationEdit.id),
                                ]);
                                navigate(`/sponsors/${s.id}/donations/${donationEdit.id}`);
                              }}
                              class="flex flex-row items-center gap-2"
                            >
                              <Switch
                                fallback={
                                  <>
                                    <Save class="size-4" />
                                    <span>Güncelle</span>
                                  </>
                                }
                              >
                                <Match when={donateState.pending}>
                                  <Loader2 class="size-4 animate-spin" />
                                  <span>Güncelleniyor...</span>
                                </Match>
                                <Match when={donateState.result}>Güncellendi</Match>
                              </Switch>
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </Show>
              </div>
            )}
          </Show>
        </main>
      </Show>
    </Suspense>
  );
}
