import { useQuery } from '@tanstack/react-query';
import { ecommerceService } from '../services/ecommerceService';

export const useEcommerceHome = () => {
  return useQuery({
    queryKey: ['ecommerce-home'],
    queryFn: () => ecommerceService.getHomePageData(),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};