import { apiClient } from '@/lib/axios';
import { User, LoginCredentials } from '../types';

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ data: User }>('/auth/me');
    return response.data.data;
  },

  async logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};