'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RotateCcw, 
  Eye, 
  Edit3, 
  Trash2, 
  ArrowUpDown, 
  MoreVertical, 
  AlertTriangle,
  Boxes,
  Printer,
  X,
  RefreshCw
} from 'lucide-react';
import { useInventoryStocks } from '@/domains/inventory/hooks/useInventory';
import { StockAdjustmentModal } from '@/domains/inventory/components/StockAdjustmentModal';
import { StockTransferModal } from '@/domains/inventory/components/StockTransferModal';

export default function InventoryPage() {
  // Filters & Search State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [stockStatus, setStockStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  // Hydration fix for client-only Date rendering
  const [printedAt, setPrintedAt] = useState<string>('');

  // UI Control States
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [activeActionMenu, setActiveActionMenu] = useState<number | null>(null);

  // Selected Item States for Modals
  const [selectedStockForView, setSelectedStockForView] = useState<any | null>(null);
  const [selectedStockForEditOption, setSelectedStockForEditOption] = useState<any | null>(null);

  // Mount হওয়ার পর তারিখ সেট করা হচ্ছে যেন Hydration Error না হয়
  useEffect(() => {
    setPrintedAt(new Date().toLocaleString());
  }, []);

  // Debounce search input to prevent unnecessary API queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch Inventory Data from API
  const { data, isLoading, refetch } = useInventoryStocks({ 
    search: debouncedSearch, 
    warehouse_id: selectedWarehouse,
    status: stockStatus,
    page,
    per_page: perPage
  });

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedWarehouse('');
    setStockStatus('all');
    setPage(1);
  };

  const handleView = (stock: any) => {
    setActiveActionMenu(null);
    setSelectedStockForView(stock);
  };

  const handleEditClick = (stock: any) => {
    setActiveActionMenu(null);
    setSelectedStockForEditOption(stock);
  };

  const handleDelete = (id: number) => {
    setActiveActionMenu(null);
    if (confirm('Are you sure you want to delete this inventory record? This action cannot be undone.')) {
      alert(`Deleted stock record ID: ${id}`);
      refetch();
    }
  };

  const handlePrint = () => {
    // প্রিন্ট দেওয়ার ঠিক আগ মুহূর্তে তারিখ আপডেট করা
    setPrintedAt(new Date().toLocaleString());
    window.print();
  };

  const stockList = data?.data?.data || [];
  const totalEntries = data?.data?.total || 0;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-6 dark:bg-gray-900">
      
      {/* Dynamic CSS Print Settings */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          .printable-area {
            border: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      {/* Header Section */}
      <div className="no-print mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Inventory Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Monitor real-time stock levels, reserve limits, and warehouse distributions.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 sm:gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            <Printer className="h-4 w-4 text-gray-500" />
            Print List
          </button>
          <button
            onClick={() => setIsAdjustOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            <Boxes className="h-4 w-4" />
            Adjust Stock
          </button>
          <button
            onClick={() => setIsTransferOpen(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            Transfer Stock
          </button>
        </div>
      </div>

      {/* Header visible ONLY in Printing */}
      <div className="hidden print-only mb-6">
        <h1 className="text-xl font-bold text-gray-900">Inventory Management Report</h1>
        <p className="text-xs text-gray-600">Generated on: {printedAt}</p>
        <hr className="my-2" />
      </div>

      {/* Filter Toolbar */}
      <div className="no-print mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {/* Search Bar */}
          <div className="relative md:col-span-5">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by product name, SKU, or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 pl-10 pr-4 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-indigo-500"
            />
          </div>

          {/* Warehouse Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedWarehouse}
              onChange={(e) => { setSelectedWarehouse(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">All Warehouses</option>
              <option value="1">Main Warehouse</option>
              <option value="2">Secondary Outlet</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={stockStatus}
              onChange={(e) => { setStockStatus(e.target.value); setPage(1); }}
              className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low">Low Stock Alert</option>
              <option value="out">Out of Stock</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 md:col-span-1">
            <button
              onClick={() => refetch()}
              title="Refresh Data"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-gray-50 text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetFilters}
              title="Reset Filters"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-gray-50 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Data Table */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent"></div>
            <span>Loading Inventory Records...</span>
          </div>
        </div>
      ) : (
        <div className="printable-area overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
              <thead className="border-b border-gray-200 bg-gray-50/70 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-700 dark:bg-gray-700/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4">Product Details</th>
                  <th className="px-6 py-4">Warehouse</th>
                  <th className="px-6 py-4">Available Qty</th>
                  <th className="px-6 py-4">Reserved</th>
                  <th className="px-6 py-4">Alert Limit</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="no-print px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {stockList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      No stock records found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  stockList.map((stock: any) => {
                    const isLowStock = stock.quantity <= stock.alert_quantity && stock.quantity > 0;
                    const isOutOfStock = stock.quantity === 0;

                    return (
                      <tr key={stock.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {stock.product?.name || 'N/A'}
                          </div>
                          <div className="text-xs font-mono text-gray-400">
                            SKU: {stock.product?.sku || 'N/A'}
                          </div>
                        </td>

                        <td className="px-6 py-4 font-medium text-gray-700 dark:text-gray-300">
                          {stock.warehouse?.name || 'Unassigned'}
                        </td>

                        <td className="px-6 py-4 font-semibold text-gray-900 dark:text-white">
                          <span className={isOutOfStock ? 'text-red-600 dark:text-red-400' : ''}>
                            {stock.quantity}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {stock.reserved_quantity || 0}
                        </td>

                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {stock.alert_quantity || 0}
                        </td>

                        <td className="px-6 py-4">
                          {isOutOfStock ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10 dark:bg-red-900/20 dark:text-red-400">
                              Out of Stock
                            </span>
                          ) : isLowStock ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-400">
                              <AlertTriangle className="h-3 w-3" />
                              Low Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400">
                              Healthy
                            </span>
                          )}
                        </td>

                        <td className="no-print px-6 py-4 text-right">
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => setActiveActionMenu(activeActionMenu === stock.id ? null : stock.id)}
                              className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-200"
                            >
                              <MoreVertical className="h-5 w-5" />
                            </button>

                            {activeActionMenu === stock.id && (
                              <div className="absolute right-0 z-20 mt-2 w-36 origin-top-right rounded-lg border border-gray-100 bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:border-gray-700 dark:bg-gray-800">
                                <div className="py-1">
                                  <button
                                    onClick={() => handleView(stock)}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                                  >
                                    <Eye className="h-3.5 w-3.5" /> View
                                  </button>
                                  <button
                                    onClick={() => handleEditClick(stock)}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                                  >
                                    <Edit3 className="h-3.5 w-3.5" /> Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(stock.id)}
                                    className="flex w-full items-center gap-2 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer / Pagination Controls */}
          <div className="no-print flex flex-col items-center justify-between gap-4 border-t border-gray-200 bg-gray-50/50 px-6 py-3 sm:flex-row dark:border-gray-700 dark:bg-gray-800">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Showing <span className="font-semibold text-gray-700 dark:text-gray-200">{stockList.length > 0 ? (page - 1) * perPage + 1 : 0}</span> to{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">{Math.min(page * perPage, totalEntries)}</span> of{' '}
              <span className="font-semibold text-gray-700 dark:text-gray-200">{totalEntries}</span> entries
            </p>

            <div className="flex items-center gap-4">
              <select
                value={perPage}
                onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }}
                className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-xs text-gray-700 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>

              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Previous
                </button>
                <button
                  disabled={page * perPage >= totalEntries}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {selectedStockForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between border-b pb-4 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Stock Details</h3>
              <button onClick={() => setSelectedStockForView(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between border-b py-2 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">Product Name:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedStockForView.product?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b py-2 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">SKU:</span>
                <span className="font-mono text-gray-900 dark:text-white">{selectedStockForView.product?.sku || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b py-2 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">Warehouse:</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedStockForView.warehouse?.name || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between border-b py-2 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">Available Quantity:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedStockForView.quantity}</span>
              </div>
              <div className="flex justify-between border-b py-2 dark:border-gray-700/50">
                <span className="text-gray-500 dark:text-gray-400">Reserved Quantity:</span>
                <span className="text-gray-900 dark:text-white">{selectedStockForView.reserved_quantity || 0}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-500 dark:text-gray-400">Low Stock Alert Limit:</span>
                <span className="text-gray-900 dark:text-white">{selectedStockForView.alert_quantity || 0}</span>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedStockForView(null)}
                className="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Options Modal */}
      {selectedStockForEditOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl dark:bg-gray-800">
            <div className="flex items-center justify-between border-b pb-4 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Update Inventory Action</h3>
              <button onClick={() => setSelectedStockForEditOption(null)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Product: <span className="font-semibold text-gray-900 dark:text-white">{selectedStockForEditOption.product?.name}</span>
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Choose an action to update this stock:
              </p>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={() => {
                    setSelectedStockForEditOption(null);
                    setIsAdjustOpen(true);
                  }}
                  className="flex items-center justify-between rounded-xl border border-orange-200 bg-orange-50 p-4 transition-colors hover:bg-orange-100 dark:border-orange-900/50 dark:bg-orange-950/20 dark:hover:bg-orange-900/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-600 p-2.5 text-white">
                      <Boxes className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">Stock Adjustment</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Add, reduce, or manually adjust quantity</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setSelectedStockForEditOption(null);
                    setIsTransferOpen(true);
                  }}
                  className="flex items-center justify-between rounded-xl border border-indigo-200 bg-indigo-50 p-4 transition-colors hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-600 p-2.5 text-white">
                      <ArrowUpDown className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">Stock Transfer</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Move stock between warehouses</div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t pt-4 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setSelectedStockForEditOption(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment & Transfer Modals */}
      <StockAdjustmentModal isOpen={isAdjustOpen} onClose={() => setIsAdjustOpen(false)} />
      <StockTransferModal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} />
    </div>
  );
}