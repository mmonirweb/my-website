"use client";

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/axios";
import { usePurchaseReturns } from "@/domains/purchase/hooks/usePurchaseReturns";
import { CreatePurchaseReturnModal, triggerReturnPrint } from "@/domains/purchase/components/CreatePurchaseReturnModal";
import {
  Plus,
  Search,
  RotateCcw,
  Building2,
  Warehouse,
  Calendar,
  FileSpreadsheet,
  Loader2,
  PackageX,
  AlertTriangle,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Printer,
  X,
  UserCheck,
  Filter,
} from "lucide-react";

// Safe Array Extractor Helper Function
const extractArray = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.suppliers)) return response.suppliers;
  if (Array.isArray(response.warehouses)) return response.warehouses;
  if (Array.isArray(response.products)) return response.products;
  return [];
};

// Professional Date Formatter Helper
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  } catch (error) {
    return dateString;
  }
};

// Helper to safely extract user name from database objects
const extractUserName = (item: any): string => {
  if (!item) return "N/A";

  if (typeof item.returned_by === "string" && item.returned_by.trim() !== "") {
    return item.returned_by;
  }

  const userObj =
    (typeof item.returned_by === "object" ? item.returned_by : null) ||
    item.creator ||
    item.user ||
    item.created_by_user;

  if (userObj && typeof userObj === "object") {
    if (userObj.name) return userObj.name;
    if (userObj.first_name) {
      return `${userObj.first_name} ${userObj.last_name || ""}`.trim();
    }
    if (userObj.username) return userObj.username;
    if (userObj.email) return userObj.email;
  }

  if (item.user_name) return item.user_name;
  if (item.created_by_name) return item.created_by_name;

  return "N/A";
};

