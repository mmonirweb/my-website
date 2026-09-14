import { apiClient } from '@/lib/axios';
import {
  InventoryItem,
  StockAdjustmentPayload,
  StockHistoryItem,
  StockTransferPayload,
  Warehouse,
  WarehousePayload,
} from '../types';

export const inventoryService = {
  // Warehouses
  getWarehouses: async (params?: Record<string, any>) => {
    const response = await apiClient.get('/warehouses', { params });
    return response.data;
  },
  createWarehouse: async (payload: WarehousePayload) => {
    const response = await apiClient.post('/warehouses', payload);
    return response.data;
  },
  updateWarehouse: async (id: number, payload: WarehousePayload) => {
    const response = await apiClient.put(`/warehouses/${id}`, payload);
    return response.data;
  },
  deleteWarehouse: async (id: number) => {
    const response = await apiClient.delete(`/warehouses/${id}`);
    return response.data;
  },
  getWarehouseById: async (id: number) => {
    const response = await apiClient.get(`/warehouses/${id}`);
    return response.data;
  },

  // Products
  getProducts: async (params?: Record<string, any>) => {
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  // Stocks (Aligned with Backend Domain Endpoints)
  getStocks: async (params?: { warehouse_id?: number; search?: string; page?: number }) => {
    const response = await apiClient.get('/inventories', { params });
    return response.data;
  },
  adjustStock: async (payload: StockAdjustmentPayload) => {
    const response = await apiClient.post('/inventories/adjustments', payload);
    return response.data;
  },
  transferStock: async (payload: StockTransferPayload) => {
    const response = await apiClient.post('/inventories/transfers', payload);
    return response.data;
  },
  getStockHistory: async (params?: { product_id?: number; warehouse_id?: number; page?: number }) => {
    const response = await apiClient.get('/inventories/histories', { params });
    return response.data;
  },
};