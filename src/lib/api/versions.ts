import { DocumentVersion, VersionComparison } from "@/types";
import { apiClient } from "./client";

export const versionService = {
  async getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
    return apiClient.get(`/documents/${documentId}/versions/`);
  },

  async getVersion(documentId: string, versionId: string): Promise<DocumentVersion> {
    return apiClient.get(`/documents/${documentId}/versions/${versionId}/`);
  },

  async restoreVersion(documentId: string, versionId: string): Promise<Document> {
    return apiClient.post(`/documents/${documentId}/versions/${versionId}/restore/`);
  },

  async compareVersions(
    documentId: string,
    fromVersionId: string,
    toVersionId: string
  ): Promise<VersionComparison> {
    return apiClient.get(
      `/documents/${documentId}/versions/compare/?from=${fromVersionId}&to=${toVersionId}`
    );
  },

  async deleteVersion(documentId: string, versionId: string): Promise<void> {
    return apiClient.delete(`/documents/${documentId}/versions/${versionId}/`);
  },
};
