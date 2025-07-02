"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  Plus,
  Share2,
  TrendingUp,
  Users,
  Eye,
  Edit,
  Clock,
  Star,
  Search,
  Activity,
  Calendar,
  BarChart3,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MainLayout } from "@/components/layout/main-layout";
import { useAuth } from "@/hooks/use-auth";
import { useDocuments } from "@/hooks/use-documents";
import { useStats } from "@/hooks/use-stats";
import { Document, DocumentShare } from "@/types";
import { timeAgo, formatDate, getInitials } from "@/lib/utils";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
    },
  },
};

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { documents, isLoading: docsLoading } = useDocuments();
  const { stats, isLoading: statsLoading } = useStats();
  const [activeTab, setActiveTab] = useState("overview");

  // Process documents for dashboard display
  const recentDocuments = documents?.slice(0, 5) || [];
  const myDocuments =
    documents?.filter((doc) => doc.author.id === user?.id) || [];
  const sharedDocuments =
    documents?.filter((doc) => doc.author.id !== user?.id) || [];

  const handleCreateDocument = () => {
    router.push("/documents/new");
  };

  const handleViewDocument = (document: Document) => {
    router.push(`/documents/${document.id}`);
  };

  const StatCard = ({
    title,
    value,
    change,
    icon: Icon,
    color = "primary",
  }: {
    title: string;
    value: string | number;
    change?: string;
    icon: any;
    color?: "primary" | "secondary" | "success" | "warning";
  }) => (
    <motion.div variants={itemVariants}>
      <Card className="card-hover">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{value}</p>
                {change && (
                  <Badge
                    variant={color === "success" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {change}
                  </Badge>
                )}
              </div>
            </div>
            <div className={`p-3 rounded-full bg-${color}/10`}>
              <Icon className={`h-5 w-5 text-${color}`} />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const DocumentCard = ({ document }: { document: Document }) => (
    <motion.div variants={itemVariants}>
      <Card
        className="group card-hover cursor-pointer"
        onClick={() => handleViewDocument(document)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium hover:text-primary transition-colors truncate">
                {document.title}
              </h3>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={document.author.avatar} />
                    <AvatarFallback className="text-xs">
                      {getInitials(document.author.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{document.author.full_name}</span>
                </div>
                <span>{timeAgo(document.updated_at)}</span>
                <span>{document.word_count} words</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  document.visibility === "public" ? "default" : "secondary"
                }
              >
                {document.visibility}
              </Badge>
              {document.author.id !== user?.id && (
                <Badge variant="outline">Shared</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const ActivityItem = ({ activity }: { activity: any }) => (
    <motion.div variants={itemVariants}>
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="p-2 rounded-full bg-primary/10">
          <Activity className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{activity.description}</p>
          <p className="text-xs text-muted-foreground">
            {timeAgo(activity.created_at)}
          </p>
        </div>
      </div>
    </motion.div>
  );

  if (docsLoading || statsLoading) {
    return (
      <MainLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-48 bg-muted rounded animate-pulse mb-2" />
              <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back, {user?.first_name}!
            </h1>
            <p className="text-muted-foreground">
              Here's what's happening with your documents
            </p>
          </div>
          <Button onClick={handleCreateDocument} className="gap-2">
            <Plus className="h-4 w-4" />
            New Document
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Documents"
            value={stats?.total_documents || myDocuments.length}
            change="+12%"
            icon={FileText}
            color="primary"
          />
          <StatCard
            title="Shared Documents"
            value={stats?.shared_documents || sharedDocuments.length}
            change="+8%"
            icon={Share2}
            color="secondary"
          />
          <StatCard
            title="Total Views"
            value={
              stats?.total_views ||
              documents?.reduce((acc, doc) => acc + doc.view_count, 0) ||
              0
            }
            change="+23%"
            icon={Eye}
            color="success"
          />
          <StatCard
            title="Collaborators"
            value={stats?.collaborators || 0}
            change="+5%"
            icon={Users}
            color="warning"
          />
        </div>

        {/* Main Content */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Documents */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Recent Documents
                  </CardTitle>
                  <CardDescription>
                    Documents you've recently viewed or edited
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {recentDocuments.length > 0 ? (
                    recentDocuments.map((document) => (
                      <DocumentCard key={document.id} document={document} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No documents yet</p>
                      <Button
                        onClick={handleCreateDocument}
                        className="mt-4 gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create your first document
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleCreateDocument}
                    className="w-full justify-start gap-2"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                    New Document
                  </Button>
                  <Button
                    onClick={() => router.push("/search")}
                    className="w-full justify-start gap-2"
                    variant="outline"
                  >
                    <Search className="h-4 w-4" />
                    Search Documents
                  </Button>
                  <Button
                    onClick={() => router.push("/shared")}
                    className="w-full justify-start gap-2"
                    variant="outline"
                  >
                    <Share2 className="h-4 w-4" />
                    Shared with Me
                  </Button>
                  <Button
                    onClick={() => router.push("/starred")}
                    className="w-full justify-start gap-2"
                    variant="outline"
                  >
                    <Star className="h-4 w-4" />
                    Starred Documents
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Usage Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Usage Analytics
                </CardTitle>
                <CardDescription>
                  Your document activity over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Documents Created
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {myDocuments.length} this month
                    </span>
                  </div>
                  <Progress value={65} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Document Views</span>
                    <span className="text-sm text-muted-foreground">
                      {documents?.reduce((acc, doc) => acc + doc.view_count, 0)}{" "}
                      total
                    </span>
                  </div>
                  <Progress value={80} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Collaborations</span>
                    <span className="text-sm text-muted-foreground">
                      {sharedDocuments.length} shared
                    </span>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* My Documents */}
              <Card>
                <CardHeader>
                  <CardTitle>My Documents ({myDocuments.length})</CardTitle>
                  <CardDescription>Documents you've created</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {myDocuments.slice(0, 5).map((document) => (
                    <DocumentCard key={document.id} document={document} />
                  ))}
                  {myDocuments.length > 5 && (
                    <Button
                      onClick={() => router.push("/documents")}
                      variant="outline"
                      className="w-full"
                    >
                      View All ({myDocuments.length})
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Shared Documents */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Shared with Me ({sharedDocuments.length})
                  </CardTitle>
                  <CardDescription>Documents shared by others</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sharedDocuments.slice(0, 5).map((document) => (
                    <DocumentCard key={document.id} document={document} />
                  ))}
                  {sharedDocuments.length > 5 && (
                    <Button
                      onClick={() => router.push("/shared")}
                      variant="outline"
                      className="w-full"
                    >
                      View All ({sharedDocuments.length})
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Latest actions and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {/* Placeholder for activity items */}
                  <ActivityItem
                    activity={{
                      description: "Created document 'Project Proposal'",
                      created_at: new Date().toISOString(),
                    }}
                  />
                  <ActivityItem
                    activity={{
                      description: "Shared 'Meeting Notes' with team",
                      created_at: new Date(
                        Date.now() - 2 * 60 * 60 * 1000
                      ).toISOString(),
                    }}
                  />
                  <ActivityItem
                    activity={{
                      description: "Updated 'Documentation Guidelines'",
                      created_at: new Date(
                        Date.now() - 5 * 60 * 60 * 1000
                      ).toISOString(),
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </MainLayout>
  );
}
