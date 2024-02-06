import { Select, Skeleton } from "@kobalte/core";
import { For, Show, createSignal } from "solid-js";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/de";
import "dayjs/locale/tr";
import "dayjs/locale/fr";
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat);
import { jsPDF } from "jspdf";
import { qC, sponsorAtom } from "../utils/stores";
import type { Sponsor as Sp } from "../../../../core/src/entities/sponsors";
import { createMutation } from "@tanstack/solid-query";
import { cn } from "../utils/cn";
import { Mutations } from "../utils/mutations";
import { languages, translations } from "../utils/translations";
import type { LanguageOption } from "../utils/translations";
import { Tanstack } from "../utils/providers";

export const Sponsor = (props: { language?: string; API_URL: string }) => (
  <Tanstack>
    <SponsorView language={props.language} API_URL={props.API_URL} />
  </Tanstack>
);

function SponsorView(props: { language?: string; API_URL: string }) {
  const [sponsor, setSponsor] = createSignal<Sp.Frontend | undefined>();
  const [year, setYear] = createSignal<number | undefined>();
  sponsorAtom.subscribe((s) => {
    setSponsor(s?.[0]);
    setYear(s?.[1]);
  });
  const [language, setLanguage] = createSignal<LanguageOption>(
    props.language ? languages.find((l) => l.value === props.language) ?? languages[0] : languages[0],
  );
  let pdfRef: HTMLDivElement;

  const createPdf = createMutation(() => ({
    mutationFn: async (sponsorName?: string) => {
      if (!sponsorName) return;
      if (!pdfRef) return;
      const cleanName = sponsorName?.replace(/[^a-zA-Z0-9]/g, "-") ?? "sponsor";
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "pt",
        format: "a3",
        compress: true,
      });
      pdf.setFontSize(10);
      await pdf.html(pdfRef, {
        callback: (doc) => {
          doc.save(`${cleanName}-${year()}.pdf`);
        },
      });
    },
    mutationKey: ["createPdf"],
  }));

  const removeDonation = createMutation(() => ({
    mutationFn: async () => {
      const spo = sponsor();
      const yea = year();
      if (!spo || !yea) return;
      const donation = spo.donations.find((d) => d.year === year());
      if (!donation) return;
      return Mutations.Donations.remove(props.API_URL, spo.id, donation.id);
    },
    mutationKey: ["removeDonation"],
    onSuccess: () => {
      qC.invalidateQueries({
        queryKey: ["sponsors"],
      });
      sponsorAtom.set(undefined);
    },
    onError: () => {
      setTimeout(() => {
        removeDonation.reset();
      }, 5000);
    },
  }));

  const theDonation = () => {
    return sponsor()?.donations.find((d) => d.year === year());
  };

  const languageOptions: LanguageOption[] = [
    { value: "tr", label: "Türkçe" },
    { value: "de", label: "Deutsch" },
    { value: "fr", label: "Français" },
  ];

  return (
    <div class="w-full flex-col gap-2 flex">
      <div class="flex flex-row gap-4 items-center justify-between">
        <div class="flex flex-row gap-4 w-max">
          <div class="flex flex-row gap-4 w-max items-center">
            <Select.Root<LanguageOption>
              placeholder="Dil Secin"
              placement="bottom-start"
              required
              options={languageOptions}
              disallowEmptySelection
              value={language()}
              optionValue="value"
              optionTextValue="label"
              onChange={(value) => {
                setLanguage(value);
                document.cookie = `language=${value.value}; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/`;
              }}
              itemComponent={(props) => (
                <Select.Item
                  item={props.item}
                  class="flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium select-none min-w-[150px] items-center justify-between"
                >
                  <Select.ItemLabel>{props.item.textValue}</Select.ItemLabel>
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
                <div class="p-2 py-1 w-full rounded-md border border-neutral-200 dark:border-neutral-800 flex flex-row gap-2 items-center justify-center bg-white dark:bg-black shadow-sm">
                  <Select.Value<LanguageOption> class="font-bold select-none capitalize">
                    {(state) => state.selectedOption().label}
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
        </div>
        <div class="flex flex-row gap-4 w-max">
          <button
            class={cn(
              "border border-red-300 rounded-md px-3 py-1 bg-red-500 text-white w-max text-sm font-medium flex flex-row items-center gap-2 print:border-0 print:shadow-none",
              {
                "opacity-50 cursor-not-allowed": !sponsor() || !year(),
              },
            )}
            disabled={!sponsor() || !year() || removeDonation.isPending}
            onClick={async () => {
              const confirmed = confirm("Are you sure you want to remove this donation?");
              if (!confirmed) return;
              await removeDonation.mutateAsync();
            }}
          >
            <span>Bagis Sil</span>
          </button>
        </div>
        <div class="flex flex-row items-center justify-center">
          <button
            class={cn(
              "border border-gray-300 rounded-md px-3 py-1 bg-black dark:bg-white dark:text-black text-white w-max outline-none text-sm font-medium flex flex-row items-center gap-2 print:border-0 print:shadow-none",
              {
                "opacity-50 cursor-not-allowed": !sponsor() || !year(),
              },
            )}
            disabled={!sponsor() || !year() || createPdf.isPending || removeDonation.isPending}
            onClick={async () => {
              await createPdf.mutateAsync(sponsor()?.name);
            }}
          >
            <span>PDF Olustur</span>
          </button>
        </div>
      </div>
      <div class=" flex-col gap-4 w-full hidden md:flex">
        {/* here we are going to show a pdf preview with custom texts */}
        <div class="flex flex-col gap-4 bg-white border border-neutral-300 mx-auto shadow-sm ">
          <div
            class="relative flex flex-col gap-4 w-[210mm] h-[297mm] py-14 px-20 text-black font-[Helvetica]"
            ref={pdfRef!}
          >
            <div class="absolute top-0 right-0 px-20 py-8">
              <img src="/ciftlik-logo.jpeg" width="150px"></img>
            </div>
            <div class="flex flex-col items-center justify-center text-[9pt]">
              <span>Ciftlik Köyü Sosyal Dayanisma Vakfi</span>
              <span>Stiftung für Unterstützung von Ciftlik Dorf</span>
              <span>Längistrasse 11 - 4133 Pratteln</span>
              <span>www.ciftlik.ch</span>
            </div>
            <div class="flex flex-row gap-4 items-center justify-between">
              <Show
                when={sponsor() && sponsor()}
                fallback={
                  <Skeleton.Root class="flex flex-col gap-1">
                    <div class="w-[120px] h-[16px] bg-neutral-300 rounded-md"></div>
                    <div class="w-[200px] h-[16px] bg-neutral-300 rounded-md"></div>
                    <div class="w-[80px] h-[16px] bg-neutral-300 rounded-md"></div>
                    <div class="w-[100px] h-[16px] bg-neutral-300 rounded-md"></div>
                  </Skeleton.Root>
                }
              >
                {(s) => (
                  <div class="flex flex-col">
                    <div class="text-[11pt] font-bold">{s().name}</div>
                    <For each={s().address.split("\n")}>{(a) => <div class="text-[10pt]">{a}</div>}</For>
                  </div>
                )}
              </Show>
              <div></div>
            </div>
            <div class="flex flex-row gap-4 items-center justify-between">
              <div></div>
              <div class="w-max text-[11pt]">
                {dayjs()
                  .locale(language().value)
                  .format(
                    language().value === "tr"
                      ? "Do MMMM YYYY"
                      : language().value === "de"
                        ? "Do MMMM YYYY"
                        : "Do MMMM YYYY",
                  )}
              </div>
            </div>
            <div class="flex flex-row gap-4 items-center justify-between">
              <div class="text-[11pt] font-bold">{translations.yourDonoOurThank[language().value]}</div>
              <div></div>
            </div>
            <div class="flex flex-col gap-2">
              <Show
                when={sponsor() && sponsor()}
                fallback={
                  <Skeleton.Root class="flex flex-col gap-1">
                    <div class="w-[80px] h-[16px] bg-neutral-300 rounded-md"></div>
                  </Skeleton.Root>
                }
              >
                {(s) => <div class="text-[11pt]">{translations.greetings[language().value](s().name)}</div>}
              </Show>

              <div class="text-[11pt] text-justify">{translations.main[language().value]}</div>
              <div class="text-[11pt]"></div>
              <div class="text-[11pt]"></div>

              <div class="text-[11pt]">
                <Show
                  when={theDonation() && theDonation()}
                  fallback={
                    <Skeleton.Root class="flex flex-col gap-1">
                      <div class="w-full h-[16px] bg-neutral-300 rounded-md"></div>
                    </Skeleton.Root>
                  }
                >
                  {(d) => (
                    <div
                      innerHTML={translations.receival[language().value](
                        d().amount.toLocaleString("de-CH", { minimumFractionDigits: 2 }),
                        d().currency,
                        d().year,
                      )}
                    ></div>
                  )}
                </Show>
              </div>
              <div class="text-[11pt]"></div>
              <div class="text-[11pt]"></div>
              <div class="text-[11pt] text-justify">{translations.thanks[language().value]}</div>
              <div class="text-[11pt]"></div>
              <div class="text-[11pt]"></div>
              <div class="text-[11pt]">{translations.goodbye[language().value]}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
