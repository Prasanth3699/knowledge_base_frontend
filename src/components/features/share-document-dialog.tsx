("use client");

import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Copy, Mail, Globe, Lock, Users, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { copyToClipboard, getInitials } from "@/lib/utils";
import { Document } from "@/types";
import { toast } from "sonner";

interface ShareDocumentDialogProps {
  document: Document;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDocumentDialog({
  document,
  open,
  onOpenChange,
}: ShareDocumentDialogProps) {
  const [shareEmails, setShareEmails] = useState("");
  const [sharePermission, setSharePermission] = useState<"view" | "edit">(
    "view"
  );
  const [shareMessage, setShareMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const handleCopyLink = async () => {
    const url =
      document.visibility === "public" && document.public_url
        ? document.public_url
        : window.location.origin + `/documents/${document.id}`;

    try {
      await copyToClipboard(url);
      toast.success("Link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleShareViaEmail = async () => {
    if (!shareEmails.trim()) {
      toast.error("Please enter at least one email address");
      return;
    }

    const emails = shareEmails
      .split(",")
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    if (emails.length === 0) {
      toast.error("Please enter valid email addresses");
      return;
    }

    setIsSharing(true);
    try {
      // This would call your sharing API
      // await api.post(`/sharing/${document.id}/invite/`, {
      //   emails,
      //   permission: sharePermission,
      //   message: shareMessage,
      // })

      toast.success(`Document shared with ${emails.length} people`);
      setShareEmails("");
      setShareMessage("");
    } catch (error) {
      toast.error("Failed to share document");
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share "{document.title}"
          </DialogTitle>
          <DialogDescription>
            Share this document with others or get a shareable link
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Document Visibility */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                {document.visibility === "public" ? (
                  <>
                    <Globe className="h-4 w-4" />
                    Public Document
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" />
                    Private Document
                  </>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {document.visibility === "public"
                      ? "Anyone with the link can view this document"
                      : "Only people you share with can access this document"}
                  </p>
                </div>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
              </div>

              {document.visibility === "public" && document.public_url && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Public URL:
                  </p>
                  <code className="text-sm break-all">
                    {document.public_url}
                  </code>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Share via Email */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Share via Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-3">
                  <Input
                    placeholder="Enter email addresses (comma separated)"
                    value={shareEmails}
                    onChange={(e) => setShareEmails(e.target.value)}
                  />
                </div>
                <Select
                  value={sharePermission}
                  onValueChange={(value: "view" | "edit") =>
                    setSharePermission(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">Can view</SelectItem>
                    <SelectItem value="edit">Can edit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Input
                  placeholder="Add a message (optional)"
                  value={shareMessage}
                  onChange={(e) => setShareMessage(e.target.value)}
                />
              </div>

              <Button
                onClick={handleShareViaEmail}
                disabled={isSharing || !shareEmails.trim()}
                loading={isSharing}
                className="w-full gap-2"
              >
                <Mail className="h-4 w-4" />
                {isSharing ? "Sharing..." : "Send Invitations"}
              </Button>
            </CardContent>
          </Card>

          {/* Current Shares (placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4" />
                People with access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Document author */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={document.author.avatar} />
                      <AvatarFallback className="text-sm">
                        {getInitials(
                          `${document.author.first_name} ${document.author.last_name}`
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {document.author.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {document.author.email}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">Owner</Badge>
                </div>

                {/* Placeholder for shared users */}
                <div className="text-center py-4 text-sm text-muted-foreground">
                  No one else has access to this document yet
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
