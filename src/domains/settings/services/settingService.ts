import { apiClient } from '@/lib/axios';
import { StoreSettings } from '../types';

export const settingService = {
  // Admin Protected Settings (Requires Token)
  getSettings: async (): Promise<StoreSettings> => {
    const response = await apiClient.get('/organization/settings');
    return response.data?.data || response.data;
  },

  // Public Storefront Settings (No Token Needed)
  getPublicSettings: async (): Promise<Partial<StoreSettings>> => {
    try {
      const response = await apiClient.get('/settings/public');
      return response.data?.data || response.data;
    } catch (error) {
      console.warn('Fallback: Public settings request failed or unauthenticated');
      return {};
    }
  },

  updateSettings: async (formData: FormData): Promise<StoreSettings> => {
    const response = await apiClient.post('/organization/settings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data || response.data;
  },
};