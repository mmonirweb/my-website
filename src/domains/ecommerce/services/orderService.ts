import { apiClient } from '@/lib/axios';
import { Order } from '../types/order';

export const orderService = {
  async getAdminOrders(params?: { search?: string; status?: string; page?: number; company_id?: number; branch_id?: number }): Promise<{ data: Order[]; meta: any }> {
    const response = await apiClient.get('/ecommerce/admin/orders', { params });
    return response.data;
  },

  async getOrderDetails(id: number): Promise<Order> {
    const response = await apiClient.get(`/ecommerce/admin/orders/${id}`);
    return response.data.data;
  },

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    const response = await apiClient.put(`/ecommerce/admin/orders/${id}/status`, { status });
    return response.data.data;
  },

  async bulkUpdateStatus(orderIds: number[], status: string): Promise<{ updated_count: number }> {
    const response = await apiClient.post('/ecommerce/admin/orders/bulk-status', { order_ids: orderIds, status });
    return response.data.data;
  }
};