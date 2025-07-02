import { create } from "zustand";
import {
  Notification,
  NotificationStats,
  NotificationPreference,
} from "@/types";
import { notificationService } from "@/lib/api/notifications";

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  stats: NotificationStats | null;
  preferences: NotificationPreference | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  fetchUnreadCount: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchPreferences: () => Promise<void>;
  updatePreferences: (
    preferences: Partial<NotificationPreference>
  ) => Promise<void>;
  addNotification: (notification: Notification) => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  stats: null,
  preferences: null,

  fetchNotifications: async () => {
    set({ isLoading: true });
    try {
      const response = await notificationService.getNotifications();
      set({
        notifications: response.results || [],
        unreadCount: response.unread_count || 0,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  markAsRead: async (id: string) => {
    try {
      await notificationService.markAsRead(id);

      set((state) => ({
        notifications: state.notifications.map((notif) =>
          notif.id === id ? { ...notif, is_read: true } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      await notificationService.markAllAsRead();

      set((state) => ({
        notifications: state.notifications.map((notif) => ({
          ...notif,
          is_read: true,
        })),
        unreadCount: 0,
      }));
    } catch (error) {
      throw error;
    }
  },

  deleteNotification: async (id: string) => {
    try {
      await notificationService.deleteNotification(id);

      set((state) => ({
        notifications: state.notifications.filter((notif) => notif.id !== id),
      }));
    } catch (error) {
      throw error;
    }
  },

  fetchUnreadCount: async () => {
    try {
      const response = await notificationService.getUnreadCount();
      set({ unreadCount: response.count });
    } catch (error) {
      throw error;
    }
  },

  fetchStats: async () => {
    set({ isLoading: true });
    try {
      // Since there's no stats method in the service, we'll calculate from notifications
      const response = await notificationService.getNotifications();
      const notifications = response.results || [];

      const stats: NotificationStats = {
        total_count: response.count || notifications.length,
        unread_count:
          response.unread_count ||
          notifications.filter((n) => !n.is_read).length,
        read_count: notifications.filter((n) => n.is_read).length,
        types: notifications.reduce((acc, notif) => {
          acc[notif.type] = (acc[notif.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };

      set({ stats, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  fetchPreferences: async () => {
    try {
      // Since preferences method doesn't exist in the service, we'll create a placeholder
      // You can implement this when you add the preferences endpoint to your service
      const defaultPreferences: NotificationPreference = {
        id: "default",
        user: "current-user",
        email_notifications: true,
        push_notifications: true,
        document_shared: true,
        document_commented: true,
        mentions: true,
        version_updates: true,
        system_updates: true,
        email_frequency: "immediate",
        quiet_hours_enabled: false,
      };

      set({ preferences: defaultPreferences });
    } catch (error) {
      throw error;
    }
  },

  updatePreferences: async (preferences: Partial<NotificationPreference>) => {
    try {
      // Since update preferences method doesn't exist in the service, we'll update locally
      // You can implement this when you add the preferences endpoint to your service
      set((state) => ({
        preferences: state.preferences
          ? { ...state.preferences, ...preferences }
          : null,
      }));
    } catch (error) {
      throw error;
    }
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
}));
