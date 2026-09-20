import { apiClient } from '@/lib/axios';
import { MasterInvoiceData } from '../types';

export const invoiceService = {
  async getInvoice(invoiceNo: string): Promise<MasterInvoiceData> {
    const response = await apiClient.get<{ success: boolean; data: MasterInvoiceData; message: string }>(
      `/invoices/${invoiceNo}`
    );
    return response.data?.data || response.data;
  },
};