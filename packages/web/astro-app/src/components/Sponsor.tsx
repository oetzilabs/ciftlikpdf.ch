import { Select, Skeleton } from "@kobalte/core";
import { For, Show, createEffect, createSignal } from "solid-js";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import "dayjs/locale/de";
import "dayjs/locale/tr";
import "dayjs/locale/fr";
dayjs.extend(advancedFormat);
dayjs.extend(localizedFormat);
import { jsPDF } from "jspdf";
import { sponsorAtom } from "../utils/stores";
import type { Sponsor } from "../../../../core/src/entities/sponsors";

const translations = {
  yourDonoOurThank: {
    de: "Ihre Spende - unser Dank!",
    fr: "Votre don - notre remerciement!",
    tr: "Bagisiniz - tesekkurumuz!",
  },
  greetings: {
    de: (name: string) => `Sehr geehrte/r ${name},`,
    fr: (name: string) => `Cher ${name},`,
    tr: (name: string) => `Sayin ${name},`,
  },
  main: {
    de: `Sie haben unserer Stiftung in diesem Jahr eine Spende zukommen lassen - dafür möchten wir Ihnen herzlichst danken. Durch Ihre Unterstützung konnten wir in unserem Dorf "Ciftlik-Köyü" viele wertvolle Hilfe leisten und die Struktur unserer Stiftung stärken. Dank Ihnen und vielen weiteren Spendenden konnten wir zum Beispiel den Schulhof im Dorfkern errichten, mehreren ärmeren Familien einen Schulbesuch der Kinder ermöglichen und einen Aufseher für unser Dorf engagieren.`,
    fr: `Vous avez fait un don à notre fondation cette année - nous vous en remercions chaleureusement. Grâce à votre soutien, nous avons pu apporter une aide précieuse à notre village "Ciftlik-Köyü" et renforcer la structure de notre fondation. Grâce à vous et à de nombreux autres donateurs, nous avons pu construire la cour de récréation au centre du village, permettre à plusieurs familles pauvres de scolariser leurs enfants et engager un surveillant pour notre village.`,
    tr: `Bu yil vakfimiza bagis yaptiginiz icin tesekkur ederiz. Desteginizle Ciftlik Koyu'nde bir cok faydali yardimlarda bulunduk ve vakfimizin yapisi guclendirdik. Sizin ve bircok bagiscinin yardimiyla, ornegin koy merkezindeki okul bahcesini insa ettik, bir cok fakir ailenin cocuklarinin okula gitmesini sagladik ve koyumuz icin bir bekci tuttuk.`,
  },
  receival: {
    de: (value: string, currency: string) =>
      `Gerne bestätigen wir hiermit Ihre Spende für das Jahr 2023 von Total: <strong>${value} ${currency}</strong>.`,
    fr: (value: string, currency: string) =>
      `Nous confirmons par la présente votre don pour l'année 2023 de Total: <strong>${value} ${currency}</strong>.`,
    tr: (value: string, currency: string) =>
      `2023 yili icin yaptiginiz toplam <strong>${value} ${currency}</strong> bagisinizi bu vesileyle onayliyoruz.`,
  },
  thanks: {
    de: `Im Namen unseres Dorfes und unserer Stiftung bedanken wir uns herzlichst für Ihre Spende und
    freuen uns weiterhin auf Ihre wertvolle Unterstützung.`,
    fr: `Au nom de notre village et de notre fondation, nous vous remercions chaleureusement pour votre don et nous réjouissons de votre précieux soutien.`,
    tr: `Koyumuz ve vakfimiz adina bagisiniz icin tesekkur eder, degerli desteginizi bekleriz.`,
  },
  goodbye: {
    de: `Mit freundlichen Grüssen`,
    fr: `Avec nos meilleures salutations`,
    tr: `Saygilarimizla`,
  },
};

interface LanguageOption {
  value: "tr" | "fr" | "de";
  label: string;
  disabled?: boolean;
}

