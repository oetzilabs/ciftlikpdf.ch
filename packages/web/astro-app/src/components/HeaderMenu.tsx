import { DropdownMenu } from "@kobalte/core";
import "solid-js";

export default function HeaderMenu() {
  return (
    <DropdownMenu.Root placement="bottom-end">
      <DropdownMenu.Trigger class="border border-neutral-300 dark:border-neutral-800 rounded-md px-3 py-1 shadow-sm font-medium text-sm">
        Menu
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content class="z-50 mt-1 self-end w-fit bg-white dark:bg-black rounded-md border border-neutral-300 dark:border-neutral-800 shadow overflow-clip">
          <DropdownMenu.Item
            class="flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium items-center justify-start select-none"
            onSelect={() => {
              window.location.href = "https://ciftlik.ch";
            }}
          >
            <span class="text-neutral-900 dark:text-neutral-100">Ciftlik Köyü Sayfasi</span>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            class="flex flex-row gap-2.5 p-2 py-1.5 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-900 active:bg-neutral-100 dark:active:bg-neutral-800 font-medium items-center justify-start select-none"
            onSelect={() => {
              window.location.href = "/dashboard";
            }}
          >
            <a class="text-neutral-900 dark:text-neutral-100">Dashboard</a>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
