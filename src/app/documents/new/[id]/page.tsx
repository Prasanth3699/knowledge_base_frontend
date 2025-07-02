("use client");

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Edit,
  Share2,
  Star,
  MoreHorizontal,
  Eye,
  Clock,
  User,
  Globe,
  Lock,
  History,
  Download,
  Copy,
  Trash2,
} from "lucide-react";

import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { DocumentVersionHistory } from "@/components/features/document-version-history";
import { ShareDocumentDialog } from "@/components/features/share-document-dialog";
import { useDocumentsStore } from "@/store/documents";
import { useAuth } from "@/hooks/use-auth";
import { getInitials, timeAgo, formatDate, copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentPageProps {
  params: {
    id: string;
  };
}

export default function DocumentPage({ params }: DocumentPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { currentDocument, fetchDocument, deleteDocument } =
    useDocumentsStore();

  const [isLoading, setIsLoading] = useState(true);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        await fetchDocument(params.id);
      } catch (error: any) {
        if (error.response?.status === 404) {
          notFound();
        }
        toast.error("Failed to load document");
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [params.id, fetchDocument]);

  const handleEdit = () => {
    router.push(`/documents/${params.id}/edit`);
  };

  const handleDelete = async () => {
    if (!currentDocument) return;

    const confirmed = confirm(
      "Are you sure you want to delete this document? This action cannot be undone."
    );

    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deleteDocument(currentDocument.id);
      toast.success("Document deleted successfully");
      router.push("/documents");
    } catch (error) {
      toast.error("Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!currentDocument) return;

    const url =
      currentDocument.visibility === "public" && currentDocument.public_url
        ? currentDocument.public_url
        : window.location.href;

    try {
      await copyToClipboard(url);
      toast.success("Link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleExportMarkdown = () => {
    if (!currentDocument) return;

    // Convert HTML to markdown (simplified)
    const markdown = currentDocument.content
      .replace(/<h1[^>]*>/g, "# ")
      .replace(/<h2[^>]*>/g, "## ")
      .replace(/<h3[^>]*>/g, "### ")
      .replace(/<\/h[1-6]>/g, "\n\n")
      .replace(/<p[^>]*>/g, "")
      .replace(/<\/p>/g, "\n\n")
      .replace(/<strong[^>]*>/g, "**")
      .replace(/<\/strong>/g, "**")
      .replace(/<em[^>]*>/g, "*")
      .replace(/<\/em>/g, "*")
      .replace(/<[^>]*>/g, "");

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentDocument.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Document exported as Markdown");
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded w-48 animate-pulse" />
          </div>
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="h-12 bg-muted rounded animate-pulse" />
            <div className="h-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!currentDocument) {
    return notFound();
  }

  const isAuthor = user?.id === currentDocument.author.id;
  const canEdit = isAuthor; // Add sharing permission logic later

  return (
    <MainLayout>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.back()}
                className="h-8 w-8"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentDocument.author.avatar} />
                  <AvatarFallback className="text-sm">
                    {getInitials(
                      `${currentDocument.author.first_name} ${currentDocument.author.last_name}`
                    )}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {currentDocument.author.full_name}
                    </span>
                    <Badge
                      variant={
                        currentDocument.visibility === "public"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {currentDocument.visibility === "public" ? (
                        <>
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </>
                      ) : (
                        <>
                          <Lock className="h-3 w-3 mr-1" />
                          Private
                        </>
                      )}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Updated {timeAgo(currentDocument.updated_at)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canEdit && (
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              )}

              <Button
                variant="outline"
                onClick={() => setShowShareDialog(true)}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowVersionHistory(true)}>
                    <History className="h-4 w-4 mr-2" />
                    Version History
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyLink}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportMarkdown}>
                    <Download className="h-4 w-4 mr-2" />
                    Export as Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Star className="h-4 w-4 mr-2" />
                    Add to Starred
                  </DropdownMenuItem>
                  {isAuthor && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isDeleting ? "Deleting..." : "Delete Document"}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                {currentDocument.title}
              </h1>
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Created {formatDate(currentDocument.created_at)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  <span>{currentDocument.view_count} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>{currentDocument.word_count} words</span>
                </div>
              </div>
            </div>

            {/* Document Content */}
            <div className="prose prose-lg max-w-none">
              <RichTextEditor
                content={currentDocument.content}
                onChange={() => {}} // Read-only
                readOnly={true}
                className="border-none p-0"
              />
            </div>

            {/* Document Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Document Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <div className="font-medium">
                      {formatDate(currentDocument.created_at)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Last updated:</span>
                    <div className="font-medium">
                      {formatDate(currentDocument.updated_at)}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Word count:</span>
                    <div className="font-medium">
                      {currentDocument.word_count.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">View count:</span>
                    <div className="font-medium">
                      {currentDocument.view_count.toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Dialogs */}
      <DocumentVersionHistory
        documentId={currentDocument.id}
        open={showVersionHistory}
        onOpenChange={setShowVersionHistory}
      />

      <ShareDocumentDialog
        document={currentDocument}
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
      />
    </MainLayout>
  );
}
