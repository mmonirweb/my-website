import { apiClient } from '@/lib/axios';
import { CustomerPaymentPayload } from '../types/payment';

export const customerPaymentService = {
  getCustomers: async () => {
    const response = await apiClient.get('/customers');
    return response.data;
  },

  getAllPayments: async (params?: Record<string, any>) => {
    const response = await apiClient.get('/customers/customer-payments', { params });
    return response.data;
  },

  collectPayment: async (payload: CustomerPaymentPayload) => {
    const response = await apiClient.post('/customers/customer-payments', payload);
    return response.data;
  },

  getHistory: async (customerId: number) => {
    const response = await apiClient.get(`/customers/customer-payments/${customerId}`);
    return response.data;
  },
};