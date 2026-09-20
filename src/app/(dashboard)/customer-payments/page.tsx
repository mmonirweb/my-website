'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Eye, 
  Printer, 
  X, 
  Receipt,
  RefreshCw
} from 'lucide-react';
import { useCustomerPayments } from '@/domains/customer/hooks/useCustomerPayments';
import ReceivePaymentModal from '@/domains/customer/components/ReceivePaymentModal';

interface PaymentRecord {
  id: number;
  receipt_no: string;
  payment_date: string;
  customer_id: number;
  customer_name: string;
  customer_phone?: string;
  amount_paid: number;
  remaining_balance: number;
  payment_method: string;
  reference_no?: string;
  created_by?: string;
  notes?: string;
}

export default function CustomerPaymentsPage() {
  const { payments, customers, isLoading, refetch } = useCustomerPayments();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [activeReceipt, setActiveReceipt] = useState<PaymentRecord | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // ফিল্টারিং ও সার্চিং হিসাব (Safe Date Range Parsing)
  const filteredPayments = useMemo(() => {
    if (!Array.isArray(payments)) return [];

    return payments.filter((item: PaymentRecord) => {
      const matchesSearch = 
        !searchQuery ||
        item.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.receipt_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.customer_phone?.includes(searchQuery);

      const matchesMethod = methodFilter === 'ALL' || item.payment_method === methodFilter;

      if (!startDate && !endDate) {
        return matchesSearch && matchesMethod;
      }

      const itemTime = item.payment_date ? new Date(item.payment_date).getTime() : 0;
      const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
      const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;

      const matchesDateRange = 
        (!start || itemTime >= start) && 
        (!end || itemTime <= end);

      return matchesSearch && matchesMethod && matchesDateRange;
    });
  }, [payments, searchQuery, methodFilter, startDate, endDate]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 text-slate-800">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer Payment Ledger</h1>
            <p className="mt-1 text-sm text-slate-500">Track collections, manage receipts, and review payment audit logs</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              title="Refresh Data"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900 active:scale-95"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            <button
              onClick={() => {
                setSelectedCustomer(customers?.[0] || null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Collect New Payment
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by customer name, phone, or receipt no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none"
              >
                <option value="ALL">All Payment Methods</option>
                <option value="CASH">Cash</option>
                <option value="MOBILE_BANKING">Mobile Banking</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CARD">Card</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>

            <div className="flex gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-2.5 py-2 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Receipt No</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Amount Paid</th>
                  <th className="px-6 py-4">Remaining Due</th>
                  <th className="px-6 py-4">Method</th>
                  <th className="px-6 py-4">Collected By</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">Loading payment records...</td>
                  </tr>
                ) : filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400">No payment transactions found.</td>
                  </tr>
                ) : (
                  filteredPayments.map((payment: PaymentRecord) => (
                    <tr key={payment.id} className="transition-colors hover:bg-slate-50/60">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => setActiveReceipt(payment)}
                          className="font-mono text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          {payment.receipt_no}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">{payment.payment_date}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-slate-800">{payment.customer_name}</p>
                          <p className="text-xs text-slate-400">{payment.customer_phone}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-emerald-600">৳{payment.amount_paid.toFixed(2)}</td>
                      <td className="px-6 py-4 font-semibold text-rose-600">৳{payment.remaining_balance.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600 uppercase">
                          {payment.payment_method?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">{payment.created_by}</td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setActiveReceipt(payment)}
                          title="View Receipt"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Payment Modal Component */}
      <ReceivePaymentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          refetch();
        }}
        onSuccess={() => refetch()}
        customer={selectedCustomer}
      />

      {/* Receipt Viewer Modal */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800">Money Receipt Details</h3>
              </div>
              <button onClick={() => setActiveReceipt(null)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div id="printable-area" className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5 text-sm">
                <div className="text-center border-b border-slate-200 pb-3">
                  <h2 className="text-xl font-black text-slate-900 tracking-wider">OFFICIAL MONEY RECEIPT</h2>
                  <p className="text-xs text-slate-500 mt-1">Receipt No: {activeReceipt.receipt_no}</p>
                  <p className="text-xs text-slate-500">Date: {activeReceipt.payment_date}</p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer Name:</span>
                    <span className="font-semibold text-slate-800">{activeReceipt.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Method:</span>
                    <span className="font-semibold text-slate-800">{activeReceipt.payment_method}</span>
                  </div>
                  {activeReceipt.reference_no && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Reference / TrxID:</span>
                      <span className="font-semibold text-slate-800">{activeReceipt.reference_no}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Collected By:</span>
                    <span className="font-semibold text-slate-800">{activeReceipt.created_by}</span>
                  </div>
                </div>

                <div className="rounded-lg bg-indigo-50/70 p-3 space-y-1.5 border border-indigo-100">
                  <div className="flex justify-between text-xs text-indigo-900">
                    <span>Amount Received:</span>
                    <span className="font-bold text-emerald-600">৳{activeReceipt.amount_paid.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-indigo-200/60 pt-1 flex justify-between text-xs font-semibold text-indigo-900">
                    <span>Remaining Balance:</span>
                    <span>৳{activeReceipt.remaining_balance.toFixed(2)}</span>
                  </div>
                </div>

                {activeReceipt.notes && (
                  <div className="text-[11px] text-slate-500 italic">
                    Note: {activeReceipt.notes}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setActiveReceipt(null)}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-700"
                >
                  <Printer className="h-4 w-4" />
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}