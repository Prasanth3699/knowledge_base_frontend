"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  User,
  Bell,
  Shield,
  Palette,
  Download,
  Trash2,
  Key,
} from "lucide-react";

import { MainLayout } from "@/components/layout/main-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/profile-settings";
import { NotificationSettings } from "@/components/settings/notification-settings";
import { SecuritySettings } from "@/components/settings/security-settings";
import { PreferencesSettings } from "@/components/settings/preferences-settings";
import { DataSettings } from "@/components/settings/data-settings";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");

  const settingsTabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "Manage your profile information",
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      description: "Configure notification preferences",
    },
    {
      id: "security",
      label: "Security",
      icon: Shield,
      description: "Password and security settings",
    },
    {
      id: "preferences",
      label: "Preferences",
      icon: Palette,
      description: "Customize your experience",
    },
    {
      id: "data",
      label: "Data & Privacy",
      icon: Download,
      description: "Export data and privacy controls",
    },
  ];

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <Settings className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
              <p className="text-muted-foreground">
                Manage your account settings and preferences
              </p>
            </div>
          </div>
        </motion.div>

        {/* Settings Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            {/* Tabs Navigation */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
              <Card className="lg:col-span-1">
                <CardContent className="p-0">
                  <TabsList className="grid w-full grid-cols-1 h-auto bg-transparent p-2 space-y-1">
                    {settingsTabs.map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <TabsTrigger
                          key={tab.id}
                          value={tab.id}
                          className="w-full justify-start gap-3 px-3 py-3 text-left data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                          <Icon className="h-4 w-4" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium">{tab.label}</div>
                            <div className="text-xs opacity-70 truncate">
                              {tab.description}
                            </div>
                          </div>
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>
                </CardContent>
              </Card>

              {/* Settings Content */}
              <div className="lg:col-span-4">
                <TabsContent value="profile" className="mt-0">
                  <ProfileSettings />
                </TabsContent>

                <TabsContent value="notifications" className="mt-0">
                  <NotificationSettings />
                </TabsContent>

                <TabsContent value="security" className="mt-0">
                  <SecuritySettings />
                </TabsContent>

                <TabsContent value="preferences" className="mt-0">
                  <PreferencesSettings />
                </TabsContent>

                <TabsContent value="data" className="mt-0">
                  <DataSettings />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
}
