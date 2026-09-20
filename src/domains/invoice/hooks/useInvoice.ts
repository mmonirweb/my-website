import { useQuery } from '@tanstack/react-query';
import { invoiceService } from '../services/invoiceService'; // অথবা আপনার প্রজেক্টের সঠিক পাথ অনুযায়ী দিন
import { MasterInvoiceData } from '../types';

export function useInvoice(invoiceNo: string | null) {
  return useQuery<MasterInvoiceData>({
    queryKey: ['invoice', invoiceNo],
    queryFn: async () => {
      if (!invoiceNo) throw new Error('Invoice number is required');
      return await invoiceService.getInvoice(invoiceNo);
    },
    enabled: !!invoiceNo,
    staleTime: 1000 * 60 * 5,
  });
}