import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { Toaster } from "solid-toast";
import { UserMenu } from "../UserMenu";
import { Header } from "./Header";
import { OfflineFirst } from "./OfflineFirst";

const queryClient = new QueryClient();
export const Providers = (props: { children: any }) => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <OfflineFirst>
          <Header
            header={
              <div class="flex items-center justify-between flex-wrap container mx-auto py-2">
                <UserMenu />
              </div>
            }
          >
            {props.children}
          </Header>
          <Toaster
            position="bottom-right"
            gutter={8}
            toastOptions={{
              duration: 2000,
            }}
          />
        </OfflineFirst>
      </QueryClientProvider>
    </>
  );
};
