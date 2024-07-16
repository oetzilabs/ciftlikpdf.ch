import { deleteUserAction } from "@/actions/users";
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
import { A, revalidate, useAction, useSubmission } from "@solidjs/router";
import type { ColumnDef } from "@tanstack/solid-table";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { LineChart, Loader2, Pen, Trash } from "lucide-solid";
import { createSignal, Match, Switch } from "solid-js";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { getAllUsers, getUser } from "@/data/users";
import type { User } from "@ciftlikpdf/core/src/entities/users";
dayjs.extend(advancedFormat);

export const userColumns = [
  {
    accessorKey: "name",
    header(props) {
      return <span class="capitalize">Isim</span>;
    },
  },
  {
    accessorKey: "type",
    header(props) {
      return <span class="capitalize">Type</span>;
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
    id: "actions",
    header(props) {
      return <span class="capitalize flex flex-row items-center gap-2 justify-end">Eylemler</span>;
    },
    size: 200,
    cell(props) {
      const user = props.row.original;
      const [openDeleteDialog, setOpenDeleteDialog] = createSignal(false);

      const deleteUser = useAction(deleteUserAction);
      const deleteUserState = useSubmission(deleteUserAction);

      return (
        <div class="flex flex-row items-center gap-2 justify-end">
          <Button
            as={A}
            href={`/users/${user.id}`}
            size="sm"
            class="flex flex-row items-center gap-2"
            variant="outline"
          >
            <LineChart class="size-4" />
            <span class="">Details</span>
          </Button>
          <Button
            as={A}
            href={`/users/${user.id}/edit`}
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
                    await deleteUser(user.id);
                    await revalidate([getUser.keyFor(user.id), getAllUsers.key]);
                    setOpenDeleteDialog(false);
                  }}
                >
                  <Switch fallback={<span>Evet, Sil</span>}>
                    <Match when={deleteUserState.pending}>
                      <span>Siliniyor...</span>
                      <Loader2 class="size-4 animate-spin" />
                    </Match>
                    <Match when={deleteUserState.result}>
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
] satisfies ColumnDef<User.Frontend>[];
