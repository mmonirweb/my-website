'use client';

import React from 'react';
import { Supplier } from '@/domains/purchase/types';

interface SupplierDetailsDrawerProps {
  supplier: Supplier | null;
  onClose: () => void;
}

export default function SupplierDetailsDrawer({ supplier, onClose }: SupplierDetailsDrawerProps) {
  if (!supplier) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-blue-600 dark:text-blue-400">
                {supplier.code}
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{supplier.name}</h2>
              <p className="text-xs text-slate-500">{supplier.company_name || 'No Associated Company'}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/50 transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Details Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="p-4 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20">
              <p className="text-xs font-bold text-blue-100 uppercase tracking-wider">Current Outstanding Balance</p>
              <h3 className="text-3xl font-black mt-1">৳{Number(supplier.current_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
              <div className="mt-3 pt-3 border-t border-white/20 flex justify-between text-xs text-blue-100">
                <span>Opening Balance:</span>
                <span className="font-bold">৳{Number(supplier.opening_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Contact Details</h4>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Phone:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{supplier.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{supplier.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tax / BIN:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{supplier.tax_number || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded-md text-[10px] ${
                      supplier.is_active
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                    }`}
                  >
                    {supplier.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Billing / Registered Address</h4>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                {supplier.address || 'No registered address available.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}