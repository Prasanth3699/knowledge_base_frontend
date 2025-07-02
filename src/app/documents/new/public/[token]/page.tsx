// src/app/documents/public/[token]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  FileText,
  Globe,
  User,
  Calendar,
  Eye,
  Download,
  Share,
  Lock,
  ExternalLink,
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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { documentService } from "@/lib/api/documents";
import { Document } from "@/types";
import { timeAgo, formatDate, getInitials, copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";

interface PublicDocumentPageProps {
  params: {
    token: string;
  };
}

export default function PublicDocumentPage({ params }: PublicDocumentPageProps) {
  const router = useRouter();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const doc = await documentService.getPublicDocument(params.token);
        setDocument(doc);
      } catch (error: any) {
        const errorMessage = error.response?.data?.message || "Document not found or no longer public";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocument();
  }, [params.token]);

  const handleShare = async () => {
    try {
      await copyToClipboard(window.location.href);
      toast.success("Link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleExportMarkdown = () => {
    if (!document) return;

    // Convert HTML to markdown (simplified)
    const markdown = document.content
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
    a.download = `${document.title}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Document exported as Markdown");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-64 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
                <Lock className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>Document Not Available</CardTitle>
              <CardDescription>
                {error || "This document is not publicly accessible or the link has expired"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => router.push("/")}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Go to Knowledge Base
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">{document.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Globe className="h-3 w-3" />
                  <span>Public Document</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Share className="h-4 w-4" />
                Share
              </Button>
              
              {document.allow_copy_edit && (
                <Button
                  onClick={handleExportMarkdown}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              )}

              <Button
                onClick={() => router.push("/")}
                size="sm"
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Knowledge Base
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Document Info */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={document.author.avatar} />
                    <AvatarFallback>
                      {getInitials(document.author.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{document.author.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      @{document.author.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Created {formatDate(document.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    <span>{document.view_count} views</span>
                  </div>
                  <span>{document.word_count} words</span>
                </div>
              </div>

              {document.description && (
                <>
                  <Separator className="my-4" />
                  <p className="text-muted-foreground">{document.description}</p>
                </>
              )}

              {document.tags && document.tags.length > 0 && (
                <>
                  <Separator className="my-4" />
                  <div className="flex flex-wrap gap-2">
                    {document.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Document Content */}
          <Card>
            <CardContent className="p-8">
              <ScrollArea className="max-h-[70vh]">
                <div
                  className="prose prose-neutral dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: document.content }}
                />
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Last updated {timeAgo(document.updated_at)} •{" "}
              <button
                onClick={() => router.push("/")}
                className="text-primary hover:underline"
              >
                Create your own Knowledge Base
              </button>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}






