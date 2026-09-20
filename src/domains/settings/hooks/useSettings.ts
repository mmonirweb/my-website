import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingService } from '../services/settingService';

export const useSettings = () => {
  const queryClient = useQueryClient();

  const settingsQuery = useQuery({
    queryKey: ['settings'],
    queryFn: settingService.getSettings,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: settingService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
    },
  });

  return {
    settings: settingsQuery.data,
    isLoading: settingsQuery.isLoading,
    isError: settingsQuery.isError,
    updateSettings: updateSettingsMutation.mutateAsync,
    isUpdating: updateSettingsMutation.isPending,
  };
};

export const usePublicSettings = () => {
  return useQuery({
    queryKey: ['public-settings'],
    queryFn: settingService.getPublicSettings,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};