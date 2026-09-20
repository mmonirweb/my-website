import { apiClient } from '@/lib/axios';
import { HomePageData } from '../types';

export const ecommerceService = {
  getHomePageData: async (): Promise<HomePageData> => {
    try {
      const response = await apiClient.get('/ecommerce/home');
      // ব্যাকএন্ড API থেকে response.data.data অথবা response.data আসবে
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
    } catch (error) {
      console.error('Failed to fetch home page data from API:', error);
      
      // API 500 error বা নেটওয়ার্ক সমস্যা হলে সেফ ফলব্যাক রিটার্ন করবে যাতে পেজ ক্র্যাশ না করে
      return {
        hero_banners: [],
        categories: [],
        featured_categories: [],
        flash_sale: {
          ends_at: '',
          products: [],
        },
        featured_products: [],
        new_arrivals: [],
        top_brands: [],
      };
    }
  },
};