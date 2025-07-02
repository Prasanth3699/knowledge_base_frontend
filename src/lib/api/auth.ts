import { LoginCredentials, RegisterData, User, AuthTokens } from "@/types";
import { apiClient } from "./client";
import Cookies from "js-cookie";

export const authService = {
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await apiClient.post<{
      user: User;
      access: string;
      refresh: string;
    }>("/auth/login/", credentials);

    // Store tokens in cookies
    Cookies.set("access_token", response.access, { expires: 1 });
    Cookies.set("refresh_token", response.refresh, { expires: 7 });

    return {
      user: response.user,
      tokens: {
        access: response.access,
        refresh: response.refresh,
      },
    };
  },

  async register(data: RegisterData): Promise<{ user: User; message: string }> {
    return apiClient.post("/auth/register/", data);
  },

  async logout(): Promise<void> {
    const refreshToken = Cookies.get("refresh_token");
    if (refreshToken) {
      try {
        await apiClient.post("/auth/logout/", { refresh: refreshToken });
      } catch (error) {
        // Continue with logout even if API call fails
      }
    }

    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
  },

  async refreshToken(): Promise<{ access: string }> {
    const refreshToken = Cookies.get("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await apiClient.post<{ access: string }>("/auth/refresh/", {
      refresh: refreshToken,
    });

    Cookies.set("access_token", response.access, { expires: 1 });
    return response;
  },

  async getCurrentUser(): Promise<User> {
    return apiClient.get("/auth/user/");
  },

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    return apiClient.post("/auth/password-reset/", { email });
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return apiClient.post("/auth/password-reset/confirm/", {
      token,
      password,
    });
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiClient.post("/auth/verify-email/", { token });
  },

  async resendVerificationEmail(): Promise<{ message: string }> {
    return apiClient.post("/auth/resend-verification/");
  },
};
