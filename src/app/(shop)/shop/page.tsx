import React from 'react';
import type { Metadata } from 'next';
import ProductCard from '@/components/ecommerce/ProductCard';

export const dynamic = 'force-dynamic';

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

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

// ১. এসইও মেটাডেটা জেনারেটর (SEO Optimization)
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'All Products | Shop Our Collection',
    description: 'Explore our wide range of high-quality products. Shop now for the best deals and fast delivery.',
    robots: { index: true, follow: true },
    openGraph: {
      title: 'All Products | Shop Our Collection',
      description: 'Explore our wide range of high-quality products.',
      type: 'website',
    },
  };
}

// ২. সার্ভার থেকে প্রডাক্ট ফেচ করার ফাংশন
async function fetchProducts(): Promise<Product[]> {
  try {
    const res = await fetch(`${rawApiUrl}/ecommerce/products`, {
      cache: 'no-store', // রিয়েল-টাইম স্টক ও প্রডাক্ট আপডেটের জন্য
    });

    if (!res.ok) {
      console.error('Failed to fetch products, status:', res.status);
      return [];
    }

    const jsonRes = await res.json();
    const resData = jsonRes?.data || jsonRes;
    
    // হ্যান্ডেল পেজিনেশন অথবা ডিরেক্ট লারাভেল কালেকশন অ্যারে
    const prodsList = Array.isArray(resData) ? resData : (resData?.data || []);
    return prodsList;
  } catch (error) {
    console.error('Failed to load shop products:', error);
    return [];
  }
}

// ৩. মেইন সার্ভার কম্পোনেন্ট
export default async function ShopProductsPage() {
  const products = await fetchProducts();

  return (
    <div className="container mx-auto px-4 py-6 min-h-screen">
      <div className="space-y-6">
        
        {/* পেজ হেডিং ও কাউন্টার */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">সকল প্রডাক্ট</h1>
            <p className="text-xs text-slate-500 mt-0.5">আমাদের কালেকশন থেকে আপনার পছন্দের প্রডাক্টটি বেছে নিন</p>
          </div>
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100">
            মোট প্রডাক্ট: {products.length}
          </span>
        </div>

        {/* প্রডাক্ট গ্রিড */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200 shadow-xs">
            <p className="text-slate-800 font-bold text-base">কোনো প্রডাক্ট পাওয়া যায়নি!</p>
            <p className="text-slate-500 text-xs mt-1">দয়া করে কিছুক্ষণ পর আবার চেষ্টা করুন।</p>
          </div>
        )}

      </div>
    </div>
  );
}