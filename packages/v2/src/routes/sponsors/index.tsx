import { getAuthenticatedSession } from "@/data/auth";
import { getAllSponsors } from "@/data/sponsors";
import { A, createAsync, revalidate, RouteDefinition, useAction, useSubmission } from "@solidjs/router";
import { Show, Suspense } from "solid-js";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/DataTable";
import { sponsorColumns } from "@/components/SponsorColumns";
import { ArrowLeft, DownloadCloud, Plus, RotateCcw, Upload } from "lucide-solid";
import type { Sponsor } from "@ciftlikpdf/core/src/entities/sponsors";
import dayjs from "dayjs";
import { createSponsorBatchAction } from "../../actions/sponsors";
import { z } from "zod";

export const route = {
  preload: async () => {
    const session = await getAuthenticatedSession();
    const sponsors = await getAllSponsors();
    return { sponsors, session };
  },
} satisfies RouteDefinition;

export default function Home() {
  const session = createAsync(() => getAuthenticatedSession());
  const allSponsors = createAsync(() => getAllSponsors());

  const createBackup = async (sponsors: Sponsor.Frontend[]) => {
    const seperator = ";";
    const csv_header = ["id", "name", "address", "year", "amount", "currency", "createdAt"].join(seperator);
    const csv = sponsors.map((s) => {
      const donations = s.donations
        .map((d) => [d.year, d.amount, d.currency, dayjs(d.createdAt).toISOString()].join(seperator))
        .flat();
      return [s.id, s.name, s.address.replaceAll("\n", " "), ...donations].join(seperator);
    });
    const result = [csv_header, ...csv].join("\n");
    const blob = new Blob([result], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `sponsors_${dayjs().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const createSponsorBatch = useAction(createSponsorBatchAction);
  const submission = useSubmission(createSponsorBatchAction);

  const importBackup = async (file: File) => {
    const reader = new FileReader();
    type Sps = {
      id: string;
      name: string;
      address: string;
      donations: {
        year: number;
        amount: number;
        currency: "CHF" | "EUR";
        createdAt: Date;
      }[];
    };
    reader.onload = async (e) => {
      if (!e.target) return;
      if (!e.target.result) return;
      const lines = e.target.result.toString().split("\n");
      const sponsors_map = new Map<string, Sps>();
      for (const line of lines) {
        const [id, name, address, year, amount, currency, createdAt] = line.split(";");
        // skip first line
        if (id === "id") continue;
        const sps = sponsors_map.get(id);
        if (!sps) {
          if (!year || !amount || !currency || !createdAt) {
            sponsors_map.set(id, {
              id,
              name,
              address,
              donations: [],
            });
            continue;
          }
          const c = z.enum(["CHF", "EUR"]).safeParse(currency.toUpperCase());
          if (!c.success) {
            sponsors_map.set(id, {
              id,
              name,
              address,
              donations: [],
            });
            continue;
          }
          const d = {
            year: parseInt(year),
            amount: parseFloat(amount),
            currency: c.data,
            createdAt: dayjs(createdAt).toDate(),
          };
          sponsors_map.set(id, {
            id,
            name,
            address,
            donations: [d],
          });
        } else {
          const c = z.enum(["CHF", "EUR"]).safeParse(currency.toUpperCase());
          if (!c.success) {
            console.log("Invalid currency");
            continue;
          }
          const d = {
            year: parseInt(year),
            amount: parseFloat(amount),
            currency: c.data,
            createdAt: dayjs(createdAt).toDate(),
          };
          console.log(d);
          sps.donations.push(d);
          console.log(sps);
          sponsors_map.set(id, sps);
        }
      }
      const sponsors = Array.from(sponsors_map.values());
      await createSponsorBatch(sponsors);
      await revalidate(getAllSponsors.key);
    };
    reader.readAsText(file);
  };

  let backupInput: HTMLInputElement | undefined;

  return (
    <main class="mx-auto p-4 pt-20 container flex flex-col gap-4">
      <div class="w-full flex flex-row items-center gap-2">
        <Button as={A} href={`/`} size="sm" class="flex flex-row items-center gap-2">
          <ArrowLeft class="size-4" />
          Geri
        </Button>
      </div>
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
        <div class="flex flex-col w-full gap-2">
          <div class="flex flex-row items-center justify-between gap-2">
            <h1 class="text-2xl font-bold">Sponsorlar</h1>
            <div class="flex flex-row gap-2 items-center justify-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => await revalidate(getAllSponsors.key)}
                class="px-3 md:px-4 flex flex-row items-center gap-2"
              >
                <RotateCcw class="size-5" />
                <span class="sr-only md:not-sr-only">Tekrar yükle</span>
              </Button>
              <Button as={A} href="/sponsors/create" size="sm" class="px-3 md:px-4 flex flex-row items-center gap-2">
                <Plus class="size-5" />
                <span class="sr-only md:not-sr-only">Sponsor oluştur</span>
              </Button>
            </div>
          </div>
          <Suspense fallback="Sponsorlar yükleniyor...">
            <Show
              when={allSponsors()}
              fallback={
                <span>
                  Şu anda sponsor yok, lütfen yeniden yükleyin veya{" "}
                  <A href="/sponsors/create">yeni bir sponsor ekleyin</A>
                </span>
              }
            >
              {(sponsors) => (
                <div class="w-full flex flex-col gap-4">
                  <div class="w-full border border-neutral-200 dark:border-neutral-800 rounded-md min-h-[calc(50svh)] flex flex-col overflow-clip">
                    <DataTable columns={sponsorColumns} data={sponsors} searchBy="name" />
                  </div>
                  <div class="flex flex-row gap-2">
                    <Button
                      size="sm"
                      class="px-3 md:px-4 flex flex-row gap-2 w-max"
                      onClick={() => createBackup(sponsors())}
                    >
                      <DownloadCloud class="size-4" />
                      <span class="sr-only md:not-sr-only">Backup</span>
                    </Button>
                    <input
                      type="file"
                      accept=".csv"
                      class="hidden"
                      disabled={submission.pending}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        await importBackup(file);
                        await revalidate(getAllSponsors.key);
                      }}
                      ref={backupInput!}
                    />
                    <Button
                      size="sm"
                      class="px-3 md:px-4 flex flex-row gap-2 w-max"
                      onClick={() => {
                        backupInput?.click();
                      }}
                      disabled={submission.pending}
                    >
                      <Upload class="size-4" />
                      <span class="sr-only md:not-sr-only">Import</span>
                    </Button>
                  </div>
                </div>
              )}
            </Show>
          </Suspense>
        </div>
      </Show>
    </main>
  );
}
