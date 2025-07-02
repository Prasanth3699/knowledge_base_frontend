import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { documentService } from "@/lib/api/documents";
import { UpdateDocumentData } from "@/types";

export function useDocument(id: string) {
  const queryClient = useQueryClient();

  const {
    data: document,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["document", id],
    queryFn: () => documentService.getDocument(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateDocumentData) => documentService.updateDocument(id, data),
    onSuccess: (updatedDocument) => {
      queryClient.setQueryData(["document", id], updatedDocument);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const autoSaveMutation = useMutation({
    mutationFn: (content: string) => documentService.autoSaveDocument(id, content),
  });

  const deleteMutation = useMutation({
    mutationFn: () => documentService.deleteDocument(id),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ["document", id] });
      queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  return {
    document,
    isLoading,
    error,
    refetch,
    updateDocument: updateMutation.mutateAsync,
    autoSaveDocument: autoSaveMutation.mutateAsync,
    deleteDocument: deleteMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isAutoSaving: autoSaveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

