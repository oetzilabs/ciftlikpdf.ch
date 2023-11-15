import { Select } from "@kobalte/core";
import { createMutation, createQuery, useQueryClient } from "@tanstack/solid-query";
import dayjs from "dayjs";
import { For, JSX, Match, Show, Switch, createSignal } from "solid-js";
import { Modal } from "../components/Modal";
import { useAuth } from "../components/providers/OfflineFirst";
import { Mutations } from "../utils/api/mutations";
import { Queries } from "../utils/api/queries";
import { Sponsor } from "@ciftlikpdf/core/entities/sponsors";
import advancedFormat from "dayjs/plugin/advancedFormat";
import "dayjs/locale/tr.js";
dayjs.extend(advancedFormat);

const NewDonationModal = (props: { sponsorID: string }) => {
  const [user] = useAuth();
  const queryClient = useQueryClient();

  const [donation, setDonation] = createSignal<Parameters<typeof Mutations.Sponsors.donate>[2]>({
    currency: "CHF",
    amount: 0,
    year: dayjs().year(),
  });

  const createDonation = createMutation(
    (data: Parameters<typeof Mutations.Sponsors.donate>[2]) => {
      const token = user().token;
      if (!token) return Promise.reject("No token found. Please login first.");
      return Mutations.Sponsors.donate(token, props.sponsorID, data);
    },
    {
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(["sponsors"]);
      },
    }
  );

  return (
    <Modal
      trigger={
        <div class="bg-blue-700 text-white px-2 py-1 rounded-sm flex flex-row items-center justify-center gap-2.5">
          <div>
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
          </div>
          <span class="w-max font-medium">Bağış Ekle</span>
        </div>
      }
      title="Bağış Ekle"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-neutral-700">Bağış Para</label>
          <input
            type="number"
            placeholder="Bağış Para"
            class="border border-neutral-300 rounded-sm p-2"
            onInput={(e) => setDonation({ ...donation(), amount: Number(e.currentTarget.value) })}
            value={donation().amount}
          />
          <Select.Root
            placeholder="Para Birimi"
            name="currency"
            placement="bottom-start"
            required
            options={["CHF", "EUR"]}
            value={donation().currency}
            onChange={(value) => setDonation({ ...donation(), currency: value })}
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
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-neutral-700">Bağış Sene</label>
          <Select.Root
            placeholder="Bağış Sene"
            name="currency"
            placement="bottom-start"
            required
            options={
              // last 5 years and next 5 years
              Array.from({ length: 11 }, (_, i) => dayjs().year() - 5 + i)
            }
            value={donation().year}
            onChange={(value) => setDonation({ ...donation(), year: value })}
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
        </div>
        <div class="flex flex-row gap-4 items-center justify-between">
          <div class="flex flex-row gap-2 w-full"></div>
          <button
            class="bg-blue-700 text-white px-2 py-1 rounded-sm flex flex-row items-center justify-center gap-2.5 disabled:bg-neutral-200 disabled:text-neutral-600"
            onClick={async () => {
              const dn = donation();
              await createDonation.mutateAsync(dn);
            }}
            disabled={createDonation.isLoading || !donation().currency || !donation().amount || !donation().year}
          >
            <Show
              when={createDonation.isLoading}
              fallback={
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
              }
            >
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
            </Show>
            <span>Kaydet</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

const NewSponsorModal = () => {
  const [user] = useAuth();
  const queryClient = useQueryClient();

  const [sponsor, setSponsor] = createSignal<Parameters<typeof Mutations.Sponsors.createWithDonation>[1]>({
    address: "",
    name: "",
    currency: "CHF",
    amount: 0,
    year: dayjs().year(),
  });

  const createSponsor = createMutation(
    (data: Parameters<typeof Mutations.Sponsors.createWithDonation>[1]) => {
      const token = user().token;
      if (!token) return Promise.reject("No token found. Please login first.");
      return Mutations.Sponsors.createWithDonation(token, data);
    },
    {
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(["sponsors"]);
      },
    }
  );

  return (
    <Modal
      trigger={
        <div class="z-50 shadow-sm fixed bottom-4 right-4 md:bottom-0 md:right-0 w-12 h-12 rounded-full bg-blue-700 text-white md:relative md:w-auto md:h-auto md:px-2 md:py-1 md:rounded-sm flex flex-row items-center justify-center gap-2.5">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="w-6 h-6 md:w-4 md:h-4"
          >
            <path d="M5 12h14" />
            <path d="M12 5v14" />
          </svg>
          <span class="sr-only md:not-sr-only">Yeni Sponsor</span>
        </div>
      }
      title="Yeni Sponsor"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-neutral-700">Sponsor Ismi</label>
          <input
            type="text"
            placeholder="Sponsor Ismi"
            class="border border-neutral-300 rounded-sm p-2"
            onInput={(e) => setSponsor({ ...sponsor(), name: e.currentTarget.value })}
            value={sponsor().name}
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-neutral-700">Sponsor Adresi</label>
          <textarea
            placeholder="Sponsor Adresi"
            class="border border-neutral-300 rounded-sm p-2"
            onInput={(e) => setSponsor({ ...sponsor(), address: e.currentTarget.value })}
            value={sponsor().address}
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-neutral-700">Sponsor Para</label>
          <input
            type="number"
            placeholder="Sponsor Para"
            class="border border-neutral-300 rounded-sm p-2"
            onInput={(e) => setSponsor({ ...sponsor(), amount: Number(e.currentTarget.value) })}
            value={sponsor().amount}
          />
          <Select.Root
            placeholder="Para Birimi"
            name="currency"
            placement="bottom-start"
            required
            options={["CHF", "EUR"]}
            value={sponsor().currency}
            onChange={(value) => setSponsor({ ...sponsor(), currency: value })}
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
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-neutral-700">Sponsor Sene</label>
          <Select.Root
            placeholder="Sponsor Sene"
            name="currency"
            placement="bottom-start"
            required
            options={
              // last 5 years and next 5 years
              Array.from({ length: 11 }, (_, i) => dayjs().year() - 5 + i)
            }
            value={sponsor().year}
            onChange={(value) => setSponsor({ ...sponsor(), year: value })}
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
        </div>
        <div class="flex flex-row gap-4 items-center justify-between">
          <div class="flex flex-row gap-2 w-full"></div>
          <button
            class="bg-blue-700 text-white px-2 py-1 rounded-sm flex flex-row items-center justify-center gap-2.5 disabled:bg-neutral-200 disabled:text-neutral-600"
            onClick={async () => {
              const sp = sponsor();
              if (!sp.name || !sp.address || !sp.currency || !sp.amount || !sp.year) {
                // console.log("invalid", sp);
                return;
              }
              await createSponsor.mutateAsync(sp);
            }}
            disabled={
              createSponsor.isLoading ||
              !sponsor().name ||
              !sponsor().address ||
              !sponsor().currency ||
              !sponsor().amount ||
              !sponsor().year
            }
          >
            <Show
              when={createSponsor.isLoading}
              fallback={
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
              }
            >
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
            </Show>
            <span>Kaydet</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

export const CreatePDFModal = (props: { sponsor: Sponsor.Frontend }) => {
  // let the user choose the year to create the pdf for
  // and then trigger a mutation
  const [user] = useAuth();

  const createPDF = createMutation(async (donationId: string) => {
    const token = user().token;
    if (!token) return Promise.reject("No token found. Please login first.");
    return Mutations.Sponsors.createPDF(token, props.sponsor.id, donationId);
  });

  return (
    <Modal
      title="PDF Oluştur"
      trigger={
        <div class="bg-blue-700 text-white px-2 py-1 rounded-sm flex flex-row items-center justify-center gap-2.5 disabled:bg-neutral-200 disabled:text-neutral-600">
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
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span class="font-medium">PDF</span>
        </div>
      }
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-neutral-700">PDF Sene</label>
          <div class="grid grid-cols-2 gap-2">
            <Show when={props.sponsor.donations !== undefined && props.sponsor.donations}>
              {(donations) => (
                <For
                  each={donations()}
                  fallback={
                    <div class="col-span-full flex flex-col gap-2 items-center justify-center bg-neutral-100 border border-neutral-200 rounded-sm p-8">
                      <span class="font-bold">Bağış bulunamadı.</span>
                    </div>
                  }
                >
                  {(donation) => (
                    <button
                      class="border border-neutral-300 rounded-sm p-8 flex flex-col gap-2 items-center justify-center"
                      onClick={async () => {
                        const data = await createPDF.mutateAsync(donation.id);
                        if (!data) return;
                        const a = document.createElement("a");
                        a.href = data;
                        a.click();
                      }}
                      disabled={createPDF.isLoading}
                    >
                      <Show
                        when={createPDF.isLoading && createPDF.variables === donation.id}
                        fallback={
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          >
                            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        }
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
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
                      </Show>
                      <span class="text-lg font-medium">{donation.year}</span>
                    </button>
                  )}
                </For>
              )}
            </Show>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const EditSponsorModal = (props: { sponsor: Sponsor.Frontend }) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [user] = useAuth();
  const queryClient = useQueryClient();

  const [sponsor, setSponsor] = createSignal<Parameters<typeof Mutations.Sponsors.update>[2]>({
    address: props.sponsor.address,
    name: props.sponsor.name,
  });

  const updateSponsor = createMutation(
    (data: Parameters<typeof Mutations.Sponsors.update>[2]) => {
      const token = user().token;
      if (!token) return Promise.reject("No token found. Please login first.");
      return Mutations.Sponsors.update(token, props.sponsor.id, data);
    },
    {
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(["sponsors"]);
      },
    }
  );

  const removeSponsor = createMutation(
    () => {
      const token = user().token;
      if (!token) return Promise.reject("No token found. Please login first.");
      return Mutations.Sponsors.remove(token, props.sponsor.id);
    },
    {
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(["sponsors"]);
      },
    }
  );

  return (
    <Modal
      title="Sponsor Düzenle"
      open={isOpen()}
      onOpenChange={setIsOpen}
      trigger={
        <div class="bg-blue-700 text-white px-2 py-1 rounded-sm flex flex-row items-center justify-center gap-2.5 disabled:bg-neutral-200 disabled:text-neutral-600">
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
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
            <path d="m15 5 3 3" />
          </svg>
          <span class="font-medium">Düzenle</span>
        </div>
      }
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-neutral-700">Sponsor Ismi</label>
          <input
            type="text"
            placeholder="Sponsor Ismi"
            class="border border-neutral-300 rounded-sm p-2"
            onInput={(e) => setSponsor({ ...sponsor(), name: e.currentTarget.value })}
            value={sponsor().name}
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-neutral-700">Sponsor Adresi</label>
          <textarea
            placeholder="Sponsor Adresi"
            class="border border-neutral-300 rounded-sm p-2 h-[150px]"
            onInput={(e) => setSponsor({ ...sponsor(), address: e.currentTarget.value })}
            value={sponsor().address}
          />
        </div>
        <div class="flex flex-row gap-4 items-center justify-between">
          <div class="flex flex-row gap-2 w-full">
            <button
              class="border border-red-300 rounded-sm text-red-500 px-2 py-1 gap-2.5 flex flex-row items-center justify-center disabled:bg-neutral-200 disabled:text-neutral-600"
              disabled={removeSponsor.isLoading}
              onClick={async () => {
                const x = await removeSponsor.mutateAsync();
                if (x.deletedAt) {
                  setIsOpen(false);
                }
              }}
            >
              <Show
                when={removeSponsor.isLoading}
                fallback={
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
                }
              >
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
              </Show>
              <span class="font-bold">Sil</span>
            </button>
          </div>
          <div class="flex flex-row gap-2.5">
            <button class="border border-neutral-300 rounded-sm px-2 py-1" onClick={() => setIsOpen(false)}>
              <span class="font-bold">İptal</span>
            </button>
            <button
              class="bg-blue-700 text-white px-2 py-1 rounded-sm flex flex-row items-center justify-center gap-2.5 disabled:bg-neutral-200 disabled:text-neutral-600"
              onClick={async () => {
                const sp = sponsor();
                if (!sp.name || !sp.address) {
                  // console.log("invalid", sp);
                  return;
                }
                const x = await updateSponsor.mutateAsync(sp);
                if (x.updatedAt) {
                  setIsOpen(false);
                }
              }}
              disabled={updateSponsor.isLoading || !sponsor().name || !sponsor().address}
            >
              <Show
                when={updateSponsor.isLoading}
                fallback={
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
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                }
              >
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
              </Show>
              <span class="font-bold">Kaydet</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

const EditDonationModal = (props: { donation: Sponsor.Frontend["donations"][number]; trigger: JSX.Element }) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [user] = useAuth();
  const queryClient = useQueryClient();

  const [donation, setDonation] = createSignal<Parameters<typeof Mutations.Sponsors.updateDonation>[2]>({
    id: props.donation.id,
    currency: props.donation.currency,
    amount: props.donation.amount,
    year: props.donation.year,
  });

  const updateDonation = createMutation(
    (data: Parameters<typeof Mutations.Sponsors.updateDonation>[2]) => {
      const token = user().token;
      if (!token) return Promise.reject("No token found. Please login first.");
      return Mutations.Sponsors.updateDonation(token, props.donation.sponsorId, data);
    },
    {
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(["sponsors"]);
      },
    }
  );

  const removeDonation = createMutation(
    () => {
      const token = user().token;
      if (!token) return Promise.reject("No token found. Please login first.");
      return Mutations.Sponsors.removeDonation(token, props.donation.sponsorId, props.donation.id);
    },
    {
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(["sponsors"]);
      },
    }
  );

  return (
    <Modal title="Bağış Düzenle" trigger={props.trigger} open={isOpen()} onOpenChange={setIsOpen}>
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-neutral-700">Bağış Para</label>
          <input
            type="number"
            placeholder="Bağış Para"
            class="border border-neutral-300 rounded-sm p-2"
            onInput={(e) => setDonation({ ...donation(), amount: Number(e.currentTarget.value) })}
            value={donation().amount}
          />
          <Select.Root
            placeholder="Para Birimi"
            name="currency"
            placement="bottom-start"
            required
            options={["CHF", "EUR"]}
            value={donation().currency}
            onChange={(value) => setDonation({ ...donation(), currency: value })}
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
                    fill="currentColor"
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
                  fill="currentColor"
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
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-neutral-700">Bağış Sene</label>
          <Select.Root
            placeholder="Bağış Sene"
            name="currency"
            placement="bottom-start"
            required
            options={
              // last 5 years and next 5 years
              Array.from({ length: 11 }, (_, i) => dayjs().year() - 5 + i)
            }
            value={donation().year}
            onChange={(value) => setDonation({ ...donation(), year: value })}
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
                    fill="currentColor"
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
                  fill="currentColor"
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
        </div>
        <div class="flex flex-row gap-4 items-center justify-between">
          <div class="flex flex-row gap-2 w-full">
            <button
              class="border border-red-300 rounded-sm text-red-500 px-2 py-1 gap-2.5 flex flex-row items-center justify-center disabled:bg-neutral-200 disabled:text-neutral-600"
              disabled={removeDonation.isLoading}
              onClick={async () => {
                const x = await removeDonation.mutateAsync();
                if (x.deletedAt) {
                  setIsOpen(false);
                }
              }}
            >
              <Show
                when={removeDonation.isLoading}
                fallback={
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
                }
              >
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
              </Show>
              <span class="font-bold">Sil</span>
            </button>
          </div>
          <div class="flex flex-row gap-2.5">
            <button
              class="border border-neutral-300 rounded-sm px-2 py-1 gap-2.5 flex flex-row items-center justify-center disabled:bg-neutral-200 disabled:text-neutral-600"
              onClick={() => setIsOpen(false)}
            >
              <span class="font-bold">İptal</span>
            </button>
            <button
              class="bg-blue-700 text-white px-2 py-1 rounded-sm flex flex-row items-center justify-center gap-2.5 disabled:bg-neutral-200 disabled:text-neutral-600"
              onClick={async () => {
                const dn = donation();
                if (!dn.currency || !dn.amount || !dn.year) {
                  // console.log("invalid", dn);
                  return;
                }
                const x = await updateDonation.mutateAsync(dn);
                if (x.updatedAt) {
                  setIsOpen(false);
                }
              }}
              disabled={updateDonation.isLoading || !donation().currency || !donation().amount || !donation().year}
            >
              <Show
                when={updateDonation.isLoading}
                fallback={
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
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                }
              >
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
              </Show>
              <span>Kaydet</span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default function SponsorlarPage() {
  const [user] = useAuth();

  const sponsors = createQuery(
    () => ["sponsors"],
    () => {
      const token = user().token;
      if (!token) return Promise.reject("No token found. Please login first.");
      return Queries.Sponsors.all(token);
    },
    {
      get enabled() {
        return user().isAuthenticated;
      },
    }
  );

  const [search, setSearch] = createSignal("");

  const filteredSponsors = (s: NonNullable<typeof sponsors.data>) => {
    const searchValue = search().toLowerCase();
    if (!searchValue) return s;
    return s.filter((sponsor) => sponsor.name.toLowerCase().includes(searchValue));
  };

  return (
    <div class="container mx-auto py-10 flex flex-col gap-6">
      <div class="flex flex-row items-center justify-between">
        <h1 class="text-3xl font-bold">Sponsorlar</h1>
        <div class="flex flex-row gap-4">
          <input
            type="text"
            placeholder="Sponsor Ara"
            class="border border-neutral-300 rounded-sm px-2 py-1"
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
          />
          <NewSponsorModal />
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Switch
          fallback={
            <div class="col-span-full w-full flex flex-col items-center justify-center gap-4 bg-neutral-100 rounded-sm py-20 border border-neutral-200">
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
              <span class="text-xl font-bold">Yükleniyor...</span>
            </div>
          }
        >
          <Match when={sponsors.isSuccess && sponsors.data !== undefined && filteredSponsors(sponsors.data)}>
            {(sps) => (
              <For
                each={sps()}
                fallback={
                  <div class="col-span-full w-full flex flex-col items-center justify-center gap-4 bg-neutral-100 rounded-sm py-20 border border-neutral-200">
                    <span class="text-md font-medium text-neutral-600 select-none">Sponsorlar bulunamadı</span>
                  </div>
                }
              >
                {(sponsor) => (
                  <div class="flex flex-col gap-2 border border-neutral-300 rounded-sm p-4">
                    <div class="w-full flex flex-row gap-2.5 items-center justify-between">
                      <div class="w-full">
                        <span class="text-lg font-bold">{sponsor.name}</span>
                      </div>
                      <div class="flex flex-row gap-2.5">
                        <EditSponsorModal sponsor={sponsor} />
                        <CreatePDFModal sponsor={sponsor} />
                      </div>
                    </div>
                    <div class="flex flex-col gap-2">
                      <span class="text-sm font-medium text-neutral-700">Adres</span>
                      <div class="text-sm text-neutral-600">
                        {sponsor.address.split("\n").map((line) => (
                          <span class="block">{line}</span>
                        ))}
                      </div>
                    </div>
                    <span class="text-sm font-medium text-neutral-700">Bağışlar</span>
                    <div class="flex flex-col gap-6">
                      <div class="flex flex-col gap-2">
                        <Show when={sponsor.donations !== undefined && sponsor.donations}>
                          {(donations) => (
                            <For
                              each={donations()}
                              fallback={
                                <div class="flex flex-col gap-4 border border-neutral-200 rounded-sm bg-neutral-100 overflow-clip p-4 items-center justify-center">
                                  <span class="text-md font-medium text-neutral-600">Bağış bulunamadı</span>
                                  <NewDonationModal sponsorID={sponsor.id} />
                                </div>
                              }
                            >
                              {(donation) => (
                                <EditDonationModal
                                  donation={donation}
                                  trigger={
                                    <div class="flex flex-row gap-2 border border-neutral-200 rounded-sm bg-neutral-100 overflow-clip">
                                      <div class="w-full flex flex-row items-center justify-between">
                                        <span class="flex text-lg h-full font-medium px-6 py-2 bg-black text-white items-center justify-between">
                                          {donation.year}
                                        </span>
                                        <div class="flex flex-col gap-0.5 items-end px-2 py-1">
                                          <span class="text-lg font-medium text-neutral-600">
                                            {donation.amount} {donation.currency}
                                          </span>
                                          <span class="text-sm">
                                            Son Ekliyen kişi:{" "}
                                            {donation.updatedBy ? donation.updatedBy?.name : donation.createdBy?.name}
                                          </span>
                                          <span class="text-sm">
                                            {dayjs(donation.updatedAt || donation.createdAt)
                                              .locale("tr")
                                              .format("Do MMMM YYYY HH:mm")}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  }
                                />
                              )}
                            </For>
                          )}
                        </Show>
                      </div>
                      <Show when={sponsor.donations.length > 0}>
                        <NewDonationModal sponsorID={sponsor.id} />
                      </Show>
                    </div>
                  </div>
                )}
              </For>
            )}
          </Match>
        </Switch>
      </div>
    </div>
  );
}
