import { apiClient } from '@/lib/axios';
import { CreateSalesReturnPayload } from '../types/return';

export const salesReturnService = {
  getProducts: async () => {
    const res = await apiClient.get('/products');
    return res.data;
  },

  getWarehouses: async () => {
    const res = await apiClient.get('/warehouses');
    return res.data;
  },

  getCustomers: async (params?: { search?: string }) => {
    const res = await apiClient.get('/customers', { params });
    return res.data;
  },

  getCustomerInvoices: async (customerId: number) => {
    const res = await apiClient.get(`/sales?customer_id=${customerId}`);
    return res.data;
  },

  createReturn: async (payload: CreateSalesReturnPayload) => {
    const res = await apiClient.post('/sales-returns', payload);
    return res.data;
  },

  getReturns: async (params?: any) => {
    const res = await apiClient.get('/sales-returns', { params });
    return res.data;
  },

  getReturnsList: async (params?: any) => {
    const res = await apiClient.get('/sales-returns', { params });
    return res.data;
  }
};