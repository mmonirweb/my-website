import React from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import ProductCard from '@/components/ecommerce/ProductCard';

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
  category?: { id: number; name: string };
}

interface CategoryData {
  id: number;
  name: string;
  slug: string;
  description?: string;
  products: Product[];
}

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

async function getCategoryData(slug: string): Promise<CategoryData | null> {
  try {
    const res = await fetch(`${rawApiUrl}/ecommerce/categories/${slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const response = await res.json();
    return response.data || null;
  } catch (error) {
    console.error('API Fetch Error:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const categoryData = await getCategoryData(resolvedParams.slug);

  if (!categoryData) {
    return {
      title: 'Category Not Found',
    };
  }

  return {
    title: categoryData.name,
    description: categoryData.description || `Browse our collection of ${categoryData.name}`,
    robots: { index: true, follow: true },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const categoryData = await getCategoryData(resolvedParams.slug);

  if (!categoryData) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">{categoryData.name}</h1>
        {categoryData.description && (
          <p className="mt-2 text-gray-600">{categoryData.description}</p>
        )}
      </div>

      {categoryData.products && categoryData.products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categoryData.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed">
          <p className="text-gray-500 text-lg">এই ক্যাটাগরিতে বর্তমানে কোনো প্রোডাক্ট নেই।</p>
        </div>
      )}
    </div>
  );
}