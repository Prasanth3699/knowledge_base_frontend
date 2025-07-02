import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { versionService } from "@/lib/api/versions";

export function useDocumentVersions(documentId: string) {
  const queryClient = useQueryClient();

  const {
    data: versions = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["document-versions", documentId],
    queryFn: () => versionService.getDocumentVersions(documentId),
    enabled: !!documentId,
  });

  const restoreMutation = useMutation({
    mutationFn: (versionId: string) => versionService.restoreVersion(documentId, versionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["document", documentId] });
      queryClient.invalidateQueries({ queryKey: ["document-versions", documentId] });
    },
  });

  const compareMutation = useMutation({
    mutationFn: ({ fromVersionId, toVersionId }: { fromVersionId: string; toVersionId: string }) =>
      versionService.compareVersions(documentId, fromVersionId, toVersionId),
  });

  const fetchVersions = () => refetch();

  const restoreVersion = async (versionId: string) => {
    return restoreMutation.mutateAsync(versionId);
  };

  const compareVersions = async (fromVersionId: string, toVersionId: string) => {
    return compareMutation.mutateAsync({ fromVersionId, toVersionId });
  };

  return {
    versions,
    isLoading,
    error,
    fetchVersions,
    restoreVersion,
    compareVersions,
    isRestoring: restoreMutation.isPending,
    isComparing: compareMutation.isPending,
  };
}

