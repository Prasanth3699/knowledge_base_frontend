import { User, UpdateUserData } from "@/types";
import { apiClient } from "./client";

export const userService = {
  async getUsers(params?: {
    search?: string;
    page?: number;
  }): Promise<{ results: User[]; count: number }> {
    const searchParams = new URLSearchParams();
    
    if (params?.search) searchParams.append("search", params.search);
    if (params?.page) searchParams.append("page", params.page.toString());

    return apiClient.get(`/users/?${searchParams.toString()}`);
  },

  async getUser(id: string): Promise<User> {
    return apiClient.get(`/users/${id}/`);
  },

  async updateUser(id: string, data: UpdateUserData): Promise<User> {
    return apiClient.patch(`/users/${id}/`, data);
  },

  async updateProfile(data: UpdateUserData): Promise<User> {
    return apiClient.patch("/auth/profile/", data);
  },

  async uploadAvatar(file: File): Promise<{ avatar: string }> {
    const formData = new FormData();
    formData.append("avatar", file);

    return apiClient.post("/auth/avatar/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  async searchUsers(query: string): Promise<User[]> {
    return apiClient.get(`/users/search/?q=${encodeURIComponent(query)}`);
  },
};
