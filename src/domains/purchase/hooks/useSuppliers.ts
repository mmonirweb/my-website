import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supplierService } from '../services/supplierService';
import { Supplier } from '../types';

export function useSuppliers(params: { search?: string; is_active?: string; page?: number; per_page?: number }) {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => supplierService.getSuppliers(params),
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Supplier>) => supplierService.createSupplier(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useUpdateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Supplier> }) => supplierService.updateSupplier(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useDeleteSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => supplierService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}