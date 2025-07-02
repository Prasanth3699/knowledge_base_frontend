import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { searchService } from "@/lib/api/search";
import { SearchResult, SavedSearch } from "@/types";

interface SearchParams {
  query: string;
  type?: "all" | "documents" | "users";
  sortBy?: string;
  dateFilter?: string;
  visibilityFilter?: string;
  tags?: string[];
  authorId?: string;
}

export function useSearch() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState<SearchParams | null>(null);

  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["search", searchParams],
    queryFn: () => searchService.globalSearch(searchParams!),
    enabled: !!searchParams?.query,
    staleTime: 30 * 1000, // 30 seconds
  });

  const {
    data: searchHistory = [],
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ["search-history"],
    queryFn: () => searchService.getSearchHistory(),
  });

  const {
    data: savedSearches = [],
    refetch: refetchSaved,
  } = useQuery({
    queryKey: ["saved-searches"],
    queryFn: () => searchService.getSavedSearches(),
  });

  const {
    data: popularSearches = [],
  } = useQuery({
    queryKey: ["popular-searches"],
    queryFn: () => searchService.getPopularSearches(),
    staleTime: 60 * 60 * 1000, // 1 hour
  });

  const saveSearchMutation = useMutation({
    mutationFn: ({ query, filters }: { query: string; filters: any }) =>
      searchService.saveSearch(query, filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-searches"] });
    },
  });

  const clearHistoryMutation = useMutation({
    mutationFn: () => searchService.clearSearchHistory(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["search-history"] });
    },
  });

  const performSearch = useCallback((params: SearchParams) => {
    setSearchParams(params);
  }, []);

  const saveSearch = useCallback(async (query: string, filters: any) => {
    return saveSearchMutation.mutateAsync({ query, filters });
  }, [saveSearchMutation]);

  const clearHistory = useCallback(async () => {
    return clearHistoryMutation.mutateAsync();
  }, [clearHistoryMutation]);

  const getSuggestions = useCallback(async (query: string) => {
    return searchService.getSearchSuggestions(query);
  }, []);

  return {
    searchResults,
    searchHistory,
    savedSearches,
    popularSearches,
    isLoading,
    error,
    performSearch,
    saveSearch,
    clearHistory,
    getSuggestions,
    isSaving: saveSearchMutation.isPending,
  };
}