export default function PurchaseReturnsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterSupplier, setFilterSupplier] = useState<string>("ALL");
  const [filterWarehouse, setFilterWarehouse] = useState<string>("ALL");
  const [filterStartDate, setFilterStartDate] = useState<string>("");
  const [filterEndDate, setFilterEndDate] = useState<string>("");

  // Viewing Details / Invoice Modal State
  const [selectedReturnInvoice, setSelectedReturnInvoice] = useState<any | null>(null);

  // 1. Fetch Purchase Returns List
  const {
    data: returnsData,
    isLoading: isLoadingReturns,
    isError: isReturnsError,
    error: returnsError,
    refetch: refetchReturns,
  } = usePurchaseReturns();

  // 2. Fetch Suppliers Data for Dropdown & Filter
  const { data: rawSuppliers = [] } = useQuery({
    queryKey: ["suppliers-dropdown"],
    queryFn: async () => {
      const res = await apiClient.get("/suppliers");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 3. Fetch Warehouses Data for Dropdown & Filter
  const { data: rawWarehouses = [] } = useQuery({
    queryKey: ["warehouses-dropdown"],
    queryFn: async () => {
      const res = await apiClient.get("/warehouses");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // 4. Fetch Products Data for Dropdown
  const { data: rawProducts = [] } = useQuery({
    queryKey: ["products-dropdown"],
    queryFn: async () => {
      const res = await apiClient.get("/products");
      return res.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Safe Arrays for Mapping in UI
  const suppliers = useMemo(() => extractArray(rawSuppliers), [rawSuppliers]);
  const warehouses = useMemo(() => extractArray(rawWarehouses), [rawWarehouses]);
  const products = useMemo(() => extractArray(rawProducts), [rawProducts]);

  // Delete Mutation Handler
  const deleteReturnMutation = useMutation({
    mutationFn: async (id: number | string) => {
      await apiClient.delete(`/purchase-returns/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-returns"] });
    },
  });

  const handleDelete = async (id: number | string) => {
    if (confirm("Are you sure you want to delete this purchase return record?")) {
      await deleteReturnMutation.mutateAsync(id);
    }
  };

  // Extract table items safely
  const returnsList = useMemo(() => extractArray(returnsData), [returnsData]);

  // Advanced Filter Logic
  const filteredReturns = useMemo(() => {
    return returnsList.filter((item: any) => {
      const returnNo = (item.return_no || item.code || `#RET-${item.id}`).toLowerCase();
      const supplierName = (item.supplier?.name || item.supplier_name || "").toLowerCase();
      const warehouseName = (item.warehouse?.name || item.warehouse_name || "").toLowerCase();
      
      const returnedBy = extractUserName(item).toLowerCase();

      const matchesSearch =
        returnNo.includes(searchTerm.toLowerCase()) ||
        supplierName.includes(searchTerm.toLowerCase()) ||
        warehouseName.includes(searchTerm.toLowerCase()) ||
        returnedBy.includes(searchTerm.toLowerCase());

      const itemSupplierId = item.supplier_id || item.supplier?.id;
      const matchesSupplier =
        filterSupplier === "ALL" || String(itemSupplierId) === String(filterSupplier);

      const itemWarehouseId = item.warehouse_id || item.warehouse?.id;
      const matchesWarehouse =
        filterWarehouse === "ALL" || String(itemWarehouseId) === String(filterWarehouse);

      const returnDateStr = item.return_date || item.created_at;
      let matchesDate = true;
      if (filterStartDate && returnDateStr) {
        matchesDate = matchesDate && new Date(returnDateStr) >= new Date(filterStartDate);
      }
      if (filterEndDate && returnDateStr) {
        matchesDate = matchesDate && new Date(returnDateStr) <= new Date(filterEndDate);
      }

      return matchesSearch && matchesSupplier && matchesWarehouse && matchesDate;
    });
  }, [returnsList, searchTerm, filterSupplier, filterWarehouse, filterStartDate, filterEndDate]);

  return (
    <div className="p-4 sm:p-6 max-w-[1600px] mx-auto space-y-6 bg-slate-50/50 min-h-screen">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <RotateCcw className="w-5 h-5" />
            </div>
            Purchase Returns
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage returned inventory, debit notes, and view activity details.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-5 py-2.5 rounded-xl font-medium shadow-md shadow-blue-500/10 transition-all duration-200 shrink-0 text-sm"
        >
          <Plus className="w-4 h-4" />
          Create Return
        </button>
      </div>

      {/* Toolbar & Search Filters */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Main Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Return No, Supplier or User..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Supplier Filter */}
          <div>
            <select
              value={filterSupplier}
              onChange={(e) => setFilterSupplier(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Suppliers</option>
              {suppliers.map((sup: any) => (
                <option key={sup.id ?? sup._id} value={sup.id ?? sup._id}>
                  {sup.name || sup.supplier_name}
                </option>
              ))}
            </select>
          </div>

          {/* Warehouse Filter */}
          <div>
            <select
              value={filterWarehouse}
              onChange={(e) => setFilterWarehouse(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Warehouses</option>
              {warehouses.map((wh: any) => (
                <option key={wh.id ?? wh._id} value={wh.id ?? wh._id}>
                  {wh.name || wh.warehouse_name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="w-full py-2 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500"
            />
            <span className="text-slate-400 text-xs">-</span>
            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="w-full py-2 px-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-medium text-slate-500 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-2 text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Active Filters applied</span>
          </div>
          <div>
            Total Records Found: <span className="text-slate-900 font-bold">{filteredReturns.length}</span>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-500 text-xs uppercase font-semibold tracking-wider border-b border-slate-200/80">
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Return No</th>
                <th className="py-3.5 px-4">Supplier</th>
                <th className="py-3.5 px-4">Warehouse</th>
                <th className="py-3.5 px-4">Returned By</th>
                <th className="py-3.5 px-4 text-right">Net Amount</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {isLoadingReturns ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      <span className="text-xs font-medium">Loading purchase returns...</span>
                    </div>
                  </td>
                </tr>
              ) : isReturnsError ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-rose-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <AlertTriangle className="w-8 h-8 text-rose-500" />
                      <div>
                        <p className="text-sm font-semibold">Failed to load purchase returns data.</p>
                        <p className="text-xs text-slate-500 mt-1">
                          {(returnsError as any)?.response?.data?.message || "Server error occurred while fetching data."}
                        </p>
                      </div>
                      <button
                        onClick={() => refetchReturns()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <PackageX className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-medium">No purchase returns record found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReturns.map((item: any) => {
                  const returnNo = item.return_no || item.code || `#RET-${item.id}`;
                  const supplierName = item.supplier?.name || item.supplier_name || "N/A";
                  const warehouseName = item.warehouse?.name || item.warehouse_name || "N/A";
                  
                  const returnedUser = extractUserName(item);
                  const formattedReturnDate = formatDate(item.return_date || item.created_at);

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors duration-150">
                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{formattedReturnDate}</span>
                        </div>
                      </td>

                      {/* Return No */}
                      <td className="py-3.5 px-4 font-semibold whitespace-nowrap">
                        <button
                          onClick={() =>
                            setSelectedReturnInvoice({
                              ...item,
                              return_no: returnNo,
                              supplier_name: supplierName,
                              warehouse_name: warehouseName,
                              returned_by: returnedUser,
                            })
                          }
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 hover:underline font-bold text-xs"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-blue-500/70 shrink-0" />
                          <span>{returnNo}</span>
                        </button>
                      </td>

                      {/* Supplier */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-medium text-slate-800 text-xs truncate max-w-[180px]" title={supplierName}>
                            {supplierName}
                          </span>
                        </div>
                      </td>

                      {/* Warehouse */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <Warehouse className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs text-slate-600 truncate max-w-[150px]" title={warehouseName}>
                            {warehouseName}
                          </span>
                        </div>
                      </td>

                      {/* User Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-700 bg-slate-100/80 px-2.5 py-1 rounded-full border border-slate-200/50" title={returnedUser}>
                          <UserCheck className="w-3 h-3 text-blue-600 shrink-0" />
                          <span>{returnedUser}</span>
                        </div>
                      </td>

                      {/* Net Amount */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-xs whitespace-nowrap">
                        ${Number(item.net_amount || item.total_amount || 0).toFixed(2)}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            title="Print Invoice"
                            onClick={() =>
                              triggerReturnPrint({
                                ...item,
                                return_no: returnNo,
                                supplier_name: supplierName,
                                warehouse_name: warehouseName,
                                returned_by: returnedUser,
                              })
                            }
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="View Return Details"
                            onClick={() =>
                              setSelectedReturnInvoice({
                                ...item,
                                return_no: returnNo,
                                supplier_name: supplierName,
                                warehouse_name: warehouseName,
                                returned_by: returnedUser,
                              })
                            }
                            className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Edit Return"
                            onClick={() => alert(`Edit return #${item.id}`)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            title="Delete Return"
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal Preview Dialog */}
      {selectedReturnInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-white border border-slate-200 text-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Purchase Return Voucher ({selectedReturnInvoice.return_no})
                </h3>
              </div>
              <button
                onClick={() => setSelectedReturnInvoice(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                <div>
                  <p className="text-slate-500">Return Date:</p>
                  <p className="font-bold text-slate-900">{formatDate(selectedReturnInvoice.return_date || selectedReturnInvoice.created_at)}</p>
                  <p className="text-slate-500 mt-2">Return Number:</p>
                  <p className="font-bold text-slate-900">{selectedReturnInvoice.return_no}</p>
                  <p className="text-slate-500 mt-2">Returned By:</p>
                  <p className="font-semibold text-blue-600">{selectedReturnInvoice.returned_by}</p>
                </div>
                <div>
                  <p className="text-slate-500">Supplier Name:</p>
                  <p className="font-bold text-slate-900">{selectedReturnInvoice.supplier_name}</p>
                  <p className="text-slate-500 mt-2">Warehouse:</p>
                  <p className="font-semibold text-slate-800">{selectedReturnInvoice.warehouse_name}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-200/80 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="bg-slate-50 text-slate-600 font-semibold uppercase border-b border-slate-100">
                    <tr>
                      <th className="p-3">Item Name</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(selectedReturnInvoice.items || []).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-4 text-center text-slate-400">
                          No line items details available for this invoice preview.
                        </td>
                      </tr>
                    ) : (
                      selectedReturnInvoice.items.map((it: any, i: number) => (
                        <tr key={i}>
                          <td className="p-3 font-medium text-slate-800">{it.product_name || it.name || `Product #${it.product_id}`}</td>
                          <td className="p-3 text-center text-slate-600">{it.quantity}</td>
                          <td className="p-3 text-right text-slate-600">${Number(it.unit_price || 0).toFixed(2)}</td>
                          <td className="p-3 text-right font-bold text-slate-900">${(Number(it.quantity || 0) * Number(it.unit_price || 0)).toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-500">
                    <span>Tax:</span>
                    <span>${Number(selectedReturnInvoice.tax_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Discount:</span>
                    <span>${Number(selectedReturnInvoice.discount_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold border-t border-slate-200 pt-2 text-slate-900">
                    <span>Net Amount:</span>
                    <span className="text-blue-600">
                      ${Number(selectedReturnInvoice.net_amount || selectedReturnInvoice.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
              <button
                onClick={() => triggerReturnPrint(selectedReturnInvoice)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors"
              >
                <Printer className="w-4 h-4" /> Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Purchase Return Modal Component */}
      <CreatePurchaseReturnModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        suppliers={suppliers}
        warehouses={warehouses}
        products={products}
      />
    </div>
  );
}