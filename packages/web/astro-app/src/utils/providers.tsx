import { QueryClientProvider } from "@tanstack/solid-query";
import { qC } from "./stores";
import type { JSX } from "solid-js";

export const Tanstack = (props: { children: JSX.Element }) => (
  <QueryClientProvider client={qC}>{props.children}</QueryClientProvider>
);
