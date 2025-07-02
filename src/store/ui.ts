import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
  
  lastVisitedPage: string;
  setLastVisitedPage: (page: string) => void;
  
  recentSearches: string[];
  addRecentSearch: (search: string) => void;
  clearRecentSearches: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      
      theme: "system",
      setTheme: (theme) => set({ theme }),
      
      lastVisitedPage: "/dashboard",
      setLastVisitedPage: (page) => set({ lastVisitedPage: page }),
      
      recentSearches: [],
      addRecentSearch: (search) => {
        const searches = get().recentSearches;
        const newSearches = [search, ...searches.filter(s => s !== search)].slice(0, 10);
        set({ recentSearches: newSearches });
      },
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        theme: state.theme,
        lastVisitedPage: state.lastVisitedPage,
        recentSearches: state.recentSearches,
      }),
    }
  )
);






