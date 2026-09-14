'use client';

import React, { useState, useMemo } from 'react';
import { useStockHistory, useWarehouses } from '@/domains/inventory/hooks/useInventory';
import { StockHistoryItem } from '@/domains/inventory/types';

export default function StockHistoryPage() {
  // --- Filter & Pagination States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // --- Modal / Invoice State ---
  const [selectedInvoiceItem, setSelectedInvoiceItem] = useState<StockHistoryItem | null>(null);

  // --- API Queries ---
  const { data: warehousesData } = useWarehouses();
  const { data: stockHistoryData, isLoading, isError } = useStockHistory({
    page: currentPage,
    warehouse_id: selectedWarehouse ? Number(selectedWarehouse) : undefined,
    product_id: undefined,
  });

  // Safe Extraction
  const historyList: StockHistoryItem[] = useMemo(() => {
    if (!stockHistoryData) return [];
    if (Array.isArray(stockHistoryData)) return stockHistoryData;
    if (Array.isArray(stockHistoryData.data)) return stockHistoryData.data;
    if (Array.isArray(stockHistoryData.data?.data)) return stockHistoryData.data.data;
    return [];
  }, [stockHistoryData]);

  const warehousesList = useMemo(() => {
    if (!warehousesData) return [];
    if (Array.isArray(warehousesData)) return warehousesData;
    if (Array.isArray(warehousesData.data)) return warehousesData.data;
    if (Array.isArray(warehousesData.data?.data)) return warehousesData.data.data;
    return [];
  }, [warehousesData]);

  // Client-side Filtering
  const filteredHistory = useMemo(() => {
    return historyList.filter((item) => {
      const matchesSearch =
        !searchTerm ||
        item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.reference_id && String(item.reference_id).includes(searchTerm));

      const matchesType = !selectedType || item.type === selectedType;

      const itemDate = new Date(item.created_at).getTime();
      const matchesStart = !startDate || itemDate >= new Date(startDate).getTime();
      const matchesEnd =
        !endDate || itemDate <= new Date(`${endDate}T23:59:59`).getTime();

      return matchesSearch && matchesType && matchesStart && matchesEnd;
    });
  }, [historyList, searchTerm, selectedType, startDate, endDate]);

  // Aggregated Summary Metrics & Product Stock Summary
  const { metrics, productTotals } = useMemo(() => {
    const pTotals: Record<string, { name: string; sku: string; totalQty: number }> = {};

    const summary = filteredHistory.reduce(
      (acc, item) => {
        const qty = Number(item.quantity) || 0;
        acc.totalTransactions += 1;

        if (item.type === 'purchase' || item.type === 'transfer_in' || item.type === 'adjustment_add') {
          acc.totalIn += qty;
        } else if (item.type === 'sale' || item.type === 'transfer_out' || item.type === 'adjustment_sub') {
          acc.totalOut += Math.abs(qty);
        }

        if (item.type === 'adjustment_add' || item.type === 'adjustment_sub') {
          acc.totalAdjustments += 1;
        }

        // Aggregate Product Stock
        const pId = item.product_id || item.product?.id || 'unknown';
        const pName = item.product?.name || `Product #${pId}`;
        const pSku = item.product?.sku || 'N/A';

        if (!pTotals[pId]) {
          pTotals[pId] = { name: pName, sku: pSku, totalQty: 0 };
        }
        pTotals[pId].totalQty += qty;

        return acc;
      },
      { totalTransactions: 0, totalIn: 0, totalOut: 0, totalAdjustments: 0 }
    );

    return { metrics: summary, productTotals: Object.values(pTotals) };
  }, [filteredHistory]);

  const getTypeBadge = (type: StockHistoryItem['type']) => {
    const badges: Record<StockHistoryItem['type'], { label: string; className: string }> = {
      opening_stock: { label: 'Opening Stock', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200' },
      purchase: { label: 'Purchase (In)', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200' },
      sale: { label: 'Sale (Out)', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200' },
      transfer_in: { label: 'Transfer In', className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200' },
      transfer_out: { label: 'Transfer Out', className: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200' },
      adjustment_add: { label: 'Adj. (+) Addition', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200' },
      adjustment_sub: { label: 'Adj. (-) Subtraction', className: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-200' },
      return: { label: 'Return / Restock', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200' },
    };

    const current = badges[type] || { label: type, className: 'bg-gray-100 text-gray-800' };

    return (
      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${current.className}`}>
        {current.label}
      </span>
    );
  };

  // Human Readable Clean Reference Badge Generator
  const formatReference = (item: StockHistoryItem) => {
    const refType = item.reference_type;
    const refId = item.reference_id;

    if (!refType) return <span className="text-gray-400">Direct Entry</span>;

    let label = 'Ref';
    if (refType.includes('StockTransfer')) label = 'Transfer Voucher';
    else if (refType.includes('StockAdjustment')) label = 'Adjustment Note';
    else if (refType.includes('Purchase')) label = 'Purchase Invoice';
    else if (refType.includes('Sale')) label = 'Sales Invoice';
    else {
      const parts = refType.split('\\');
      label = parts[parts.length - 1];
    }

    return (
      <button
        onClick={() => setSelectedInvoiceItem(item)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-50 hover:text-blue-800 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
      >
        📄 {label} #{refId || 'N/A'}
      </button>
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!filteredHistory.length) return;

    const headers = ['ID,Date,Warehouse,Product,SKU,Type,Reference Type,Reference ID,Quantity,Balance After,Created By'];
    const rows = filteredHistory.map((item) => [
      item.id,
      `"${new Date(item.created_at).toLocaleString()}"`,
      `"${item.warehouse?.name || ''}"`,
      `"${item.product?.name || ''}"`,
      `"${item.product?.sku || ''}"`,
      item.type,
      item.reference_type || '',
      item.reference_id || '',
      item.quantity,
      item.balance_after,
      `"${item.creator?.name || 'System'}"`,
    ].join(','));

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Stock_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedWarehouse('');
    setSelectedType('');
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 lg:p-8 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* --- Header Section --- */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
              Stock Ledger & Audit Trail
            </h1>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
              Real-time audit log of stock movements, transfers, adjustments, and transactions.
            </p>
          </div>

          <div className="flex items-center gap-3 print:hidden">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
            >
              📊 Export CSV
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              🖨️ Print Ledger
            </button>
          </div>
        </div>

        {/* --- KPI Summary Metric Cards --- */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Audit Logs</span>
            <div className="mt-2 text-2xl font-black text-gray-900 dark:text-white">{metrics.totalTransactions}</div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Total Inflow (+)</span>
            <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">+{metrics.totalIn}</div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Total Outflow (-)</span>
            <div className="mt-2 text-2xl font-black text-rose-600 dark:text-rose-400">-{metrics.totalOut}</div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Total Adjustments</span>
            <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">{metrics.totalAdjustments}</div>
          </div>
        </div>

        {/* --- Product Aggregated Quantity Bar --- */}
        {productTotals.length > 0 && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300 mb-2">
              📦 Product Quantities Movement Summary (Filtered View)
            </h3>
            <div className="flex flex-wrap gap-2">
              {productTotals.map((prod, idx) => (
                <div key={idx} className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1.5 text-xs font-medium shadow-sm dark:bg-gray-800 dark:text-white border border-gray-200 dark:border-gray-700">
                  <span>{prod.name}</span>
                  <span className="font-mono text-[10px] text-gray-400">({prod.sku})</span>
                  <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${prod.totalQty >= 0 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'}`}>
                    Net Movement: {prod.totalQty > 0 ? `+${prod.totalQty}` : prod.totalQty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Advanced Search & Filters Control Bar --- */}
        <div className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm print:hidden dark:border-gray-800 dark:bg-gray-900 space-y-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            
            {/* Search Input */}
            <div className="lg:col-span-1">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Search</label>
              <input
                type="text"
                placeholder="Product, SKU, Ref ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Warehouse Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Warehouse</label>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">All Warehouses</option>
                {warehousesList.map((wh: any) => (
                  <option key={wh.id} value={wh.id}>{wh.name}</option>
                ))}
              </select>
            </div>

            {/* Movement Type Filter */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Transaction Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="">All Movement Types</option>
                <option value="opening_stock">Opening Stock</option>
                <option value="purchase">Purchase</option>
                <option value="sale">Sale</option>
                <option value="transfer_in">Transfer In</option>
                <option value="transfer_out">Transfer Out</option>
                <option value="adjustment_add">Adjustment Addition (+)</option>
                <option value="adjustment_sub">Adjustment Subtraction (-)</option>
                <option value="return">Return / Restock</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-gray-300 p-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>

          </div>

          <div className="flex items-center justify-end">
            <button
              onClick={resetFilters}
              className="text-xs font-medium text-red-600 hover:underline dark:text-red-400"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* --- Main Audit Ledger Table --- */}
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600 dark:text-gray-300">
              <thead className="border-b border-gray-200 bg-gray-50/80 uppercase tracking-wider text-gray-500 dark:border-gray-800 dark:bg-gray-800/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-bold">Date & Time</th>
                  <th className="px-6 py-4 font-bold">Warehouse</th>
                  <th className="px-6 py-4 font-bold">Product Specs</th>
                  <th className="px-6 py-4 font-bold">Movement Type</th>
                  <th className="px-6 py-4 font-bold">Reference Document</th>
                  <th className="px-6 py-4 font-bold text-right">Quantity</th>
                  <th className="px-6 py-4 font-bold text-right">Balance After</th>
                  <th className="px-6 py-4 font-bold">Audit Officer</th>
                  <th className="px-6 py-4 font-bold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-sm text-gray-500">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                      <p className="mt-2 font-medium">Fetching real-time ledger entries...</p>
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-sm font-semibold text-rose-500">
                      Failed to load stock audit records. Please try again.
                    </td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 text-center text-sm text-gray-500">
                      No stock history records match your selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => {
                    const isPositive = Number(item.quantity) >= 0;
                    return (
                      <tr key={item.id} className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/40">
                        <td className="whitespace-nowrap px-6 py-4 font-mono text-gray-700 dark:text-gray-300">
                          {new Date(item.created_at).toLocaleString('en-US', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </td>
                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          {item.warehouse?.name || `WH #${item.warehouse_id}`}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-gray-900 dark:text-white">
                            {item.product?.name || `Product #${item.product_id}`}
                          </div>
                          {item.product?.sku && (
                            <div className="font-mono text-[10px] text-gray-400">SKU: {item.product.sku}</div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {getTypeBadge(item.type)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {formatReference(item)}
                        </td>
                        <td className={`whitespace-nowrap px-6 py-4 text-right font-mono text-sm font-black ${
                          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                        }`}>
                          {isPositive ? `+${item.quantity}` : item.quantity}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right font-mono text-sm font-bold text-gray-900 dark:text-white">
                          {item.balance_after}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-gray-700 dark:text-gray-300">
                          <span className="inline-flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                            {item.creator?.name || 'System Operator'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-center">
                          <button
                            onClick={() => setSelectedInvoiceItem(item)}
                            className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300"
                          >
                            👁️ View Note
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="flex items-center justify-between border-t border-gray-100 bg-white px-6 py-4 print:hidden dark:border-gray-800 dark:bg-gray-900">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-700 dark:text-gray-200">{filteredHistory.length}</span> records
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-40 dark:border-gray-700 dark:text-gray-200"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 px-2">Page {currentPage}</span>
              <button
                disabled={historyList.length < 15}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 disabled:opacity-40 dark:border-gray-700 dark:text-gray-200"
              >
                Next
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* --- PRINTABLE INVOICE / ADJUSTMENT / TRANSFER VOUCHER MODAL --- */}
      {selectedInvoiceItem && (() => {
        const item = selectedInvoiceItem as any;
        
        // Comprehensive check for From Warehouse
        const fromWH =
          item.from_warehouse?.name ||
          item.fromWarehouse?.name ||
          item.reference?.from_warehouse?.name ||
          item.reference?.fromWarehouse?.name ||
          item.transfer?.from_warehouse?.name ||
          item.transfer?.fromWarehouse?.name ||
          item.from_warehouse_name ||
          (item.type === 'transfer_out' ? item.warehouse?.name : 'N/A');

        // Comprehensive check for To Warehouse
        const toWH =
          item.to_warehouse?.name ||
          item.toWarehouse?.name ||
          item.reference?.to_warehouse?.name ||
          item.reference?.toWarehouse?.name ||
          item.transfer?.to_warehouse?.name ||
          item.transfer?.toWarehouse?.name ||
          item.to_warehouse_name ||
          (item.type === 'transfer_in' ? item.warehouse?.name : 'N/A');

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 dark:text-white space-y-6">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b pb-4 dark:border-gray-800">
                <div>
                  <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-wider">
                    NRG SOLAR ENTERPRISE
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Official Stock Audit & Movement Voucher
                  </p>
                </div>
                <button
                  onClick={() => setSelectedInvoiceItem(null)}
                  className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                >
                  ✕
                </button>
              </div>

              {/* Voucher Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block">Voucher/Ref ID:</span>
                  <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                    #{selectedInvoiceItem.reference_id || selectedInvoiceItem.id}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Date & Time:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {new Date(selectedInvoiceItem.created_at).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Transaction Type:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">
                    {selectedInvoiceItem.type}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block">Authorized By:</span>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {selectedInvoiceItem.creator?.name || 'Super Admin / System'}
                  </span>
                </div>

                {/* Transfer Route Details ( If Transfer ) */}
                {(selectedInvoiceItem.type === 'transfer_out' || selectedInvoiceItem.type === 'transfer_in' || fromWH !== 'N/A' || toWH !== 'N/A') && (
                  <div className="col-span-2 rounded-xl bg-blue-50 p-3 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 block">From (Source)</span>
                      <span className="font-bold text-blue-900 dark:text-blue-300 text-sm">
                        {fromWH}
                      </span>
                    </div>
                    <div className="text-blue-500 font-bold text-base">➔</div>
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 block">To (Destination)</span>
                      <span className="font-bold text-blue-900 dark:text-blue-300 text-sm">
                        {toWH}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Summary Table inside Invoice */}
              <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 font-bold uppercase text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    <tr>
                      <th className="p-3">Product Name</th>
                      {selectedInvoiceItem.type === 'transfer_out' || selectedInvoiceItem.type === 'transfer_in' ? (
                        <>
                          <th className="p-3">From WH</th>
                          <th className="p-3">To WH</th>
                        </>
                      ) : (
                        <th className="p-3">Warehouse</th>
                      )}
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3 text-right">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    <tr>
                      <td className="p-3 font-semibold">
                        {selectedInvoiceItem.product?.name || `Product #${selectedInvoiceItem.product_id}`}
                        <div className="text-[10px] text-gray-400 font-mono">SKU: {selectedInvoiceItem.product?.sku || 'N/A'}</div>
                      </td>
                      {selectedInvoiceItem.type === 'transfer_out' || selectedInvoiceItem.type === 'transfer_in' ? (
                        <>
                          <td className="p-3 font-medium">
                            {fromWH}
                          </td>
                          <td className="p-3 font-medium">
                            {toWH}
                          </td>
                        </>
                      ) : (
                        <td className="p-3">{selectedInvoiceItem.warehouse?.name || `WH #${selectedInvoiceItem.warehouse_id}`}</td>
                      )}
                      <td className="p-3 text-right font-mono font-bold">
                        {Number(selectedInvoiceItem.quantity) >= 0 ? `+${selectedInvoiceItem.quantity}` : selectedInvoiceItem.quantity}
                      </td>
                      <td className="p-3 text-right font-mono font-bold">{selectedInvoiceItem.balance_after}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Signature Area */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs">
                <div className="border-t border-gray-300 dark:border-gray-700 pt-2 text-gray-500">
                  Authorized Signature
                </div>
                <div className="border-t border-gray-300 dark:border-gray-700 pt-2 text-gray-500">
                  Receiver / Warehouse Manager
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-800 print:hidden">
                <button
                  onClick={() => setSelectedInvoiceItem(null)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                >
                  🖨️ Print Voucher / Invoice
                </button>
              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
}