export function Sponsor() {
  const [sponsor, setSponsor] = createSignal<Sponsor.Frontend | undefined>();
  const [year, setYear] = createSignal<number | undefined>();
  sponsorAtom.subscribe((s) => {
    setSponsor(s?.[0]);
    setYear(s?.[1]);
  });
  const [language, setLanguage] = createSignal<LanguageOption>({
    label: "Türkçe",
    value: "tr",
    disabled: false,
  });
  let pdfRef: HTMLDivElement;
  const createPdf = (sponsorName?: string) => {
    if (!sponsorName) return;
    if (!pdfRef) return;
    const cleanName = sponsorName?.replace(/[^a-zA-Z0-9]/g, "-") ?? "sponsor";
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "pt",
      format: "a3",
    });
    pdf.html(pdfRef, {
      callback: (doc) => {
        doc.save(`${cleanName}-${year()}.pdf`);
      },
    });
  };
  const theDonation = () => {
    return sponsor()?.donations.find((d) => d.year === year());
  };

  const languageOptions: LanguageOption[] = [
    { value: "tr", label: "Türkçe" },
    { value: "de", label: "Deutsch" },
    { value: "fr", label: "Français" },
  ];

  return (
    <div class="w-full flex flex-col gap-2">
      <div class="flex flex-row gap-4 items-center justify-between">
        <div class="flex flex-row gap-4 w-max">
          <div class="flex flex-row gap-4 w-max items-center">
            <Select.Root<LanguageOption>
              placeholder="Dil Secin"
              placement="bottom-start"
              required
              options={languageOptions}
              value={language()}
              optionValue="value"
              optionTextValue="label"
              onChange={(value) => setLanguage(value)}
              disallowEmptySelection={false}
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
        <div class="flex flex-row items-center justify-center">
          <button
            class="border border-gray-300 rounded-md px-3 py-1 bg-black dark:bg-white dark:text-black text-white w-max outline-none text-sm font-medium flex flex-row items-center gap-2 print:border-0 print:shadow-none"
            onClick={() => {
              createPdf(sponsor()?.name);
            }}
          >
            <span>PDF Olustur</span>
          </button>
        </div>
      </div>
      <div class="flex flex-col gap-4 w-full">
        {/* here we are going to show a pdf preview with custom texts */}
        <div class="flex flex-col gap-4 bg-white border border-neutral-300 mx-auto *:text-black shadow-sm font-[Arial]">
          <div class="relative flex flex-col gap-4 w-[210mm] h-[297mm] py-14 px-20" ref={pdfRef!}>
            <div class="absolute top-0 right-0 px-20 py-8">
              <img src="/ciftlik-logo.jpeg" width="150px"></img>
            </div>
            <div class="flex flex-col items-center justify-center text-[9pt]">
              <span>Ciftlik Köyü Sosyal Dayanisma Vakfi</span>
              <span>Stiftung für Unterstützung von Ciftlik- Dorf</span>
              <span>Längistrasse 11 - 4133 Pratteln</span>
              <span>www.ciftlik.ch</span>
            </div>
            <div class="flex flex-row gap-4 items-center justify-between">
              <Show when={sponsor() && sponsor()} fallback={
                <Skeleton.Root class="flex flex-col gap-1">
                  <div class="w-[120px] h-[16px] bg-neutral-300 rounded-md"></div>
                  <div class="w-[200px] h-[16px] bg-neutral-300 rounded-md"></div>
                  <div class="w-[80px] h-[16px] bg-neutral-300 rounded-md"></div>
                  <div class="w-[100px] h-[16px] bg-neutral-300 rounded-md"></div>
                </Skeleton.Root>
              }>
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
              <div>
                {dayjs()
                  .locale(language().value)
                  .format(
                    language().value === "tr"
                      ? "D. MMMM YYYY"
                      : language().value === "de"
                        ? "D. MMMM YYYY"
                        : "D MMMM YYYY"
                  )}
              </div>
            </div>
            <div class="flex flex-row gap-4 items-center justify-between">
              <div class="text-[11pt] font-bold">{translations.yourDonoOurThank[language().value]}</div>
              <div></div>
            </div>
            <div class="flex flex-col gap-2">
              <Show when={sponsor() && sponsor()} fallback={
                <Skeleton.Root class="flex flex-col gap-1">
                  <div class="w-[80px] h-[16px] bg-neutral-300 rounded-md"></div>
                </Skeleton.Root>
              }>
                {(s) => (
                  <div class="text-[11pt]">{translations.greetings[language().value](s().name)}</div>
                )}
              </Show>

              <div class="text-[11pt] text-justify">{translations.main[language().value]}</div>
              <div class="text-[11pt]"></div>
              <div class="text-[11pt]"></div>

              <div class="text-[11pt]">
                <Show when={theDonation() && theDonation()} fallback={
                  <Skeleton.Root class="flex flex-col gap-1">
                    <div class="w-full h-[16px] bg-neutral-300 rounded-md"></div>
                  </Skeleton.Root>
                }>
                  {(d) => (
                    <div
                      innerHTML={translations.receival[language().value](
                        d().amount.toLocaleString("de-CH", { minimumFractionDigits: 2 }),
                        d().currency
                      )}
                    ></div>
                  )}
                </Show>
              </div>
              <div class="text-[11pt]"></div>
              <div class="text-[11pt]"></div>
              <div class="text-[11pt]">{translations.thanks[language().value]}</div>
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
