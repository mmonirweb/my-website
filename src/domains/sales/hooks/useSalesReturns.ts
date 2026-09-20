import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salesReturnService } from '../services/salesReturnService';
import { CreateSalesReturnPayload } from '../types/return';

export const useSalesReturns = (params?: Record<string, any>) => {
  const queryClient = useQueryClient();

  const returnsQuery = useQuery({
    queryKey: ['sales-returns', params],
    queryFn: () => salesReturnService.getReturns(params),
  });

  return {
    returns: returnsQuery.data?.data?.data || returnsQuery.data?.data || returnsQuery.data || [],
    pagination: returnsQuery.data?.data,
    isLoading: returnsQuery.isLoading,
    createReturn: (payload: CreateSalesReturnPayload) =>
      useMutation({
        mutationFn: (p: CreateSalesReturnPayload) => salesReturnService.createReturn(p),
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['sales-returns'] });
          queryClient.invalidateQueries({ queryKey: ['customers'] });
          queryClient.invalidateQueries({ queryKey: ['inventory'] });
        },
      }),
    isSubmitting: false,
    rawResponse: returnsQuery.data,
  };
};