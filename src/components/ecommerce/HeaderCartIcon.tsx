'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function HeaderCartIcon() {
  const { totalItems } = useCart();

  return (
    <Link href="/cart" className="relative p-2.5 rounded-2xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 transition flex items-center justify-center">
      <ShoppingCart className="w-5 h-5" />
      {totalItems > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-emerald-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
          {totalItems}
        </span>
      )}
    </Link>
  );
}