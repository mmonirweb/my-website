'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Zap, Check, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface Product {
  id: number | string;
  name: string;
  slug: string;
  price?: number | string;
  sale_price?: number | string;
  regular_price?: number | string;
  unit_price?: number | string;
  selling_price?: number | string;
  stock?: number;
  current_stock?: number;
  total_stock?: number;
  image?: string;
  featured_image?: string;
  main_image?: string;
  [key: string]: any;
}

interface ProductActionButtonsProps {
  product: Product;
  quantity?: number;
  layout?: 'vertical' | 'horizontal';
  showBuyNow?: boolean;
  className?: string;
}

export default function ProductActionButtons({
  product,
  quantity = 1,
  layout = 'horizontal',
  showBuyNow = true,
  className = '',
}: ProductActionButtonsProps) {
  const { addToCart } = useCart();
  const router = useRouter();
  const [isAdded, setIsAdded] = useState(false);

  // প্রোডাক্টের যেকোনো স্টক প্রপার্টি চেক করার জন্য লজিক
  const stockCount = Number(
    product.stock ?? product.current_stock ?? product.total_stock ?? 0
  );
  const isOutOfStock = stockCount <= 0;

  // ১. কার্টে যোগ করার হ্যান্ডলার
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  // ২. সরাসরি চেকআউটে যাওয়ার হ্যান্ডলার (Buy Now)
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addToCart(product, quantity);
    router.push('/checkout');
  };

  return (
    <div className={`flex ${layout === 'vertical' ? 'flex-col' : 'flex-row'} gap-2.5 ${className}`}>
      {/* Add to Cart Button */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`w-full flex-1 transition-all duration-300 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold shadow-sm ${
          isOutOfStock
            ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
            : isAdded
            ? 'bg-emerald-600 text-white shadow-emerald-600/30 ring-2 ring-emerald-600/20 active:scale-95 cursor-pointer'
            : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-amber-400/20 border border-amber-300/50 active:scale-95 cursor-pointer'
        }`}
      >
        {isOutOfStock ? (
          <>
            <AlertCircle className="w-4 h-4" />
            <span>Stock Out</span>
          </>
        ) : isAdded ? (
          <>
            <Check className="w-4 h-4 animate-bounce" />
            <span>Added to Cart!</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-4 h-4 text-slate-900" />
            <span>Add to Cart</span>
          </>
        )}
      </button>

      {/* Buy Now Button */}
      {showBuyNow && (
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isOutOfStock}
          className={`w-full flex-1 transition-all duration-300 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs md:text-sm font-bold ${
            isOutOfStock
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
              : 'bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-md shadow-slate-900/20 active:scale-95 border border-slate-700/50 cursor-pointer'
          }`}
        >
          <Zap className={`w-4 h-4 ${isOutOfStock ? 'text-slate-400' : 'text-amber-400 fill-amber-400 animate-pulse'}`} />
          <span>Buy Now</span>
        </button>
      )}
    </div>
  );
}