import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '../services/orderService';

export function useOrders(params?: { search?: string; status?: string; page?: number }) {
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['admin-orders', params],
    queryFn: () => orderService.getAdminOrders(params),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => orderService.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  const bulkUpdateStatusMutation = useMutation({
    mutationFn: ({ orderIds, status }: { orderIds: number[]; status: string }) => orderService.bulkUpdateStatus(orderIds, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });

  return {
    ...ordersQuery,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    bulkUpdateStatus: bulkUpdateStatusMutation.mutateAsync,
    isBulkUpdating: bulkUpdateStatusMutation.isPending,
  };
}