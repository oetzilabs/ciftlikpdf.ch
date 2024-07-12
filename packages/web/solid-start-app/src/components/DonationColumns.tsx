import { deleteDonationAction } from "@/actions/sponsors";
import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getSponsor } from "@/data/sponsors";
import type { Sponsor } from "@ciftlikpdf/core/src/entities/sponsors";
import type { User } from "@ciftlikpdf/core/src/entities/users";
import { A, revalidate, useAction, useSubmission } from "@solidjs/router";
import type { ColumnDef } from "@tanstack/solid-table";
import dayjs from "dayjs";
import germanLocale from "dayjs/locale/de";
import frenchLocale from "dayjs/locale/fr";
import turkishLocale from "dayjs/locale/tr";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { DownloadCloud, Loader2, Pen, Trash } from "lucide-solid";
import { createSignal, Match, Switch } from "solid-js";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
dayjs.extend(advancedFormat);

export const donationColumns = [
  {
    accessorKey: "year",
    header(props) {
      return <span class="capitalize">Sene</span>;
    },
    cell(props) {
      return <span>{dayjs().set("year", props.getValue<number>()).format("YYYY")}</span>;
    },
  },
  {
    accessorKey: "amount",
    header(props) {
      return <span class="capitalize">Miktar</span>;
    },
    cell(props) {
      return <span class="capitalize font-bold">{props.getValue<number>()}</span>;
    },
  },
  {
    accessorKey: "currency",
    header(props) {
      return <span class="capitalize">Para Birimi</span>;
    },
    cell(props) {
      const d = props.getValue<string>();
      return <span class="capitalize font-bold">{d === "CHF" ? "CHF" : d === "EUR" ? "EUR" : "???"}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header(props) {
      return <span class="capitalize">Eklendi Tarihi</span>;
    },
    cell(props) {
      return <Badge variant="outline">{dayjs(props.getValue<Date>()).format("DD.MM.YYYY")}</Badge>;
    },
  },
  {
    accessorKey: "createdBy",
    header(props) {
      return <span class="capitalize">Oluşturan</span>;
    },
    cell(props) {
      return <Badge variant="secondary">{props.getValue<User.Frontend>()?.name ?? "???"}</Badge>;
    },
  },
  {
    id: "actions",
    header(props) {
      return <span class="capitalize">Eylemler</span>;
    },
    size: 200,
    cell(props) {
      const [openDeleteDialog, setOpenDeleteDialog] = createSignal(false);
      const donation = props.row.original;

      const deleteDonation = useAction(deleteDonationAction);
      const deleteDonationState = useSubmission(deleteDonationAction);

      const [isCreatingPDF, setIsCreatingPDF] = createSignal<"tr" | "de" | "fr" | false>(false);

      const generatePDF = async (donation: Sponsor.Frontend["donations"][number], language: "tr" | "de" | "fr") => {
        const slugifiedSponsorName = donation.sponsor.name.replaceAll(/[^a-zA-Z0-9]/g, "-");
        setIsCreatingPDF(language);
        dayjs.locale(language, language === "tr" ? turkishLocale : language === "de" ? germanLocale : frenchLocale);
        const res = await fetch(`${import.meta.env.VITE_API_URL}/pdf-generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: donation.sponsor.name,
            address: donation.sponsor.address,
            creationDate: dayjs(donation.createdAt).format("Do MMMM YYYY"),
            language,
            value: donation.amount,
            currency: donation.currency,
            year: donation.year,
          }),
        });
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `donation_receipt_${slugifiedSponsorName}_${donation.year}.pdf`);
        document.body.appendChild(link);
        link.click();
        setIsCreatingPDF(false);
      };

      return (
        <div class="flex flex-row items-center gap-2">
          {/* <Button
            as={A}
            href={`/sponsors/${props.row.original.sponsorId}/donations/${props.row.original.id}`}
            size="sm"
            class="flex flex-row items-center gap-2"
            variant="outline"
          >
            <LineChart class="size-4" />
            <span class="">Details</span>
          </Button> */}
          <DropdownMenu>
            <DropdownMenuTrigger
              as={Button}
              variant="outline"
              disabled={isCreatingPDF() !== false}
              size="sm"
              class="flex flex-row items-center gap-2"
            >
              <Switch fallback={<DownloadCloud class="size-4" />}>
                <Match when={isCreatingPDF() !== false}>
                  <Loader2 class="size-4 animate-spin" />
                </Match>
              </Switch>
              <span class="">PDF Olustur</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onSelect={() => generatePDF(props.row.original, "tr")}
                class="flex flex-row items-center gap-2"
              >
                <Switch fallback={<DownloadCloud class="size-4" />}>
                  <Match when={isCreatingPDF() === "tr"}>
                    <Loader2 class="size-4 animate-spin" />
                  </Match>
                </Switch>
                Türkçe
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => generatePDF(props.row.original, "de")}
                class="flex flex-row items-center gap-2"
              >
                <Switch fallback={<DownloadCloud class="size-4" />}>
                  <Match when={isCreatingPDF() === "de"}>
                    <Loader2 class="size-4 animate-spin" />
                  </Match>
                </Switch>
                Deutsch
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => generatePDF(props.row.original, "fr")}
                class="flex flex-row items-center gap-2"
              >
                <Switch fallback={<DownloadCloud class="size-4" />}>
                  <Match when={isCreatingPDF() === "fr"}>
                    <Loader2 class="size-4 animate-spin" />
                  </Match>
                </Switch>
                Français
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            as={A}
            href={`/sponsors/${props.row.original.sponsorId}/donations/${props.row.original.id}/edit`}
            size="sm"
            class="flex flex-row items-center gap-2"
          >
            <Pen class="size-4" />
            <span class="">Düzenle</span>
          </Button>

          <AlertDialog open={openDeleteDialog()} onOpenChange={setOpenDeleteDialog}>
            <AlertDialogTrigger as={Button} class="flex flex-row items-center gap-2" variant="destructive" size="sm">
              <Trash class="size-4" />
              Sil
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Gercek Silmek istediğinize emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu bağlantıyı silindikten sonra bizim sistemimizden silinecek ve gerceklerinizi kaybedeceğiz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogClose>Kapat</AlertDialogClose>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    await deleteDonation(donation.id);
                    await revalidate(getSponsor.keyFor(donation.sponsorId));
                    setOpenDeleteDialog(false);
                  }}
                >
                  <Switch fallback={<span>Evet, Sil</span>}>
                    <Match when={deleteDonationState.pending}>
                      <span>Siliniyor...</span>
                      <Loader2 class="size-4 animate-spin" />
                    </Match>
                    <Match when={deleteDonationState.result}>
                      <span>Silindi</span>
                    </Match>
                  </Switch>
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    },
  },
] satisfies ColumnDef<Sponsor.Frontend["donations"][number]>[];
