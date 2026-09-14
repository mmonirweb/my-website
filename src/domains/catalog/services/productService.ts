import { apiClient } from '@/lib/axios';
import { Product, ProductResponse } from '../types/product';

export const productService = {
  async getProducts(params?: Record<string, any>): Promise<ProductResponse> {
    const response = await apiClient.get('/catalog/products', { params });
    return response.data;
  },

  async getProduct(id: number): Promise<{ status: string; data: Product }> {
    const response = await apiClient.get(`/catalog/products/${id}`);
    return response.data;
  },

  async createProduct(data: FormData): Promise<{ status: string; message: string; data: Product }> {
    const response = await apiClient.post('/catalog/products', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async updateProduct(id: number, data: FormData): Promise<{ status: string; message: string; data: Product }> {
    if (!data.has('_method')) {
      data.append('_method', 'PUT');
    }
    const response = await apiClient.post(`/catalog/products/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteProduct(id: number): Promise<{ status: string; message: string }> {
    const response = await apiClient.delete(`/catalog/products/${id}`);
    return response.data;
  },
};