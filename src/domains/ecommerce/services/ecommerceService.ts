import { apiClient } from '@/lib/axios';
import { HomePageData } from '../types';

export const ecommerceService = {
  getHomePageData: async (): Promise<HomePageData> => {
    const response = await apiClient.get('/ecommerce/home');
    const resultData = response.data?.data || response.data;

    return {
      hero_banners: Array.isArray(resultData?.hero_banners) ? resultData.hero_banners : [],
      categories: Array.isArray(resultData?.categories) ? resultData.categories : [],
      featured_categories: Array.isArray(resultData?.categories) ? resultData.categories : [],
      flash_sale: {
        ends_at: resultData?.flash_sale?.ends_at || '',
        products: Array.isArray(resultData?.flash_sale?.products) ? resultData.flash_sale.products : [],
      },
      featured_products: Array.isArray(resultData?.featured_products) ? resultData.featured_products : [],
      new_arrivals: Array.isArray(resultData?.new_arrivals) ? resultData.new_arrivals : [],
      top_brands: Array.isArray(resultData?.top_brands) ? resultData.top_brands : [],
    };
  },
};