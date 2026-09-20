'use client';

import React, { useState } from 'react';
import { useOrders } from '@/domains/ecommerce/hooks/useOrders';
import { 
  ShoppingBag, 
  Eye, 
  Truck, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Search, 
  Filter, 
  PackageCheck, 
  RefreshCw, 
  Calendar,
  Printer,
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import Link from 'next/link';

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  
  const { data, isLoading, updateStatus, bulkUpdateStatus, isBulkUpdating } = useOrders({ search, status });

  const responseData = data as any;
  const orders = Array.isArray(responseData) 
    ? responseData 
    : Array.isArray(responseData?.data) 
    ? responseData.data 
    : Array.isArray(responseData?.orders) 
    ? responseData.orders 
    : Array.isArray(responseData?.data?.data) 
    ? responseData.data.data 
    : [];

  // সিলেকশন হ্যান্ডলার
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(orders.map((o: any) => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectOrder = (id: number) => {
    if (selectedOrderIds.includes(id)) {
      setSelectedOrderIds(selectedOrderIds.filter(item => item !== id));
    } else {
      setSelectedOrderIds([...selectedOrderIds, id]);
    }
  };

  // এক ক্লিকে বাল্ক স্ট্যাটাস আপডেট
  const handleBulkAction = async (targetStatus: string) => {
    if (selectedOrderIds.length === 0) {
      alert('দয়া করে অন্তত একটি অর্ডার সিলেক্ট করুন!');
      return;
    }
    try {
      await bulkUpdateStatus({ orderIds: selectedOrderIds, status: targetStatus });
      setSelectedOrderIds([]);
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  // এক ক্লিকে নতুন পেন্ডিং অর্ডারগুলোর ইনভয়েস প্রিন্ট করার ফাংশন
  const handlePrintInvoices = () => {
    // শুধুমাত্র সিলেক্টকৃত অথবা ফিল্টার করা পেন্ডিং অর্ডারগুলোর ইনভয়েস উইন্ডো ওপেন করবে
    const printWindow = window.open('', '_print_window', 'height=800,width=1000');
    if (!printWindow) return;

    const targetOrders = orders.filter((o: any) => selectedOrderIds.includes(o.id) || o.status === 'pending');

    let htmlContent = `
      <html>
        <head>
          <title>Bulk Invoices</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #333; }
            .invoice-box { page-break-after: always; border: 1px solid #ddd; padding: 30px; margin-bottom: 20px; border-radius: 8px; }
            h2 { margin: 0 0 10px 0; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 13px; text-align: left; }
            th { background: #f8fafc; }
            .text-right { text-align: right; }
          </style>
        </head>
        <body>
    `;

    targetOrders.forEach((order: any) => {
      htmlContent += `
        <div class="invoice-box">
          <h2>Invoice #${order.order_number}</h2>
          <p><strong>Customer:</strong> ${order.customer_name} | <strong>Phone:</strong> ${order.phone}</p>
          <p><strong>Address:</strong> ${order.shipping_address}</p>
          <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
      `;
      order.items?.forEach((item: any) => {
        htmlContent += `
          <tr>
            <td>${item.product?.name || 'Product'}</td>
            <td>${item.quantity}</td>
            <td>৳${item.price}</td>
            <td class="text-right">৳${item.quantity * item.price}</td>
          </tr>
        `;
      });
      htmlContent += `
            </tbody>
          </table>
          <h3 class="text-right" style="margin-top: 15px;">Total Amount: ৳${order.total_amount}</h3>
        </div>
      `;
    });

    htmlContent += `
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const getStatusBadge = (currentStatus: string) => {
    switch (currentStatus) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500 border border-amber-500/25">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/25">
            <ShoppingBag className="w-3.5 h-3.5" /> Processing
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/10 text-purple-500 border border-purple-500/25">
            <Truck className="w-3.5 h-3.5" /> Shipped
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-500 border border-rose-500/25">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-600 border border-orange-500/25">
            <RotateCcw className="w-3.5 h-3.5" /> Returned
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <PackageCheck className="w-7 h-7 text-blue-600" />
            Enterprise E-commerce Orders
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage multi-company/branch orders, inventory reserves, bulk processing, and batch invoice printing.
          </p>
        </div>

        {/* Bulk Action Top Bar Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={handlePrintInvoices}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition shadow-xs"
          >
            <Printer className="w-4 h-4" /> Print Invoices ({selectedOrderIds.length || 'All Pending'})
          </button>

          <button 
            onClick={() => handleBulkAction('processing')}
            disabled={isBulkUpdating || selectedOrderIds.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50 shadow-xs"
          >
            <ArrowRight className="w-4 h-4" /> Process Selected
          </button>

          <button 
            onClick={() => handleBulkAction('shipped')}
            disabled={isBulkUpdating || selectedOrderIds.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition disabled:opacity-50 shadow-xs"
          >
            <Truck className="w-4 h-4" /> Ship Selected
          </button>

          <button 
            onClick={() => handleBulkAction('delivered')}
            disabled={isBulkUpdating || selectedOrderIds.length === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition disabled:opacity-50 shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" /> Deliver Selected
          </button>

          <button 
            onClick={() => handleBulkAction('returned')}
            disabled={isBulkUpdating || selectedOrderIds.length === 0}
            title="Return or Cancel undelivered shipments"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition disabled:opacity-50 shadow-xs"
          >
            <RotateCcw className="w-4 h-4" /> Return / Cancel
          </button>
        </div>
      </div>

      {/* Advanced Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by Invoice Number, Customer Name or Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-52">
            <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent bg-white cursor-pointer appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                <th className="p-4.5 w-10 text-center">
                  <input 
                    type="checkbox" 
                    onChange={handleSelectAll}
                    checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                  />
                </th>
                <th className="p-4.5">Invoice / Order ID</th>
                <th className="p-4.5">Customer Info</th>
                <th className="p-4.5">Total Amount</th>
                <th className="p-4.5">Order Status</th>
                <th className="p-4.5">Order Date</th>
                <th className="p-4.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs font-bold text-slate-500">Loading enterprise orders...</span>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <ShoppingBag className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-bold text-slate-600">No orders found</p>
                      <p className="text-xs text-slate-400">Try adjusting your invoice search criteria or filter options.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-4.5 text-center">
                      <input 
                        type="checkbox" 
                        checked={selectedOrderIds.includes(order.id)}
                        onChange={() => handleSelectOrder(order.id)}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                      />
                    </td>
                    <td className="p-4.5 font-bold text-slate-900">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-mono">
                        #{order.order_number}
                      </span>
                    </td>
                    <td className="p-4.5">
                      <div className="font-bold text-slate-900">{order.customer_name}</div>
                      <div className="text-xs text-slate-500 font-normal mt-0.5">{order.phone}</div>
                    </td>
                    <td className="p-4.5 font-extrabold text-emerald-600">
                      ৳{Number(order.total_amount).toLocaleString('en-BD', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4.5">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        <select 
                          value={order.status}
                          onChange={(e) => updateStatus({ id: order.id, status: e.target.value })}
                          className="text-xs font-bold px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer transition hover:bg-slate-100"
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="returned">Returned</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4.5 text-xs text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(order.created_at).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="p-4.5 text-right">
                      <Link 
                        href={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 text-blue-600 font-bold text-xs hover:bg-blue-600 hover:text-white transition-all duration-200 shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" /> Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}