import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saleService } from '../services/saleService';
import { StoreSalePayload } from '../types';

export const useSales = (params?: Record<string, any>) => {
  const queryClient = useQueryClient();

  const salesQuery = useQuery({
    queryKey: ['sales', params],
    queryFn: () => saleService.getSales(params),
  });

  const createSaleMutation = useMutation({
    mutationFn: (payload: StoreSalePayload) => saleService.createSale(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return {
    sales: salesQuery.data,
    isLoading: salesQuery.isLoading,
    isError: salesQuery.isError,
    createSale: createSaleMutation.mutateAsync,
    isCreating: createSaleMutation.isPending,
  };
};

export const useSaleDetails = (id: number) => {
  return useQuery({
    queryKey: ['sale-details', id],
    queryFn: () => saleService.getSaleById(id),
    enabled: !!id,
  });
};