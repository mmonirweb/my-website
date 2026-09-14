import { useQuery } from '@tanstack/react-query';
import { supplierLedgerService } from '../services/supplierLedgerService';

export function useSupplierLedger(
  supplierId: number,
  params: { search?: string; start_date?: string; end_date?: string; type?: string; page?: number; per_page?: number }
) {
  return useQuery({
    queryKey: ['supplier-ledger', supplierId, params],
    queryFn: () => supplierLedgerService.getLedger(supplierId, params),
    enabled: !!supplierId && !isNaN(supplierId),
  });
}