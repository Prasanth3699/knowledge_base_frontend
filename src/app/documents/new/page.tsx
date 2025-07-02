"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Settings, Share, Eye } from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { MainLayout } from "@/components/layout/main-layout";
import { DocumentEditor } from "@/components/editor/document-editor";
import { useDocuments } from "@/hooks/use-documents";
import { useUsers } from "@/hooks/use-users";
import { useAuth } from "@/hooks/use-auth";
import { Document } from "@/types";
import { toast } from "sonner";

export default function NewDocumentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { createDocument, isLoading } = useDocuments();
  const { users } = useUsers();
  
  const [showSettings, setShowSettings] = useState(false);
  const [documentSettings, setDocumentSettings] = useState({
    visibility: "private" as "private" | "public",
    description: "",
    tags: [] as string[],
    allowComments: true,
    allowCopyEdit: false,
  });

  const [newTag, setNewTag] = useState("");

  const handleSave = async (content: string, title: string) => {
    if (!title.trim()) {
      toast.error("Please enter a document title");
      return;
    }

    try {
      const document = await createDocument({
        title: title.trim(),
        content,
        description: documentSettings.description,
        visibility: documentSettings.visibility,
        tags: documentSettings.tags,
        allow_comments: documentSettings.allowComments,
        allow_copy_edit: documentSettings.allowCopyEdit,
      });

      toast.success("Document created successfully");
      router.push(`/documents/${document.id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create document");
      throw error;
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
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">New Document</h1>
                <p className="text-sm text-muted-foreground">
                  Create a new document to share with your team
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
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
                      Configure how your document is shared and accessed
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
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-0">
          <DocumentEditor
            onSave={handleSave}
            isLoading={isLoading}
            users={users}
            className="h-full"
          />
        </div>

        {/* Footer Info */}
        <div className="border-t bg-muted/30 px-4 py-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Draft</span>
              <Badge variant="outline" className="text-xs">
                {documentSettings.visibility === "public" ? "Public" : "Private"}
              </Badge>
              {documentSettings.tags.length > 0 && (
                <span>{documentSettings.tags.length} tags</span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span>Auto-save enabled</span>
              <span>Press Ctrl+S to save</span>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}