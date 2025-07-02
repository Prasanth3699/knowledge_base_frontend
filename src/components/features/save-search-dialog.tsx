"use client";

import { useState } from "react";
import { Save } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import { AdvancedSearchFilters } from "@/types";
import { toast } from "sonner";

interface SaveSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  searchQuery: string;
  filters: AdvancedSearchFilters;
}

export function SaveSearchDialog({
  open,
  onOpenChange,
  searchQuery,
  filters,
}: SaveSearchDialogProps) {
  const [name, setName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a name for your saved search");
      return;
    }

    setIsSaving(true);
    try {
      await api.post("/search/saved/", {
        name: name.trim(),
        query: searchQuery,
        filters,
      });

      toast.success("Search saved successfully!");
      onOpenChange(false);
      setName("");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to save search";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Search
          </DialogTitle>
          <DialogDescription>
            Save this search to quickly access it later
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="search-name">Search Name</Label>
            <Input
              id="search-name"
              placeholder="Enter a name for this search"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-2">Search Details:</div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>Query: "{searchQuery}"</div>
              {filters.search_type !== "all" && (
                <div>Type: {filters.search_type}</div>
              )}
              {filters.visibility && (
                <div>Visibility: {filters.visibility}</div>
              )}
              {(filters.min_word_count || filters.max_word_count) && (
                <div>
                  Word count: {filters.min_word_count || 0} -{" "}
                  {filters.max_word_count || "∞"}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !name.trim()}
            loading={isSaving}
          >
            {isSaving ? "Saving..." : "Save Search"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
