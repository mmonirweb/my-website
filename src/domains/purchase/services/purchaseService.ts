import { apiClient } from '@/lib/axios';
import {
  CreatePurchasePayload,
  PurchaseListResponse,
  PurchaseQueryParams,
  SinglePurchaseResponse,
} from '../types/purchase';

export const purchaseService = {
  async getPurchases(params?: PurchaseQueryParams): Promise<PurchaseListResponse> {
    const response = await apiClient.get<PurchaseListResponse>('/purchases', { params });
    return response.data;
  },

  async getPurchaseById(id: number | string): Promise<SinglePurchaseResponse> {
    const response = await apiClient.get<SinglePurchaseResponse>(`/purchases/${id}`);
    return response.data;
  },

  async createPurchase(payload: CreatePurchasePayload): Promise<SinglePurchaseResponse> {
    const formData = new FormData();

    // Multipart Form Data formatting for attachments and nested items
    Object.entries(payload).forEach(([key, value]) => {
      if (key === 'items' && Array.isArray(value)) {
        value.forEach((item: Record<string, any>, index: number) => {
          Object.entries(item).forEach(([itemKey, itemVal]) => {
            if (itemVal !== undefined && itemVal !== null) {
              formData.append(`items[${index}][${itemKey}]`, String(itemVal));
            }
          });
        });
      } else if (key === 'attachment' && value instanceof File) {
        formData.append('attachment', value);
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    const response = await apiClient.post<SinglePurchaseResponse>('/purchases', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};