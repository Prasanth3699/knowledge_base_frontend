// src/components/features/notifications-dropdown.tsx
("use client");

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  FileText,
  Share2,
  MessageSquare,
  Users,
  Settings,
  X,
  MoreHorizontal,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotificationsStore } from "@/store/notifications";
import { getInitials, cn } from "@/lib/utils";
import { Notification } from "@/types";

interface NotificationsDropdownProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NotificationsDropdown({
  open,
  onOpenChange,
}: NotificationsDropdownProps) {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotificationsStore();

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "mention":
        return MessageSquare;
      case "document_shared":
        return Share2;
      case "document_updated":
        return FileText;
      case "comment":
        return MessageSquare;
      case "system":
        return Bell;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "mention":
        return "text-blue-500";
      case "document_shared":
        return "text-green-500";
      case "document_updated":
        return "text-orange-500";
      case "comment":
        return "text-purple-500";
      case "system":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }

    // Navigate based on notification type
    if (
      notification.related_object_type === "document" &&
      notification.related_object_id
    ) {
      router.push(`/documents/${notification.related_object_id}`);
    }

    onOpenChange(false);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const recentNotifications = notifications.slice(0, 8);

  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <div />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96 p-0" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <DropdownMenuLabel className="text-base font-semibold p-0">
            Notifications
          </DropdownMenuLabel>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="h-8 px-2 text-xs"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Mark all read
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                router.push("/notifications");
                onOpenChange(false);
              }}
              className="h-8 px-2 text-xs"
            >
              View all
            </Button>
          </div>
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-96">
          {recentNotifications.length > 0 ? (
            <div className="p-2">
              <AnimatePresence>
                {recentNotifications.map((notification, index) => {
                  const Icon = getNotificationIcon(
                    notification.notification_type
                  );
                  const iconColor = getNotificationColor(
                    notification.notification_type
                  );

                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        "group relative flex items-start gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer",
                        !notification.is_read && "bg-accent/30"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Icon */}
                      <div
                        className={cn(
                          "flex-shrink-0 mt-0.5 p-1.5 rounded-full bg-background border",
                          iconColor
                        )}
                      >
                        <Icon className="h-3 w-3" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-sm leading-relaxed",
                                !notification.is_read && "font-medium"
                              )}
                            >
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              {notification.sender && (
                                <div className="flex items-center gap-1.5">
                                  <Avatar className="h-4 w-4">
                                    <AvatarImage
                                      src={notification.sender.avatar}
                                    />
                                    <AvatarFallback className="text-[10px]">
                                      {getInitials(
                                        `${notification.sender.first_name} ${notification.sender.last_name}`
                                      )}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-xs text-muted-foreground">
                                    {notification.sender.full_name}
                                  </span>
                                </div>
                              )}
                              <span className="text-xs text-muted-foreground">
                                {notification.time_ago}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                              >
                                <Check className="h-3 w-3" />
                              </Button>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!notification.is_read && (
                                  <DropdownMenuItem
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <Check className="h-4 w-4 mr-2" />
                                    Mark as read
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                  onClick={() =>
                                    deleteNotification(notification.id)
                                  }
                                  className="text-destructive"
                                >
                                  <X className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>

                        {/* Unread indicator */}
                        {!notification.is_read && (
                          <div className="absolute left-1 top-4 h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground text-center">
                No notifications yet
              </p>
              <p className="text-xs text-muted-foreground text-center mt-1">
                We'll notify you when something happens
              </p>
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 8 && (
          <div className="border-t p-3">
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => {
                router.push("/notifications");
                onOpenChange(false);
              }}
            >
              View all {notifications.length} notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
