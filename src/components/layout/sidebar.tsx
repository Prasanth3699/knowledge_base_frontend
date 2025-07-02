"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Search,
  Bell,
  Settings,
  Home,
  Plus,
  Share2,
  Archive,
  Star,
  Users,
  Bookmark,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useUIStore } from "@/store/ui";
import { useNotificationsStore } from "@/store/notifications";
import { cn, getInitials } from "@/lib/utils";

const navigationItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
    shortcut: "⌘D",
  },
  {
    label: "My Documents",
    href: "/documents",
    icon: FileText,
    shortcut: "⌘M",
  },
  {
    label: "Shared with Me",
    href: "/shared",
    icon: Share2,
    shortcut: "⌘S",
  },
  {
    label: "Search",
    href: "/search",
    icon: Search,
    shortcut: "⌘K",
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    badge: true,
  },
  {
    label: "Starred",
    href: "/starred",
    icon: Star,
  },
  {
    label: "Bookmarks",
    href: "/bookmarks",
    icon: Bookmark,
  },
  {
    label: "Archive",
    href: "/archive",
    icon: Archive,
  },
];

const quickActions = [
  {
    label: "New Document",
    href: "/documents/new",
    icon: Plus,
    variant: "gradient" as const,
  },
  {
    label: "Invite Users",
    href: "/invite",
    icon: Users,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { unreadCount } = useNotificationsStore();

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300",
        sidebarOpen ? "w-64" : "w-16"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-2"
              >
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold gradient-text">KnowledgeBase</span>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center"
              >
                <FileText className="h-4 w-4 text-white" />
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            {sidebarOpen ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b">
          <div className="space-y-2">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <Button
                  variant={action.variant || "outline"}
                  className={cn("w-full justify-start", !sidebarOpen && "px-2")}
                >
                  <action.icon className="h-4 w-4" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="ml-2"
                      >
                        {action.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </Link>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.href} href={item.href}>
                <div
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent/50",
                    isActive && "bg-accent text-accent-foreground",
                    !sidebarOpen && "justify-center px-2"
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        className="flex items-center justify-between flex-1"
                      >
                        <span>{item.label}</span>
                        <div className="flex items-center gap-2">
                          {item.badge &&
                            item.label === "Notifications" &&
                            unreadCount > 0 && (
                              <Badge
                                variant="destructive"
                                className="h-5 px-1.5 text-xs"
                              >
                                {unreadCount > 99 ? "99+" : unreadCount}
                              </Badge>
                            )}
                          {item.shortcut && (
                            <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.shortcut}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t">
          <Link href="/settings">
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg p-2 hover:bg-accent/50 transition-colors",
                !sidebarOpen && "justify-center"
              )}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xs">
                  {user
                    ? getInitials(`${user.first_name} ${user.last_name}`)
                    : "U"}
                </AvatarFallback>
              </Avatar>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 min-w-0"
                  >
                    <p className="text-sm font-medium truncate">
                      {user?.full_name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email || "user@example.com"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
