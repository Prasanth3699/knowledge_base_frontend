("use client");

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bell, Mail, Smartphone, Save } from "lucide-react";

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
import { useNotificationsStore } from "@/store/notifications";
import { NotificationPreference } from "@/types";
import { toast } from "sonner";

export function NotificationSettings() {
  const { preferences, fetchPreferences, updatePreferences } =
    useNotificationsStore();
  const [localPreferences, setLocalPreferences] =
    useState<NotificationPreference | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  useEffect(() => {
    if (preferences) {
      setLocalPreferences(preferences);
    }
  }, [preferences]);

  useEffect(() => {
    if (preferences && localPreferences) {
      const changed =
        JSON.stringify(preferences) !== JSON.stringify(localPreferences);
      setHasChanges(changed);
    }
  }, [preferences, localPreferences]);

  const handleSave = async () => {
    if (!localPreferences) return;

    setIsLoading(true);
    try {
      await updatePreferences(localPreferences);
      toast.success("Notification preferences updated!");
      setHasChanges(false);
    } catch (error) {
      toast.error("Failed to update preferences");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = (key: keyof NotificationPreference, value: any) => {
    if (!localPreferences) return;
    setLocalPreferences({ ...localPreferences, [key]: value });
  };

  if (!localPreferences) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-muted rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Choose which email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mentions</Label>
                <p className="text-sm text-muted-foreground">
                  When someone mentions you in a document
                </p>
              </div>
              <Switch
                checked={localPreferences.email_mentions}
                onCheckedChange={(checked) =>
                  updatePreference("email_mentions", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Document Shared</Label>
                <p className="text-sm text-muted-foreground">
                  When someone shares a document with you
                </p>
              </div>
              <Switch
                checked={localPreferences.email_document_shared}
                onCheckedChange={(checked) =>
                  updatePreference("email_document_shared", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Document Updated</Label>
                <p className="text-sm text-muted-foreground">
                  When a shared document is updated
                </p>
              </div>
              <Switch
                checked={localPreferences.email_document_updated}
                onCheckedChange={(checked) =>
                  updatePreference("email_document_updated", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Comments</Label>
                <p className="text-sm text-muted-foreground">
                  When someone comments on your documents
                </p>
              </div>
              <Switch
                checked={localPreferences.email_comments}
                onCheckedChange={(checked) =>
                  updatePreference("email_comments", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>System Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Important system updates and announcements
                </p>
              </div>
              <Switch
                checked={localPreferences.email_system}
                onCheckedChange={(checked) =>
                  updatePreference("email_system", checked)
                }
              />
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Digest Frequency</Label>
                <p className="text-sm text-muted-foreground">
                  How often to receive email summaries
                </p>
              </div>
              <Select
                value={localPreferences.email_digest_frequency}
                onValueChange={(value) =>
                  updatePreference("email_digest_frequency", value)
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            In-App Notifications
          </CardTitle>
          <CardDescription>
            Configure notifications shown within the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mentions</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications when mentioned
                </p>
              </div>
              <Switch
                checked={localPreferences.inapp_mentions}
                onCheckedChange={(checked) =>
                  updatePreference("inapp_mentions", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Document Shared</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications when documents are shared
                </p>
              </div>
              <Switch
                checked={localPreferences.inapp_document_shared}
                onCheckedChange={(checked) =>
                  updatePreference("inapp_document_shared", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Document Updated</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications when documents are updated
                </p>
              </div>
              <Switch
                checked={localPreferences.inapp_document_updated}
                onCheckedChange={(checked) =>
                  updatePreference("inapp_document_updated", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Comments</Label>
                <p className="text-sm text-muted-foreground">
                  Show notifications for new comments
                </p>
              </div>
              <Switch
                checked={localPreferences.inapp_comments}
                onCheckedChange={(checked) =>
                  updatePreference("inapp_comments", checked)
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>System Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Show system updates and announcements
                </p>
              </div>
              <Switch
                checked={localPreferences.inapp_system}
                onCheckedChange={(checked) =>
                  updatePreference("inapp_system", checked)
                }
              />
            </div>
          </div>
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
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
