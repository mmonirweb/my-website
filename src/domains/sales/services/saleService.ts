import { apiClient } from '@/lib/axios';
import { Sale, StoreSalePayload } from '../types';

export const saleService = {
  getSales: async (params?: Record<string, any>) => {
    const response = await apiClient.get('/sales', { params });
    return response.data;
  },

  getSaleById: async (id: number) => {
    const response = await apiClient.get(`/sales/${id}`);
    return response.data.data as Sale;
  },

  createSale: async (payload: StoreSalePayload) => {
    const response = await apiClient.post('/sales', payload);
    return response.data.data as Sale;
  },
};