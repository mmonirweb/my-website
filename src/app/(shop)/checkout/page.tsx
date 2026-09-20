'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { apiClient } from '@/lib/axios';
import { ShieldCheck, Truck, CreditCard, ShoppingBag, ArrowRight, Loader2, Plus, Minus, Trash2 } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const subtotal = cart.reduce((acc: number, item: any) => {
    const price = Number(item?.special_price ?? item?.selling_price ?? item?.price ?? 0);
    return acc + price * (item?.quantity || 1);
  }, 0);

  const shippingFee = subtotal > 0 ? 60 : 0;
  const total = subtotal + shippingFee;

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setError('আপনার কার্ট খালি রয়েছে!');
      return;
    }
    if (!formData.name || !formData.phone || !formData.address) {
      setError('দয়া করে নাম, ফোন নম্বর এবং ঠিকানা পূরণ করুন।');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        customer_name: formData.name,
        phone: formData.phone,
        shipping_address: formData.address,
        notes: formData.notes,
        items: cart.map((item: any) => ({
          product_id: item?.id,
          quantity: item?.quantity,
          price: Number(item?.special_price ?? item?.selling_price ?? item?.price ?? 0),
        })),
        total_amount: total,
      };

      await apiClient.post('/ecommerce/orders', orderPayload);
      
      clearCart();
      router.push('/checkout/success');
    } catch (err: any) {
      console.error('Order failed:', err);
      setError(err.response?.data?.message || 'অর্ডার করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 bg-slate-50">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl border border-slate-100 shadow-xl text-center space-y-4">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">আপনার কার্ট খালি!</h2>
          <p className="text-sm text-slate-500">চেকআউট করার আগে শপ থেকে কিছু পণ্য কার্টে যোগ করুন।</p>
          <button
            onClick={() => router.push('/shop')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md cursor-pointer"
          >
            শপিং এ ফিরে যান
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Secure Checkout</h1>
          <p className="text-sm text-slate-500 mt-1">Complete your order by providing your shipping details below.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-2xl font-medium max-w-6xl mx-auto text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Billing & Shipping Details */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Truck className="w-5 h-5 text-emerald-600" />
                Shipping Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required 
                    placeholder="আপনার পুরো নাম" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required 
                    placeholder="017XXXXXXXX" 
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Delivery Address *</label>
                <textarea 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required 
                  rows={3}
                  placeholder="বাসার নাম্বার, রোড নাম্বার, এলাকা, থানা ও জেলা" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Order Notes (Optional)</label>
                <input 
                  type="text"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন" 
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Payment Method
              </h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/30 cursor-pointer">
                  <input type="radio" name="payment" defaultChecked className="text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                  <div>
                    <span className="block text-sm font-bold text-slate-900">Cash on Delivery (COD)</span>
                    <span className="text-xs text-slate-500">Pay with cash upon delivery.</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Right: Order Summary & Cart Items */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6 sticky top-6">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                Order Summary ({cart.length} items)
              </h2>

              {/* Cart Items List */}
              <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                {cart.map((item: any) => {
                  const itemPrice = Number(item?.special_price ?? item?.selling_price ?? item?.price ?? 0);
                  const itemImage = item?.main_image || item?.featured_image || item?.image || 'https://placehold.co/100x100/e2e8f0/64748b?text=No+Image';

                  return (
                    <div key={item?.id} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50/50 border border-slate-100">
                      <img 
                        src={itemImage} 
                        alt={item?.name || 'Product'} 
                        className="w-14 h-14 object-cover rounded-lg border border-slate-200 shrink-0 bg-white" 
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{item?.name}</h4>
                        <p className="text-xs text-emerald-600 font-semibold mt-0.5">৳{itemPrice.toFixed(2)}</p>
                        
                        {/* Quantity Controls inside Checkout */}
                        <div className="flex items-center gap-2 mt-2">
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item?.id, item?.quantity - 1)}
                            className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 px-1">{item?.quantity}</span>
                          <button 
                            type="button"
                            onClick={() => updateQuantity(item?.id, item?.quantity + 1)}
                            className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end justify-between h-full">
                        <button 
                          type="button"
                          onClick={() => removeFromCart(item?.id)}
                          className="text-slate-400 hover:text-rose-500 transition mb-2 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-sm text-slate-900">৳{(itemPrice * (item?.quantity || 1)).toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold">৳{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping Fee</span>
                  <span className="font-semibold">৳{shippingFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-100">
                  <span>Total</span>
                  <span className="text-emerald-600">৳{total.toFixed(2)}</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Order...</span>
                  </>
                ) : (
                  <>
                    <span>Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>100% Safe & Secure Checkout</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}