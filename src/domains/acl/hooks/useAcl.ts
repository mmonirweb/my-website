import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aclService } from '../services/aclService';
import { CreateRolePayload, AssignUserRolesPayload } from '../types';

export const useAcl = () => {
  const queryClient = useQueryClient();

  // 1. Get Roles Query
  const rolesQuery = useQuery({
    queryKey: ['roles'],
    queryFn: aclService.getRoles,
  });

  // 2. Get Permissions Query
  const permissionsQuery = useQuery({
    queryKey: ['permissions'],
    queryFn: aclService.getPermissions,
  });

  // 3. Create Role Mutation
  const createRoleMutation = useMutation({
    mutationFn: aclService.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  // 4. Update Role Mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CreateRolePayload }) =>
      aclService.updateRole(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  // 5. Delete Role Mutation
  const deleteRoleMutation = useMutation({
    mutationFn: (id: number) => aclService.deleteRole(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  // 6. Assign User Roles Mutation
  const assignUserRolesMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: number; payload: AssignUserRolesPayload }) =>
      aclService.assignUserRoles(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    roles: rolesQuery.data ?? [],
    isLoadingRoles: rolesQuery.isLoading,
    isFetchingRoles: rolesQuery.isFetching,
    permissions: permissionsQuery.data ?? {},
    isLoadingPermissions: permissionsQuery.isLoading,
    
    // Mutations
    createRole: createRoleMutation.mutateAsync,
    updateRole: updateRoleMutation.mutateAsync,
    deleteRole: deleteRoleMutation.mutateAsync,
    assignUserRoles: assignUserRolesMutation.mutateAsync,

    // Mutation States (Form disabling / loading state handle করার জন্য)
    isCreatingRole: createRoleMutation.isPending,
    isUpdatingRole: updateRoleMutation.isPending,
    isDeletingRole: deleteRoleMutation.isPending,
  };
};