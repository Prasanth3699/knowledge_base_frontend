"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  Search,
  Filter,
  Grid,
  List,
  MoreHorizontal,
  Eye,
  Edit,
  Share,
  Trash2,
  FileText,
  Globe,
  Lock,
  Clock,
  User,
  Tag,
  StarOff,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MainLayout } from "@/components/layout/main-layout";
import { useDocuments } from "@/hooks/use-documents";
import { useAuth } from "@/hooks/use-auth";
import { useDocumentsStore } from "@/store/documents";
import { Document } from "@/types";
import { timeAgo, getInitials, cn } from "@/lib/utils";
import { toast } from "sonner";

type ViewMode = "grid" | "list";
type SortBy = "starred_date" | "updated" | "title" | "views";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
};

export default function StarredDocumentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { documents, isLoading } = useDocuments();
  const { starredDocuments, toggleStar } = useDocumentsStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortBy>("starred_date");
  const [visibilityFilter, setVisibilityFilter] = useState<string>("all");

  // Filter starred documents
  const starredDocs = useMemo(() => {
    if (!documents) return [];
    
    let filtered = documents.filter(doc => starredDocuments.includes(doc.id));

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.author.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply visibility filter
    if (visibilityFilter !== "all") {
      filtered = filtered.filter(doc => doc.visibility === visibilityFilter);
    }

    // Sort documents
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title);
        case "updated":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case "views":
          return b.view_count - a.view_count;
        case "starred_date":
        default:
          // For starred_date, we'd need to track when each document was starred
          // For now, fall back to updated_at
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });

    return filtered;
  }, [documents, starredDocuments, searchQuery, visibilityFilter, sortBy]);

  const handleDocumentClick = (document: Document) => {
    router.push(`/documents/${document.id}`);
  };

  const handleUnstar = (document: Document) => {
    toggleStar(document.id);
    toast.success("Removed from starred documents");
  };

  const StarredDocumentGridItem = ({ document }: { document: Document }) => (
    <motion.div variants={itemVariants}>
      <Card className="group card-hover h-full">
        <CardContent className="p-4 h-full flex flex-col">
          <div 
            className="flex-1 cursor-pointer"
            onClick={() => handleDocumentClick(document)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleDocumentClick(document)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  {document.author.id === user?.id && (
                    <DropdownMenuItem onClick={() => router.push(`/documents/${document.id}/edit`)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleUnstar(document)}
                    className="text-orange-600"
                  >
                    <StarOff className="h-4 w-4 mr-2" />
                    Remove from Starred
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <h3 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {document.title}
            </h3>

            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {document.description || "No description"}
            </p>

            <div className="flex items-center gap-2 mb-3">
              <Badge variant={document.visibility === "public" ? "default" : "secondary"}>
                {document.visibility === "public" ? (
                  <><Globe className="h-3 w-3 mr-1" /> Public</>
                ) : (
                  <><Lock className="h-3 w-3 mr-1" /> Private</>
                )}
              </Badge>
              {document.author.id !== user?.id && (
                <Badge variant="outline">Shared</Badge>
              )}
              <div className="ml-auto">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </div>
            </div>

            {document.tags && document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {document.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="h-2 w-2 mr-1" />{tag}
                  </Badge>
                ))}
                {document.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{document.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="space-y-2 mt-auto">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Avatar className="h-4 w-4">
                <AvatarImage src={document.author.avatar} />
                <AvatarFallback className="text-xs">
                  {getInitials(document.author.full_name)}
                </AvatarFallback>
              </Avatar>
              <span>{document.author.full_name}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(document.updated_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {document.view_count}
                </span>
              </div>
              <span>{document.word_count} words</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const StarredDocumentListItem = ({ document }: { document: Document }) => (
    <motion.div variants={itemVariants}>
      <Card className="group card-hover">
        <CardContent className="p-4">
          <div 
            className="flex items-center gap-4 cursor-pointer"
            onClick={() => handleDocumentClick(document)}
          >
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold hover:text-primary transition-colors truncate">
                  {document.title}
                </h3>
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Badge variant={document.visibility === "public" ? "default" : "secondary"}>
                  {document.visibility === "public" ? (
                    <><Globe className="h-3 w-3 mr-1" /> Public</>
                  ) : (
                    <><Lock className="h-3 w-3 mr-1" /> Private</>
                  )}
                </Badge>
                {document.author.id !== user?.id && (
                  <Badge variant="outline">Shared</Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                <span>{document.view_count} views</span>
              </div>

              {document.tags && document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {document.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="h-2 w-2 mr-1" />{tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDocumentClick(document)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                {document.author.id === user?.id && (
                  <DropdownMenuItem onClick={() => router.push(`/documents/${document.id}/edit`)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleUnstar(document)}
                  className="text-orange-600"
                >
                  <StarOff className="h-4 w-4 mr-2" />
                  Remove from Starred
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-muted rounded animate-pulse" />
            <div className="h-10 w-32 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
              Starred Documents
            </h1>
            <p className="text-muted-foreground">
              Your favorite documents in one place
            </p>
          </div>
          <Button onClick={() => router.push("/documents")} className="gap-2">
            <FileText className="h-4 w-4" />
            Browse All Documents
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">{starredDocs.length}</p>
                  <p className="text-sm text-muted-foreground">Starred</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">
                    {starredDocs.filter(doc => doc.author.id === user?.id).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Your Documents</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Share className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-2xl font-bold">
                    {starredDocs.filter(doc => doc.author.id !== user?.id).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Shared</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search starred documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={visibilityFilter} onValueChange={setVisibilityFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Documents</SelectItem>
              <SelectItem value="private">Private Only</SelectItem>
              <SelectItem value="public">Public Only</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="starred_date">Date Starred</SelectItem>
              <SelectItem value="updated">Last Updated</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="views">View Count</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Documents Grid/List */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            "gap-6",
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          )}
        >
          <AnimatePresence mode="wait">
            {starredDocs.length > 0 ? (
              starredDocs.map((document) => (
                viewMode === "grid" ? (
                  <StarredDocumentGridItem key={document.id} document={document} />
                ) : (
                  <StarredDocumentListItem key={document.id} document={document} />
                )
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full text-center py-12"
              >
                <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold mb-2">No starred documents</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "No starred documents match your search"
                    : "Star documents to see them here for quick access"
                  }
                </p>
                {!searchQuery && (
                  <Button onClick={() => router.push("/documents")} className="gap-2">
                    <FileText className="h-4 w-4" />
                    Browse Documents
                  </Button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </MainLayout>
  );
}