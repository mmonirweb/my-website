'use client';

import React, { useState } from 'react';
import { useSales } from '@/domains/sales/hooks/useSales';
import { Plus, Search, Eye, ShoppingBag, ShieldCheck, X } from 'lucide-react';
import Link from 'next/link';

export default function SalesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedAuditSale, setSelectedAuditSale] = useState<any | null>(null);
  
  const { sales, isLoading } = useSales({ search, page });

  // Laravel pagination / Direct array API response safe extractor
  const salesList = Array.isArray(sales)
    ? sales
    : Array.isArray(sales?.data)
    ? sales.data
    : Array.isArray(sales?.data?.data)
    ? sales.data.data
    : [];

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
                <th className="px-6 py-4 text-center">Audit & Actions</th>
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
                    <td className="px-6 py-4 font-mono font-semibold text-blue-400">{sale.invoice_no}</td>
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
                    <td className="px-6 py-4 text-right font-semibold text-slate-100">৳{Number(sale.grand_total).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-emerald-400">৳{Number(sale.paid_amount).toFixed(2)}</td>
                    <td className="px-6 py-4 text-right text-rose-400">৳{Number(sale.due_amount).toFixed(2)}</td>
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
                        onClick={() => setSelectedAuditSale(sale)}
                        title="View Enterprise Audit Trail"
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Enterprise Audit Trail Modal */}
      {selectedAuditSale && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
                <h3 className="font-bold text-slate-100 text-lg">Audit Trail Log — {selectedAuditSale.invoice_no}</h3>
              </div>
              <button onClick={() => setSelectedAuditSale(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-xs space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Action: <strong className="text-emerald-400">ORDER CREATED</strong></span>
                  <span>{new Date(selectedAuditSale.created_at).toLocaleString()}</span>
                </div>
                <p className="text-slate-300">Issued by User: <strong>{selectedAuditSale.created_by}</strong></p>
                <p className="text-slate-500 font-mono">Sale Type: {selectedAuditSale.sale_type} | Channel: Direct ERP Engine</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedAuditSale(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}