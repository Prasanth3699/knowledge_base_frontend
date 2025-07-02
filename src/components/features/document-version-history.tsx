("use client");

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, User, RotateCcw, Eye, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { api } from "@/lib/api";
import { getInitials, timeAgo, formatDateTime } from "@/lib/utils";
import { DocumentVersion } from "@/types";
import { toast } from "sonner";

interface DocumentVersionHistoryProps {
  documentId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentVersionHistory({
  documentId,
  open,
  onOpenChange,
}: DocumentVersionHistoryProps) {
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] =
    useState<DocumentVersion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReverting, setIsReverting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchVersions();
    }
  }, [open, documentId]);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const response = await api.get(`/documents/${documentId}/versions/`);
      setVersions(response.data);
    } catch (error) {
      toast.error("Failed to fetch version history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevertToVersion = async (version: DocumentVersion) => {
    if (
      !confirm(
        `Are you sure you want to revert to version ${version.version_number}?`
      )
    ) {
      return;
    }

    setIsReverting(true);
    try {
      await api.post(`/documents/${documentId}/revert-to-version/`, {
        version_id: version.id,
      });
      toast.success("Document reverted successfully");
      onOpenChange(false);
      // Refresh the page to show the reverted content
      window.location.reload();
    } catch (error) {
      toast.error("Failed to revert document");
    } finally {
      setIsReverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Version History</DialogTitle>
          <DialogDescription>
            View and restore previous versions of this document
          </DialogDescription>
        </DialogHeader>

        <div className="flex h-[70vh]">
          {/* Versions List */}
          <div className="w-1/3 border-r">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-2">
                {isLoading ? (
                  [...Array(5)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-4">
                        <div className="h-4 bg-muted rounded mb-2" />
                        <div className="h-3 bg-muted rounded w-2/3" />
                      </CardContent>
                    </Card>
                  ))
                ) : versions.length > 0 ? (
                  <AnimatePresence>
                    {versions.map((version, index) => (
                      <motion.div
                        key={version.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card
                          className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                            selectedVersion?.id === version.id
                              ? "bg-accent"
                              : ""
                          }`}
                          onClick={() => setSelectedVersion(version)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">
                                Version {version.version_number}
                              </span>
                              {index === 0 && (
                                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                                  Current
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Avatar className="h-4 w-4">
                                <AvatarImage
                                  src={version.version_author?.avatar}
                                />
                                <AvatarFallback className="text-xs">
                                  {version.version_author &&
                                    getInitials(
                                      `${version.version_author.first_name} ${version.version_author.last_name}`
                                    )}
                                </AvatarFallback>
                              </Avatar>
                              <span>
                                {version.version_author?.full_name || "Unknown"}
                              </span>
                            </div>

                            <div className="text-xs text-muted-foreground">
                              {timeAgo(version.created_at)}
                            </div>

                            <div className="text-xs text-muted-foreground mt-1">
                              {version.word_count} words •{" "}
                              {version.character_count} characters
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No version history available
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Version Preview */}
          <div className="flex-1 flex flex-col">
            {selectedVersion ? (
              <>
                <div className="p-4 border-b bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">
                        Version {selectedVersion.version_number}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Created {formatDateTime(selectedVersion.created_at)} by{" "}
                        {selectedVersion.version_author?.full_name || "Unknown"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRevertToVersion(selectedVersion)}
                        disabled={isReverting}
                        className="gap-2"
                      >
                        <RotateCcw className="h-4 w-4" />
                        {isReverting
                          ? "Reverting..."
                          : "Revert to this version"}
                      </Button>
                    </div>
                  </div>
                </div>

                <ScrollArea className="flex-1 p-4">
                  <RichTextEditor
                    content={selectedVersion.content}
                    onChange={() => {}}
                    readOnly={true}
                    className="border-none"
                  />
                </ScrollArea>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Eye className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Select a version to preview
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
