import { A } from "@solidjs/router";
import { For, Show } from "solid-js";
import Logo from "../components/Logo";
import { cn } from "../utils/cn";

interface Option {
  label: string;
  href: string;
  disabled: boolean;
}
const selections: Option[] = [
  {
    href: "/sponsors",
    label: "Sponsorlar",
    disabled: false,
  },
  {
    href: "/donations",
    label: "Bağışlar",
    disabled: true,
  },
  {
    href: "/income",
    label: "Gelirler",
    disabled: true,
  },
  {
    href: "/expenses",
    label: "Giderler",
    disabled: true,
  },
];

export default function Home() {
  return (
    <div class="flex container mx-auto flex-col gap-10 py-10">
      <div class="flex flex-col gap-10">
        <div class="flex flex-row items-center justify-center py-10">
          <Logo />
        </div>
        <div class="flex flex-col gap-4 items-center justify-center">
          <span class="text-2xl font-medium">
            Bu site, Çiftlik Vakıf'ın PDFleri yayınlamak için kullandığı bir araçtır.
          </span>
          <span class="text-lg font-medium select-none">
            Çiftlik Vakıf'ın sitesine{" "}
            <A class="text-blue-500 hover:underline" href="https://ciftlik.ch">
              buradan
            </A>{" "}
            ulaşabilirsiniz.
          </span>
        </div>
      </div>
      <div class="max-w-[600px] w-full mx-auto flex flex-col gap-10 py-10">
        <div class="flex flex-col gap-4">
          <div class="w-max">
            <span class="text-2xl font-medium">PDFler</span>
          </div>
          <div class="flex flex-col gap-2">
            <For each={selections}>
              {(selection) => (
                <Show when={!selection.disabled} fallback={<></>}>
                  <A
                    href={selection.href}
                    class={cn(
                      "p-10 rounded-sm border border-neutral-300 flex flex-col gap-2.5 items-center justify-center",
                      {
                        "disabled:opacity-50 disabled:cursor-not-allowed": selection.disabled,
                      }
                    )}
                  >
                    {selection.label}
                  </A>
                </Show>
              )}
            </For>
          </div>
        </div>
      </div>
    </div>
  );
}
