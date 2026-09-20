'use client';

import Link from 'next/link';
import { Heart } from 'lucide-react';
import ProductActionButtons from '@/components/ecommerce/ProductActionButtons';

interface Product {
  id: number | string;
  name: string;
  slug: string;
  price?: number | string;
  sale_price?: number | string;
  regular_price?: number | string;
  unit_price?: number | string;
  selling_price?: number | string;
  image?: string;
  featured_image?: string;
  main_image?: string;
  inventories?: Array<{ quantity: number }>;
  total_stock?: number;
  stock?: number | string;
  stock_quantity?: number | string;
  [key: string]: any;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const rawPrice = product?.sale_price || product?.price || product?.regular_price || product?.unit_price || product?.selling_price || 0;
  const rawOriginalPrice = product?.price || product?.regular_price || 0;
  
  const displayPrice = Number(rawPrice) || 0;
  const originalPrice = Number(rawOriginalPrice) || 0;
  
  const hasDiscount = Boolean(product?.sale_price && Number(product.sale_price) < originalPrice);

  const imageUrl = product?.featured_image || product?.image || product?.main_image || '/images/placeholder.jpg';
  const productUrl = `/shop/product/${product?.slug || product?.id}`;

  // Calculate total stock safely supporting multiple backend formats
  const totalStock = Number(
    product?.total_stock ?? 
    (Array.isArray(product?.inventories) && product.inventories.length > 0
      ? product.inventories.reduce((acc, inv) => acc + Number(inv.quantity || 0), 0) 
      : (product?.stock ?? product?.stock_quantity ?? 0))
  );

  const isStockAvailable = totalStock > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-xs hover:shadow-xl transition-all duration-300 p-3 flex flex-col justify-between group">
      <div>
        {/* Product Image wrapped with Link */}
        <Link href={productUrl} className="block">
          <div className="relative aspect-square rounded-xl bg-slate-50 overflow-hidden mb-2">
            <img
              src={imageUrl}
              alt={product?.name || 'Product Image'}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/e2e8f0/64748b?text=No+Image';
              }}
            />
            
            {/* Stock Badge on Image */}
            <div className="absolute top-2 left-2 z-10">
              {isStockAvailable ? (
                <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-xs">
                  Stock Available
                </span>
              ) : (
                <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-xs">
                  Out of Stock
                </span>
              )}
            </div>

            <button 
              type="button" 
              onClick={(e) => e.preventDefault()} 
              className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-xs rounded-full text-slate-400 hover:text-rose-500 shadow-xs transition"
            >
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </Link>

        {/* Title wrapped with Link */}
        <Link href={productUrl}>
          <h3 className="font-bold text-slate-800 line-clamp-2 hover:text-emerald-600 transition text-xs sm:text-sm leading-snug">
            {product?.name}
          </h3>
        </Link>
      </div>

      {/* Price & Action Buttons Area */}
      <div className="mt-1 pt-2 border-t border-slate-50 flex flex-col gap-2">
        {/* Price Section */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm sm:text-base font-extrabold text-emerald-600">
            ৳{displayPrice.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-[11px] text-slate-400 line-through font-medium">
              ৳{originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Product Action Buttons Component */}
        <div className="mt-1">
          <ProductActionButtons product={product as any} quantity={1} layout={"vertical" as any} showBuyNow={true} />
        </div>
      </div>
    </div>
  );
}