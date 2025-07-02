"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bookmark,
  Search,
  Trash2,
  Edit,
  Clock,
  MoreHorizontal,
  Play,
} from "lucide-react";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { SavedSearch } from "@/types";
import { toast } from "sonner";

export default function SavedSearchesPage() {
  const router = useRouter();
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSavedSearches();
  }, []);

  const fetchSavedSearches = async () => {
    try {
      const response = await api.get("/search/saved/");
      setSavedSearches(response.data.results || response.data);
    } catch (error) {
      toast.error("Failed to fetch saved searches");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSearch = (savedSearch: SavedSearch) => {
    const params = new URLSearchParams();
    params.set("q", savedSearch.query);

    // Add filters to URL if they exist
    if (savedSearch.filters) {
      Object.entries(savedSearch.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, String(value));
        }
      });
    }

    router.push(`/search?${params.toString()}`);
  };

  const handleDeleteSearch = async (id: string) => {
    if (!confirm("Are you sure you want to delete this saved search?")) return;

    try {
      await api.delete(`/search/saved/${id}/`);
      setSavedSearches(savedSearches.filter((search) => search.id !== id));
      toast.success("Saved search deleted");
    } catch (error) {
      toast.error("Failed to delete saved search");
    }
  };

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
  };

  return (
    <MainLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Bookmark className="h-8 w-8" />
              Saved Searches
            </h1>
            <p className="text-muted-foreground">
              Quick access to your frequently used searches
            </p>
          </div>
          <Button onClick={() => router.push("/search")} className="gap-2">
            <Search className="h-4 w-4" />
            New Search
          </Button>
        </div>

        {/* Saved Searches */}
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="animate-pulse">
                  <div className="h-6 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-full" />
                </CardHeader>
                <CardContent className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : savedSearches.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {savedSearches.map((savedSearch) => (
                <motion.div
                  key={savedSearch.id}
                  variants={itemVariants}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="group card-hover h-full">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg line-clamp-2">
                            {savedSearch.name}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            "{savedSearch.query}"
                          </CardDescription>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRunSearch(savedSearch)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Run Search
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteSearch(savedSearch.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {/* Search Filters */}
                        {savedSearch.filters &&
                          Object.keys(savedSearch.filters).length > 0 && (
                            <div className="text-sm text-muted-foreground">
                              <div className="font-medium mb-1">Filters:</div>
                              <div className="space-y-1">
                                {savedSearch.filters.search_type !== "all" && (
                                  <div>
                                    Type: {savedSearch.filters.search_type}
                                  </div>
                                )}
                                {savedSearch.filters.visibility && (
                                  <div>
                                    Visibility: {savedSearch.filters.visibility}
                                  </div>
                                )}
                                {(savedSearch.filters.min_word_count ||
                                  savedSearch.filters.max_word_count) && (
                                  <div>
                                    Words:{" "}
                                    {savedSearch.filters.min_word_count || 0} -{" "}
                                    {savedSearch.filters.max_word_count || "∞"}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Created {timeAgo(savedSearch.created_at)}
                            </span>
                          </div>
                          {savedSearch.last_used_at && (
                            <span>
                              Used {timeAgo(savedSearch.last_used_at)}
                            </span>
                          )}
                        </div>

                        {/* Action Button */}
                        <Button
                          onClick={() => handleRunSearch(savedSearch)}
                          className="w-full gap-2"
                          size="sm"
                        >
                          <Play className="h-4 w-4" />
                          Run Search
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No saved searches</h3>
            <p className="text-muted-foreground mb-4">
              Save your frequently used searches for quick access
            </p>
            <Button onClick={() => router.push("/search")} className="gap-2">
              <Search className="h-4 w-4" />
              Start Searching
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
