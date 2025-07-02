import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/lib/api/users";
import { UpdateUserData } from "@/types";

export function useUsers(searchQuery?: string) {
  const queryClient = useQueryClient();

  const {
    data: usersData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users", searchQuery],
    queryFn: () => userService.getUsers({ search: searchQuery }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserData }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  const searchUsers = async (query: string) => {
    return userService.searchUsers(query);
  };

  return {
    users: usersData?.results || [],
    totalCount: usersData?.count || 0,
    isLoading,
    error,
    updateUser: updateUserMutation.mutateAsync,
    searchUsers,
    isUpdating: updateUserMutation.isPending,
  };
}

