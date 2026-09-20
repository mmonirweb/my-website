'use client';

import React, { useState } from 'react';
import { useCustomerPayments } from '../hooks/useCustomerPayments';
import ReceivePaymentModal from './ReceivePaymentModal';
import { Plus, RotateCcw, Search } from 'lucide-react';

export default function CustomerPaymentLedger() {
  const [search, setSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { payments = [], isLoading } = useCustomerPayments({
    search,
    payment_method: paymentMethod,
  });

  return (
    <div className="p-6 space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customer Payment Ledger</h1>
          <p className="text-xs text-slate-500">Track collections, manage receipts, and review payment audit logs</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all"
          >
            <Plus className="h-4 w-4" />
            Collect New Payment
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer name, phone, or receipt no..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-indigo-500"
          />
        </div>
        <select
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          className="border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-indigo-500"
        >
          <option value="ALL">All Payment Methods</option>
          <option value="CASH">Cash</option>
          <option value="MOBILE_BANKING">Mobile Banking</option>
          <option value="BANK_TRANSFER">Bank Transfer</option>
          <option value="CARD">Card</option>
          <option value="CHEQUE">Cheque</option>
        </select>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="p-4">RECEIPT NO</th>
              <th className="p-4">DATE</th>
              <th className="p-4">CUSTOMER</th>
              <th className="p-4">AMOUNT PAID</th>
              <th className="p-4">REMAINING DUE</th>
              <th className="p-4">METHOD</th>
              <th className="p-4">COLLECTED BY</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-slate-400">Loading payment ledger...</td>
              </tr>
            ) : payments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-slate-400">No payment transactions found.</td>
              </tr>
            ) : (
              payments.map((item: any) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-bold text-indigo-600">{item.receipt_no || item.payment_no}</td>
                  <td className="p-4">{item.payment_date}</td>
                  <td className="p-4">
                    <p className="font-semibold text-slate-800">{item.customer_name}</p>
                    <p className="text-[10px] text-slate-400">{item.customer_phone}</p>
                  </td>
                  <td className="p-4 font-bold text-emerald-600">৳ {Number(item.amount_paid).toFixed(2)}</td>
                  <td className="p-4 font-semibold text-rose-600">৳ {Number(item.remaining_balance).toFixed(2)}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {item.payment_method}
                    </span>
                  </td>
                  <td className="p-4">{item.created_by}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ReceivePaymentModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}