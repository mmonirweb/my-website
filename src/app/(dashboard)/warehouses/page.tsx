'use client';

import React, { useState, useMemo } from 'react';
import { useWarehouses, useInventoryMutations } from '@/domains/inventory/hooks/useInventory';
import { WarehouseModal } from '@/domains/inventory/components/WarehouseModal';
import { Warehouse } from '@/domains/inventory/types';

export default function WarehousesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  // View & Delete Modal States
  const [viewWarehouse, setViewWarehouse] = useState<Warehouse | null>(null);
  const [deletingWarehouse, setDeletingWarehouse] = useState<Warehouse | null>(null);

  // Filters & Pagination State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);

  // API Hooks
  const { data, isLoading, isError, refetch } = useWarehouses({
    search,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    page,
  });

  const { deleteWarehouseMutation } = useInventoryMutations();

  const warehouses: Warehouse[] = data?.data?.data || [];
  const paginationMeta = data?.data;

  // Handlers
  const handleEdit = (warehouse: Warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedWarehouse(null);
    setIsModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingWarehouse?.id) return;
    try {
      await deleteWarehouseMutation.mutateAsync(deletingWarehouse.id);
      setDeletingWarehouse(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete warehouse facility', error);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setPage(1);
  };

  // Quick stats calculation
  const stats = useMemo(() => {
    return {
      total: paginationMeta?.total || warehouses.length,
      active: warehouses.filter((w) => w.is_active).length,
      coldStorage: warehouses.filter((w) => w.type === 'cold_storage').length,
      fulfillment: warehouses.filter((w) => w.type === 'fulfillment').length,
    };
  }, [warehouses, paginationMeta]);

  const getTypeBadge = (type: string) => {
    const labels: Record<string, { name: string; color: string }> = {
      central: { name: 'Central DC', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 ring-1 ring-purple-500/20' },
      fulfillment: { name: 'Fulfillment', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 ring-1 ring-blue-500/20' },
      cold_storage: { name: 'Cold Storage', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 ring-1 ring-cyan-500/20' },
      transit_hub: { name: 'Transit Hub', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 ring-1 ring-amber-500/20' },
      retail_backroom: { name: 'Retail Backroom', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 ring-1 ring-emerald-500/20' },
    };

    const current = labels[type] || { name: type, color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' };

    return (
      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide ${current.color}`}>
        {current.name}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 dark:bg-gray-950 space-y-6">
      
      {/* 1. Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">
              Warehouse Enterprise Facilities
            </h1>
            <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              Live Network
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Manage global logistics hubs, spatial capacities, operational metrics, and personnel assignments.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 active:scale-95 dark:shadow-blue-900/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Provision Facility</span>
        </button>
      </div>

      {/* 2. Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-xs border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Total Facilities</p>
            <span className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">🏢</span>
          </div>
          <h3 className="mt-3 text-3xl font-black text-gray-900 dark:text-white">{stats.total}</h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Operational</p>
            <span className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">⚡</span>
          </div>
          <h3 className="mt-3 text-3xl font-black text-emerald-600 dark:text-emerald-400">{stats.active}</h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Cold Storage</p>
            <span className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-950/50 text-cyan-600 dark:text-cyan-400">❄️</span>
          </div>
          <h3 className="mt-3 text-3xl font-black text-cyan-600 dark:text-cyan-400">{stats.coldStorage}</h3>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-xs border border-gray-100 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Fulfillment Hubs</p>
            <span className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">📦</span>
          </div>
          <h3 className="mt-3 text-3xl font-black text-blue-600 dark:text-blue-400">{stats.fulfillment}</h3>
        </div>
      </div>

      {/* 3. Search & Filters Bar */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-xs border border-gray-100 dark:border-gray-800 dark:bg-gray-900 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
          <input
            type="text"
            placeholder="Search by facility name, code, manager, or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 pl-9 pr-4 text-xs text-gray-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-white dark:focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Facility Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-3 text-xs font-medium text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
          >
            <option value="all">All Facility Types</option>
            <option value="central">Central Distribution</option>
            <option value="fulfillment">Fulfillment Hub</option>
            <option value="cold_storage">Cold Storage</option>
            <option value="transit_hub">Transit Hub</option>
            <option value="retail_backroom">Retail Backroom</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-gray-50/50 py-2.5 px-3 text-xs font-medium text-gray-700 focus:outline-none dark:border-gray-700 dark:bg-gray-950 dark:text-gray-300"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>

          {/* Reset Filters Button */}
          {(search || statusFilter !== 'all' || typeFilter !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Enterprise Data Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xs dark:border-gray-800 dark:bg-gray-900">
        {isLoading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-xs text-gray-500">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span>Fetching enterprise records...</span>
          </div>
        ) : isError ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-xs text-rose-500">
            <span>⚠️ Failed to load warehouse records. Please check your connection.</span>
            <button onClick={() => refetch()} className="text-blue-600 underline font-bold">Retry</button>
          </div>
        ) : warehouses.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-xs text-gray-500">
            <p className="font-bold text-gray-700 dark:text-gray-300">No Warehouse Facilities Found</p>
            <p>Try adjusting your search query or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-500 dark:text-gray-400">
              <thead className="border-b bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-600 dark:border-gray-800 dark:bg-gray-950/50 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-4">Facility & Code</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Manager & Contact</th>
                  <th className="px-6 py-4">Location</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Default</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {warehouses.map((item: Warehouse) => (
                  <tr
                    key={item.id}
                    className="transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/40"
                  >
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 dark:text-white">{item.name}</div>
                      <span className="font-mono text-[10px] text-gray-400">{item.code}</span>
                    </td>
                    <td className="px-6 py-4">{getTypeBadge(item.type)}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800 dark:text-gray-200">
                        {item.manager_name || 'Unassigned'}
                      </div>
                      <div className="text-[10px] text-gray-400">{item.phone || item.email || 'No contact'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-700 dark:text-gray-300">{item.city || 'N/A'}</div>
                      <div className="text-[10px] text-gray-400">{item.state || item.country || ''}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          item.is_active
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            item.is_active ? 'bg-emerald-500' : 'bg-rose-500'
                          }`}
                        />
                        {item.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.is_default ? (
                        <span className="inline-flex rounded bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                          Primary Default
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>

                    {/* Action Buttons: View, Edit, Delete */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View Action */}
                        <button
                          onClick={() => setViewWarehouse(item)}
                          title="View Details"
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                        >
                          👁️
                        </button>

                        {/* Edit Action */}
                        <button
                          onClick={() => handleEdit(item)}
                          title="Edit Facility"
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50"
                        >
                          ✏️
                        </button>

                        {/* Delete Action */}
                        <button
                          onClick={() => setDeletingWarehouse(item)}
                          title="Delete Facility"
                          className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Pagination Footer */}
        {paginationMeta && (
          <div className="flex items-center justify-between border-t px-6 py-4 dark:border-gray-800">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Showing Page <span className="font-bold text-gray-900 dark:text-white">{paginationMeta.current_page}</span> of{' '}
              <span className="font-bold text-gray-900 dark:text-white">{paginationMeta.last_page}</span>
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
              >
                Previous
              </button>
              <button
                disabled={page >= (paginationMeta.last_page || 1)}
                onClick={() => setPage((prev) => prev + 1)}
                className="rounded-lg border px-3 py-1.5 text-xs font-semibold text-gray-600 disabled:opacity-40 dark:border-gray-700 dark:text-gray-300"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Warehouse Modal (Create/Edit) */}
      <WarehouseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        warehouse={selectedWarehouse}
      />

      {/* 6. View Details Modal */}
      {viewWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 space-y-6">
            <div className="flex items-start justify-between border-b pb-4 dark:border-gray-800">
              <div>
                <span className="font-mono text-xs text-blue-600 dark:text-blue-400 font-bold">{viewWarehouse.code}</span>
                <h3 className="text-xl font-black text-gray-900 dark:text-white">{viewWarehouse.name}</h3>
              </div>
              <button
                onClick={() => setViewWarehouse(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-gray-50 rounded-xl dark:bg-gray-800/50">
                <p className="text-gray-400 font-medium">Facility Manager</p>
                <p className="font-bold text-gray-800 dark:text-gray-200 mt-1">{viewWarehouse.manager_name || 'N/A'}</p>
                <p className="text-[10px] text-gray-500">{viewWarehouse.phone || viewWarehouse.email}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl dark:bg-gray-800/50">
                <p className="text-gray-400 font-medium">Location & Address</p>
                <p className="font-bold text-gray-800 dark:text-gray-200 mt-1">{viewWarehouse.address || 'N/A'}</p>
                <p className="text-[10px] text-gray-500">{viewWarehouse.city}, {viewWarehouse.state}</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl dark:bg-gray-800/50">
                <p className="text-gray-400 font-medium">Floor Capacity</p>
                <p className="font-bold text-gray-800 dark:text-gray-200 mt-1">
                  {viewWarehouse.total_capacity_sqft ? `${viewWarehouse.total_capacity_sqft.toLocaleString()} Sq. Ft.` : 'N/A'}
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl dark:bg-gray-800/50">
                <p className="text-gray-400 font-medium">Max Weight Capacity</p>
                <p className="font-bold text-gray-800 dark:text-gray-200 mt-1">
                  {viewWarehouse.max_weight_capacity_tons ? `${viewWarehouse.max_weight_capacity_tons} Tons` : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex justify-end border-t pt-4 dark:border-gray-800">
              <button
                onClick={() => setViewWarehouse(null)}
                className="rounded-xl bg-gray-100 px-5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Modal */}
      {deletingWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400">
              ⚠️
            </div>
            <h3 className="text-lg font-extrabold text-gray-900 dark:text-white">Confirm Facility Deletion</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Are you sure you want to delete <span className="font-bold text-gray-800 dark:text-gray-200">{deletingWarehouse.name}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeletingWarehouse(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="rounded-xl bg-rose-600 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-500/25 hover:bg-rose-700"
              >
                Delete Facility
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}