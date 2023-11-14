import { User } from "@ciftlikpdf/core/entities/users";
import { useQueryClient } from "@tanstack/solid-query";
import { Accessor, Setter, createContext, createEffect, createSignal, onCleanup, useContext } from "solid-js";
import { Queries } from "../../utils/api/queries";

export type UseAuth = {
  isLoading: boolean;
  isAuthenticated: boolean;
  token: string | null;
  expiresAt: Date | null;
  user: User.Frontend | null;
};

export const DashboardContext = createContext<{
  isOnline: Accessor<boolean>;
  setIsOnline: Setter<boolean>;
  auth: [Accessor<UseAuth>, Setter<UseAuth>];
  saveUser: (token: string) => Promise<boolean>;
}>({
  isOnline: () => false,
  setIsOnline: () => {},
  auth: [
    (() => ({
      isLoading: true,
      isAuthenticated: false,
      token: null,
      expiresAt: null,
      user: null,
    })) as Accessor<UseAuth>,
    (() => {}) as Setter<UseAuth>,
  ],
  saveUser: () => Promise.reject("Not implemented yet"),
});

export const useAuth = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useAuth must be used within an OfflineFirst");
  const auth = ctx.auth;
  if (!auth) throw new Error("useAuth must be used within an OfflineFirst");
  return auth;
};

export const AuthProvider = (props: { children: any }) => {
  const queryClient = useQueryClient();
  if (!queryClient) throw new Error("OfflineFirst must be used within a QueryClientProvider");

  const [AuthStore, setAuthStore] = createSignal<UseAuth>({
    isLoading: true,
    isAuthenticated: false,
    token: null,
    expiresAt: null,
    user: null,
  });

  const [isOnline, setIsOnline] = createSignal(true);

  createEffect(() => {
    const handler = async () => {
      setIsOnline(window.navigator.onLine);
    };
    window.addEventListener("online", handler);
    window.addEventListener("offline", handler);
    onCleanup(() => {
      window.removeEventListener("online", handler);
      window.removeEventListener("offline", handler);
    });
  });

  return (
    <DashboardContext.Provider
      value={{
        saveUser: async (token: string) => {
          if (!token) return Promise.reject("No token provided.");
          const user = await Queries.session(token);
          if (!user.success) return Promise.reject("Something went wrong.");
          const userData = user.user;
          if (!userData) return Promise.reject("Something went wrong. No user data.");
          setAuthStore({
            isLoading: false,
            isAuthenticated: true,
            token,
            expiresAt: user.expiresAt,
            user: userData,
          });
          return true;
        },
        isOnline,
        setIsOnline,
        auth: [AuthStore, setAuthStore],
      }}
    >
      {props.children}
    </DashboardContext.Provider>
  );
};

export const useOfflineFirst = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useOfflineFirst must be used within a OfflineFirst");
  return context;
};
