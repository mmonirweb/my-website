import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bannerService } from '../services/bannerService';
import { Banner } from '../types/banner';

export function useBanners(params?: any) {
  const queryClient = useQueryClient();

  const bannersQuery = useQuery({
    queryKey: ['banners', params],
    queryFn: () => bannerService.getBanners(params),
  });

  const createMutation = useMutation({
    mutationFn: (data: Partial<Banner>) => bannerService.createBanner(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Banner> }) => bannerService.updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => bannerService.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
  });

  return {
    ...bannersQuery,
    banners: bannersQuery.data?.data?.data || bannersQuery.data?.data || [],
    createBanner: createMutation.mutateAsync,
    updateBanner: updateMutation.mutateAsync,
    deleteBanner: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
  };
}