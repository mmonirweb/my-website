import { apiClient } from '@/lib/axios';
import { Brand, BrandFormData, Category, CategoryFormData, PaginatedResponse } from '../types';

export const catalogService = {
  // Brand APIs
  getBrands: async (page = 1, search = '', perPage = 15): Promise<PaginatedResponse<Brand>> => {
    const res = await apiClient.get('/catalog/brands', {
      params: { page, search, per_page: perPage },
    });
    return res.data.data;
  },

  createBrand: async (payload: BrandFormData): Promise<Brand> => {
    const res = await apiClient.post('/catalog/brands', payload);
    return res.data.data;
  },

  updateBrand: async (id: number, payload: BrandFormData): Promise<Brand> => {
    const res = await apiClient.put(`/catalog/brands/${id}`, payload);
    return res.data.data;
  },

  deleteBrand: async (id: number): Promise<void> => {
    await apiClient.delete(`/catalog/brands/${id}`);
  },

  // Category APIs
  getCategories: async (page = 1, search = '', perPage = 15): Promise<PaginatedResponse<Category>> => {
    const res = await apiClient.get('/catalog/categories', {
      params: { page, search, per_page: perPage },
    });
    return res.data.data;
  },

  getCategoryTree: async (): Promise<Category[]> => {
    const res = await apiClient.get('/catalog/categories', {
      params: { tree: 1 },
    });
    return res.data.data;
  },

  createCategory: async (payload: CategoryFormData): Promise<Category> => {
    const res = await apiClient.post('/catalog/categories', payload);
    return res.data.data;
  },

  updateCategory: async (id: number, payload: CategoryFormData): Promise<Category> => {
    const res = await apiClient.put(`/catalog/categories/${id}`, payload);
    return res.data.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/catalog/categories/${id}`);
  },
};