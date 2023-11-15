import { createQueries, createQuery, useQueryClient } from "@tanstack/solid-query";
import dayjs from "dayjs";
import advancedFormat from "dayjs/plugin/advancedFormat";
import { useAuth } from "../components/providers/OfflineFirst";
import { A } from "@solidjs/router";
import { Queries } from "../utils/api/queries";
import { Match, Switch } from "solid-js";
import Logo from "../components/Logo";
dayjs.extend(advancedFormat);

export default function DashboardPage() {
  const [user] = useAuth();

  const sponsors = createQuery(
    () => ["sponsors"],
    () => {
      const token = user().token;
      if (!token) return Promise.reject("No token found. Please login first.");
      return Queries.Sponsors.count(token);
    },
    {
      get enabled() {
        return user().isAuthenticated;
      },
      refetchInterval: 1000 * 5,
      refetchIntervalInBackground: true,
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div class="container mx-auto flex flex-col gap-8 py-10">
      <div class="flex flex-row items-center justify-between"></div>
      <div class="w-full flex flex-col items-center justify-center">
        <Logo />
      </div>
      <h1 class="text-3xl font-bold">Ciftlik Köyü PDF'ler</h1>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <A
          href="/sponsorlar"
          class="flex flex-row gap-4 border border-neutral-300 rounded-sm p-8 items-center justify-center"
        >
          <span class="text-2xl font-bold">Sponsorlar</span>
          <Switch
            fallback={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="animate-spin"
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            }
          >
            <Match when={sponsors.isSuccess && typeof sponsors.data !== "undefined" && sponsors.data}>
              {(sps) => <span class="text-2xl font-bold">{sps().count}</span>}
            </Match>
          </Switch>
        </A>
      </div>
    </div>
  );
}
