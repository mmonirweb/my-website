import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';
import { StockAdjustmentPayload, StockTransferPayload, WarehousePayload } from '../types';

export const useWarehouses = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['warehouses', params],
    queryFn: () => inventoryService.getWarehouses(params),
  });
};

export const useInventoryStocks = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['inventory-stocks', params],
    queryFn: () => inventoryService.getStocks(params),
  });
};

export const useStockHistory = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['stock-history', params],
    queryFn: () => inventoryService.getStockHistory(params),
  });
};

export const useProducts = (params?: Record<string, any>) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => {
      if (typeof inventoryService.getProducts === 'function') {
        return inventoryService.getProducts(params);
      }
      return Promise.resolve([]);
    },
  });
};

export const useInventoryMutations = () => {
  const queryClient = useQueryClient();

  const createWarehouseMutation = useMutation({
    mutationFn: (payload: WarehousePayload) => inventoryService.createWarehouse(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });

  const updateWarehouseMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: WarehousePayload }) =>
      inventoryService.updateWarehouse(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });

  const deleteWarehouseMutation = useMutation({
    mutationFn: (id: number) => inventoryService.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouses'] });
    },
  });

  const adjustStockMutation = useMutation({
    mutationFn: (payload: StockAdjustmentPayload) => inventoryService.adjustStock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-stocks'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history'] });
    },
  });

  const transferStockMutation = useMutation({
    mutationFn: (payload: StockTransferPayload) => inventoryService.transferStock(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-stocks'] });
      queryClient.invalidateQueries({ queryKey: ['stock-history'] });
    },
  });

  return {
    createWarehouseMutation,
    updateWarehouseMutation,
    deleteWarehouseMutation,
    adjustStockMutation,
    transferStockMutation,
  };
};