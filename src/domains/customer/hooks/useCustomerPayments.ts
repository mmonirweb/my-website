import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerPaymentService } from '../services/customerPaymentService';
import { CustomerPaymentPayload } from '../types/payment';

export const useCustomerPayments = (filters?: Record<string, any>) => {
  const queryClient = useQueryClient();

  // ১. কাস্টমার লিস্ট লোড করার কুয়েরি
  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const res = await customerPaymentService.getCustomers();
      if (Array.isArray(res)) return res;
      if (Array.isArray(res?.data)) return res.data;
      if (Array.isArray(res?.data?.data)) return res.data.data;
      return [];
    },
  });

  // ২. পেমেন্ট লিস্ট/লেজার লোড করার কুয়েরি
  const paymentsQuery = useQuery({
    queryKey: ['customer-payments', filters],
    queryFn: async () => {
      const res = await customerPaymentService.getAllPayments(filters);
      
      let rawData: any[] = [];
      if (Array.isArray(res)) {
        rawData = res;
      } else if (Array.isArray(res?.data)) {
        rawData = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        rawData = res.data.data;
      } else if (Array.isArray(res?.data?.data?.data)) {
        rawData = res.data.data.data;
      }

      return rawData.map((item: any) => ({
        id: item.id,
        payment_no: item.payment_no || `PAY-${item.id}`,
        receipt_no: item.payment_no || `PAY-${item.id}`,
        payment_date: item.payment_date,
        customer_id: item.customer_id,
        customer_name: item.customer?.name || 'N/A',
        customer_phone: item.customer?.phone || '',
        amount_paid: parseFloat(item.amount || 0),
        previous_balance: parseFloat(item.previous_balance || 0),
        remaining_balance: parseFloat(item.remaining_balance || 0),
        payment_method: item.payment_method || 'CASH',
        reference_no: item.reference_no || '',
        created_by: item.creator?.name || 'System Admin',
        notes: item.notes || '',
      }));
    },
  });

  // ৩. পেমেন্ট কালেকশন মিউটেশন
  const collectPaymentMutation = useMutation({
    mutationFn: (payload: CustomerPaymentPayload) =>
      customerPaymentService.collectPayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer-payments'] });
      queryClient.invalidateQueries({ queryKey: ['customer-ledger'] });
    },
  });

  return {
    customers: customersQuery.data || [],
    payments: paymentsQuery.data || [],
    isLoading: paymentsQuery.isLoading,
    isCustomersLoading: customersQuery.isLoading,
    collectPayment: collectPaymentMutation.mutateAsync,
    isSubmitting: collectPaymentMutation.isPending,
    refetch: paymentsQuery.refetch,
  };
};