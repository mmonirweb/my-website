import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taxRateService, unitService } from '../services/taxUnitService';
import { TaxRateInput, UnitInput } from '../types/catalog';

export const useTaxRates = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['tax-rates'],
    queryFn: async () => {
      const response = await taxRateService.getTaxRates();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: TaxRateInput) => taxRateService.createTaxRate(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tax-rates'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaxRateInput }) =>
      taxRateService.updateTaxRate(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tax-rates'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => taxRateService.deleteTaxRate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tax-rates'] }),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
};

export const useUnits = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['units'],
    queryFn: async () => {
      const response = await unitService.getUnits();
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: UnitInput) => unitService.createUnit(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['units'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UnitInput }) =>
      unitService.updateUnit(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['units'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => unitService.deleteUnit(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['units'] }),
  });

  return { ...query, createMutation, updateMutation, deleteMutation };
};