'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSuppliers, useDeleteSupplier } from '@/domains/purchase/hooks/useSuppliers';
import CreateSupplierModal from '@/domains/purchase/components/CreateSupplierModal';
import SupplierDetailsDrawer from './SupplierDetailsDrawer';
import { Supplier } from '@/domains/purchase/types';

export default function SuppliersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const { data: response, isLoading, isFetching } = useSuppliers({
    search,
    is_active: statusFilter,
    page,
    per_page: 10,
  });

  const deleteSupplier = useDeleteSupplier();
  const suppliers = response?.data || [];
  const meta = response?.meta;
  const stats = response?.stats;

  const handleEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      deleteSupplier.mutate(id);
    }
  };

  const handleCreateNew = () => {
    setEditingSupplier(null);
    setIsModalOpen(true);
  };

  const handlePrintSuppliers = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!suppliers.length) return;

    const headers = ['Code', 'Name', 'Company', 'Phone', 'Email', 'Status', 'Current Balance'];
    const rows = suppliers.map((sup) => [
      sup.code,
      sup.name,
      sup.company_name || '',
      sup.phone,
      sup.email || '',
      sup.is_active ? 'Active' : 'Inactive',
      sup.current_balance.toString(),
    ]);

    const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
    const csvContent =
      '\uFEFF' +
      [headers.map(escapeCsv).join(','), ...rows.map((row) => row.map(escapeCsv).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Suppliers_List_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }
          body {
            background: #fff !important;
            color: #000 !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          table {
            width: 100% !important;
          }
        }
      `}</style>

      <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen">
        {/* Page Title & Main Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Suppliers & Vendors
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
              Manage your global procurement accounts, payables, and contact parameters.
            </p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-3 text-xs font-bold hover:bg-emerald-100 transition-all cursor-pointer"
            >
              📊 Export CSV
            </button>
            <button
              onClick={handlePrintSuppliers}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-800 text-white px-4 py-3 text-xs font-bold hover:bg-slate-900 transition-all cursor-pointer"
            >
              🖨️ Print
            </button>
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-extrabold text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02]"
            >
              <span className="text-base">+</span> Add Supplier
            </button>
          </div>
        </div>

        {/* KPI Stats Analytics Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 text-xl font-bold">
              🏢
            </div>
            <div>
              <p className="text-[10px] font-black tracking-wider uppercase text-slate-400">Total Suppliers</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {stats?.total_suppliers ?? 0}
              </h3>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 text-xl font-bold">
              ✅
            </div>
            <div>
              <p className="text-[10px] font-black tracking-wider uppercase text-slate-400">Active Accounts</p>
              <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {stats?.active_suppliers ?? 0}
              </h3>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-rose-600 text-xl font-bold">
              ৳
            </div>
            <div>
              <p className="text-[10px] font-black tracking-wider uppercase text-slate-400">Total Outstanding Payable</p>
              <h3 className="text-xl font-black text-rose-600 mt-0.5">
                ৳{Number(stats?.total_payable || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
        </div>

        {/* Control Bar (Search & Filters) */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center print:hidden">
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              placeholder="Search code, name, phone, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <span className="absolute left-3.5 top-2.5 text-slate-400 text-xs">🔍</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
            >
              <option value="">All Statuses</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>

        {/* Main Suppliers Data Table */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm relative">
          {isFetching && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-100 overflow-hidden z-20 print:hidden">
              <div className="w-full h-full bg-blue-600 animate-pulse" />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-extrabold uppercase tracking-wider">
                  <th className="p-4 pl-6">Supplier</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Balance</th>
                  <th className="p-4 pr-6 text-center print:hidden">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="p-4 pl-6"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-28" /></td>
                      <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" /></td>
                      <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" /></td>
                      <td className="p-4"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" /></td>
                      <td className="p-4 text-right"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20 ml-auto" /></td>
                      <td className="p-4 pr-6 print:hidden"><div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24 mx-auto" /></td>
                    </tr>
                  ))
                ) : suppliers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-slate-400 font-bold">
                      No suppliers found. Try adjusting your search query or filters.
                    </td>
                  </tr>
                ) : (
                  suppliers.map((sup) => (
                    <tr key={sup.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-4 pl-6">
                        <div className="flex flex-col">
                          <span className="font-mono text-[10px] font-black text-blue-600 dark:text-blue-400">
                            {sup.code}
                          </span>
                          <span
                            onClick={() => setSelectedSupplier(sup)}
                            className="font-bold text-slate-900 dark:text-white cursor-pointer hover:underline text-sm"
                          >
                            {sup.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">
                        {sup.company_name || '—'}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="text-slate-900 dark:text-white font-bold">{sup.phone}</span>
                          <span className="text-[10px] text-slate-400">{sup.email || 'No email'}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black tracking-wider uppercase ${
                            sup.is_active
                              ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                          }`}
                        >
                          {sup.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        ৳{Number(sup.current_balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-4 pr-6 text-center print:hidden">
                        <div className="inline-flex items-center gap-2">
                          <Link
                            href={`/suppliers/${sup.id}/ledger`}
                            title="View Full Ledger"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                          >
                            📜
                          </Link>
                          <button
                            onClick={() => setSelectedSupplier(sup)}
                            title="View Details"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleEdit(sup)}
                            title="Edit Supplier"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-amber-50 hover:text-amber-600 transition-colors"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDelete(sup.id)}
                            title="Delete Supplier"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Server Pagination */}
          {meta && meta.last_page > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500 print:hidden">
              <span>
                Showing Page {meta.current_page} of {meta.last_page} ({meta.total} Suppliers)
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={meta.current_page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Previous
                </button>
                <button
                  disabled={meta.current_page === meta.last_page}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal & Drawer Components */}
        <CreateSupplierModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          supplierToEdit={editingSupplier}
        />

        <SupplierDetailsDrawer
          supplier={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      </div>
    </>
  );
}