'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { usePurchaseReturns } from '../hooks/usePurchaseReturns';
import {
  X,
  PackagePlus,
  Trash2,
  Calendar,
  Warehouse as WarehouseIcon,
  UserCheck,
  FileText,
  AlertCircle,
  Loader2,
  Plus,
  Search,
  ChevronDown,
  Check,
  Printer,
} from 'lucide-react';

interface CustomSelectOption {
  id: number | string;
  label: string;
  subLabel?: string;
}

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

function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  icon,
  disabled = false,
}: {
  options: CustomSelectOption[];
  value: number | string;
  onChange: (value: number | string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.id) === String(value));

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(term))
    );
  }, [options, searchTerm]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white flex items-center justify-between cursor-pointer transition-all hover:border-slate-700 ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${isOpen ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <span className="text-slate-400">{icon}</span>}
          <span className={selectedOption ? 'text-white font-medium' : 'text-slate-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 z-[9999] mt-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-slate-800 bg-slate-950/50 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs text-white focus:outline-none placeholder:text-slate-500"
            />
          </div>
          <div className="overflow-y-auto flex-1 p-1 scrollbar-thin scrollbar-thumb-slate-800 max-h-48">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-500">No results found</div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.id) === String(value);
                return (
                  <div
                    key={opt.id}
                    onClick={() => {
                      onChange(opt.id);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-blue-600/20 text-blue-400 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <div className="flex flex-col truncate">
                      <span>{opt.label}</span>
                      {opt.subLabel && <span className="text-[10px] text-slate-500">{opt.subLabel}</span>}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// প্রিন্ট ফাংশনালিটি helper
export const triggerReturnPrint = (returnData: any) => {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const itemsHtml = (returnData.items || [])
    .map(
      (item: any, idx: number) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${idx + 1}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">${item.product_name || item.name || `Product #${item.product_id}`}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right;">$${Number(item.unit_price).toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; text-align: right; font-weight: bold;">$${(Number(item.quantity) * Number(item.unit_price)).toFixed(2)}</td>
      </tr>
    `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Purchase Return Receipt - ${returnData.return_no || 'RET'}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; padding: 20px; font-size: 12px; }
          .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
          .title { font-size: 20px; font-weight: bold; color: #2563eb; text-transform: uppercase; margin: 0; }
          .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
          .grid { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .col { flex: 1; }
          .box { background: #f8fafc; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #f1f5f9; color: #334155; padding: 8px; font-weight: 600; text-align: left; border-bottom: 2px solid #cbd5e1; }
          .total-box { margin-top: 20px; text-align: right; margin-left: auto; width: 250px; }
          .total-row { display: flex; justify-content: space-between; padding: 4px 0; }
          .grand-total { font-weight: bold; font-size: 14px; border-top: 2px solid #2563eb; padding-top: 6px; color: #2563eb; }
          .footer { text-align: center; margin-top: 40px; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px; }
          .badge { background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; font-weight: 600; font-size: 10px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">Purchase Return Invoice</h1>
          <div class="subtitle">Official Inventory Return Voucher</div>
        </div>

        <div class="grid">
          <div class="col box" style="margin-right: 10px;">
            <p style="margin:2px 0;"><strong>Return No:</strong> <span class="badge">${returnData.return_no || `#RET-${returnData.id || 'NEW'}`}</span></p>
            <p style="margin:2px 0;"><strong>Return Date:</strong> ${returnData.return_date || new Date().toISOString().split('T')[0]}</p>
            <p style="margin:2px 0;"><strong>Returned By (User):</strong> <span style="color:#0284c7; font-weight:bold;">${returnData.returned_by || 'Current User'}</span></p>
          </div>
          <div class="col box">
            <p style="margin:2px 0;"><strong>Supplier:</strong> ${returnData.supplier_name || 'N/A'}</p>
            <p style="margin:2px 0;"><strong>Warehouse:</strong> ${returnData.warehouse_name || 'Main Warehouse'}</p>
            <p style="margin:2px 0;"><strong>Reason:</strong> ${returnData.reason || 'N/A'}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="text-align: center; width: 40px;">#</th>
              <th>Item Description</th>
              <th style="text-align: center; width: 80px;">Qty</th>
              <th style="text-align: right; width: 100px;">Unit Price</th>
              <th style="text-align: right; width: 110px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="total-box">
          <div class="total-row"><span>Subtotal:</span> <span>$${Number(returnData.subtotal || 0).toFixed(2)}</span></div>
          <div class="total-row"><span>Tax (+):</span> <span>$${Number(returnData.tax_amount || 0).toFixed(2)}</span></div>
          <div class="total-row"><span>Discount (-):</span> <span>$${Number(returnData.discount_amount || 0).toFixed(2)}</span></div>
          <div class="total-row grand-total"><span>Net Total:</span> <span>$${Number(returnData.net_amount || 0).toFixed(2)}</span></div>
        </div>

        <div style="margin-top: 40px; display: flex; justify-content: space-between; text-align: center;">
          <div style="width: 150px; border-top: 1px dashed #64748b; padding-top: 5px;">Authorized Signature</div>
          <div style="width: 150px; border-top: 1px dashed #64748b; padding-top: 5px;">Supplier Stamp</div>
        </div>

        <div class="footer">
          Generated automatically by System on ${new Date().toLocaleString()}
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => {
    printWindow.print();
  }, 500);
};

interface ItemRow {
  product_id: number | string;
  unit_price: number | '';
  quantity: number | '';
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  suppliers?: any;
  warehouses?: any;
  products?: any;
  currentUser?: { name: string; email?: string } | null;
}

export const CreatePurchaseReturnModal: React.FC<Props> = ({
  isOpen,
  onClose,
  suppliers = [],
  warehouses = [],
  products = [],
  currentUser = { name: 'Admin / Operator' },
}) => {
  const safeSuppliers = useMemo(() => extractArray(suppliers), [suppliers]);
  const safeWarehouses = useMemo(() => extractArray(warehouses), [warehouses]);
  const safeProducts = useMemo(() => extractArray(products), [products]);

  const { createReturn, isCreating } = usePurchaseReturns();

  const [supplierId, setSupplierId] = useState<number | string>('');
  const [warehouseId, setWarehouseId] = useState<number | string>('');
  const [returnDate, setReturnDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [taxAmount, setTaxAmount] = useState<number | ''>(0);
  const [discountAmount, setDiscountAmount] = useState<number | ''>(0);
  const [reason, setReason] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [autoPrint, setAutoPrint] = useState<boolean>(true);

  const [items, setItems] = useState<ItemRow[]>([
    { product_id: '', unit_price: '', quantity: 1 },
  ]);

  const supplierOptions = useMemo(() => {
    return safeSuppliers.map((s: any) => ({
      id: s.id ?? s._id,
      label: s.name || s.supplier_name || 'Unnamed Supplier',
      subLabel: s.phone ? `Phone: ${s.phone}` : undefined,
    }));
  }, [safeSuppliers]);

  const warehouseOptions = useMemo(() => {
    return safeWarehouses.map((w: any) => ({
      id: w.id ?? w._id,
      label: w.name || w.warehouse_name || 'Main Warehouse',
      subLabel: w.code ? `Code: ${w.code}` : undefined,
    }));
  }, [safeWarehouses]);

  const productOptions = useMemo(() => {
    return safeProducts.map((p: any) => {
      const availableStock =
        p.stock_quantity ??
        p.stock ??
        p.qty ??
        p.quantity ??
        p.current_stock ??
        0;

      const skuText = p.sku ? `SKU: ${p.sku} | ` : '';

      return {
        id: p.id ?? p._id,
        label: p.name || p.title || 'Unnamed Product',
        subLabel: `${skuText}Stock: ${availableStock}`,
      };
    });
  }, [safeProducts]);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg('');
      setSupplierId('');
      setWarehouseId('');
      setReturnDate(new Date().toISOString().split('T')[0]);
      setTaxAmount(0);
      setDiscountAmount(0);
      setReason('');
      setItems([{ product_id: '', unit_price: '', quantity: 1 }]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [...prev, { product_id: '', unit_price: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleProductSelect = (index: number, selectedProdId: number | string) => {
    if (!selectedProdId) {
      setItems((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], product_id: '', unit_price: '' };
        return updated;
      });
      return;
    }

    const selectedProd = safeProducts.find(
      (p: any) => String(p.id ?? p._id) === String(selectedProdId)
    );

    const autoPrice =
      selectedProd?.cost_price ??
      selectedProd?.purchase_price ??
      selectedProd?.price ??
      0;

    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        product_id: selectedProdId,
        unit_price: autoPrice,
      };
      return updated;
    });
  };

  const handleItemChange = (index: number, field: keyof ItemRow, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const subtotal = items.reduce((sum, item) => {
    const price = typeof item.unit_price === 'number' ? item.unit_price : 0;
    const qty = Number(item.quantity) || 0;
    return sum + price * qty;
  }, 0);

  const parsedTax = Number(taxAmount) || 0;
  const parsedDiscount = Number(discountAmount) || 0;
  const netTotal = Math.max(0, subtotal + parsedTax - parsedDiscount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!supplierId) {
      setErrorMsg('Please select a supplier.');
      return;
    }
    if (!warehouseId) {
      setErrorMsg('Please select a warehouse.');
      return;
    }
    if (items.some((i) => !i.product_id || Number(i.quantity) <= 0)) {
      setErrorMsg('Please select valid products and valid quantities for all items.');
      return;
    }

    const selectedSupplier = safeSuppliers.find(s => String(s.id ?? s._id) === String(supplierId));
    const selectedWarehouse = safeWarehouses.find(w => String(w.id ?? w._id) === String(warehouseId));

    const payload = {
      supplier_id: Number(supplierId),
      warehouse_id: Number(warehouseId),
      return_date: returnDate,
      tax_amount: parsedTax,
      discount_amount: parsedDiscount,
      reason,
      items: items.map((i) => ({
        product_id: Number(i.product_id),
        unit_price: Number(i.unit_price) || 0,
        quantity: Number(i.quantity) || 1,
      })),
    };

    try {
      const res: any = await createReturn(payload);
      
      // Auto Print Trigger
      if (autoPrint) {
        const returnedItemDetails = items.map((i) => {
          const prod = safeProducts.find((p) => String(p.id ?? p._id) === String(i.product_id));
          return {
            product_id: i.product_id,
            product_name: prod?.name || prod?.title || `Product #${i.product_id}`,
            quantity: i.quantity,
            unit_price: i.unit_price,
          };
        });

        triggerReturnPrint({
          id: res?.id || res?.data?.id || 'NEW',
          return_no: res?.return_no || res?.data?.return_no || `RET-${Date.now().toString().slice(-6)}`,
          return_date: returnDate,
          supplier_name: selectedSupplier?.name || selectedSupplier?.supplier_name || 'N/A',
          warehouse_name: selectedWarehouse?.name || selectedWarehouse?.warehouse_name || 'Main Warehouse',
          returned_by: currentUser?.name || 'System User',
          reason: reason || 'N/A',
          items: returnedItemDetails,
          subtotal,
          tax_amount: parsedTax,
          discount_amount: parsedDiscount,
          net_amount: netTotal,
        });
      }

      onClose();
    } catch (err: any) {
      setErrorMsg(
        err?.response?.data?.message || err?.message || 'Failed to process purchase return.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 text-slate-100 rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-wide">
                New Purchase Return
              </h3>
              <p className="text-xs text-slate-400">
                Returned by: <span className="text-blue-400 font-semibold">{currentUser?.name || 'Authorized User'}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-400 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Supplier Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                Supplier <span className="text-rose-400">*</span>
              </label>
              <SearchableSelect
                options={supplierOptions}
                value={supplierId}
                onChange={(val) => setSupplierId(val)}
                placeholder="Select Supplier"
                icon={<UserCheck className="w-4 h-4" />}
              />
            </div>

            {/* Warehouse Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <WarehouseIcon className="w-3.5 h-3.5 text-blue-400" />
                Warehouse <span className="text-rose-400">*</span>
              </label>
              <SearchableSelect
                options={warehouseOptions}
                value={warehouseId}
                onChange={(val) => setWarehouseId(val)}
                placeholder="Select Warehouse"
                icon={<WarehouseIcon className="w-4 h-4" />}
              />
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                Return Date <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-none focus:border-blue-500 transition-colors"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Product Items Table */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Return Items List
            </h4>

            <div className="border border-slate-800 rounded-2xl overflow-visible bg-slate-950/40">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3">Product Name</th>
                    <th className="p-3 w-28">Quantity</th>
                    <th className="p-3 w-32">Unit Price</th>
                    <th className="p-3 w-32 text-right">Subtotal</th>
                    <th className="p-3 w-14 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {items.map((item, index) => {
                    const rowSubtotal =
                      (Number(item.quantity) || 0) * (Number(item.unit_price) || 0);

                    return (
                      <tr key={index} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-2.5 relative">
                          <SearchableSelect
                            options={productOptions}
                            value={item.product_id}
                            onChange={(val) => handleProductSelect(index, val)}
                            placeholder="Select Product"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="1"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'quantity',
                                e.target.value === '' ? '' : Number(e.target.value)
                              )
                            }
                            required
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                            value={item.unit_price}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                'unit_price',
                                e.target.value === '' ? '' : Number(e.target.value)
                              )
                            }
                            placeholder="0.00"
                            required
                          />
                        </td>
                        <td className="p-2.5 text-right font-bold text-slate-100">
                          {rowSubtotal.toFixed(2)}
                        </td>
                        <td className="p-2.5 text-center">
                          {items.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <div className="p-2.5 bg-slate-900/60 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 px-3 py-1.5 rounded-lg hover:bg-blue-500/10 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Product Line
                </button>
              </div>
            </div>
          </div>

          {/* Totals & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                Reason / Note
              </label>
              <textarea
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500 transition-colors h-28 resize-none"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the reason for this purchase return..."
              />
            </div>

            <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-200">{subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Tax (+)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-28 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-right text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  value={taxAmount}
                  onChange={(e) =>
                    setTaxAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400">
                <span>Discount (-)</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-28 bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-right text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                  value={discountAmount}
                  onChange={(e) =>
                    setDiscountAmount(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />
              </div>

              <div className="flex justify-between text-sm font-bold text-white border-t border-slate-800 pt-2.5">
                <span>Net Return Total</span>
                <span className="text-blue-400">${netTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPrint}
                onChange={(e) => setAutoPrint(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 bg-slate-950 border-slate-800 focus:ring-blue-500 focus:ring-offset-slate-900"
              />
              <Printer className="w-3.5 h-3.5 text-slate-400" /> Auto print invoice on submit
            </label>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2 transition-all"
              >
                {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                {isCreating ? 'Processing...' : 'Submit Return'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};