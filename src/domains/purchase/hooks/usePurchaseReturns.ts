import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseReturnService } from "../services/purchaseReturnService";
import { CreatePurchaseReturnPayload } from "../types/purchaseReturn";

export const usePurchaseReturns = (params?: Record<string, any>) => {
  const queryClient = useQueryClient();

  const returnsQuery = useQuery({
    queryKey: ["purchase-returns", params],
    queryFn: () => purchaseReturnService.getReturns(params),
  });

  const createReturnMutation = useMutation({
    mutationFn: (payload: CreatePurchaseReturnPayload) =>
      purchaseReturnService.createReturn(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-returns"] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
  });

  return {
    ...returnsQuery,
    createReturn: createReturnMutation.mutateAsync,
    isCreating: createReturnMutation.isPending,
  };
};