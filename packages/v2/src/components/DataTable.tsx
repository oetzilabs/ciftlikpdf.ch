import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TextField, TextFieldRoot } from "@/components/ui/textfield";
import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/solid-table";
import {
  createSolidTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/solid-table";
import { Eye } from "lucide-solid";
import { Accessor, For, JSX, Show, createSignal, splitProps } from "solid-js";

type Props<TData, TValue> = {
  columns: ColumnDef<TData, TValue>[];
  data: Accessor<TData[] | undefined>;
  searchBy: keyof TData;
  menu?: JSX.Element;
  sorting?: SortingState;
};

export const DataTable = <TData, TValue>(props: Props<TData, TValue>) => {
  const [local] = splitProps(props, ["columns", "data", "sorting"]);
  const [sorting, setSorting] = createSignal<SortingState>(local.sorting ?? []);
  const [columnFilters, setColumnFilters] = createSignal<ColumnFiltersState>([]);
  const [rowSelection, setRowSelection] = createSignal({});
  const [columnVisibility, setColumnVisibility] = createSignal<VisibilityState>({});

  const table = createSolidTable({
    getCoreRowModel: getCoreRowModel(),
    // eslint-disable-next-line solid/reactivity
    columns: local.columns,
    get data() {
      const d = local.data();
      if (!d) return [];
      return d;
    },
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    enableSorting: true,
    state: {
      get sorting() {
        return sorting();
      },
      get columnFilters() {
        return columnFilters();
      },
      get columnVisibility() {
        return columnVisibility();
      },
      get rowSelection() {
        return rowSelection();
      },
    },
  });

  return (
    <div class="w-full h-full flex flex-col">
      <div class="flex items-center justify-between w-full p-2 border-b border-neutral-200 dark:border-neutral-800 gap-2">
        <div class="flex items-center w-full">
          <TextFieldRoot class="w-full">
            <TextField
              placeholder={`Filter ${String(props.searchBy)}...`}
              value={(table.getColumn(String(props.searchBy))?.getFilterValue() as string) ?? ""}
              onInput={(event) => {
                // @ts-ignore
                setColumnFilters((filters) => [
                  ...filters,
                  {
                    id: props.searchBy,
                    // @ts-ignore
                    value: event.currentTarget.value,
                  },
                ]);
              }}
              class="w-full h-8"
            />
          </TextFieldRoot>
        </div>
        <div class="flex flex-row items-center justify-end gap-2">
          <Show when={props.menu}>{(menu) => <div class="flex items-center">{menu()}</div>}</Show>
          <DropdownMenu>
            <DropdownMenuTrigger
              as={Button}
              variant="outline"
              class="flex flex-row items-center justify-center gap-2"
              size="sm"
            >
              <Eye class="size-4" />
              <span>View</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <For each={table.getAllColumns().filter((column) => column.getCanHide())}>
                {(item) => (
                  <DropdownMenuCheckboxItem
                    class="capitalize"
                    checked={item.getIsVisible()}
                    onChange={(value) => item.toggleVisibility(!!value)}
                  >
                    {item.id}
                  </DropdownMenuCheckboxItem>
                )}
              </For>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div class="flex flex-col w-full h-full">
        <Table>
          <TableHeader>
            <For each={table.getHeaderGroups()}>
              {(headerGroup) => (
                <TableRow>
                  <For each={headerGroup.headers}>
                    {(header) => {
                      return (
                        <TableHead class="text-left px-4">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      );
                    }}
                  </For>
                </TableRow>
              )}
            </For>
          </TableHeader>
          <TableBody>
            <Show
              when={table.getRowModel().rows?.length}
              fallback={
                <TableRow>
                  <TableCell colSpan={local.columns.length} class="">
                    No results.
                  </TableCell>
                </TableRow>
              }
            >
              <For each={table.getRowModel().rows}>
                {(row) => (
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    <For each={row.getVisibleCells()}>
                      {(cell) => (
                        <TableCell class="text-left px-4">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      )}
                    </For>
                  </TableRow>
                )}
              </For>
            </Show>
          </TableBody>
        </Table>
        <div class="flex grow" />
        <div class="text-muted-foreground flex-1 text-sm w-full p-2 border-t border-neutral-200 dark:border-neutral-800 select-none">
          {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s)
          selected.
        </div>
      </div>
    </div>
  );
};
