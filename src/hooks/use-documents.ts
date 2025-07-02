import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentService } from "@/lib/api/documents";
import { Document, CreateDocumentData, UpdateDocumentData } from "@/types";

export function useDocuments(params?: {
  search?: string;
  visibility?: string;
  author?: string;
  tags?: string[];
  ordering?: string;
}) {
  const queryClient = useQueryClient();

  const {
    data: documentsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["documents", params],
    queryFn: () => documentService.getDocuments(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDocumentData) => documentService.createDocument(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDocumentData }) =>
      documentService.updateDocument(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentService.deleteDocument(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const autoSaveMutation = useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      documentService.autoSaveDocument(id, content),
  });

  return {
    documents: documentsData?.results || [],
    totalCount: documentsData?.count || 0,
    isLoading,
    error,
    refetch,
    createDocument: createMutation.mutateAsync,
    updateDocument: updateMutation.mutateAsync,
    deleteDocument: deleteMutation.mutateAsync,
    autoSaveDocument: autoSaveMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isAutoSaving: autoSaveMutation.isPending,
  };
}

