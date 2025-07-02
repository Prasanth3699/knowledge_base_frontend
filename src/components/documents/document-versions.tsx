"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History,
  Clock,
  User,
  Eye,
  RotateCcw,
  GitBranch,
  FileText,
  Download,
  Compare,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  CheckCircle,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDocumentVersions } from "@/hooks/use-document-versions";
import { useAuth } from "@/hooks/use-auth";
import { Document, DocumentVersion } from "@/types";
import { timeAgo, formatDate, getInitials } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentVersionsProps {
  document: Document;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRestoreVersion?: (versionId: string) => void;
}

interface VersionItemProps {
  version: DocumentVersion;
  isLatest: boolean;
  isComparing: boolean;
  onView: (version: DocumentVersion) => void;
  onRestore: (version: DocumentVersion) => void;
  onCompare: (version: DocumentVersion) => void;
  canRestore: boolean;
}

const VersionItem = ({
  version,
  isLatest,
  isComparing,
  onView,
  onRestore,
  onCompare,
  canRestore,
}: VersionItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="border rounded-lg p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <GitBranch className="h-4 w-4 text-primary" />
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm">
                Version {version.version_number}
              </span>
              {isLatest && (
                <Badge variant="default" className="text-xs">
                  Current
                </Badge>
              )}
              {isComparing && (
                <Badge variant="outline" className="text-xs">
                  Comparing
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo(version.created_at)}
              </div>
              {version.version_author && (
                <div className="flex items-center gap-1">
                  <Avatar className="h-3 w-3">
                    <AvatarImage src={version.version_author.avatar} />
                    <AvatarFallback className="text-xs">
                      {getInitials(version.version_author.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{version.version_author.full_name}</span>
                </div>
              )}
              <span>{version.word_count} words</span>
              <span>{version.character_count} characters</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(version)}>
                <Eye className="h-4 w-4 mr-2" />
                View Version
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCompare(version)}>
                <Compare className="h-4 w-4 mr-2" />
                Compare
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {canRestore && !isLatest && (
                <DropdownMenuItem 
                  onClick={() => onRestore(version)}
                  className="text-orange-600 focus:text-orange-600"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore Version
                </DropdownMenuItem>
              )}
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Export Version
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            <Separator />
            
            {version.changes_summary && (
              <div>
                <h4 className="text-sm font-medium mb-1">Changes Summary</h4>
                <p className="text-sm text-muted-foreground">
                  {version.changes_summary}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-2">{formatDate(version.created_at)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Size:</span>
                <span className="ml-2">
                  {version.word_count} words, {version.character_count} chars
                </span>
              </div>
            </div>

            {/* Content Preview */}
            <div>
              <h4 className="text-sm font-medium mb-2">Content Preview</h4>
              <div className="bg-muted/50 rounded p-3 text-sm">
                <div 
                  className="prose prose-sm max-w-none line-clamp-3"
                  dangerouslySetInnerHTML={{
                    __html: version.content.substring(0, 200) + "..."
                  }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export function DocumentVersionsDialog({
  document,
  isOpen,
  onOpenChange,
  onRestoreVersion,
}: DocumentVersionsProps) {
  const { user } = useAuth();
  const {
    versions,
    isLoading,
    compareVersions,
    restoreVersion,
    fetchVersions,
  } = useDocumentVersions(document.id);

  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState<{
    from: DocumentVersion | null;
    to: DocumentVersion | null;
  }>({ from: null, to: null });
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<DocumentVersion | null>(null);

  const isOwner = document.author.id === user?.id;
  const canRestore = isOwner; // Add more complex permission logic here

  useEffect(() => {
    if (isOpen) {
      fetchVersions();
    }
  }, [isOpen, fetchVersions]);

  const handleViewVersion = (version: DocumentVersion) => {
    setSelectedVersion(version);
  };

  const handleCompareVersion = (version: DocumentVersion) => {
    if (!compareMode) {
      setCompareMode(true);
      setCompareVersions({ from: version, to: null });
    } else if (!compareVersions.to) {
      setCompareVersions(prev => ({ ...prev, to: version }));
    } else {
      // Reset and start new comparison
      setCompareVersions({ from: version, to: null });
    }
  };

  const handleRestoreVersion = async (version: DocumentVersion) => {
    setShowRestoreConfirm(version);
  };

  const confirmRestore = async () => {
    if (!showRestoreConfirm) return;

    try {
      await restoreVersion(showRestoreConfirm.id);
      if (onRestoreVersion) {
        onRestoreVersion(showRestoreConfirm.id);
      }
      setShowRestoreConfirm(null);
      toast.success("Version restored successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to restore version");
    }
  };

  const handleCompareSubmit = async () => {
    if (compareVersions.from && compareVersions.to) {
      try {
        const comparison = await compareVersions(
          compareVersions.from.id,
          compareVersions.to.id
        );
        // Handle comparison result - could open in a new dialog or navigate to compare page
        toast.success("Comparison generated");
      } catch (error) {
        toast.error("Failed to compare versions");
      }
    }
  };

  const clearCompareMode = () => {
    setCompareMode(false);
    setCompareVersions({ from: null, to: null });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History - {document.title}
            </DialogTitle>
            <DialogDescription>
              View and manage different versions of this document
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 min-h-0 space-y-4">
            {/* Compare Mode Header */}
            {compareMode && (
              <Alert>
                <Compare className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    Select two versions to compare
                    {compareVersions.from && (
                      <span className="ml-2">
                        (Selected: Version {compareVersions.from.version_number}
                        {compareVersions.to && 
                          ` and Version ${compareVersions.to.version_number}`
                        })
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-2">
                    {compareVersions.from && compareVersions.to && (
                      <Button size="sm" onClick={handleCompareSubmit}>
                        Compare Versions
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearCompareMode}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Versions List */}
            <ScrollArea className="flex-1">
              <div className="space-y-4 pr-4">
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="border rounded-lg p-4">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-muted rounded w-1/3" />
                          <div className="h-3 bg-muted rounded w-2/3" />
                          <div className="h-3 bg-muted rounded w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : versions && versions.length > 0 ? (
                  <AnimatePresence>
                    {versions.map((version, index) => (
                      <VersionItem
                        key={version.id}
                        version={version}
                        isLatest={index === 0}
                        isComparing={
                          compareVersions.from?.id === version.id ||
                          compareVersions.to?.id === version.id
                        }
                        onView={handleViewVersion}
                        onRestore={handleRestoreVersion}
                        onCompare={handleCompareVersion}
                        canRestore={canRestore}
                      />
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold mb-2">No version history</h3>
                    <p className="text-muted-foreground">
                      Version history will appear here as you make changes to the document
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {versions && (
                  <span>{versions.length} versions total</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {!compareMode && (
                  <Button
                    variant="outline"
                    onClick={() => setCompareMode(true)}
                    className="gap-2"
                  >
                    <Compare className="h-4 w-4" />
                    Compare Versions
                  </Button>
                )}
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Version Viewer Dialog */}
      <Dialog 
        open={!!selectedVersion} 
        onOpenChange={() => setSelectedVersion(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Version {selectedVersion?.version_number} - {document.title}
            </DialogTitle>
            <DialogDescription>
              {selectedVersion && (
                <div className="flex items-center gap-4 text-sm">
                  <span>Created {formatDate(selectedVersion.created_at)}</span>
                  {selectedVersion.version_author && (
                    <span>by {selectedVersion.version_author.full_name}</span>
                  )}
                  <span>{selectedVersion.word_count} words</span>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 p-4 border rounded-lg">
            {selectedVersion && (
              <div 
                className="prose prose-neutral dark:prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: selectedVersion.content }}
              />
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedVersion(null)}>
              Close
            </Button>
            {selectedVersion && canRestore && (
              <Button
                onClick={() => {
                  setSelectedVersion(null);
                  handleRestoreVersion(selectedVersion);
                }}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restore This Version
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restore Confirmation Dialog */}
      <Dialog 
        open={!!showRestoreConfirm} 
        onOpenChange={() => setShowRestoreConfirm(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-500" />
              Restore Version
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to restore Version {showRestoreConfirm?.version_number}?
              This will create a new version with the content from the selected version.
            </DialogDescription>
          </DialogHeader>

          {showRestoreConfirm && (
            <div className="space-y-3">
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>
                    Created {formatDate(showRestoreConfirm.created_at)}
                  </span>
                  {showRestoreConfirm.version_author && (
                    <>
                      <span>by</span>
                      <span className="font-medium">
                        {showRestoreConfirm.version_author.full_name}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {showRestoreConfirm.word_count} words, {showRestoreConfirm.character_count} characters
                </p>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Your current content will be preserved as a new version before restoring.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRestoreConfirm(null)}
            >
              Cancel
            </Button>
            <Button onClick={confirmRestore} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Restore Version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Version History Button Component
interface VersionHistoryButtonProps {
  document: Document;
  onRestoreVersion?: (versionId: string) => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function VersionHistoryButton({
  document,
  onRestoreVersion,
  variant = "outline",
  size = "default",
  className,
}: VersionHistoryButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <History className="h-4 w-4" />
        {size !== "icon" && <span className="ml-2">Version History</span>}
      </Button>

      <DocumentVersionsDialog
        document={document}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onRestoreVersion={onRestoreVersion}
      />
    </>
  );
}