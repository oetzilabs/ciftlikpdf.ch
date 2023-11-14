import { FileRoutes, Routes } from "solid-start";
import { cn } from "../utils/cn";
import { useHeader } from "./providers/Header";

export default function Content() {
  const { visible } = useHeader();
  return (
    <div
      class={cn("pt-[49px] h-[100svh] px-4 md:px-0", {
        "pt-0": !visible(),
      })}
    >
      <Routes>
        <FileRoutes />
      </Routes>
    </div>
  );
}
