import { create } from "zustand";

interface EditorState {
  isAutoSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  wordCount: number;
  characterCount: number;
  
  setAutoSaving: (saving: boolean) => void;
  setLastSaved: (date: Date | null) => void;
  setUnsavedChanges: (hasChanges: boolean) => void;
  setWordCount: (count: number) => void;
  setCharacterCount: (count: number) => void;
  
  // Editor settings
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  showWordCount: boolean;
  showCharacterCount: boolean;
  autoSaveInterval: number;
  
  updateSettings: (settings: Partial<Pick<EditorState, 
    "fontSize" | "fontFamily" | "lineHeight" | "showWordCount" | 
    "showCharacterCount" | "autoSaveInterval">>) => void;
}

export const useEditorStore = create<EditorState>()((set, get) => ({
  isAutoSaving: false,
  lastSaved: null,
  hasUnsavedChanges: false,
  wordCount: 0,
  characterCount: 0,
  
  setAutoSaving: (isAutoSaving) => set({ isAutoSaving }),
  setLastSaved: (lastSaved) => set({ lastSaved }),
  setUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),
  setWordCount: (wordCount) => set({ wordCount }),
  setCharacterCount: (characterCount) => set({ characterCount }),
  
  // Default editor settings
  fontSize: 14,
  fontFamily: "Inter",
  lineHeight: 1.6,
  showWordCount: true,
  showCharacterCount: true,
  autoSaveInterval: 2000,
  
  updateSettings: (settings) => {
    set((state) => ({ ...state, ...settings }));
  },
}));