import { apiClient } from '@/lib/axios';
import { Customer, CustomerPayload, CustomerLedgerItem } from '../types';

export const customerService = {
  getCustomers: async (params?: Record<string, any>) => {
    const response = await apiClient.get('/customers', { params });
    return response.data;
  },

  getCustomerById: async (id: number) => {
    const response = await apiClient.get(`/customers/${id}`);
    return response.data.data as Customer;
  },

  createCustomer: async (payload: CustomerPayload) => {
    const response = await apiClient.post('/customers', payload);
    return response.data.data as Customer;
  },

  updateCustomer: async (id: number, payload: CustomerPayload) => {
    const response = await apiClient.put(`/customers/${id}`, payload);
    return response.data.data as Customer;
  },

  deleteCustomer: async (id: number) => {
    const response = await apiClient.delete(`/customers/${id}`);
    return response.data;
  },

  getCustomerLedger: async (id: number, params?: Record<string, any>) => {
    const response = await apiClient.get(`/customers/${id}/ledger`, { params });
    return response.data.data;
  },
};