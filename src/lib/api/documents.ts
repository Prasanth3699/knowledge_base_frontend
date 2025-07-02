import { 
  Document, 
  CreateDocumentData, 
  UpdateDocumentData, 
  PaginatedResponse 
} from "@/types";
import { apiClient } from "./client";

export const documentService = {
  async getDocuments(params?: {
    page?: number;
    search?: string;
    visibility?: string;
    author?: string;
    tags?: string[];
    ordering?: string;
  }): Promise<PaginatedResponse<Document>> {
    const searchParams = new URLSearchParams();
    
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.search) searchParams.append("search", params.search);
    if (params?.visibility) searchParams.append("visibility", params.visibility);
    if (params?.author) searchParams.append("author", params.author);
    if (params?.tags?.length) {
      params.tags.forEach(tag => searchParams.append("tags", tag));
    }
    if (params?.ordering) searchParams.append("ordering", params.ordering);

    return apiClient.get(`/documents/?${searchParams.toString()}`);
  },

  async getDocument(id: string): Promise<Document> {
    return apiClient.get(`/documents/${id}/`);
  },

  async createDocument(data: CreateDocumentData): Promise<Document> {
    return apiClient.post("/documents/", data);
  },

  async updateDocument(id: string, data: UpdateDocumentData): Promise<Document> {
    return apiClient.patch(`/documents/${id}/`, data);
  },

  async deleteDocument(id: string): Promise<void> {
    return apiClient.delete(`/documents/${id}/`);
  },

  async autoSaveDocument(id: string, content: string): Promise<void> {
    return apiClient.post(`/documents/${id}/auto-save/`, { content });
  },

  async duplicateDocument(id: string): Promise<Document> {
    return apiClient.post(`/documents/${id}/duplicate/`);
  },

  async getPublicDocument(token: string): Promise<Document> {
    return apiClient.get(`/documents/public/${token}/`);
  },

  async generatePublicLink(id: string): Promise<{ public_url: string }> {
    return apiClient.post(`/documents/${id}/public-link/`);
  },

  async revokePublicLink(id: string): Promise<void> {
    return apiClient.delete(`/documents/${id}/public-link/`);
  },

  async getDocumentStats(id: string): Promise<{
    view_count: number;
    share_count: number;
    comment_count: number;
    version_count: number;
  }> {
    return apiClient.get(`/documents/${id}/stats/`);
  },

  async mentionUsers(id: string, userIds: string[]): Promise<void> {
    return apiClient.post(`/documents/${id}/mentions/`, { user_ids: userIds });
  },
};

