"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Share2,
  Users,
  Mail,
  Copy,
  Check,
  X,
  Eye,
  Edit,
  Crown,
  Globe,
  Lock,
  Send,
  UserPlus,
  Trash2,
  Settings,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { useDocumentSharing } from "@/hooks/use-document-sharing";
import { useUsers } from "@/hooks/use-users";
import { Document, DocumentShare, User } from "@/types";
import { getInitials, copyToClipboard } from "@/lib/utils";
import { toast } from "sonner";

interface DocumentSharingProps {
  document: Document;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShareUserProps {
  share: DocumentShare;
  onUpdatePermission: (shareId: string, permission: "view" | "edit") => void;
  onRemoveShare: (shareId: string) => void;
  canManage: boolean;
}

const ShareUser = ({ share, onUpdatePermission, onRemoveShare, canManage }: ShareUserProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="flex items-center justify-between p-3 rounded-lg border"
  >
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={share.user.avatar} />
        <AvatarFallback className="text-sm">
          {getInitials(share.user.full_name)}
        </AvatarFallback>
      </Avatar>
      <div>
        <p className="font-medium text-sm">{share.user.full_name}</p>
        <p className="text-xs text-muted-foreground">{share.user.email}</p>
      </div>
    </div>

    <div className="flex items-center gap-2">
      {canManage ? (
        <>
          <Select
            value={share.permission}
            onValueChange={(permission: "view" | "edit") =>
              onUpdatePermission(share.id, permission)
            }
          >
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="view">
                <div className="flex items-center gap-2">
                  <Eye className="h-3 w-3" />
                  View
                </div>
              </SelectItem>
              <SelectItem value="edit">
                <div className="flex items-center gap-2">
                  <Edit className="h-3 w-3" />
                  Edit
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onRemoveShare(share.id)}
          >
            <X className="h-3 w-3" />
          </Button>
        </>
      ) : (
        <Badge variant={share.permission === "edit" ? "default" : "secondary"}>
          {share.permission === "edit" ? (
            <><Edit className="h-3 w-3 mr-1" /> Edit</>
          ) : (
            <><Eye className="h-3 w-3 mr-1" /> View</>
          )}
        </Badge>
      )}
    </div>
  </motion.div>
);

