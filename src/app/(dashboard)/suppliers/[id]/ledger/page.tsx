'use client';

import React, { useState, use, useMemo } from 'react';
import Link from 'next/link';
import { useSupplierLedger } from '@/domains/purchase/hooks/useSupplierLedger';

interface SupplierLedgerPageProps {
  params: Promise<{ id: string }>;
}

const formatDate = (dateString?: string): string => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }).format(date);
};

const formatCurrency = (amount: number | string = 0): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(numericAmount)
    .replace('BDT', '৳');
};

export default function SupplierLedgerPage({ params }: SupplierLedgerPageProps) {
  const resolvedParams = use(params);
  const supplierId = useMemo(() => Number(resolvedParams?.id), [resolvedParams?.id]);

  // Filter & Control States
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage] = useState(20);

  // API Fetching
  const { data: response, isLoading, isFetching } = useSupplierLedger(supplierId, {
    search: searchTerm.trim() || undefined,
    start_date: startDate || undefined,
    end_date: endDate || undefined,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    page,
    per_page: perPage,
  });

  const supplier = response?.supplier;
  const summary = response?.summary;
  const ledgers = useMemo(() => response?.data || [], [response?.data]);
  const meta = response?.meta;

  const openingBalance = useMemo(
    () => Number(summary?.calculated_opening_balance ?? supplier?.opening_balance ?? 0),
    [summary?.calculated_opening_balance, supplier?.opening_balance]
  );

  const handlePrint = () => {
    window.print();
  };

  // Secure CSV Export Standard
  const handleExportCSV = () => {
    if (!ledgers.length) return;

    const headers = [
      'Date',
      'Voucher No',
      'Type',
      'Description',
      'Debit (Paid)',
      'Credit (Bill)',
      'Balance',
    ];

    const rows: string[][] = [];

    ledgers.forEach((item) => {
      rows.push([
        formatDate(item.date),
        item.voucher_no || '',
        item.type || '',
        item.description || '',
        (item.debit || 0).toString(),
        (item.credit || 0).toString(),
        (item.balance || 0).toString(),
      ]);
    });

    const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
    const csvContent =
      '\uFEFF' +
      [headers.map(escapeCsv).join(','), ...rows.map((row) => row.map(escapeCsv).join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Ledger_${(supplier?.name || 'Supplier').replace(/[^a-zA-Z0-9]/g, '_')}_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setTypeFilter('all');
    setPage(1);
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'purchase':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-900';
      case 'payment':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900';
      case 'purchase_return':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900';
      case 'opening_balance':
        return 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200 dark:border-purple-900';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          body {
            background: #fff !important;
            color: #000 !important;
            padding: 0 !important;
            margin: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          nav,
          aside,
          header,
          footer,
          .print\\:hidden {
            display: none !important;
          }
          .printable-area {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            max-width: 100% !important;
          }
          table {
            page-break-inside: auto;
            width: 100% !important;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>

      <div className="printable-area p-4 sm:p-6 lg:p-8 space-y-6 w-full mx-auto min-h-screen text-slate-800 dark:text-slate-100">
        {/* Screen Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <Link
              href="/suppliers"
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              ← Back
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
                  {supplier?.code || '—'}
                </span>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {supplier?.name || 'Supplier Ledger'}
                </h1>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {supplier?.company_name ? `${supplier.company_name} • ` : ''}Phone:{' '}
                {supplier?.phone || '—'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleExportCSV}
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-4 py-2.5 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-all shadow-sm cursor-pointer"
            >
              📊 Export CSV
            </button>
            <button
              onClick={handlePrint}
              type="button"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-5 py-2.5 text-xs font-extrabold shadow-md hover:bg-slate-800 dark:hover:bg-slate-100 transition-all cursor-pointer"
            >
              🖨️ Print Statement
            </button>
          </div>
        </div>

        {/* Printable Header */}
        <div className="hidden print:block text-left border-b-2 border-slate-800 pb-4 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
                Supplier Statement
              </h1>
              <h2 className="text-lg font-bold text-slate-800 mt-1">{supplier?.name}</h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {supplier?.company_name && `${supplier.company_name} | `}Code: {supplier?.code} |
                Phone: {supplier?.phone}
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Statement Date:</p>
              <p>{formatDate(new Date().toISOString())}</p>
              {startDate && endDate && (
                <p className="mt-1 font-medium text-slate-600">
                  Period: {startDate} to {endDate}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
          <div className="p-5 print:p-3 rounded-3xl print:rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 print:border-slate-300 shadow-sm">
            <p className="text-[10px] font-black tracking-wider uppercase text-slate-400 print:text-slate-600">
              Opening Balance
            </p>
            <h3 className="text-2xl print:text-base font-black text-slate-700 dark:text-slate-200 print:text-slate-900 mt-1">
              {formatCurrency(openingBalance)}
            </h3>
            <p className="text-[10px] text-slate-400 print:text-slate-500 mt-1 font-medium">
              Initial Setup Balance
            </p>
          </div>

          <div className="p-5 print:p-3 rounded-3xl print:rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 print:border-slate-300 shadow-sm">
            <p className="text-[10px] font-black tracking-wider uppercase text-slate-400 print:text-slate-600">
              Filtered Purchases (Credit)
            </p>
            <h3 className="text-2xl print:text-base font-black text-slate-900 dark:text-white print:text-slate-900 mt-1">
              {formatCurrency(summary?.total_credit)}
            </h3>
            <p className="text-[10px] text-slate-400 print:text-slate-500 mt-1 font-medium">
              Total Billed Amount
            </p>
          </div>

          <div className="p-5 print:p-3 rounded-3xl print:rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 print:border-slate-300 shadow-sm">
            <p className="text-[10px] font-black tracking-wider uppercase text-slate-400 print:text-slate-600">
              Filtered Paid (Debit)
            </p>
            <h3 className="text-2xl print:text-base font-black text-emerald-600 dark:text-emerald-400 print:text-slate-900 mt-1">
              {formatCurrency(summary?.total_debit)}
            </h3>
            <p className="text-[10px] text-slate-400 print:text-slate-500 mt-1 font-medium">
              Total Cleared Amount
            </p>
          </div>

          <div className="p-5 print:p-3 rounded-3xl print:rounded-xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 print:border-slate-300 shadow-sm border-l-4 border-l-rose-500 print:border-l-slate-800">
            <p className="text-[10px] font-black tracking-wider uppercase text-slate-400 print:text-slate-600">
              Current Net Balance
            </p>
            <h3 className="text-2xl print:text-base font-black text-rose-600 dark:text-rose-400 print:text-slate-900 mt-1">
              {formatCurrency(supplier?.current_balance)}
            </h3>
            <p className="text-[10px] text-slate-400 print:text-slate-500 mt-1 font-medium">
              Total Current Outstanding Due
            </p>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-3 print:hidden">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search by Voucher No or Description..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-4 pr-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              />
              <span className="text-xs text-slate-400 font-bold">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
              />

              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="purchase">Purchase</option>
                <option value="payment">Payment</option>
                <option value="purchase_return">Purchase Return</option>
                <option value="opening_balance">Opening Balance</option>
              </select>

              {(startDate || endDate || typeFilter !== 'all' || searchTerm) && (
                <button
                  onClick={handleResetFilters}
                  type="button"
                  className="px-3.5 py-2 rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900 text-xs font-extrabold hover:bg-rose-100 transition-all cursor-pointer"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Data Table Container */}
        <div className="rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm relative print:border-none print:shadow-none">
          {isFetching && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-100 overflow-hidden z-20 print:hidden">
              <div className="w-full h-full bg-blue-600 animate-pulse" />
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs print:text-[10px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-400 font-extrabold uppercase tracking-wider print:bg-slate-100 print:text-slate-900">
                  <th className="py-3.5 px-3 pl-6 w-32 whitespace-nowrap print:p-1.5">Date</th>
                  <th className="py-3.5 px-3 w-36 whitespace-nowrap print:p-1.5">Voucher No</th>
                  <th className="py-3.5 px-3 w-36 whitespace-nowrap print:p-1.5">Type</th>
                  <th className="py-3.5 px-3 print:p-1.5">Description</th>
                  <th className="py-3.5 px-3 text-right w-36 whitespace-nowrap print:p-1.5">Debit (Paid)</th>
                  <th className="py-3.5 px-3 text-right w-36 whitespace-nowrap print:p-1.5">Credit (Bill)</th>
                  <th className="py-3.5 px-3 pr-6 text-right w-40 whitespace-nowrap print:p-1.5">Balance</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 print:divide-slate-300 font-medium">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-3.5 px-3 pl-6">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-24" />
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16" />
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-36" />
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto" />
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 ml-auto" />
                      </td>
                      <td className="py-3.5 px-3 pr-6 text-right">
                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20 ml-auto" />
                      </td>
                    </tr>
                  ))
                ) : ledgers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-slate-400 font-bold">
                      No ledger transactions found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  ledgers.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors print:hover:bg-transparent"
                    >
                      <td className="py-3.5 px-3 pl-6 font-semibold whitespace-nowrap print:p-1.5">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-3.5 px-3 font-mono font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap print:text-slate-900 print:p-1.5">
                        {item.voucher_no || '—'}
                      </td>
                      <td className="py-3.5 px-3 whitespace-nowrap print:p-1.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${getTypeBadge(
                            item.type
                          )}`}
                        >
                          {item.type ? item.type.replace('_', ' ') : '—'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300 print:text-slate-800 print:p-1.5">
                        {item.description || '—'}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-emerald-600 whitespace-nowrap print:text-slate-900 print:p-1.5">
                        {Number(item.debit) > 0 ? formatCurrency(item.debit) : '—'}
                      </td>
                      <td className="py-3.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap print:text-slate-900 print:p-1.5">
                        {Number(item.credit) > 0 ? formatCurrency(item.credit) : '—'}
                      </td>
                      <td className="py-3.5 px-3 pr-6 text-right font-mono font-black text-slate-900 dark:text-white whitespace-nowrap print:text-slate-900 print:p-1.5">
                        {formatCurrency(item.balance)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Container */}
          {meta && meta.last_page > 1 && (
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-500 print:hidden">
              <span>
                Showing Page {meta.current_page} of {meta.last_page}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={meta.current_page === 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  type="button"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={meta.current_page === meta.last_page}
                  onClick={() => setPage((prev) => prev + 1)}
                  type="button"
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Printable Footer Signatures */}
        <div className="hidden print:flex justify-between items-end mt-16 pt-8 border-t border-slate-400 text-xs font-semibold text-slate-800">
          <div className="text-center">
            <div className="border-t border-slate-400 w-40 mb-1" />
            <p>Prepared By</p>
          </div>
          <div className="text-center">
            <div className="border-t border-slate-400 w-40 mb-1" />
            <p>Supplier Signature</p>
          </div>
          <div className="text-center">
            <div className="border-t border-slate-400 w-40 mb-1" />
            <p>Authorized Signature</p>
          </div>
        </div>
      </div>
    </>
  );
}