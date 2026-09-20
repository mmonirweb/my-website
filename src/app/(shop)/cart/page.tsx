'use client';

import React from 'react';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const { t } = useLanguage();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-xl">
        <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">{t('emptyCart')}</h2>
        <p className="text-sm text-slate-500 mb-6">আপনার পছন্দমতো পণ্য কার্টে যোগ করে কেনাকাটা শুরু করুন।</p>
        <Link href="/shop" className="inline-flex items-center gap-2 bg-emerald-600 text-white text-xs font-bold px-6 py-3.5 rounded-2xl shadow-md hover:bg-emerald-700 transition">
          {t('continueShopping')} <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-6">{t('shoppingCart')} ({totalItems})</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-100 p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-slate-100 rounded-xl overflow-hidden shrink-0 border border-slate-100">
                    <img src={item.main_image || 'https://placehold.co/200x200/e2e8f0/64748b?text=Item'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-800 line-clamp-1">{item.name}</h3>
                    {item.sku && <p className="text-xs text-slate-400 mt-0.5">SKU: {item.sku}</p>}
                    <p className="text-sm font-black text-emerald-600 mt-1">৳{item.selling_price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 rounded-lg bg-white text-slate-600 hover:bg-slate-100">
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-slate-800">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 rounded-lg bg-white text-slate-600 hover:bg-slate-100">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <button onClick={() => removeFromCart(item.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">{t('orderSummary')}</h3>
              <div className="flex justify-between text-sm text-slate-600">
                <span>{t('subtotal')}</span>
                <span className="font-bold text-slate-900">৳{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600 pb-3 border-b border-slate-100">
                <span>{t('deliveryCharge')}</span>
                <span className="font-bold text-slate-900">{t('calculatedAtCheckout')}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1">
                <span>{t('total')}</span>
                <span className="text-emerald-600">৳{subtotal.toFixed(2)}</span>
              </div>

              <Link href="/checkout" className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-lg hover:bg-emerald-700 transition">
                {t('checkout')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}