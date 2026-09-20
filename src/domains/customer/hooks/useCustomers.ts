import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/customerService';
import { CustomerPayload } from '../types';

export const useCustomers = (params?: Record<string, any>) => {
  const queryClient = useQueryClient();

  // All Customers Query
  const customersQuery = useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerService.getCustomers(params),
  });

  // Single Customer Details Query
  const customerQuery = useQuery({
    queryKey: ['customer', params?.id],
    queryFn: () => customerService.getCustomerById(params?.id),
    enabled: !!params?.id,
  });

  // Customer Ledger Query
  const customerLedgerQuery = useQuery({
    queryKey: ['customer-ledger', params?.id, params],
    queryFn: () => customerService.getCustomerLedger(params?.id, params),
    enabled: !!params?.id,
  });

  const createCustomerMutation = useMutation({
    mutationFn: (payload: CustomerPayload) => customerService.createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CustomerPayload }) =>
      customerService.updateCustomer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: (id: number) => customerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });

  return {
    customersQuery,
    customerQuery,
    customerLedgerQuery,
    createCustomerMutation,
    updateCustomerMutation,
    deleteCustomerMutation,
  };
};

// ==========================================
// Standalone Named Export Hooks
// ==========================================

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CustomerPayload) => customerService.createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CustomerPayload }) =>
      customerService.updateCustomer(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer'] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => customerService.deleteCustomer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
  });
};