export function DocumentSharingDialog({ document, isOpen, onOpenChange }: DocumentSharingProps) {
  const { user } = useAuth();
  const { users, searchUsers } = useUsers();
  const {
    shares,
    invitations,
    isLoading,
    shareDocument,
    updateSharePermission,
    removeShare,
    createInvitation,
    fetchShares,
  } = useDocumentSharing(document.id);

  const [shareEmail, setShareEmail] = useState("");
  const [sharePermission, setSharePermission] = useState<"view" | "edit">("view");
  const [shareMessage, setShareMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [isPublic, setIsPublic] = useState(document.visibility === "public");
  const [publicUrl, setPublicUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const isOwner = document.author.id === user?.id;
  const filteredUsers = users?.filter(u => 
    u.id !== user?.id && 
    !shares?.some(s => s.user.id === u.id) &&
    (u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
     u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  useEffect(() => {
    if (isOpen) {
      fetchShares();
      if (document.visibility === "public" && document.public_url) {
        setPublicUrl(document.public_url);
      }
    }
  }, [isOpen, document, fetchShares]);

  const handleShareWithUser = async (selectedUser: User) => {
    try {
      await shareDocument({
        userId: selectedUser.id,
        permission: sharePermission,
        message: shareMessage,
      });
      setShareMessage("");
      toast.success(`Document shared with ${selectedUser.full_name}`);
    } catch (error) {
      toast.error("Failed to share document");
    }
  };

  const handleInviteByEmail = async () => {
    if (!shareEmail.trim()) return;

    try {
      await createInvitation({
        email: shareEmail.trim(),
        permission: sharePermission,
        message: shareMessage,
      });
      setShareEmail("");
      setShareMessage("");
      toast.success("Invitation sent successfully");
    } catch (error) {
      toast.error("Failed to send invitation");
    }
  };

  const handleUpdatePermission = async (shareId: string, permission: "view" | "edit") => {
    try {
      await updateSharePermission(shareId, permission);
      toast.success("Permission updated");
    } catch (error) {
      toast.error("Failed to update permission");
    }
  };

  const handleRemoveShare = async (shareId: string) => {
    try {
      await removeShare(shareId);
      toast.success("Access removed");
    } catch (error) {
      toast.error("Failed to remove access");
    }
  };

  const handleCopyLink = async () => {
    const url = isPublic && publicUrl ? publicUrl : window.location.href;
    try {
      await copyToClipboard(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied to clipboard");
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleTogglePublic = async () => {
    // This would call an API to update document visibility
    setIsPublic(!isPublic);
    if (!isPublic) {
      // Generate public URL
      setPublicUrl(`${window.location.origin}/documents/public/${document.id}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share "{document.title}"
          </DialogTitle>
          <DialogDescription>
            Share this document with others or make it publicly accessible
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Public Link Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Public Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Make public</p>
                  <p className="text-sm text-muted-foreground">
                    Anyone with the link can view this document
                  </p>
                </div>
                <Switch
                  checked={isPublic}
                  onCheckedChange={handleTogglePublic}
                  disabled={!isOwner}
                />
              </div>

              {isPublic && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <div className="flex gap-2">
                    <Input
                      value={publicUrl}
                      readOnly
                      className="flex-1"
                    />
                    <Button
                      onClick={handleCopyLink}
                      variant="outline"
                      className="gap-2"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                  </div>
                  <Alert>
                    <Globe className="h-4 w-4" />
                    <AlertDescription>
                      This document is public. Anyone with the link can view it without signing in.
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </CardContent>
          </Card>

          {/* Share with Users */}
          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Share with People
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* User Search */}
                <div>
                  <Label htmlFor="search-users">Search users</Label>
                  <Input
                    id="search-users"
                    placeholder="Search by name, email, or username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  
                  {searchQuery && filteredUsers.length > 0 && (
                    <div className="mt-2 border rounded-lg max-h-40 overflow-y-auto">
                      {filteredUsers.slice(0, 5).map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center justify-between p-2 hover:bg-accent cursor-pointer"
                          onClick={() => handleShareWithUser(user)}
                        >
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.avatar} />
                              <AvatarFallback className="text-xs">
                                {getInitials(user.full_name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium">{user.full_name}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            Share
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Email Invitation */}
                <div className="space-y-3">
                  <Label htmlFor="share-email">Or invite by email</Label>
                  <div className="flex gap-2">
                    <Input
                      id="share-email"
                      type="email"
                      placeholder="Enter email address"
                      value={shareEmail}
                      onChange={(e) => setShareEmail(e.target.value)}
                    />
                    <Select value={sharePermission} onValueChange={setSharePermission}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">
                          <div className="flex items-center gap-2">
                            <Eye className="h-3 w-3" />
                            View
                          </div>
                        </SelectItem>
                        <SelectItem value="edit">
                          <div className="flex items-center gap-2">
                            <Edit className="h-3 w-3" />
                            Edit
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Textarea
                    placeholder="Add a message (optional)"
                    value={shareMessage}
                    onChange={(e) => setShareMessage(e.target.value)}
                    rows={2}
                  />
                  
                  <Button
                    onClick={handleInviteByEmail}
                    disabled={!shareEmail.trim() || isLoading}
                    className="gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send Invitation
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Shares */}
          {shares && shares.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  People with Access ({shares.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Owner */}
                  <div className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={document.author.avatar} />
                        <AvatarFallback className="text-sm">
                          {getInitials(document.author.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">
                          {document.author.full_name}
                          {document.author.id === user?.id && " (You)"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {document.author.email}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">
                      <Crown className="h-3 w-3 mr-1" />
                      Owner
                    </Badge>
                  </div>

                  {/* Shared Users */}
                  <AnimatePresence>
                    {shares.map((share) => (
                      <ShareUser
                        key={share.id}
                        share={share}
                        onUpdatePermission={handleUpdatePermission}
                        onRemoveShare={handleRemoveShare}
                        canManage={isOwner}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Invitations */}
          {invitations && invitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Pending Invitations ({invitations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {invitations.map((invitation) => (
                    <div
                      key={invitation.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium text-sm">{invitation.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Invited • {invitation.permission} access
                        </p>
                      </div>
                      <Badge variant="outline">Pending</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Share button component for easy integration
interface ShareButtonProps {
  document: Document;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ShareButton({ document, variant = "outline", size = "default", className }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsOpen(true)}
        className={className}
      >
        <Share2 className="h-4 w-4" />
        {size !== "icon" && <span className="ml-2">Share</span>}
      </Button>
      
      <DocumentSharingDialog
        document={document}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
    </>
  );
}