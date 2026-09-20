'use client';

import React, { useState, useMemo } from 'react';
import { useSalesReturns } from '@/domains/sales/hooks/useSalesReturns';
import CreateSalesReturnModal from '@/domains/sales/components/CreateSalesReturnModal';
import MasterInvoiceModal from '@/domains/invoice/components/MasterInvoiceModal';
import { 
  Plus, Search, Printer, RotateCcw
} from 'lucide-react';

export interface ReturnItem {
  product_id: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface ExchangeItem {
  product_id: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export type ReturnActionType = 'REFUND' | 'DUE_ADJUSTMENT' | 'EXCHANGE';

export interface CreateSalesReturnPayload {
  sale_id?: number | null;
  customer_id: number;
  warehouse_id: number;
  return_date: string;
  action_type: ReturnActionType;
  payment_method: string;
  reason?: string;
  items: ReturnItem[];
  exchange_items?: ExchangeItem[];
  exchange_paid_amount?: number;
}

export interface SalesReturnRecord {
  id: number;
  return_no: string;
  customer?: {
    id: number;
    name: string;
    phone: string;
  };
  creator?: {
    id: number;
    name: string;
  };
  invoice?: {
    invoice_no: string;
  };
  master_invoice_no?: string;
  invoice_no?: string;
  total_return_amount: string | number;
  action_type: ReturnActionType;
  return_date: string;
  created_at: string;
}

export default function SalesReturnsPage() {
  const [search, setSearch] = useState<string>('');
  const [actionTypeFilter, setActionTypeFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Master Invoice Modal State
  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState<string | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);

  const { returns: fetchedReturns, isLoading, rawResponse } = useSalesReturns({ search });

  // ব্যাকএন্ড পেজিনেশন বা র রেসপন্স অবজেক্ট থেকে টাইপ-সেফভাবে অ্যারে এক্সট্র্যাক্ট করা
  const returns: SalesReturnRecord[] = useMemo(() => {
    if (Array.isArray(fetchedReturns)) return fetchedReturns;
    
    if (!rawResponse) return [];
    const response = rawResponse as Record<string, any>;

    if (Array.isArray(response)) return response;
    if (Array.isArray(response.returns)) return response.returns;
    if (Array.isArray(response.data)) return response.data;
    if (Array.isArray(response.sales_returns)) return response.sales_returns;
    if (Array.isArray(response.data?.data)) return response.data.data;
    
    return [];
  }, [fetchedReturns, rawResponse]);

  const filteredReturns = useMemo(() => {
    if (!returns || !Array.isArray(returns)) return [];
    
    return returns.filter((item: Record<string, any>) => {
      const q = search.toLowerCase().trim();
      
      const returnNo = (item?.return_no || '').toLowerCase();
      const invoiceNo = (
        item?.master_invoice_no || 
        item?.invoice_no || 
        item?.invoice_number || 
        item?.invoice?.invoice_no || 
        ''
      ).toLowerCase();
      
      const customerName = (item?.customer?.name || '').toLowerCase();
      const customerPhone = (item?.customer?.phone || '').toLowerCase();

      const matchesSearch = !q || 
        returnNo.includes(q) || 
        invoiceNo.includes(q) || 
        customerName.includes(q) || 
        customerPhone.includes(q);

      const matchesAction = actionTypeFilter === 'ALL' || item?.action_type === actionTypeFilter;

      let matchesDate = true;
      if (startDate && item?.return_date) {
        matchesDate = matchesDate && new Date(item.return_date) >= new Date(startDate);
      }
      if (endDate && item?.return_date) {
        matchesDate = matchesDate && new Date(item.return_date) <= new Date(endDate);
      }

      return matchesSearch && matchesAction && matchesDate;
    });
  }, [returns, search, actionTypeFilter, startDate, endDate]);

  const handleOpenInvoice = (invoiceNo: string) => {
    if (!invoiceNo) {
      alert('Invoice number not found for this return.');
      return;
    }
    setSelectedInvoiceNo(invoiceNo);
    setIsInvoiceModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <RotateCcw className="w-6 h-6 text-indigo-500" /> Sales Returns & Adjustments
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage product returns, due balance adjustments, and customer exchanges</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition"
        >
          <Plus className="w-4 h-4" /> Process Return
        </button>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search return no, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={actionTypeFilter}
          onChange={(e) => setActionTypeFilter(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="ALL">All Action Types</option>
          <option value="DUE_ADJUSTMENT">Due Adjustment</option>
          <option value="REFUND">Refund</option>
          <option value="EXCHANGE">Exchange</option>
        </select>

        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />

        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
      </div>

      {/* Table Section */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading returns...</div>
        ) : filteredReturns.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No return records found.</div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800 uppercase font-semibold">
              <tr>
                <th className="p-3.5">Return No</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Action Type</th>
                <th className="p-3.5 text-right">Return Amount</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5 text-center">Invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredReturns.map((item: Record<string, any>) => {
                const targetInvoiceNo = 
                  item?.master_invoice_no || 
                  item?.invoice_no || 
                  item?.invoice_number || 
                  item?.invoice?.invoice_no || 
                  item?.return_no;

                return (
                  <tr key={item.id} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5 font-bold text-slate-200">{item.return_no}</td>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-200">{item.customer?.name || 'Walk-in'}</p>
                      <p className="text-[11px] text-slate-400">{item.customer?.phone || 'N/A'}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {item.action_type}
                      </span>
                    </td>
                    <td className="p-3.5 text-right font-bold text-emerald-400">
                      ৳{Number(item.total_return_amount || 0).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-slate-400">{item.return_date || 'N/A'}</td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => handleOpenInvoice(targetInvoiceNo)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-lg transition"
                        title="View Commercial Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Sales Return Modal */}
      <CreateSalesReturnModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(masterInvoiceNo) => {
          if (masterInvoiceNo) {
            handleOpenInvoice(masterInvoiceNo);
          }
        }}
      />

      {/* Master Invoice Preview Modal */}
      <MasterInvoiceModal
        isOpen={isInvoiceModalOpen}
        invoiceNo={selectedInvoiceNo}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          setSelectedInvoiceNo(null);
        }}
      />

    </div>
  );
}