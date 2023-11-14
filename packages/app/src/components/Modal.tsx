import { Dialog } from "@kobalte/core";
import { JSX, Show } from "solid-js";

type ModalProps = {
  children: JSX.Element;
  description?: string;
  title?: string;
  trigger: JSX.Element;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Modal(props: ModalProps) {
  return (
    <Dialog.Root open={props.open} onOpenChange={props.onOpenChange ? props.onOpenChange : (open) => {}}>
      <Dialog.Trigger class="">{props.trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 bg-black/[0.02] backdrop-blur-sm z-50" />
        <div class="flex flex-col">
          <Dialog.Content class="z-50 absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] flex flex-col gap-2 h-auto w-[500px] max-w-full bg-white dark:bg-black p-4 border border-black/10 dark:border-white/10 rounded-sm shadow-xl transition-[height]">
            <div class="flex flex-row items-center justify-between">
              <div>
                <Show when={props.title && props.title}>
                  {(title) => <Dialog.Title class="text-xl font-bold">{title()}</Dialog.Title>}
                </Show>
              </div>
              <div>
                <Dialog.CloseButton>
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
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </Dialog.CloseButton>
              </div>
            </div>
            <div class="flex flex-col gap-2">{props.children}</div>
            <Show when={props.description && props.description}>
              {(description) => <Dialog.Description class="">{description()}</Dialog.Description>}
            </Show>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
