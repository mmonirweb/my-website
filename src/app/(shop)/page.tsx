'use client';

import { useEcommerceHome } from '@/domains/ecommerce/hooks/useEcommerceHome';
import HeroBanner from '@/components/ecommerce/HeroBanner';
import ProductCard from '@/components/ecommerce/ProductCard';

// Professional Skeleton Loader for seamless UX
function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 animate-pulse">
      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Banner Skeleton */}
        <div className="w-full h-48 sm:h-64 md:h-80 bg-slate-200 rounded-3xl" />

        {/* Section 1 Skeleton */}
        <div className="space-y-4">
          <div className="h-6 bg-slate-200 rounded w-40 sm:w-48" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-3 rounded-2xl border border-slate-100 space-y-3">
                <div className="h-28 sm:h-36 bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EcommerceHomePage() {
  const { data, isLoading, isError, refetch } = useEcommerceHome();

  if (isLoading) {
    return <HomeSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-600 gap-4 container mx-auto px-4 text-center">
        <p className="text-sm md:text-base font-semibold">সাময়িক নেটওয়ার্ক সংযোগ সমস্যা দেখা দিয়েছে।</p>
        <button
          onClick={() => refetch()}
          className="px-6 py-2.5 bg-emerald-600 text-white text-xs md:text-sm font-bold rounded-2xl shadow-md hover:bg-emerald-700 transition cursor-pointer"
        >
          পুনরায় চেষ্টা করুন
        </button>
      </div>
    );
  }

  const homeData = (data as Record<string, any>) || {};

  const banners = Array.isArray(homeData?.hero_banners) ? homeData.hero_banners : [];
  const featuredProducts = Array.isArray(homeData?.featured_products) ? homeData.featured_products : [];
  const flashSaleProducts = Array.isArray(homeData?.flash_sale?.products) ? homeData.flash_sale.products : [];
  const newArrivals = Array.isArray(homeData?.new_arrivals) ? homeData.new_arrivals : [];

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* 1. Hero Banner */}
      <HeroBanner banners={banners} />

      <main className="container mx-auto px-4 py-6 space-y-10">
        {/* 2. Featured Products Section */}
        {featuredProducts.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base md:text-xl font-bold text-slate-800">
                Featured Products
              </h2>
              <a
                href="/shop"
                className="text-xs md:text-sm text-emerald-600 font-semibold hover:underline"
              >
                View All &rarr;
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
              {featuredProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* 3. Flash Sale Section */}
        {flashSaleProducts.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base md:text-xl font-bold text-slate-800">
                Flash Sale
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
              {flashSaleProducts.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* 4. New Arrivals Section */}
        {newArrivals.length > 0 && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base md:text-xl font-bold text-slate-800">
                New Arrivals
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-4">
              {newArrivals.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}