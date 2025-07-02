import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { sharingService } from "@/lib/api/sharing";
import { CreateShareData, CreateInvitationData } from "@/types";

export function useDocumentSharing(documentId: string) {
  const queryClient = useQueryClient();

  const {
    data: shares = [],
    isLoading: sharesLoading,
    refetch: refetchShares,
  } = useQuery({
    queryKey: ["document-shares", documentId],
    queryFn: () => sharingService.getDocumentShares(documentId),
    enabled: !!documentId,
  });

  const {
    data: invitations = [],
    isLoading: invitationsLoading,
    refetch: refetchInvitations,
  } = useQuery({
    queryKey: ["document-invitations", documentId],
    queryFn: () => sharingService.getShareInvitations(documentId),
    enabled: !!documentId,
  });

  const shareMutation = useMutation({
    mutationFn: (data: CreateShareData) => sharingService.shareDocument(documentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-shares", documentId] });
    },
  });

  const updatePermissionMutation = useMutation({
    mutationFn: ({ shareId, permission }: { shareId: string; permission: "view" | "edit" }) =>
      sharingService.updateSharePermission(documentId, shareId, permission),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-shares", documentId] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: (shareId: string) => sharingService.removeShare(documentId, shareId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-shares", documentId] });
    },
  });

  const inviteMutation = useMutation({
    mutationFn: (data: CreateInvitationData) => sharingService.createInvitation(documentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document-invitations", documentId] });
    },
  });

  const fetchShares = useCallback(() => {
    refetchShares();
    refetchInvitations();
  }, [refetchShares, refetchInvitations]);

  return {
    shares,
    invitations,
    isLoading: sharesLoading || invitationsLoading,
    fetchShares,
    shareDocument: shareMutation.mutateAsync,
    updateSharePermission: updatePermissionMutation.mutateAsync,
    removeShare: removeMutation.mutateAsync,
    createInvitation: inviteMutation.mutateAsync,
    isSharing: shareMutation.isPending,
    isUpdating: updatePermissionMutation.isPending,
    isRemoving: removeMutation.isPending,
    isInviting: inviteMutation.isPending,
  };
}



