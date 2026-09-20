'use client';

import React, { useState, useMemo } from 'react';
import { useSales } from '@/domains/sales/hooks/useSales';
import { Plus, Search, Edit, Trash2, Printer } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// নতুন মাস্টার ইনভয়েস মডাল ইম্পোর্ট
import MasterInvoiceModal from '@/domains/invoice/components/MasterInvoiceModal';

export default function SalesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // ইনভয়েস মডালের জন্য সিলেক্টেড ইনভয়েস নম্বর স্টেট
  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState<string | null>(null);

  const salesHook = useSales({ search, page }) as any;
  const { sales, isLoading } = salesHook;
  const deleteSale = salesHook.deleteSale || salesHook.removeSale;

  // Safe Array Extractor for API response
  const rawSalesList = Array.isArray(sales)
    ? sales
    : Array.isArray(sales?.data)
    ? sales.data
    : Array.isArray(sales?.data?.data)
    ? sales.data.data
    : [];

  // Robust Client-side Search Filtering fallback
  const salesList = useMemo(() => {
    if (!search.trim()) return rawSalesList;
    const query = search.toLowerCase();
    return rawSalesList.filter((sale: any) => {
      const invoiceNo = (sale.invoice_no || '').toLowerCase();
      const customerName = (sale.customer?.name || '').toLowerCase();
      const customerPhone = (sale.customer?.phone || '').toLowerCase();
      return invoiceNo.includes(query) || customerName.includes(query) || customerPhone.includes(query);
    });
  }, [rawSalesList, search]);

  const handleEdit = (id: number | string) => {
    router.push(`/sales/${id}`);
  };

  const handleDelete = async (sale: any) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete invoice "${sale.invoice_no}"? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    try {
      if (deleteSale) {
        await deleteSale(sale.id);
      } else {
        alert('Delete API function is not configured in useSales hook.');
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || error?.message || 'Failed to delete sale');
    }
  };

  // ইনভয়েস ওপেন হ্যান্ডলার (invoice_no সেট করবে)
  const handleOpenMasterInvoice = (sale: any) => {
    const invNo = sale.invoice_no || sale.invoice_number;
    if (invNo) {
      setSelectedInvoiceNo(invNo);
    } else {
      alert('Invoice number not found for this sale.');
    }
  };

  // ---------------------------------------------------------------------------
  // Main Sales List View
  // ---------------------------------------------------------------------------
  return (
    <div className="p-6 space-y-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sales & Commercial Operations</h1>
          <p className="text-sm text-slate-400">Manage Commercial, Wholesale, Retail & Direct Enterprise Orders</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/sales/create"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>New Sale</span>
          </Link>
        </div>
      </div>

      {/* Filter Section */}
      <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search invoice number, customer name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Invoice</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Grand Total</th>
                <th className="px-6 py-4 text-right">Paid</th>
                <th className="px-6 py-4 text-right">Due</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                    Loading commercial transactions...
                  </td>
                </tr>
              ) : salesList.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-8 text-center text-slate-500">
                    No sales records found.
                  </td>
                </tr>
              ) : (
                salesList.map((sale: any) => (
                  <tr key={sale.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold">
                      <button
                        onClick={() => handleOpenMasterInvoice(sale)}
                        className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                        title="Click to view full Invoice"
                      >
                        {sale.invoice_no}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                        sale.sale_type === 'COMMERCIAL' ? 'bg-amber-950/60 border-amber-800 text-amber-400' :
                        sale.sale_type === 'WHOLESALE' ? 'bg-cyan-950/60 border-cyan-800 text-cyan-400' :
                        sale.sale_type === 'POS' ? 'bg-purple-950/60 border-purple-800 text-purple-400' :
                        'bg-blue-950/60 border-blue-800 text-blue-400'
                      }`}>
                        {sale.sale_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-200">{sale.customer?.name}</td>
                    <td className="px-6 py-4 text-slate-400">{sale.sale_date}</td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-100">৳{Number(sale.grand_total || sale.net_payable || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-emerald-400">৳{Number(sale.paid_amount || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-rose-400">৳{Number(sale.due_amount || sale.due || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2.5 py-1 text-[11px] font-semibold rounded-full ${
                        sale.payment_status === 'PAID' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        sale.payment_status === 'PARTIAL' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {sale.payment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleOpenMasterInvoice(sale)}
                        title="Print / View Invoice"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(sale.id)}
                        title="Edit Sale Record"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors cursor-pointer"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(sale)}
                        title="Delete Sale Record"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* মাস্টার ইনভয়েস মডাল */}
      <MasterInvoiceModal
        isOpen={!!selectedInvoiceNo}
        invoiceNo={selectedInvoiceNo}
        onClose={() => setSelectedInvoiceNo(null)}
      />
    </div>
  );
}