"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Palette, Monitor, Sun, Moon, Save, Globe, Clock } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUIStore } from "@/store/ui";
import { toast } from "sonner";

interface Preferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  compactMode: boolean;
  showLineNumbers: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  defaultDocumentVisibility: "private" | "public";
  showWordCount: boolean;
  showCharacterCount: boolean;
  enableKeyboardShortcuts: boolean;
  defaultViewMode: "grid" | "list";
}

export function PreferencesSettings() {
  const { theme, setTheme } = useTheme();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const [preferences, setPreferences] = useState<Preferences>({
    theme: (theme as "light" | "dark" | "system") || "system",
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    compactMode: false,
    showLineNumbers: false,
    autoSave: true,
    autoSaveInterval: 30,
    defaultDocumentVisibility: "private",
    showWordCount: true,
    showCharacterCount: true,
    enableKeyboardShortcuts: true,
    defaultViewMode: "grid",
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load preferences from localStorage or API
    const savedPreferences = localStorage.getItem("userPreferences");
    if (savedPreferences) {
      try {
        const parsed = JSON.parse(savedPreferences);
        setPreferences({ ...preferences, ...parsed });
      } catch (error) {
        console.error("Failed to parse saved preferences:", error);
      }
    }
  }, []);

  const updatePreference = <K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);

    // Apply theme immediately
    if (key === "theme") {
      setTheme(value as string);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Save to localStorage (in a real app, this would be an API call)
      localStorage.setItem("userPreferences", JSON.stringify(preferences));

      // Apply preferences
      if (preferences.theme) {
        setTheme(preferences.theme);
      }

      toast.success("Preferences saved successfully!");
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Asia/Kolkata",
    "Australia/Sydney",
  ];

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
    { code: "it", name: "Italiano" },
    { code: "pt", name: "Português" },
    { code: "ru", name: "Русский" },
    { code: "ja", name: "日本語" },
    { code: "ko", name: "한국어" },
    { code: "zh", name: "中文" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize the look and feel of the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Theme</Label>
                <p className="text-sm text-muted-foreground">
                  Choose your preferred color scheme
                </p>
              </div>
              <Select
                value={preferences.theme}
                onValueChange={(value: "light" | "dark" | "system") =>
                  updatePreference("theme", value)
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Light
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Dark
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="h-4 w-4" />
                      System
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Compact Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Use a more compact layout to show more content
                </p>
              </div>
              <Switch
                checked={preferences.compactMode}
                onCheckedChange={(checked) =>
                  updatePreference("compactMode", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Default View Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Choose how documents are displayed by default
                </p>
              </div>
              <Select
                value={preferences.defaultViewMode}
                onValueChange={(value: "grid" | "list") =>
                  updatePreference("defaultViewMode", value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid</SelectItem>
                  <SelectItem value="list">List</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Localization
          </CardTitle>
          <CardDescription>
            Set your language and regional preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select
                value={preferences.language}
                onValueChange={(value) => updatePreference("language", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select
                value={preferences.timezone}
                onValueChange={(value) => updatePreference("timezone", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Editor Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Editor Preferences
          </CardTitle>
          <CardDescription>
            Configure how the document editor behaves
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-save</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically save your work while typing
                </p>
              </div>
              <Switch
                checked={preferences.autoSave}
                onCheckedChange={(checked) =>
                  updatePreference("autoSave", checked)
                }
              />
            </div>

            {preferences.autoSave && (
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-save Interval</Label>
                  <p className="text-sm text-muted-foreground">
                    How often to auto-save (in seconds)
                  </p>
                </div>
                <Select
                  value={preferences.autoSaveInterval.toString()}
                  onValueChange={(value) =>
                    updatePreference("autoSaveInterval", parseInt(value))
                  }
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 seconds</SelectItem>
                    <SelectItem value="30">30 seconds</SelectItem>
                    <SelectItem value="60">1 minute</SelectItem>
                    <SelectItem value="300">5 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Line Numbers</Label>
                <p className="text-sm text-muted-foreground">
                  Display line numbers in the editor
                </p>
              </div>
              <Switch
                checked={preferences.showLineNumbers}
                onCheckedChange={(checked) =>
                  updatePreference("showLineNumbers", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Word Count</Label>
                <p className="text-sm text-muted-foreground">
                  Display word count in the editor
                </p>
              </div>
              <Switch
                checked={preferences.showWordCount}
                onCheckedChange={(checked) =>
                  updatePreference("showWordCount", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Character Count</Label>
                <p className="text-sm text-muted-foreground">
                  Display character count in the editor
                </p>
              </div>
              <Switch
                checked={preferences.showCharacterCount}
                onCheckedChange={(checked) =>
                  updatePreference("showCharacterCount", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Default Document Visibility</Label>
                <p className="text-sm text-muted-foreground">
                  Default visibility for new documents
                </p>
              </div>
              <Select
                value={preferences.defaultDocumentVisibility}
                onValueChange={(value: "private" | "public") =>
                  updatePreference("defaultDocumentVisibility", value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="public">Public</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
          <CardDescription>
            Enable or customize keyboard shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Keyboard Shortcuts</Label>
              <p className="text-sm text-muted-foreground">
                Use keyboard shortcuts for faster navigation
              </p>
            </div>
            <Switch
              checked={preferences.enableKeyboardShortcuts}
              onCheckedChange={(checked) =>
                updatePreference("enableKeyboardShortcuts", checked)
              }
            />
          </div>

          {preferences.enableKeyboardShortcuts && (
            <div className="space-y-3 pt-4 border-t">
              <h4 className="font-medium">Available Shortcuts</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span>Command Palette</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘K</kbd>
                </div>
                <div className="flex justify-between">
                  <span>New Document</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘N</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Search</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘F</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Save Document</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘S</kbd>
                </div>
                <div className="flex justify-between">
                  <span>My Documents</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘M</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Dashboard</span>
                  <kbd className="px-2 py-1 bg-muted rounded text-xs">⌘D</kbd>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end"
        >
          <Button
            onClick={handleSave}
            disabled={isLoading}
            loading={isLoading}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isLoading ? "Saving..." : "Save Preferences"}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
