// @refresh reload
import { Suspense, createEffect, createSignal, onCleanup } from "solid-js";
import { Body, ErrorBoundary, Head, Html, Meta, Scripts, Title } from "solid-start";
import Content from "./components/Content";
import { Providers } from "./components/providers";
import "./root.css";

export default function Root() {
  return (
    <Html lang="en">
      <Head>
        <Title>ciftlikpdf</Title>
        <Meta charset="utf-8" />
        <Meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Body class="bg-white dark:bg-black text-black dark:text-white">
        <Suspense>
          <ErrorBoundary>
            <Providers>
              <Content />
            </Providers>
          </ErrorBoundary>
        </Suspense>
        <Scripts />
      </Body>
    </Html>
  );
}
