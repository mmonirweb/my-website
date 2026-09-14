import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { UserFormData } from '../types';

export function useUsers(params?: { search?: string; per_page?: number }) {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getUsers(params),
  });

  const createUserMutation = useMutation({
    mutationFn: (data: UserFormData) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UserFormData }) =>
      userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active, ...rest }: { id: number; is_active: boolean; [key: string]: any }) =>
      userService.updateUser(id, { is_active, ...rest } as UserFormData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    usersQuery,
    createUserMutation,
    updateUserMutation,
    deleteUserMutation,
    toggleStatusMutation,
  };
}

export function useUserFormData(enabled = true) {
  return useQuery({
    queryKey: ['user-form-data'],
    queryFn: () => userService.getFormData(),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}