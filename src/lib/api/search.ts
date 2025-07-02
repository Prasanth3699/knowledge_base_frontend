import { SearchResult, SavedSearch } from "@/types";
import { apiClient } from "./client";

export const searchService = {
  async globalSearch(params: {
    query: string;
    type?: "all" | "documents" | "users";
    sortBy?: string;
    dateFilter?: string;
    visibilityFilter?: string;
    tags?: string[];
    authorId?: string;
  }): Promise<SearchResult> {
    const searchParams = new URLSearchParams();
    
    searchParams.append("q", params.query);
    if (params.type && params.type !== "all") searchParams.append("type", params.type);
    if (params.sortBy) searchParams.append("sort", params.sortBy);
    if (params.dateFilter && params.dateFilter !== "all") {
      searchParams.append("date_filter", params.dateFilter);
    }
    if (params.visibilityFilter && params.visibilityFilter !== "all") {
      searchParams.append("visibility", params.visibilityFilter);
    }
    if (params.tags?.length) {
      params.tags.forEach(tag => searchParams.append("tags", tag));
    }
    if (params.authorId) searchParams.append("author", params.authorId);

    return apiClient.get(`/search/?${searchParams.toString()}`);
  },

  async getSearchHistory(): Promise<SavedSearch[]> {
    return apiClient.get("/search/history/");
  },

  async saveSearch(query: string, filters: any): Promise<SavedSearch> {
    return apiClient.post("/search/saved/", { query, filters });
  },

  async getSavedSearches(): Promise<SavedSearch[]> {
    return apiClient.get("/search/saved/");
  },

  async deleteSavedSearch(id: string): Promise<void> {
    return apiClient.delete(`/search/saved/${id}/`);
  },

  async getSearchSuggestions(query: string): Promise<string[]> {
    return apiClient.get(`/search/suggestions/?q=${encodeURIComponent(query)}`);
  },

  async getPopularSearches(): Promise<string[]> {
    return apiClient.get("/search/popular/");
  },

  async clearSearchHistory(): Promise<void> {
    return apiClient.delete("/search/history/");
  },
};
