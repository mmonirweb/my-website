'use client';

import React, { useState, useEffect } from 'react';
import ProductCard from '@/components/ecommerce/ProductCard';
import { Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/axios';

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  image?: string;
  featured_image?: string;
  main_image?: string;
  stock: number;
  category?: { id: number; name: string; slug: string };
  brand?: { id: number; name: string; slug?: string };
}

export default function ShopProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchShopData() {
      setIsLoading(true);
      try {
        const res = await apiClient.get('/ecommerce/products');
        const resData = res.data?.data || res.data;
        
        // Handle pagination or direct array format from Laravel API
        const prodsList = Array.isArray(resData) ? resData : (resData?.data || []);
        setProducts(prodsList);

      } catch (error) {
        console.error('Failed to load shop products:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchShopData();
  }, []);

  return (
    <div className="container mx-auto px-4 py-4 min-h-screen">
      
      {/* Main Content Area (Clean Full Width Products Grid without any filters/sorting) */}
      <div className="space-y-4">

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-xs">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
            <p className="text-xs font-semibold text-slate-500">প্রডাক্ট লোড হচ্ছে...</p>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-800 font-bold text-base">কোনো প্রডাক্ট পাওয়া যায়নি!</p>
            <p className="text-slate-500 text-xs mt-1">দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।</p>
          </div>
        )}

      </div>
    </div>
  );
}