"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  FileText,
  Search,
  Plus,
  Home,
  Share2,
  Star,
  Bell,
  Settings,
  User,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Calendar,
  Archive,
  Bookmark,
  Users,
  Eye,
  Edit,
  Trash2,
  Download,
  Copy,
  Globe,
  Lock,
} from "lucide-react";

import { useAuth } from "@/hooks/use-auth";
import { useDocuments } from "@/hooks/use-documents";
import { useUsers } from "@/hooks/use-users";
import { useUIStore } from "@/store/ui";
import { Document, User as UserType } from "@/types";
import { getInitials } from "@/lib/utils";

type CommandItem = {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
  keywords?: string[];
  group:
    | "navigation"
    | "actions"
    | "documents"
    | "users"
    | "settings"
    | "recent";
  data?: any;
};

export function CommandPalette() {
  const router = useRouter();
  const { setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { documents } = useDocuments();
  const { users } = useUsers();
  const { commandPaletteOpen, setCommandPaletteOpen, addRecentSearch } =
    useUIStore();

  const [search, setSearch] = useState("");

  // Listen for keyboard shortcuts
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  const runCommand = (fn: () => void) => {
    setCommandPaletteOpen(false);
    fn();
  };

  // Build command items
  const commandItems = useMemo(() => {
    const items: CommandItem[] = [];

    // Navigation commands
    items.push(
      {
        id: "nav-dashboard",
        label: "Dashboard",
        description: "Go to your dashboard",
        icon: Home,
        action: () => runCommand(() => router.push("/dashboard")),
        keywords: ["home", "overview"],
        group: "navigation",
      },
      {
        id: "nav-documents",
        label: "My Documents",
        description: "View all your documents",
        icon: FileText,
        action: () => runCommand(() => router.push("/documents")),
        keywords: ["docs", "files"],
        group: "navigation",
      },
      {
        id: "nav-shared",
        label: "Shared with Me",
        description: "Documents shared by others",
        icon: Share2,
        action: () => runCommand(() => router.push("/shared")),
        keywords: ["shared", "collaboration"],
        group: "navigation",
      },
      {
        id: "nav-starred",
        label: "Starred Documents",
        description: "Your starred documents",
        icon: Star,
        action: () => runCommand(() => router.push("/starred")),
        keywords: ["favorites", "bookmarks"],
        group: "navigation",
      },
      {
        id: "nav-search",
        label: "Search",
        description: "Search documents and users",
        icon: Search,
        action: () => runCommand(() => router.push("/search")),
        keywords: ["find", "lookup"],
        group: "navigation",
      },
      {
        id: "nav-notifications",
        label: "Notifications",
        description: "View your notifications",
        icon: Bell,
        action: () => runCommand(() => router.push("/notifications")),
        keywords: ["alerts", "updates"],
        group: "navigation",
      }
    );

    // Action commands
    items.push(
      {
        id: "action-new-document",
        label: "New Document",
        description: "Create a new document",
        icon: Plus,
        action: () => runCommand(() => router.push("/documents/new")),
        keywords: ["create", "add", "write"],
        group: "actions",
      },
      {
        id: "action-search-global",
        label: "Global Search",
        description: `Search for "${search}"`,
        icon: Search,
        action: () =>
          runCommand(() => {
            if (search.trim()) {
              addRecentSearch(search.trim());
              router.push(`/search?q=${encodeURIComponent(search.trim())}`);
            }
          }),
        keywords: ["find", "query"],
        group: "actions",
      }
    );

    // Settings commands
    items.push(
      {
        id: "settings-profile",
        label: "Profile",
        description: "View and edit your profile",
        icon: User,
        action: () => runCommand(() => router.push("/profile")),
        keywords: ["account", "user"],
        group: "settings",
      },
      {
        id: "settings-preferences",
        label: "Settings",
        description: "Manage your preferences",
        icon: Settings,
        action: () => runCommand(() => router.push("/settings")),
        keywords: ["preferences", "config"],
        group: "settings",
      },
      {
        id: "theme-light",
        label: "Light Theme",
        description: "Switch to light mode",
        icon: Sun,
        action: () => runCommand(() => setTheme("light")),
        keywords: ["appearance", "bright"],
        group: "settings",
      },
      {
        id: "theme-dark",
        label: "Dark Theme",
        description: "Switch to dark mode",
        icon: Moon,
        action: () => runCommand(() => setTheme("dark")),
        keywords: ["appearance", "night"],
        group: "settings",
      },
      {
        id: "theme-system",
        label: "System Theme",
        description: "Use system theme preference",
        icon: Monitor,
        action: () => runCommand(() => setTheme("system")),
        keywords: ["appearance", "auto"],
        group: "settings",
      },
      {
        id: "auth-logout",
        label: "Sign Out",
        description: "Sign out of your account",
        icon: LogOut,
        action: () =>
          runCommand(async () => {
            await logout();
            router.push("/auth/login");
          }),
        keywords: ["exit", "leave"],
        group: "settings",
      }
    );

    // Document commands (recent documents)
    if (documents && documents.length > 0) {
      documents.slice(0, 10).forEach((doc: Document) => {
        items.push({
          id: `doc-${doc.id}`,
          label: doc.title,
          description: `Open "${doc.title}"`,
          icon: doc.visibility === "public" ? Globe : Lock,
          action: () => runCommand(() => router.push(`/documents/${doc.id}`)),
          keywords: [
            doc.title.toLowerCase(),
            doc.author.full_name.toLowerCase(),
          ],
          group: "documents",
          data: doc,
        });
      });
    }

    // User commands
    if (users && users.length > 0) {
      users.slice(0, 5).forEach((userItem: UserType) => {
        items.push({
          id: `user-${userItem.id}`,
          label: userItem.full_name,
          description: `View ${userItem.full_name}'s profile`,
          icon: User,
          action: () => runCommand(() => router.push(`/users/${userItem.id}`)),
          keywords: [
            userItem.full_name.toLowerCase(),
            userItem.username.toLowerCase(),
          ],
          group: "users",
          data: userItem,
        });
      });
    }

    return items;
  }, [router, setTheme, logout, documents, users, search, addRecentSearch]);

  // Filter commands based on search
  const filteredItems = useMemo(() => {
    if (!search) return commandItems;

    const searchLower = search.toLowerCase();
    return commandItems.filter((item) => {
      const matchesLabel = item.label.toLowerCase().includes(searchLower);
      const matchesDescription = item.description
        ?.toLowerCase()
        .includes(searchLower);
      const matchesKeywords = item.keywords?.some((keyword) =>
        keyword.includes(searchLower)
      );

      return matchesLabel || matchesDescription || matchesKeywords;
    });
  }, [commandItems, search]);

  // Group filtered items
  const groupedItems = useMemo(() => {
    const groups = filteredItems.reduce((acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = [];
      }
      acc[item.group].push(item);
      return acc;
    }, {} as Record<string, CommandItem[]>);

    return groups;
  }, [filteredItems]);

  const groupLabels = {
    navigation: "Navigation",
    actions: "Actions",
    documents: "Documents",
    users: "Users",
    settings: "Settings",
    recent: "Recent",
  };

  return (
    <CommandDialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
    >
      <Command>
        <CommandInput
          placeholder="Type a command or search..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {Object.entries(groupedItems).map(([group, items], index) => (
            <div key={group}>
              {index > 0 && <CommandSeparator />}
              <CommandGroup
                heading={groupLabels[group as keyof typeof groupLabels]}
              >
                {items.map((item) => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => item.action()}
                    className="flex items-center gap-2"
                  >
                    <item.icon className="h-4 w-4" />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                    {item.group === "documents" && item.data && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <span>{item.data.word_count} words</span>
                      </div>
                    )}
                    {item.group === "users" && item.data && (
                      <div className="text-xs text-muted-foreground">
                        @{item.data.username}
                      </div>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </Command>
    </CommandDialog>
  );
}
