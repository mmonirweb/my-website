import { apiClient } from '@/lib/axios';
import { SupplierLedgerResponse } from '../types';

interface GetLedgerParams {
  search?: string;
  start_date?: string;
  end_date?: string;
  type?: string;
  page?: number;
  per_page?: number;
}

export const supplierLedgerService = {
  getLedger: async (supplierId: number, params: GetLedgerParams): Promise<SupplierLedgerResponse> => {
    const response = await apiClient.get(`/suppliers/${supplierId}/ledger`, { params });
    return response.data;
  },
};