import { create } from "zustand";
import { Document } from "@/types";

interface DocumentsState {
  documents: Document[];
  currentDocument: Document | null;
  recentDocuments: Document[];
  starredDocuments: string[];
  isLoading: boolean;
  
  setDocuments: (documents: Document[]) => void;
  addDocument: (document: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  setCurrentDocument: (document: Document | null) => void;
  addToRecent: (document: Document) => void;
  toggleStar: (documentId: string) => void;
  setLoading: (loading: boolean) => void;
  
  // Filters
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  visibilityFilter: "all" | "public" | "private";
  setVisibilityFilter: (filter: "all" | "public" | "private") => void;
  
  sortBy: "updated" | "created" | "title" | "views";
  setSortBy: (sort: "updated" | "created" | "title" | "views") => void;
  
  sortOrder: "asc" | "desc";
  setSortOrder: (order: "asc" | "desc") => void;
}

export const useDocumentsStore = create<DocumentsState>()((set, get) => ({
  documents: [],
  currentDocument: null,
  recentDocuments: [],
  starredDocuments: [],
  isLoading: false,
  
  setDocuments: (documents) => set({ documents }),
  
  addDocument: (document) => {
    const { documents } = get();
    set({ documents: [document, ...documents] });
  },
  
  updateDocument: (id, updates) => {
    const { documents, currentDocument } = get();
    const newDocuments = documents.map(d => 
      d.id === id ? { ...d, ...updates } : d
    );
    const newCurrentDocument = currentDocument?.id === id 
      ? { ...currentDocument, ...updates } 
      : currentDocument;
    
    set({ 
      documents: newDocuments, 
      currentDocument: newCurrentDocument 
    });
  },
  
  removeDocument: (id) => {
    const { documents } = get();
    const newDocuments = documents.filter(d => d.id !== id);
    set({ 
      documents: newDocuments,
      currentDocument: null 
    });
  },
  
  setCurrentDocument: (document) => {
    set({ currentDocument: document });
    if (document) {
      get().addToRecent(document);
    }
  },
  
  addToRecent: (document) => {
    const { recentDocuments } = get();
    const newRecent = [
      document,
      ...recentDocuments.filter(d => d.id !== document.id)
    ].slice(0, 10);
    set({ recentDocuments: newRecent });
  },
  
  toggleStar: (documentId) => {
    const { starredDocuments } = get();
    const newStarred = starredDocuments.includes(documentId)
      ? starredDocuments.filter(id => id !== documentId)
      : [...starredDocuments, documentId];
    set({ starredDocuments: newStarred });
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  
  // Filters
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  
  visibilityFilter: "all",
  setVisibilityFilter: (visibilityFilter) => set({ visibilityFilter }),
  
  sortBy: "updated",
  setSortBy: (sortBy) => set({ sortBy }),
  
  sortOrder: "desc",
  setSortOrder: (sortOrder) => set({ sortOrder }),
}));