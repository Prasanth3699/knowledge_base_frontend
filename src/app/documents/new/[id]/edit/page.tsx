"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Settings, Share, Eye, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/main-layout";
import { DocumentEditor } from "@/components/editor/document-editor";
import { ShareButton } from "@/components/documents/document-sharing";
import { VersionHistoryButton } from "@/components/documents/document-versions";
import { useDocument } from "@/hooks/use-document";
import { useUsers } from "@/hooks/use-users";
import { useAuth } from "@/hooks/use-auth";
import { notFound } from "next/navigation";
import { toast } from "sonner";

interface DocumentEditPageProps {
  params: {
    id: string;
  };
}

export default function DocumentEditPage({ params }: DocumentEditPageProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { users } = useUsers();
  const { 
    document: currentDocument, 
    isLoading, 
    updateDocument, 
    autoSaveDocument,
    deleteDocument,
    isUpdating,
    isAutoSaving 
  } = useDocument(params.id);

  const [showSettings, setShowSettings] = useState(false);
  const [documentSettings, setDocumentSettings] = useState({
    visibility: "private" as "private" | "public",
    description: "",
    tags: [] as string[],
    allowComments: true,
    allowCopyEdit: false,
  });

  const [newTag, setNewTag] = useState("");

  // Initialize settings when document loads
  useEffect(() => {
    if (currentDocument) {
      setDocumentSettings({
        visibility: currentDocument.visibility,
        description: currentDocument.description || "",
        tags: currentDocument.tags || [],
        allowComments: currentDocument.allow_comments,
        allowCopyEdit: currentDocument.allow_copy_edit,
      });
    }
  }, [currentDocument]);

  const handleSave = async (content: string, title: string) => {
    if (!currentDocument) return;

    try {
      await updateDocument({
        title: title.trim(),
        content,
        description: documentSettings.description,
        visibility: documentSettings.visibility,
        tags: documentSettings.tags,
        allow_comments: documentSettings.allowComments,
        allow_copy_edit: documentSettings.allowCopyEdit,
      });

      toast.success("Document saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save document");
      throw error;
    }
  };

  const handleAutoSave = async (content: string) => {
    if (!currentDocument) return;
    
    try {
      await autoSaveDocument(content);
    } catch (error) {
      console.error("Auto-save failed:", error);
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !documentSettings.tags.includes(newTag.trim())) {
      setDocumentSettings(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setDocumentSettings(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleDelete = async () => {
    if (!currentDocument) return;
    
    const confirmed = confirm(
      `Are you sure you want to delete "${currentDocument.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      await deleteDocument();
      toast.success("Document deleted successfully");
      router.push("/documents");
    } catch (error) {
      toast.error("Failed to delete document");
    }
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
  
  if (!isAuthor) {
    router.push(`/documents/${currentDocument.id}`);
    return null;
  }

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
                onClick={() => router.push(`/documents/${currentDocument.id}`)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">Editing: {currentDocument.title}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant={currentDocument.visibility === "public" ? "default" : "secondary"}>
                    {currentDocument.visibility}
                  </Badge>
                  {isAutoSaving && <span>Auto-saving...</span>}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => router.push(`/documents/${currentDocument.id}`)}
                variant="outline"
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Preview
              </Button>

              <ShareButton document={currentDocument} />

              <VersionHistoryButton document={currentDocument} />

              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Document Settings</DialogTitle>
                    <DialogDescription>
                      Configure document properties and permissions
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Visibility */}
                    <div className="space-y-2">
                      <Label>Visibility</Label>
                      <Select
                        value={documentSettings.visibility}
                        onValueChange={(value: "private" | "public") =>
                          setDocumentSettings(prev => ({ ...prev, visibility: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">
                            Private - Only you and shared users can access
                          </SelectItem>
                          <SelectItem value="public">
                            Public - Anyone with the link can view
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (Optional)</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe what this document is about..."
                        value={documentSettings.description}
                        onChange={(e) =>
                          setDocumentSettings(prev => ({
                            ...prev,
                            description: e.target.value
                          }))
                        }
                        rows={3}
                      />
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {documentSettings.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            {tag} ×
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyDown={handleKeyDown}
                        />
                        <Button
                          onClick={handleAddTag}
                          disabled={!newTag.trim()}
                          variant="outline"
                        >
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-4">
                      <Label>Permissions</Label>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Allow Comments</Label>
                          <p className="text-xs text-muted-foreground">
                            Users can leave comments on this document
                          </p>
                        </div>
                        <Switch
                          checked={documentSettings.allowComments}
                          onCheckedChange={(checked) =>
                            setDocumentSettings(prev => ({
                              ...prev,
                              allowComments: checked
                            }))
                          }
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-sm font-medium">Allow Copy/Export</Label>
                          <p className="text-xs text-muted-foreground">
                            Users can copy or export this document
                          </p>
                        </div>
                        <Switch
                          checked={documentSettings.allowCopyEdit}
                          onCheckedChange={(checked) =>
                            setDocumentSettings(prev => ({
                              ...prev,
                              allowCopyEdit: checked
                            }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowSettings(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => setShowSettings(false)}>
                      Save Settings
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    Export as Markdown
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    Duplicate Document
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    className="text-destructive"
                  >
                    Delete Document
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0">
          <DocumentEditor
            document={currentDocument}
            onSave={handleSave}
            onAutoSave={handleAutoSave}
            isLoading={isUpdating}
            users={users}
            className="h-full"
          />
        </div>
      </div>
    </MainLayout>
  );
}