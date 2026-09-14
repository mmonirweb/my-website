import { apiClient } from '@/lib/axios';
import { CreatePurchaseReturnPayload, PurchaseReturn } from "../types/purchaseReturn";

export const purchaseReturnService = {
  async getReturns(params?: Record<string, any>) {
    const response = await apiClient.get("/purchase-returns", { params });
    return response.data;
  },

  async createReturn(payload: CreatePurchaseReturnPayload): Promise<PurchaseReturn> {
    const response = await apiClient.post("/purchase-returns", payload);
    return response.data.data;
  },
};