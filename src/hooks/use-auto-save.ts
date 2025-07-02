import { useEffect, useRef } from "react";
import { useDocument } from "./use-document";
import { useDebounce } from "./use-debounce";

export function useAutoSave(documentId: string, content: string, enabled = true) {
  const { autoSaveDocument } = useDocument(documentId);
  const lastSavedContent = useRef(content);
  
  const debouncedSave = useDebounce(async () => {
    if (enabled && content !== lastSavedContent.current) {
      try {
        await autoSaveDocument(content);
        lastSavedContent.current = content;
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }
  }, 2000);

  useEffect(() => {
    if (enabled && content !== lastSavedContent.current) {
      debouncedSave();
    }
  }, [content, enabled, debouncedSave]);

  return {
    isAutoSaving: content !== lastSavedContent.current,
  };
}

