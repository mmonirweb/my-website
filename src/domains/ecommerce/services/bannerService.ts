import { apiClient } from '@/lib/axios';
import { Banner } from '../types/banner';

export const bannerService = {
  async getBanners(params?: any) {
    const response = await apiClient.get('/ecommerce/banners', { params });
    return response.data;
  },

  async createBanner(data: any) {
    const response = await apiClient.post('/ecommerce/banners', data);
    return response.data;
  },

  async updateBanner(id: number, data: Partial<Banner>) {
    const response = await apiClient.put(`/ecommerce/banners/${id}`, data);
    return response.data;
  },

  async deleteBanner(id: number) {
    const response = await apiClient.delete(`/ecommerce/banners/${id}`);
    return response.data;
  }
};