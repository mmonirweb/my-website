import { useQuery } from '@tanstack/react-query';
import { ecommerceService } from '../services/ecommerceService';

export const useEcommerceHome = () => {
  return useQuery({
    queryKey: ['ecommerce-home'],
    queryFn: () => ecommerceService.getHomePageData(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache retention
    gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
    retry: 3, // Auto-retry 3 times if server fails to respond
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false, // Prevent unwanted background re-fetching
  });
};