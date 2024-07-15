import { deleteSponsorAction } from "@/actions/sponsors";
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
import { getSponsor } from "@/data/sponsors";
import type { Sponsor } from "@ciftlikpdf/core/src/entities/sponsors";
import { A, revalidate, useAction, useSubmission } from "@solidjs/router";
import type { ColumnDef } from "@tanstack/solid-table";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { LineChart, Loader2, Pen, Trash } from "lucide-solid";
import { createSignal, For, Match, Switch } from "solid-js";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
dayjs.extend(advancedFormat);

export const sponsorColumns = [
  {
    accessorKey: "name",
    header(props) {
      return <span class="capitalize">Isim</span>;
    },
  },
  {
    accessorKey: "address",
    header(props) {
      return <span class="capitalize">Adress</span>;
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
    accessorKey: "donations",
    header(props) {
      return <span class="capitalize">Bağışlar</span>;
    },
    cell(props) {
      return (
        <div class="flex flex-row gap-1">
          <For each={props.row.original.donations}>
            {(d) => (
              <Badge variant="outline">
                {d.amount} {d.currency} ({d.year})
              </Badge>
            )}
          </For>
        </div>
      );
    },
  },
  {
    id: "actions",
    header(props) {
      return <span class="capitalize">Eylemler</span>;
    },
    size: 200,
    cell(props) {
      const sponsor = props.row.original;
      const [openDeleteDialog, setOpenDeleteDialog] = createSignal(false);

      const deleteSponsor = useAction(deleteSponsorAction);
      const deleteSponsorState = useSubmission(deleteSponsorAction);

      return (
        <div class="flex flex-row items-center gap-2">
          <Button
            as={A}
            href={`/sponsors/${sponsor.id}`}
            size="sm"
            class="flex flex-row items-center gap-2"
            variant="outline"
          >
            <LineChart class="size-4" />
            <span class="">Details</span>
          </Button>
          <Button
            as={A}
            href={`/sponsors/${sponsor.id}/edit`}
            size="sm"
            class="flex flex-row items-center gap-2"
            variant="outline"
          >
            <Pen class="size-4" />
            <span class="">Güncelle</span>
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
                    await deleteSponsor(sponsor.id);
                    await revalidate(getSponsor.keyFor(sponsor.id));
                    setOpenDeleteDialog(false);
                  }}
                >
                  <Switch fallback={<span>Evet, Sil</span>}>
                    <Match when={deleteSponsorState.pending}>
                      <span>Siliniyor...</span>
                      <Loader2 class="size-4 animate-spin" />
                    </Match>
                    <Match when={deleteSponsorState.result}>
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
] satisfies ColumnDef<Sponsor.Frontend>[];
