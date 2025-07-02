import { Notification } from "@/types";
import { apiClient } from "./client";

export const notificationService = {
  async getNotifications(params?: {
    page?: number;
    unread_only?: boolean;
  }): Promise<{ results: Notification[]; count: number; unread_count: number }> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.unread_only) searchParams.append("unread_only", "true");

    return apiClient.get(`/notifications/?${searchParams.toString()}`);
  },

  async markAsRead(id: string): Promise<void> {
    return apiClient.patch(`/notifications/${id}/`, { is_read: true });
  },

  async markAllAsRead(): Promise<void> {
    return apiClient.post("/notifications/mark-all-read/");
  },

  async deleteNotification(id: string): Promise<void> {
    return apiClient.delete(`/notifications/${id}/`);
  },

  async getUnreadCount(): Promise<{ count: number }> {
    return apiClient.get("/notifications/unread-count/");
  },
};