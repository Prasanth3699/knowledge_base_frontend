// src/app/search/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  FileText,
  User,
  Filter,
  Clock,
  Calendar,
  Eye,
  Globe,
  Lock,
  Tag,
  TrendingUp,
  History,
  Bookmark,
  X,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { MainLayout } from "@/components/layout/main-layout";
import { useSearch } from "@/hooks/use-search";
import { useAuth } from "@/hooks/use-auth";
import { Document, User as UserType, SearchResult } from "@/types";
import { timeAgo, getInitials, highlightText, cn } from "@/lib/utils";
import { toast } from "sonner";

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

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [searchType, setSearchType] = useState<"all" | "documents" | "users">("all");
  const [sortBy, setSortBy] = useState<"relevance" | "date" | "title">("relevance");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month" | "year">("all");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [authorFilter, setAuthorFilter] = useState<string>("all");

  const {
    searchResults,
    isLoading,
    searchHistory,
    popularSearches,
    suggestions,
    performSearch,
    saveSearch,
    clearHistory,
  } = useSearch();

  const debouncedSearch = useMemo(() => {
    const timeout = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch({
          query: searchQuery,
          type: searchType,
          sortBy,
          dateFilter,
          visibilityFilter,
          tags: selectedTags,
          authorId: authorFilter !== "all" ? authorFilter : undefined,
        });
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchQuery, searchType, sortBy, dateFilter, visibilityFilter, selectedTags, authorFilter]);

  useEffect(() => {
    return debouncedSearch;
  }, [debouncedSearch]);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      performSearch({
        query: searchQuery,
        type: searchType,
        sortBy,
        dateFilter,
        visibilityFilter,
        tags: selectedTags,
        authorId: authorFilter !== "all" ? authorFilter : undefined,
      });
    }
  };

  const handleSaveSearch = async () => {
    if (searchQuery.trim()) {
      try {
        await saveSearch(searchQuery, {
          type: searchType,
          sortBy,
          dateFilter,
          visibilityFilter,
          tags: selectedTags,
          authorId: authorFilter !== "all" ? authorFilter : undefined,
        });
        toast.success("Search saved");
      } catch (error) {
        toast.error("Failed to save search");
      }
    }
  };

  const handleQuickSearch = (query: string) => {
    setSearchQuery(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  const handleClearFilters = () => {
    setSearchType("all");
    setSortBy("relevance");
    setDateFilter("all");
    setVisibilityFilter("all");
    setSelectedTags([]);
    setAuthorFilter("all");
  };

  const DocumentResult = ({ document }: { document: Document }) => (
    <motion.div variants={itemVariants}>
      <Card 
        className="group card-hover cursor-pointer"
        onClick={() => router.push(`/documents/${document.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold hover:text-primary transition-colors truncate">
                  {highlightText(document.title, searchQuery)}
                </h3>
                <Badge variant={document.visibility === "public" ? "default" : "secondary"}>
                  {document.visibility === "public" ? (
                    <><Globe className="h-3 w-3 mr-1" /> Public</>
                  ) : (
                    <><Lock className="h-3 w-3 mr-1" /> Private</>
                  )}
                </Badge>
              </div>

              {document.content && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {highlightText(
                    document.content.replace(/<[^>]*>/g, "").substring(0, 200) + "...",
                    searchQuery
                  )}
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={document.author.avatar} />
                    <AvatarFallback className="text-xs">
                      {getInitials(document.author.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{document.author.full_name}</span>
                </div>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo(document.updated_at)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {document.view_count} views
                </span>
                <span>{document.word_count} words</span>
              </div>

              {document.tags && document.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {document.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      <Tag className="h-2 w-2 mr-1" />
                      {highlightText(tag, searchQuery)}
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

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle bookmark
                }}
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const UserResult = ({ user: resultUser }: { user: UserType }) => (
    <motion.div variants={itemVariants}>
      <Card 
        className="group card-hover cursor-pointer"
        onClick={() => router.push(`/users/${resultUser.id}`)}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={resultUser.avatar} />
              <AvatarFallback>
                {getInitials(resultUser.full_name)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold hover:text-primary transition-colors">
                {highlightText(resultUser.full_name, searchQuery)}
              </h3>
              <p className="text-sm text-muted-foreground">
                @{highlightText(resultUser.username, searchQuery)}
              </p>
              <p className="text-sm text-muted-foreground">
                {highlightText(resultUser.email, searchQuery)}
              </p>
            </div>

            <Badge variant="outline">
              <User className="h-3 w-3 mr-1" />
              User
            </Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center py-12"
    >
      <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
      <h3 className="text-lg font-semibold mb-2">
        {searchQuery ? "No results found" : "Start searching"}
      </h3>
      <p className="text-muted-foreground mb-6">
        {searchQuery
          ? "Try adjusting your search terms or filters"
          : "Search through documents and users to find what you need"
        }
      </p>
      
      {!searchQuery && popularSearches && popularSearches.length > 0 && (
        <div className="max-w-md mx-auto">
          <h4 className="font-medium mb-3">Popular searches</h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {popularSearches.map((search) => (
              <Button
                key={search}
                variant="outline"
                size="sm"
                onClick={() => handleQuickSearch(search)}
                className="gap-2"
              >
                <TrendingUp className="h-3 w-3" />
                {search}
              </Button>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );

  const hasActiveFilters = searchType !== "all" || sortBy !== "relevance" || 
    dateFilter !== "all" || visibilityFilter !== "all" || 
    selectedTags.length > 0 || authorFilter !== "all";

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Search className="h-8 w-8" />
              Search
            </h1>
            <p className="text-muted-foreground">
              Find documents, users, and content across your workspace
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="p-4">
            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search documents, users, and content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-24"
                  autoFocus
                />
                {searchQuery && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => setSearchQuery("")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <Button type="submit" size="sm">
                      Search
                    </Button>
                  </div>
                )}
              </div>

              {/* Quick Filters */}
              <div className="flex items-center gap-4 flex-wrap">
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Results</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="title">Title</SelectItem>
                  </SelectContent>
                </Select>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filters
                      {hasActiveFilters && (
                        <Badge variant="secondary" className="ml-1 text-xs">
                          {[searchType !== "all", sortBy !== "relevance", dateFilter !== "all", 
                            visibilityFilter !== "all", selectedTags.length > 0, 
                            authorFilter !== "all"].filter(Boolean).length}
                        </Badge>
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Date Range</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setDateFilter("today")}>
                      Today
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDateFilter("week")}>
                      This Week
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDateFilter("month")}>
                      This Month
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setDateFilter("year")}>
                      This Year
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Visibility</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => setVisibilityFilter("public")}>
                      Public Only
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setVisibilityFilter("private")}>
                      Private Only
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    onClick={handleClearFilters}
                    className="gap-2 text-muted-foreground"
                  >
                    <X className="h-3 w-3" />
                    Clear Filters
                  </Button>
                )}

                <div className="ml-auto flex items-center gap-2">
                  {searchQuery && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSaveSearch}
                      className="gap-2"
                    >
                      <Bookmark className="h-3 w-3" />
                      Save Search
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchQuery && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {isLoading ? "Searching..." : 
                searchResults ? 
                  `${searchResults.total_documents + searchResults.total_users} results found` :
                  "No results"
              }
            </span>
            {searchResults && searchResults.search_time && (
              <span className="text-xs text-muted-foreground">
                ({(searchResults.search_time * 1000).toFixed(0)}ms)
              </span>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-full" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : searchResults && (searchResults.documents.length > 0 || searchResults.users.length > 0) ? (
          <Tabs defaultValue="all" className="space-y-6">
            <TabsList>
              <TabsTrigger value="all">
                All ({searchResults.total_documents + searchResults.total_users})
              </TabsTrigger>
              <TabsTrigger value="documents">
                Documents ({searchResults.total_documents})
              </TabsTrigger>
              <TabsTrigger value="users">
                Users ({searchResults.total_users})  
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {searchResults.documents.map((document) => (
                  <DocumentResult key={document.id} document={document} />
                ))}
                {searchResults.users.map((user) => (
                  <UserResult key={user.id} user={user} />
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {searchResults.documents.map((document) => (
                  <DocumentResult key={document.id} document={document} />
                ))}
              </motion.div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {searchResults.users.map((user) => (
                  <UserResult key={user.id} user={user} />
                ))}
              </motion.div>
            </TabsContent>
          </Tabs>
        ) : (
          <EmptyState />
        )}

        {/* Search History Sidebar */}
        {searchHistory && searchHistory.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Recent Searches
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearHistory}
                  className="text-muted-foreground"
                >
                  Clear
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {searchHistory.slice(0, 5).map((search, index) => (
                  <Button
                    key={index}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left"
                    onClick={() => handleQuickSearch(search.query)}
                  >
                    <Clock className="h-3 w-3 mr-2" />
                    {search.query}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}