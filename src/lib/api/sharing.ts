import { DocumentShare, ShareInvitation, CreateShareData, CreateInvitationData } from "@/types";
import { apiClient } from "./client";

export const sharingService = {
  async getDocumentShares(documentId: string): Promise<DocumentShare[]> {
    return apiClient.get(`/documents/${documentId}/shares/`);
  },

  async shareDocument(documentId: string, data: CreateShareData): Promise<DocumentShare> {
    return apiClient.post(`/documents/${documentId}/shares/`, data);
  },

  async updateSharePermission(
    documentId: string,
    shareId: string,
    permission: "view" | "edit"
  ): Promise<DocumentShare> {
    return apiClient.patch(`/documents/${documentId}/shares/${shareId}/`, {
      permission,
    });
  },

  async removeShare(documentId: string, shareId: string): Promise<void> {
    return apiClient.delete(`/documents/${documentId}/shares/${shareId}/`);
  },

  async getShareInvitations(documentId: string): Promise<ShareInvitation[]> {
    return apiClient.get(`/documents/${documentId}/invitations/`);
  },

  async createInvitation(
    documentId: string,
    data: CreateInvitationData
  ): Promise<ShareInvitation> {
    return apiClient.post(`/documents/${documentId}/invitations/`, data);
  },

  async acceptInvitation(token: string): Promise<{ document: Document; share: DocumentShare }> {
    return apiClient.post(`/sharing/invitations/${token}/accept/`);
  },

  async declineInvitation(token: string): Promise<void> {
    return apiClient.post(`/sharing/invitations/${token}/decline/`);
  },

  async getSharedWithMe(params?: {
    page?: number;
    search?: string;
    permission?: string;
  }): Promise<PaginatedResponse<DocumentShare>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.permission) searchParams.append("permission", params.permission);

    return apiClient.get(`/sharing/shared-with-me/?${searchParams.toString()}`);
  },
};