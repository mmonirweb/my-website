'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/domains/ecommerce/services/orderService';
import { ArrowLeft, User, Phone, MapPin, Package, ShoppingBag, Printer } from 'lucide-react';

export default function AdminOrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order-details', id],
    queryFn: () => orderService.getOrderDetails(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="p-12 text-center text-slate-400">Loading order details...</div>;
  }

  if (!order) {
    return <div className="p-12 text-center text-rose-500">Order not found.</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-slate-900 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>

        <button 
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-xl shadow-md cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print Invoice
        </button>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-xs space-y-8">
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-100 pb-6 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Order #{order.order_number}</h1>
            <p className="text-xs text-slate-500 mt-1">Placed on {new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 uppercase">
              Status: {order.status}
            </span>
          </div>
        </div>

        {/* Customer & Shipping Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Information</h3>
            <div className="flex items-center gap-2.5 text-sm text-slate-800 font-semibold">
              <User className="w-4 h-4 text-emerald-600" /> {order.customer_name}
            </div>
            <div className="flex items-center gap-2.5 text-sm text-slate-600">
              <Phone className="w-4 h-4 text-emerald-600" /> {order.phone}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Shipping Address</h3>
            <div className="flex items-start gap-2.5 text-sm text-slate-700">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" /> 
              <span>{order.shipping_address}</span>
            </div>
            {order.notes && (
              <p className="text-xs text-slate-500 italic">Notes: {order.notes}</p>
            )}
          </div>
        </div>

        {/* Ordered Items Table */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" /> Order Items
          </h3>

          <div className="border border-slate-100 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-600 uppercase">
                  <th className="p-4">Product</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Quantity</th>
                  <th className="p-4 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="p-4 font-semibold text-slate-800">
                      {item.product?.name || 'Product Item'}
                    </td>
                    <td className="p-4 text-slate-600">৳{Number(item.price).toFixed(2)}</td>
                    <td className="p-4 text-slate-600">{item.quantity}</td>
                    <td className="p-4 text-right font-bold text-slate-900">
                      ৳{(Number(item.price) * item.quantity).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Totals */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <div className="w-full sm:w-80 space-y-2 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span className="font-semibold">৳{Number(order.shipping_fee).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-extrabold text-slate-900 pt-2 border-t border-slate-100">
              <span>Total Amount</span>
              <span className="text-emerald-600">৳{Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}