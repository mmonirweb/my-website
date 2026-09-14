'use client';

import { useState } from 'react';
import { 
  X, 
  PackageCheck, 
  Loader2, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Hash, 
  Warehouse, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  MapPin,
  Truck
} from 'lucide-react';

import { usePurchases } from '../hooks/usePurchases';

export interface Supplier {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  current_balance: number;
}

export interface WarehouseModel {
  id: number;
  name: string;
  code?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  cost_price?: number;
  purchase_price?: number;
  unit?: string;
  stock_quantity?: number;
}

export interface PurchaseItem {
  id?: number;
  purchase_id?: number;
  product_id: number;
  product?: Product;
  ordered_quantity: number;
  received_quantity?: number;
  unit_price: number;
  discount_amount?: number;
  tax_rate?: number;
  tax_amount?: number;
  landed_cost_share?: number;
  sub_total?: number;
  batch_number?: string;
  expiry_date?: string;
}

export interface GoodsReceivedNoteItem {
  purchase_item_id: number;
  product_id: number;
  received_quantity: number;
  passed_quantity?: number;
  rejected_quantity?: number;
  rejection_reason?: string;
  storage_location?: string;
  batch_number?: string;
  expiry_date?: string;
}

export interface GoodsReceivedNotePayload {
  purchase_id: number;
  warehouse_id: number;
  supplier_challan_no?: string;
  vehicle_no?: string;
  inspector_name?: string;
  received_date: string;
  received_by?: number;
  remarks?: string;
  items: GoodsReceivedNoteItem[];
}

export interface Purchase {
  id: number;
  purchase_no: string;
  reference_no?: string;
  supplier_id: number;
  supplier?: Supplier;
  warehouse_id: number;
  warehouse?: WarehouseModel;
  purchase_date: string;
  expected_delivery_date?: string;
  payment_due_date?: string;
  currency_code: string;
  exchange_rate: number;
  sub_total: number;
  discount_amount: number;
  tax_amount: number;
  shipping_cost: number;
  other_charges: number;
  grand_total: number;
  paid_amount: number;
  due_amount: number;
  status: 'draft' | 'pending_approval' | 'ordered' | 'partial_received' | 'received' | 'cancelled';
  payment_status: 'unpaid' | 'partial' | 'paid' | 'advance';
  items: PurchaseItem[];
  created_at?: string;
}

interface ReceiveGoodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchase: Purchase;
  onSuccess: () => void;
  currentUserId?: number;
}

