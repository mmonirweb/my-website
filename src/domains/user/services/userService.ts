import { apiClient } from '@/lib/axios';
import { User, UserFormData, UserFormDataOptions } from '../types';

export const userService = {
  async getUsers(params?: { search?: string; per_page?: number }) {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  async getUser(id: number): Promise<User> {
    const response = await apiClient.get(`/users/${id}`);
    return response.data.data;
  },

  async createUser(data: UserFormData): Promise<User> {
    const response = await apiClient.post('/users', data);
    return response.data.data;
  },

  async updateUser(id: number, data: UserFormData): Promise<User> {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data.data;
  },

  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  async restoreUser(id: number): Promise<User> {
    const response = await apiClient.post(`/users/${id}/restore`);
    return response.data.data;
  },

  async getFormData(): Promise<UserFormDataOptions> {
    const response = await apiClient.get('/users/form-data');
    return response.data.data;
  },
};