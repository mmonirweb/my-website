import { apiClient } from '@/lib/axios';
import { Supplier, SupplierStats } from '../types';

interface GetSuppliersParams {
  search?: string;
  is_active?: string;
  page?: number;
  per_page?: number;
}

interface GetSuppliersResponse {
  success: boolean;
  message: string;
  data: Supplier[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  stats: SupplierStats;
}

export const supplierService = {
  getSuppliers: async (params: GetSuppliersParams): Promise<GetSuppliersResponse> => {
    const response = await apiClient.get('/suppliers', { params });
    return response.data;
  },

  createSupplier: async (data: Partial<Supplier>): Promise<{ data: Supplier }> => {
    const response = await apiClient.post('/suppliers', data);
    return response.data;
  },

  updateSupplier: async (id: number, data: Partial<Supplier>): Promise<{ data: Supplier }> => {
    const response = await apiClient.put(`/suppliers/${id}`, data);
    return response.data;
  },

  deleteSupplier: async (id: number): Promise<void> => {
    await apiClient.delete(`/suppliers/${id}`);
  },
};