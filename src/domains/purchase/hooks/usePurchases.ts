import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient as axios } from '@/lib/axios';
import { GoodsReceivedNotePayload } from '../types/purchase';

export function usePurchases(page: number = 1, filters: Record<string, any> = {}) {
  const queryClient = useQueryClient();

  const purchasesQuery = useQuery({
    queryKey: ['purchases', page, filters],
    queryFn: async () => {
      const response = await axios.get('/purchases', {
        params: { page, ...filters },
      });
      return response.data;
    },
  });

  const createPurchaseMutation = useMutation({
    mutationFn: async (payload: any) => {
      const formData = new FormData();
      Object.keys(payload).forEach((key) => {
        if (key === 'items' && Array.isArray(payload.items)) {
          payload.items.forEach((item: any, index: number) => {
            Object.keys(item).forEach((itemKey) => {
              if (item[itemKey] !== undefined && item[itemKey] !== null) {
                formData.append(`items[${index}][${itemKey}]`, item[itemKey]);
              }
            });
          });
        } else if (payload[key] !== undefined && payload[key] !== null) {
          formData.append(key, payload[key]);
        }
      });
      const response = await axios.post('/purchases', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });

  const receiveGoodsMutation = useMutation({
    mutationFn: async (payload: GoodsReceivedNotePayload) => {
      const response = await axios.post('/purchases/receive', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });

  const deletePurchaseMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await axios.delete(`/purchases/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });

  return {
    purchasesQuery,
    createPurchaseMutation,
    receiveGoodsMutation,
    deletePurchaseMutation,
  };
}