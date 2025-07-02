"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Download,
  Trash2,
  Database,
  FileText,
  Users,
  Clock,
  AlertTriangle,
  ExternalLink,
  CheckCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useDocumentsStore } from "@/store/documents";
import { formatDate, downloadFile } from "@/lib/utils";
import { toast } from "sonner";

export function DataSettings() {
  const { user } = useAuth();
  const { stats } = useDocumentsStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isDeletingData, setIsDeletingData] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);
    setExportProgress(0);

    try {
      // Simulate export progress
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // In a real app, this would call your API to export data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setExportProgress(100);

      // Generate sample export data
      const exportData = {
        user: {
          id: user?.id,
          email: user?.email,
          name: user?.full_name,
          created_at: user?.created_at,
        },
        documents: {
          total: stats?.total_documents || 0,
          public: stats?.public_documents || 0,
          private: stats?.private_documents || 0,
          total_words: stats?.total_words || 0,
        },
        exported_at: new Date().toISOString(),
        export_version: "1.0",
      };

      // Download the export file
      downloadFile(
        JSON.stringify(exportData, null, 2),
        `knowledge-base-export-${new Date().toISOString().split("T")[0]}.json`,
        "application/json"
      );

      toast.success("Data exported successfully!");
    } catch (error) {
      toast.error("Failed to export data");
    } finally {
      setIsExporting(false);
      setExportProgress(0);
    }
  };

  const handleDeleteAllData = async () => {
    const confirmText = "DELETE ALL MY DATA";
    const userInput = prompt(
      `This will permanently delete ALL your data including documents, settings, and account information. This action cannot be undone.\n\nType "${confirmText}" to confirm:`
    );

    if (userInput !== confirmText) {
      toast.error("Data deletion cancelled");
      return;
    }

    setIsDeletingData(true);
    try {
      // In a real app, this would call your API to delete all user data
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("All data has been scheduled for deletion");
    } catch (error) {
      toast.error("Failed to delete data");
    } finally {
      setIsDeletingData(false);
    }
  };

  const dataCategories = [
    {
      name: "Documents",
      count: stats?.total_documents || 0,
      size: "2.4 MB",
      icon: FileText,
      description: "All your documents and their content",
    },
    {
      name: "Shared Data",
      count: 12,
      size: "340 KB",
      icon: Users,
      description: "Documents shared with you and sharing permissions",
    },
    {
      name: "Activity Logs",
      count: 89,
      size: "156 KB",
      icon: Clock,
      description: "Your activity history and access logs",
    },
    {
      name: "Settings",
      count: 1,
      size: "12 KB",
      icon: Database,
      description: "Your preferences and configuration data",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Data Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Overview
          </CardTitle>
          <CardDescription>
            View and manage your data stored in Knowledge Base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div
                  key={category.name}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {category.count} items • {category.size}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Total Data Size</h4>
                <p className="text-sm text-muted-foreground">
                  Account created {formatDate(user?.created_at || new Date())}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">2.9 MB</div>
                <div className="text-sm text-muted-foreground">
                  Last updated today
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Your Data
          </CardTitle>
          <CardDescription>
            Download a copy of all your data in a portable format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>What's included</AlertTitle>
            <AlertDescription>
              Your export will include all documents, settings, activity logs,
              and metadata in JSON format. This data can be imported into other
              compatible systems.
            </AlertDescription>
          </Alert>

          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Preparing your data...</span>
                <span>{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              onClick={handleExportData}
              disabled={isExporting}
              loading={isExporting}
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export My Data"}
            </Button>
            <Button variant="outline" asChild>
              <a
                href="https://docs.example.com/data-export"
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                Learn More
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Privacy Controls</CardTitle>
          <CardDescription>
            Manage how your data is used and shared
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Analytics Data</div>
                <p className="text-sm text-muted-foreground">
                  Help improve the platform by sharing anonymous usage data
                </p>
              </div>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Public Profile</div>
                <p className="text-sm text-muted-foreground">
                  Control what information is visible to other users
                </p>
              </div>
              <Button variant="outline" size="sm">
                Configure
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-medium">Data Processing</div>
                <p className="text-sm text-muted-foreground">
                  View how your data is processed and stored
                </p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <a
                  href="https://docs.example.com/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Policy
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Delete All Data</AlertTitle>
            <AlertDescription>
              Permanently delete all your data including documents, settings,
              and account information. This action cannot be undone and your
              account will be closed.
            </AlertDescription>
          </Alert>

          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <strong>What will be deleted:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>All documents and their content</li>
                <li>Account settings and preferences</li>
                <li>Activity logs and history</li>
                <li>Shared documents and permissions</li>
                <li>Your user account</li>
              </ul>
            </div>

            <Button
              variant="destructive"
              onClick={handleDeleteAllData}
              disabled={isDeletingData}
              loading={isDeletingData}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {isDeletingData ? "Deleting..." : "Delete All My Data"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