export default function ReceiveGoodsModal({
  isOpen,
  onClose,
  purchase,
  onSuccess,
  currentUserId,
}: ReceiveGoodsModalProps) {
  const { receiveGoodsMutation } = usePurchases();

  const [supplierChallanNo, setSupplierChallanNo] = useState('');
  const [receivedDate, setReceivedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [vehicleNo, setVehicleNo] = useState('');
  const [inspectorName, setInspectorName] = useState('');
  const [remarks, setRemarks] = useState('');

  const [receivedItems, setReceivedItems] = useState(() =>
    purchase.items.map((item: PurchaseItem) => {
      const remaining = Number(item.ordered_quantity) - Number(item.received_quantity || 0);
      return {
        purchase_item_id: item.id!,
        product_id: item.product_id,
        product_name: item.product?.name || `Product #${item.product_id}`,
        ordered_quantity: Number(item.ordered_quantity),
        already_received: Number(item.received_quantity || 0),
        receiving_quantity: remaining > 0 ? remaining : 0,
        passed_quantity: remaining > 0 ? remaining : 0,
        rejected_quantity: 0,
        rejection_reason: '',
        storage_location: '',
        batch_number: item.batch_number || '',
        expiry_date: item.expiry_date || '',
      };
    })
  );

  if (!isOpen) return null;

  const handleQtyChange = (index: number, field: string, value: any) => {
    setReceivedItems((prev) => {
      const updated = [...prev];
      const currentItem = { ...updated[index], [field]: value };

      if (field === 'receiving_quantity' || field === 'rejected_quantity') {
        const recv = Number(field === 'receiving_quantity' ? value : currentItem.receiving_quantity) || 0;
        const rej = Number(field === 'rejected_quantity' ? value : currentItem.rejected_quantity) || 0;
        currentItem.passed_quantity = Math.max(0, recv - rej);
      }

      updated[index] = currentItem;
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payloadItems = receivedItems
      .filter((item) => Number(item.receiving_quantity) > 0)
      .map((item) => ({
        purchase_item_id: item.purchase_item_id,
        product_id: item.product_id,
        received_quantity: Number(item.receiving_quantity) || 0,
        passed_quantity: Number(item.passed_quantity) || 0,
        rejected_quantity: Number(item.rejected_quantity) || 0,
        rejection_reason: item.rejection_reason.trim() || undefined,
        storage_location: item.storage_location.trim() || undefined,
        batch_number: item.batch_number.trim() || undefined,
        expiry_date: item.expiry_date || undefined,
      }));

    if (payloadItems.length === 0) {
      alert('Please enter at least one valid receiving quantity.');
      return;
    }

    try {
      await receiveGoodsMutation.mutateAsync({
        purchase_id: purchase.id,
        warehouse_id: purchase.warehouse_id,
        supplier_challan_no: supplierChallanNo.trim() || undefined,
        vehicle_no: vehicleNo.trim() || undefined,
        inspector_name: inspectorName.trim() || undefined,
        received_date: receivedDate,
        received_by: currentUserId || undefined,
        remarks: remarks.trim() || undefined,
        items: payloadItems,
      } as any);

      onSuccess();
      onClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to process GRN received items.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 text-slate-100 w-full max-w-6xl rounded-3xl border border-slate-800 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden">
        
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/20">
              <PackageCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">Goods Received Note (GRN)</h2>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Industrial QC & Gate Lock
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>PO Ref: <strong className="text-blue-400">{purchase.purchase_no}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Warehouse className="w-3.5 h-3.5 text-slate-400" /> 
                  Warehouse: <strong className="text-slate-200">{purchase.warehouse?.name || `ID #${purchase.warehouse_id}`}</strong>
                </span>
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-blue-400" /> Challan / Invoice No
              </label>
              <input
                type="text"
                placeholder="e.g. CHN-2026-9901"
                value={supplierChallanNo}
                onChange={(e) => setSupplierChallanNo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-400" /> Vehicle No
              </label>
              <input
                type="text"
                placeholder="e.g. DHAKA-METRO-T-11"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Received Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                required
                value={receivedDate}
                onChange={(e) => setReceivedDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> QC Inspector
              </label>
              <input
                type="text"
                placeholder="Inspector Name"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" /> Remarks
              </label>
              <input
                type="text"
                placeholder="Gate notes..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Quality Control & Stock Allocation
              </h3>
            </div>

            <div className="space-y-4">
              {receivedItems.map((item, index) => {
                const maxAllowed = item.ordered_quantity - item.already_received;
                const isOverReceived = Number(item.receiving_quantity) > maxAllowed;

                return (
                  <div 
                    key={index} 
                    className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs space-y-3 hover:border-slate-700/80 transition-all"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5">
                      <div>
                        <span className="font-bold text-white text-sm block">{item.product_name}</span>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                          <span>PO Qty: <strong className="text-slate-200">{item.ordered_quantity}</strong></span>
                          <span>•</span>
                          <span>Prev Recv: <strong className="text-slate-200">{item.already_received}</strong></span>
                          <span>•</span>
                          <span>Max Recv Limit: <strong className="text-amber-400">{Math.max(0, maxAllowed)}</strong></span>
                        </div>
                      </div>

                      {isOverReceived && (
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20">
                          <AlertTriangle className="w-3.5 h-3.5" /> Exceeds Max Limit
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                      <div>
                        <label className="block text-[10px] text-cyan-400 font-bold mb-1">
                          Receiving Qty <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={maxAllowed}
                          step="0.001"
                          value={item.receiving_quantity}
                          onChange={(e) => handleQtyChange(index, 'receiving_quantity', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-emerald-400 font-bold mb-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Passed Qty
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.001"
                          value={item.passed_quantity}
                          onChange={(e) => handleQtyChange(index, 'passed_quantity', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-rose-400 font-bold mb-1 flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Rejected Qty
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.001"
                          value={item.rejected_quantity}
                          onChange={(e) => handleQtyChange(index, 'rejected_quantity', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-rose-400 font-semibold focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                          Batch / Lot No
                        </label>
                        <input
                          type="text"
                          placeholder="BATCH-X"
                          value={item.batch_number}
                          onChange={(e) => handleQtyChange(index, 'batch_number', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 font-semibold mb-1">
                          Expiry Date
                        </label>
                        <input
                          type="date"
                          value={item.expiry_date}
                          onChange={(e) => handleQtyChange(index, 'expiry_date', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400" /> Bin Location
                        </label>
                        <input
                          type="text"
                          placeholder="Rack-A-01"
                          value={item.storage_location}
                          onChange={(e) => handleQtyChange(index, 'storage_location', e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-amber-300 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    {Number(item.rejected_quantity) > 0 && (
                      <div className="pt-2">
                        <input
                          type="text"
                          placeholder="State the reason for quality rejection..."
                          value={item.rejection_reason}
                          onChange={(e) => handleQtyChange(index, 'rejection_reason', e.target.value)}
                          className="w-full bg-rose-950/20 border border-rose-900/40 rounded-xl px-3 py-1.5 text-xs text-rose-300 placeholder-rose-400/50 focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <span className="text-[11px] text-slate-500 hidden sm:inline-block">
              * Verification will generate GRN and update physical stock & vendor ledgers.
            </span>
            <div className="flex gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={receiveGoodsMutation.isPending}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
              >
                {receiveGoodsMutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                Confirm & Post GRN
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
}