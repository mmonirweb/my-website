import { apiClient } from '@/lib/axios';
import { Role, GroupedPermissions, CreateRolePayload, AssignUserRolesPayload } from '../types';

export const aclService = {
  getRoles: async (): Promise<Role[]> => {
    const response = await apiClient.get('/acl/roles');
    return response.data?.data || response.data;
  },

  getPermissions: async (): Promise<GroupedPermissions> => {
    const response = await apiClient.get('/acl/permissions');
    return response.data?.data || response.data;
  },

  createRole: async (payload: CreateRolePayload): Promise<Role> => {
    const response = await apiClient.post('/acl/roles', payload);
    return response.data?.data || response.data;
  },

  updateRole: async (id: number, payload: CreateRolePayload): Promise<Role> => {
    const response = await apiClient.put(`/acl/roles/${id}`, payload);
    return response.data?.data || response.data;
  },

  deleteRole: async (id: number): Promise<void> => {
    await apiClient.delete(`/acl/roles/${id}`);
  },

  assignUserRoles: async (userId: number, payload: AssignUserRolesPayload) => {
    const response = await apiClient.post(`/acl/users/${userId}/roles`, payload);
    return response.data?.data || response.data;
  },
};