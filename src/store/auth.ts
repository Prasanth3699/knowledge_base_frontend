import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import {
  User,
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
} from "@/types";
import { authApi } from "@/lib/api";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true });
        try {
          const response = await authApi.login(credentials);
          const { user, tokens } = response.data;

          // Store tokens in cookies
          Cookies.set("access_token", tokens.access, { expires: 1 }); // 1 day
          Cookies.set("refresh_token", tokens.refresh, { expires: 7 }); // 7 days

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (credentials: RegisterCredentials) => {
        set({ isLoading: true });
        try {
          const response = await authApi.register(credentials);
          const { user, tokens } = response.data;

          // Store tokens in cookies
          Cookies.set("access_token", tokens.access, { expires: 1 });
          Cookies.set("refresh_token", tokens.refresh, { expires: 7 });

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          const refreshToken = Cookies.get("refresh_token");
          if (refreshToken) {
            await authApi.logout(refreshToken);
          }
        } catch (error) {
          // Ignore logout errors
        } finally {
          get().clearAuth();
        }
      },

      refreshUser: async () => {
        try {
          const response = await authApi.getProfile();
          set({ user: response.data, isAuthenticated: true });
        } catch (error) {
          get().clearAuth();
        }
      },

      updateUser: (updatedUser: Partial<User>) => {
        const { user } = get();
        if (user) {
          set({ user: { ...user, ...updatedUser } });
        }
      },

      setTokens: (tokens: AuthTokens) => {
        Cookies.set("access_token", tokens.access, { expires: 1 });
        Cookies.set("refresh_token", tokens.refresh, { expires: 7 });
      },

      clearAuth: () => {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
