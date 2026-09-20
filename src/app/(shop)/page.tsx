'use client';

import { useEcommerceHome } from '@/domains/ecommerce/hooks/useEcommerceHome';
import HeroBanner from '@/components/ecommerce/HeroBanner';
import ProductCard from '@/components/ecommerce/ProductCard';

export default function EcommerceHomePage() {
  const { data, isLoading } = useEcommerceHome();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-500 font-medium">
        Loading store...
      </div>
    );
  }

  const homeData = (data as Record<string, any>) || {};

  const banners = Array.isArray(homeData?.hero_banners)
    ? homeData.hero_banners
    : [];

  const featuredProducts = Array.isArray(homeData?.featured_products)
    ? homeData.featured_products
    : [];

  const flashSaleProducts = Array.isArray(homeData?.flash_sale?.products)
    ? homeData.flash_sale.products
    : [];

  const newArrivals = Array.isArray(homeData?.new_arrivals)
    ? homeData.new_arrivals
    : [];

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