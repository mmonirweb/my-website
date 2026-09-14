'use client';

import { useState, useMemo } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Eye, 
  PackageCheck, 
  Loader2, 
  Search, 
  Filter, 
  Trash2, 
  FileText, 
  History, 
  DollarSign, 
  Clock, 
  AlertCircle,
  X,
  Printer,
  Download,
  Building2,
  Calendar,
  User,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

import { usePurchases } from '@/domains/purchase/hooks/usePurchases';
import { Purchase } from '@/domains/purchase/types/purchase';
import CreatePurchaseModal from '@/domains/purchase/components/CreatePurchaseModal';
import ReceiveGoodsModal from '@/domains/purchase/components/ReceiveGoodsModal';

export default function PurchasesPage() {
  const [page, setPage] = useState<number>(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState<boolean>(false);
  
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [viewInvoicePurchase, setViewInvoicePurchase] = useState<Purchase | null>(null);
  const [activityLogPurchase, setActivityLogPurchase] = useState<Purchase | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paymentFilter, setPaymentFilter] = useState('ALL');

  const { purchasesQuery, deletePurchaseMutation } = usePurchases(page);

  const purchasesData: Purchase[] = purchasesQuery?.data?.data?.data || [];
  const metaData = purchasesQuery?.data?.data?.meta || purchasesQuery?.data?.meta || null;
  const isLoading = purchasesQuery?.isLoading;

  const filteredPurchases = useMemo(() => {
    return purchasesData.filter((item) => {
      const matchesSearch = 
        item.purchase_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.supplier?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.creator?.name || item.created_by_user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.reference_no || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
      const matchesPayment = paymentFilter === 'ALL' || item.payment_status === paymentFilter;

      return matchesSearch && matchesStatus && matchesPayment;
    });
  }, [purchasesData, searchTerm, statusFilter, paymentFilter]);

  const metrics = useMemo(() => {
    const totalSpent = purchasesData.reduce((acc, curr) => acc + Number(curr.grand_total || 0), 0);
    const totalDue = purchasesData.reduce((acc, curr) => acc + Number(curr.due_amount || 0), 0);
    const pendingCount = purchasesData.filter(i => i.status !== 'received' && i.status !== 'cancelled').length;

    return { totalSpent, totalDue, pendingCount, totalCount: purchasesData.length };
  }, [purchasesData]);

  const handleOpenReceiveModal = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setIsReceiveModalOpen(true);
  };

  const handleReceiveSuccess = () => {
    purchasesQuery.refetch();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete/cancel this purchase order? This action cannot be undone.')) {
      try {
        if (deletePurchaseMutation) {
          await deletePurchaseMutation.mutateAsync(id);
          purchasesQuery.refetch();
        } else {
          alert('Delete function is not attached to usePurchases hook.');
        }
      } catch (err: any) {
        alert(err?.response?.data?.message || 'Failed to delete purchase order.');
      }
    }
  };

  const exportToCSV = () => {
    if (!filteredPurchases.length) return;
    const headers = ['PO Number,Supplier,Warehouse,Created By,Received By,Grand Total,Paid,Due,Status,Payment Status'];
    const rows = filteredPurchases.map(p => [
      `"${p.purchase_no}"`,
      `"${p.supplier?.name || 'N/A'}"`,
      `"${p.warehouse?.name || 'N/A'}"`,
      `"${p.creator?.name || p.created_by_user?.name || 'N/A'}"`,
      `"${p.received_by_user?.name || 'N/A'}"`,
      p.grand_total,
      p.paid_amount,
      p.due_amount,
      p.status,
      p.payment_status
    ].join(','));
    
    const blob = new Blob([[headers, ...rows].join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Purchase_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 min-h-screen text-slate-100 font-sans">
      
      {/* Executive Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Orders</p>
            <h3 className="text-xl font-bold text-white">{metrics.totalCount}</h3>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Volume</p>
            <h3 className="text-xl font-bold text-emerald-400">৳ {metrics.totalSpent.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Outstanding Due</p>
            <h3 className="text-xl font-bold text-rose-400">৳ {metrics.totalDue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Pending Delivery</p>
            <h3 className="text-xl font-bold text-amber-400">{metrics.pendingCount}</h3>
          </div>
        </div>
      </div>

      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-6 rounded-3xl border border-slate-800/80 backdrop-blur-xl shadow-lg">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-blue-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Enterprise Purchase Orders</h1>
            <p className="text-xs text-slate-400">Manage procurement, vendor billing, GRN & system audit trail</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs px-4 py-3 rounded-2xl border border-slate-700 transition-all"
          >
            <Download className="w-4 h-4 text-slate-400" />
            Export CSV
          </button>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            Create Purchase Order
          </button>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search PO #, Supplier, Creator, Ref..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="ALL">All Receiving Statuses</option>
            <option value="draft">Draft</option>
            <option value="ordered">Ordered</option>
            <option value="partial_received">Partial Received</option>
            <option value="received">Received</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="ALL">All Payment Statuses</option>
            <option value="unpaid">Unpaid</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="advance">Advance</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900/90 rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl backdrop-blur-xl">
        {isLoading ? (
          <div className="p-12 flex items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            <span>Loading enterprise records...</span>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                  <tr>
                    <th className="p-4">PO Number</th>
                    <th className="p-4">Supplier</th>
                    <th className="p-4">Created By</th>
                    <th className="p-4">Received By</th>
                    <th className="p-4">Warehouse</th>
                    <th className="p-4">Grand Total</th>
                    <th className="p-4">Paid Amount</th>
                    <th className="p-4">Due Amount</th>
                    <th className="p-4">Recv Status</th>
                    <th className="p-4">Pay Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300 font-medium">
                  {filteredPurchases.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center p-8 text-slate-500">
                        No matching purchase orders found.
                      </td>
                    </tr>
                  ) : (
                    filteredPurchases.map((item: Purchase) => (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-4">
                          <button
                            onClick={() => setViewInvoicePurchase(item)}
                            className="font-bold text-blue-400 hover:underline hover:text-blue-300 transition-all flex items-center gap-1.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            {item.purchase_no}
                          </button>
                        </td>
                        <td className="p-4 text-white font-semibold">{item.supplier?.name || 'N/A'}</td>
                        
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-slate-300">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate max-w-[120px]" title={item.creator?.name || item.created_by_user?.name || 'N/A'}>
                              {item.creator?.name || item.created_by_user?.name || 'N/A'}
                            </span>
                          </div>
                        </td>

                        {/* Received By Column Fix */}
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-emerald-400">
                            <UserCheck className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[120px]" title={item.received_by_user?.name || 'Pending'}>
                              {item.received_by_user?.name || 'Pending'}
                            </span>
                          </div>
                        </td>

                        <td className="p-4">{item.warehouse?.name || 'N/A'}</td>
                        <td className="p-4 font-bold text-white">৳ {Number(item.grand_total).toFixed(2)}</td>
                        <td className="p-4 text-emerald-400 font-semibold">৳ {Number(item.paid_amount || 0).toFixed(2)}</td>
                        <td className="p-4 text-rose-400 font-semibold">৳ {Number(item.due_amount || 0).toFixed(2)}</td>
                        
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                              item.status === 'received'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : item.status === 'partial_received'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            {item.status.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                              item.payment_status === 'paid'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : item.payment_status === 'partial'
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : item.payment_status === 'advance'
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {item.payment_status}
                          </span>
                        </td>

                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {item.status !== 'received' && (
                              <button
                                onClick={() => handleOpenReceiveModal(item)}
                                title="Receive Goods (GRN)"
                                className="p-2 rounded-xl text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all"
                              >
                                <PackageCheck className="w-4 h-4" />
                              </button>
                            )}

                            <button 
                              onClick={() => setViewInvoicePurchase(item)}
                              title="View Purchase Invoice Details"
                              className="p-2 rounded-xl text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition-all"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button 
                              onClick={() => setActivityLogPurchase(item)}
                              title="View Activity & Audit Logs"
                              className="p-2 rounded-xl text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-all"
                            >
                              <History className="w-4 h-4" />
                            </button>

                            <button 
                              onClick={() => handleDelete(item.id)}
                              title="Delete Purchase Order"
                              className="p-2 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {metaData && (
              <div className="p-4 bg-slate-950/40 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Showing page {metaData.current_page || page} of {metaData.last_page || 1}</span>
                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                    className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={metaData.current_page >= metaData.last_page}
                    onClick={() => setPage(prev => prev + 1)}
                    className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-xl transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <CreatePurchaseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {selectedPurchase && (
        <ReceiveGoodsModal
          isOpen={isReceiveModalOpen}
          onClose={() => {
            setIsReceiveModalOpen(false);
            setSelectedPurchase(null);
          }}
          purchase={selectedPurchase}
          onSuccess={handleReceiveSuccess}
        />
      )}

      {viewInvoicePurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl text-slate-200">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-blue-600/10 text-blue-400 border border-blue-500/20">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white">Purchase Invoice Detail</h2>
                  <p className="text-xs text-slate-400">PO Number: <span className="text-blue-400 font-semibold">{viewInvoicePurchase.purchase_no}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => window.print()} 
                  className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-300 text-xs flex items-center gap-1.5 transition-all"
                >
                  <Printer className="w-4 h-4" /> Print
                </button>
                <button 
                  onClick={() => setViewInvoicePurchase(null)}
                  className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                <div>
                  <p className="text-[11px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" /> Supplier Details
                  </p>
                  <p className="text-sm font-bold text-white mt-1">{viewInvoicePurchase.supplier?.name || 'N/A'}</p>
                  <p className="text-xs text-slate-400">{viewInvoicePurchase.supplier?.phone || 'No Contact'}</p>
                </div>

                <div>
                  <p className="text-[11px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Receiving Warehouse
                  </p>
                  <p className="text-sm font-bold text-white mt-1">{viewInvoicePurchase.warehouse?.name || 'N/A'}</p>
                  <p className="text-xs text-slate-400">Ref: {viewInvoicePurchase.reference_no || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[11px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Personnel & Audit
                  </p>
                  <p className="text-xs text-slate-300 mt-1">Creator: <strong className="text-white">{viewInvoicePurchase.creator?.name || viewInvoicePurchase.created_by_user?.name || 'N/A'}</strong></p>
                  <p className="text-xs text-slate-400">Receiver: {viewInvoicePurchase.received_by_user?.name || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-[11px] text-slate-500 uppercase font-semibold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-purple-400" /> Dates & Currency
                  </p>
                  <p className="text-xs text-slate-300 mt-1">Date: {viewInvoicePurchase.purchase_date || 'N/A'}</p>
                  <p className="text-xs text-slate-400">Currency: {viewInvoicePurchase.currency_code || 'BDT'}</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Purchased Items Breakdown</h3>
                <div className="border border-slate-800 rounded-2xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3 text-right">Ordered Qty</th>
                        <th className="p-3 text-right">Unit Price</th>
                        <th className="p-3 text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/40">
                      {viewInvoicePurchase.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-3 font-medium text-white">{item.product?.name || `Product #${item.product_id}`}</td>
                          <td className="p-3 text-right font-mono text-slate-300">{item.ordered_quantity}</td>
                          <td className="p-3 text-right font-mono text-slate-300">৳ {Number(item.unit_price).toFixed(2)}</td>
                          <td className="p-3 text-right font-mono font-bold text-white">৳ {Number(item.sub_total || (item.ordered_quantity * item.unit_price)).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Subtotal:</span>
                    <span className="font-mono text-slate-200">৳ {Number(viewInvoicePurchase.sub_total || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Tax Amount:</span>
                    <span className="font-mono text-slate-200">৳ {Number(viewInvoicePurchase.tax_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Shipping Cost:</span>
                    <span className="font-mono text-slate-200">৳ {Number(viewInvoicePurchase.shipping_cost || 0).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold text-white">
                    <span>Grand Total:</span>
                    <span className="font-mono text-emerald-400">৳ {Number(viewInvoicePurchase.grand_total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Paid Amount:</span>
                    <span className="font-mono text-emerald-400">৳ {Number(viewInvoicePurchase.paid_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>Due Balance:</span>
                    <span className="font-mono text-rose-400">৳ {Number(viewInvoicePurchase.due_amount || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activityLogPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full p-6 space-y-6 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                <h2 className="text-base font-bold text-white">System Audit & Activity Log</h2>
              </div>
              <button 
                onClick={() => setActivityLogPurchase(null)}
                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <p className="text-slate-400">Target PO Number: <strong className="text-blue-400">{activityLogPurchase.purchase_no}</strong></p>
                <p className="text-slate-500 mt-0.5">Record Timestamp: {activityLogPurchase.created_at || 'N/A'}</p>
              </div>

              <div className="relative border-l-2 border-slate-800 left-3 space-y-6 pl-6 py-2">
                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-blue-500 border-4 border-slate-900" />
                  <p className="text-xs font-bold text-white">PO Created</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Created by: <span className="text-blue-400 font-semibold">{activityLogPurchase.creator?.name || activityLogPurchase.created_by_user?.name || 'N/A'}</span>
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">System Automated Log</span>
                </div>

                <div className="relative">
                  <div className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-4 border-slate-900 ${activityLogPurchase.status === 'received' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <p className="text-xs font-bold text-white">Goods Receiving Status (GRN)</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Current Status: <span className="text-amber-400 font-semibold uppercase">{activityLogPurchase.status.replace('_', ' ')}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Received / Handled by: <span className="text-emerald-400 font-semibold">{activityLogPurchase.received_by_user?.name || 'Pending'}</span>
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full bg-purple-500 border-4 border-slate-900" />
                  <p className="text-xs font-bold text-white">Payment Status Audit</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Current Payment: <span className="text-emerald-400 font-semibold uppercase">{activityLogPurchase.payment_status}</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Total Paid: <span className="text-white font-mono">৳ {Number(activityLogPurchase.paid_amount || 0).toFixed(2)}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}