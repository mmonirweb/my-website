'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  Loader2, 
  Search, 
  ChevronDown, 
  Check, 
  Building2, 
  Warehouse, 
  Sparkles
} from 'lucide-react';
import { usePurchases } from '../hooks/usePurchases';
import { useSuppliers } from '../hooks/useSuppliers';
import { useWarehouses } from '../../inventory/hooks/useInventory';
import { useProducts } from '../../catalog/hooks/useCatalog';

interface CreatePurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PurchaseItemState {
  product_id: number | '';
  ordered_quantity: number | '';
  unit_price: number | '';
  discount_amount: number | '';
  tax_rate: number | '';
  uom: string;
}

const extractArray = (response: any): any[] => {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.data)) return response.data.data;
  if (Array.isArray(response.items)) return response.items;
  return [];
};

interface CustomSelectOption {
  id: number | string;
  label: string;
  subLabel?: string;
}

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
        <div className="absolute z-50 mt-1 w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl max-h-60 overflow-hidden flex flex-col">
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
          <div className="overflow-y-auto flex-1 p-1 scrollbar-thin scrollbar-thumb-slate-800">
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

export default function CreatePurchaseModal({ isOpen, onClose }: CreatePurchaseModalProps) {
  const { createPurchaseMutation } = usePurchases();
  const suppliersQuery = useSuppliers();
  const warehousesQuery = useWarehouses();
  const productsQuery = useProducts();

  const suppliers = useMemo(() => extractArray(suppliersQuery?.data), [suppliersQuery?.data]);
  const warehouses = useMemo(() => extractArray(warehousesQuery?.data), [warehousesQuery?.data]);
  const products = useMemo(() => extractArray(productsQuery?.data), [productsQuery?.data]);

  const isLoadingData = suppliersQuery.isLoading || warehousesQuery.isLoading || productsQuery.isLoading;

  const generatePONumber = () => {
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    return `PO-${today}-${randomDigits}`;
  };

  // Header & Meta Form States
  const [supplierId, setSupplierId] = useState<number | ''>('');
  const [warehouseId, setWarehouseId] = useState<number | ''>('');
  const [referenceNo, setReferenceNo] = useState(() => generatePONumber());
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [paymentDueDate, setPaymentDueDate] = useState('');
  const [currencyCode, setCurrencyCode] = useState('BDT');
  const [exchangeRate, setExchangeRate] = useState<number | ''>(1);
  const [incoterm, setIncoterm] = useState('FOB');
  const [paymentTerm, setPaymentTerm] = useState('Net 30');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'lc' | 'mobile_banking'>('bank');
  const [status, setStatus] = useState<'draft' | 'pending_approval' | 'ordered' | 'received'>('ordered');

  // Amounts
  const [discountAmount, setDiscountAmount] = useState<number | ''>(0);
  const [taxAmount, setTaxAmount] = useState<number | ''>(0);
  const [shippingCost, setShippingCost] = useState<number | ''>(0);
  const [otherCharges, setOtherCharges] = useState<number | ''>(0);
  const [paidAmount, setPaidAmount] = useState<number | ''>(0);

  // Notes & Docs
  const [notes, setNotes] = useState('');
  const [supplierNotes, setSupplierNotes] = useState('');
  const [termsConditions, setTermsConditions] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);

  // Items State (Batch and Expiry removed, UOM added)
  const [items, setItems] = useState<PurchaseItemState[]>([
    { product_id: '', ordered_quantity: 1, unit_price: 0, discount_amount: 0, tax_rate: 0, uom: 'Pcs' },
  ]);

  const supplierOptions = useMemo(() => {
    return suppliers.map((s: any) => ({
      id: s.id ?? s._id,
      label: s.name || s.supplier_name || 'Unnamed Supplier',
      subLabel: s.phone ? `Phone: ${s.phone}` : undefined,
    }));
  }, [suppliers]);

  const warehouseOptions = useMemo(() => {
    return warehouses.map((w: any) => ({
      id: w.id ?? w._id,
      label: w.name || w.warehouse_name || 'Main Warehouse',
      subLabel: w.code ? `Code: ${w.code}` : undefined,
    }));
  }, [warehouses]);

  const productOptions = useMemo(() => {
    return products.map((p: any) => ({
      id: p.id ?? p._id,
      label: p.name || p.title || 'Unnamed Product',
      subLabel: p.sku ? `SKU: ${p.sku} | Stock: ${p.stock_quantity ?? 0}` : undefined,
    }));
  }, [products]);

  // Calculations
  const subTotal = useMemo(() => {
    return items.reduce((acc, item) => {
      const qty = typeof item.ordered_quantity === 'number' ? item.ordered_quantity : 0;
      const price = typeof item.unit_price === 'number' ? item.unit_price : 0;
      const disc = typeof item.discount_amount === 'number' ? item.discount_amount : 0;
      const taxRate = typeof item.tax_rate === 'number' ? item.tax_rate : 0;
      
      const lineBase = (qty * price) - disc;
      const lineTax = (lineBase * taxRate) / 100;
      return acc + lineBase + lineTax;
    }, 0);
  }, [items]);

  const numDiscount = typeof discountAmount === 'number' ? discountAmount : 0;
  const numTax = typeof taxAmount === 'number' ? taxAmount : 0;
  const numShipping = typeof shippingCost === 'number' ? shippingCost : 0;
  const numOther = typeof otherCharges === 'number' ? otherCharges : 0;
  const numPaid = typeof paidAmount === 'number' ? paidAmount : 0;

  const grandTotal = Math.max(0, subTotal - numDiscount + numTax + numShipping + numOther);
  const dueAmount = Math.max(0, grandTotal - numPaid);

  if (!isOpen) return null;

  const resetForm = () => {
    setSupplierId('');
    setWarehouseId('');
    setReferenceNo(generatePONumber());
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setExpectedDeliveryDate('');
    setPaymentDueDate('');
    setCurrencyCode('BDT');
    setExchangeRate(1);
    setIncoterm('FOB');
    setPaymentTerm('Net 30');
    setPaymentMethod('bank');
    setStatus('ordered');
    setDiscountAmount(0);
    setTaxAmount(0);
    setShippingCost(0);
    setOtherCharges(0);
    setPaidAmount(0);
    setNotes('');
    setSupplierNotes('');
    setTermsConditions('');
    setAttachment(null);
    setItems([{ product_id: '', ordered_quantity: 1, unit_price: 0, discount_amount: 0, tax_rate: 0, uom: 'Pcs' }]);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAddItem = () => {
    setItems((prev) => [...prev, { product_id: '', ordered_quantity: 1, unit_price: 0, discount_amount: 0, tax_rate: 0, uom: 'Pcs' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: keyof PurchaseItemState, value: any) => {
    setItems((prevItems) => {
      const updated = [...prevItems];
      if (field === 'product_id') {
        const selectedProdId = value === '' ? '' : Number(value);
        const selectedProduct = products.find((p: any) => String(p.id ?? p._id) === String(selectedProdId));
        const defaultPrice = selectedProduct?.cost_price ?? selectedProduct?.purchase_price ?? selectedProduct?.price ?? 0;
        const defaultUom = selectedProduct?.unit || selectedProduct?.uom || 'Pcs';

        updated[index] = {
          ...updated[index],
          product_id: selectedProdId,
          unit_price: Number(defaultPrice),
          uom: defaultUom,
        };
      } else if (field === 'uom') {
        updated[index] = { ...updated[index], uom: value };
      } else {
        const numVal = value === '' ? '' : Math.max(0, Number(value));
        updated[index] = { ...updated[index], [field]: numVal };
      }
      return updated;
    });
  };

  const handlePrintPurchaseOrder = (purchaseData: any) => {
    const selectedSupplier = suppliers.find((s: any) => String(s.id ?? s._id) === String(supplierId));
    const selectedWarehouse = warehouses.find((w: any) => String(w.id ?? w._id) === String(warehouseId));

    const poNo = purchaseData?.purchase_no || referenceNo || 'PO-DRAFT';
    const printWindow = window.open('', '_blank', 'width=900,height=800');

    if (!printWindow) return;

    const itemsRowsHtml = items.map((item, idx) => {
      const prod = products.find((p: any) => String(p.id ?? p._id) === String(item.product_id));
      const qty = Number(item.ordered_quantity) || 0;
      const price = Number(item.unit_price) || 0;
      const disc = Number(item.discount_amount) || 0;
      const taxRate = Number(item.tax_rate) || 0;
      const base = (qty * price) - disc;
      const lineTotal = base + ((base * taxRate) / 100);

      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${idx + 1}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${prod?.name || 'Product #' + item.product_id}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${qty} ${item.uom}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${currencyCode} ${price.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${currencyCode} ${disc.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${taxRate}%</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">${currencyCode} ${lineTotal.toFixed(2)}</td>
        </tr>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Purchase Order - ${poNo}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; }
            .title { font-size: 24px; font-weight: bold; color: #1e40af; }
            .info-grid { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
            .info-box { width: 48%; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 20px; }
            th { background-color: #f1f5f9; padding: 8px; border: 1px solid #ddd; text-align: left; }
            .totals { width: 300px; margin-left: auto; font-size: 13px; border-collapse: collapse; }
            .totals td { padding: 6px; border-bottom: 1px solid #eee; }
            .grand-total { font-weight: bold; font-size: 15px; color: #1e40af; border-top: 2px solid #2563eb; }
            .footer { margin-top: 40px; font-size: 11px; text-align: center; color: #666; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">PURCHASE ORDER</div>
              <div style="font-size: 12px; color: #555;">Ref No: <strong>${poNo}</strong></div>
            </div>
            <div style="text-align: right; font-size: 12px;">
              <div>Date: <strong>${purchaseDate}</strong></div>
              <div>Status: <span style="text-transform: uppercase;">${status}</span></div>
            </div>
          </div>

          <div class="info-grid">
            <div class="info-box">
              <strong style="color: #2563eb;">SUPPLIER DETAILS:</strong><br/>
              <strong>${selectedSupplier?.name || selectedSupplier?.supplier_name || 'N/A'}</strong><br/>
              ${selectedSupplier?.phone ? `Phone: ${selectedSupplier.phone}<br/>` : ''}
              Payment Method: ${paymentMethod.toUpperCase()}
            </div>
            <div class="info-box">
              <strong style="color: #2563eb;">DELIVERY TO (WAREHOUSE):</strong><br/>
              <strong>${selectedWarehouse?.name || selectedWarehouse?.warehouse_name || 'N/A'}</strong><br/>
              Expected Delivery: ${expectedDeliveryDate || 'N/A'}<br/>
              Incoterm: ${incoterm}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 40px; text-align: center;">#</th>
                <th>Product</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Discount</th>
                <th style="text-align: right;">VAT</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRowsHtml}
            </tbody>
          </table>

          <table class="totals">
            <tr>
              <td>Subtotal:</td>
              <td style="text-align: right;">${currencyCode} ${subTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Order Discount:</td>
              <td style="text-align: right;">- ${currencyCode} ${numDiscount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Tax / VAT:</td>
              <td style="text-align: right;">+ ${currencyCode} ${numTax.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Shipping / Freight:</td>
              <td style="text-align: right;">+ ${currencyCode} ${numShipping.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Other Charges:</td>
              <td style="text-align: right;">+ ${currencyCode} ${numOther.toFixed(2)}</td>
            </tr>
            <tr class="grand-total">
              <td>Grand Total:</td>
              <td style="text-align: right;">${currencyCode} ${grandTotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Paid Amount:</td>
              <td style="text-align: right; font-weight: bold; color: #16a34a;">${currencyCode} ${numPaid.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Balance Due:</td>
              <td style="text-align: right; font-weight: bold; color: #dc2626;">${currencyCode} ${dueAmount.toFixed(2)}</td>
            </tr>
          </table>

          ${supplierNotes ? `<div style="margin-top: 20px; font-size: 12px;"><strong>Supplier Notes:</strong> ${supplierNotes}</div>` : ''}
          ${termsConditions ? `<div style="margin-top: 10px; font-size: 12px;"><strong>Terms & Conditions:</strong> ${termsConditions}</div>` : ''}

          <div class="footer">
            Generated via ERP Purchase Management | ${new Date().toLocaleString()}
          </div>

          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId || !warehouseId) {
      alert('Please select both Supplier and Target Warehouse.');
      return;
    }

    const hasInvalidItem = items.some(
      (i) => !i.product_id || Number(i.ordered_quantity) <= 0 || Number(i.unit_price) < 0
    );

    if (hasInvalidItem) {
      alert('Please select products and fill valid quantities and prices for all rows.');
      return;
    }

    try {
      const result = await createPurchaseMutation.mutateAsync({
        supplier_id: Number(supplierId),
        warehouse_id: Number(warehouseId),
        reference_no: referenceNo || undefined,
        purchase_date: purchaseDate,
        expected_delivery_date: expectedDeliveryDate || undefined,
        payment_due_date: paymentDueDate || undefined,
        currency_code: currencyCode,
        exchange_rate: Number(exchangeRate) || 1,
        incoterm: incoterm || undefined,
        payment_term: paymentTerm || undefined,
        payment_method: paymentMethod,
        discount_amount: numDiscount,
        tax_amount: numTax,
        shipping_cost: numShipping,
        other_charges: numOther,
        paid_amount: numPaid,
        status,
        notes: notes.trim() || undefined,
        supplier_notes: supplierNotes.trim() || undefined,
        terms_conditions: termsConditions.trim() || undefined,
        attachment: attachment || undefined,
        items: items.map((i) => ({
          product_id: Number(i.product_id),
          ordered_quantity: Number(i.ordered_quantity),
          unit_price: Number(i.unit_price),
          discount_amount: Number(i.discount_amount) || 0,
          tax_rate: Number(i.tax_rate) || 0,
          uom: i.uom,
        })),
      });

      handlePrintPurchaseOrder(result?.data || result);
      handleClose();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to register the purchase order.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 text-slate-100 w-full max-w-6xl rounded-3xl border border-slate-800 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden relative">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/80 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                Industrial Enterprise Purchase Order (PO)
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Procurement Management, Multi-Currency, Landed Cost Allocation & Stock Sync
              </p>
            </div>
          </div>
          <button onClick={handleClose} className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        {isLoadingData ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="text-xs font-semibold">Loading Catalogs, Warehouses & Supplier Registries...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
            
            {/* 1. Primary ERP Header Details */}
            <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800/80 space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" /> Header & Vendor Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Supplier <span className="text-rose-400">*</span></label>
                  <SearchableSelect options={supplierOptions} value={supplierId} onChange={(val) => setSupplierId(Number(val))} placeholder="Select Supplier" icon={<Building2 className="w-4 h-4" />} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Target Warehouse <span className="text-rose-400">*</span></label>
                  <SearchableSelect options={warehouseOptions} value={warehouseId} onChange={(val) => setWarehouseId(Number(val))} placeholder="Select Warehouse" icon={<Warehouse className="w-4 h-4" />} />
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-400">PO Number / Ref</label>
                    <button
                      type="button"
                      onClick={() => setReferenceNo(generatePONumber())}
                      className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5 font-medium"
                    >
                      <Sparkles className="w-3 h-3" /> Auto Gen
                    </button>
                  </div>
                  <input type="text" placeholder="e.g. PO-20260912-8492" value={referenceNo} onChange={(e) => setReferenceNo(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">PO Status</label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:border-blue-500 focus:outline-none">
                    <option value="draft">Draft</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="ordered">Ordered / Placed</option>
                    <option value="received">Received (Direct Stock Add)</option>
                  </select>
                </div>
              </div>

              {/* Terms, Currency & Delivery Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-2 border-t border-slate-800/50">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">PO Date</label>
                  <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Expected Delivery</label>
                  <input type="date" value={expectedDeliveryDate} onChange={(e) => setExpectedDeliveryDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Payment Due Date</label>
                  <input type="date" value={paymentDueDate} onChange={(e) => setPaymentDueDate(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Currency & Ex. Rate</label>
                  <div className="flex gap-1">
                    <input type="text" value={currencyCode} onChange={(e) => setCurrencyCode(e.target.value.toUpperCase())} className="w-14 bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white text-center font-bold" />
                    <input type="number" step="0.0001" value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Incoterm / Terms</label>
                  <input type="text" placeholder="FOB / CIF" value={incoterm} onChange={(e) => setIncoterm(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-white" />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-white">
                    <option value="bank">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="lc">Letter of Credit (LC)</option>
                    <option value="mobile_banking">Mobile Banking</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Advanced Multi-Item Data Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <span>Ordered Product Line Items</span>
                  <span className="bg-slate-800 text-blue-400 text-[10px] px-2 py-0.5 rounded-full font-semibold">
                    {items.length} {items.length === 1 ? 'Item' : 'Items'}
                  </span>
                </h3>
                <button type="button" onClick={handleAddItem} className="flex items-center gap-1.5 text-xs font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                  <Plus className="w-3.5 h-3.5" /> Add Row Item
                </button>
              </div>

              {/* Explicit Column Labels Header (Desktop view) */}
              <div className="hidden sm:grid grid-cols-12 gap-2.5 px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-950/40 rounded-xl border border-slate-800/40">
                <div className="col-span-4">Product Name / SKU</div>
                <div className="col-span-2">Quantity & Unit (UOM)</div>
                <div className="col-span-2">Unit Price ({currencyCode})</div>
                <div className="col-span-1">Discount</div>
                <div className="col-span-1">VAT / Tax %</div>
                <div className="col-span-1 text-right">Subtotal</div>
                <div className="col-span-1 text-right">Action</div>
              </div>

              <div className="space-y-2">
                {items.map((item, index) => {
                  const itemQty = typeof item.ordered_quantity === 'number' ? item.ordered_quantity : 0;
                  const itemPrice = typeof item.unit_price === 'number' ? item.unit_price : 0;
                  const itemDisc = typeof item.discount_amount === 'number' ? item.discount_amount : 0;
                  const itemTax = typeof item.tax_rate === 'number' ? item.tax_rate : 0;
                  
                  const lineBase = (itemQty * itemPrice) - itemDisc;
                  const rowSubtotal = lineBase + ((lineBase * itemTax) / 100);

                  return (
                    <div key={index} className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80 hover:border-slate-700/80 transition-colors">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
                        
                        {/* Product Selector */}
                        <div className="sm:col-span-4">
                          <label className="block text-[10px] text-slate-400 sm:hidden mb-1 font-semibold">Product Name / SKU</label>
                          <SearchableSelect options={productOptions} value={item.product_id} onChange={(val) => handleItemChange(index, 'product_id', val)} placeholder="Search Product SKU/Name..." />
                        </div>

                        {/* Quantity & UOM */}
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-slate-400 sm:hidden mb-1 font-semibold">Quantity & Unit</label>
                          <div className="flex gap-1">
                            <input type="number" min="1" placeholder="Qty" value={item.ordered_quantity} onChange={(e) => handleItemChange(index, 'ordered_quantity', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none" />
                            <select value={item.uom} onChange={(e) => handleItemChange(index, 'uom', e.target.value)} className="w-16 bg-slate-900 border border-slate-800 rounded-xl px-1 py-2 text-[11px] text-slate-300 focus:outline-none">
                              <option value="Pcs">Pcs</option>
                              <option value="Box">Box</option>
                              <option value="Kg">Kg</option>
                              <option value="Ton">Ton</option>
                              <option value="Ltr">Ltr</option>
                              <option value="Meter">Mtr</option>
                              <option value="Set">Set</option>
                            </select>
                          </div>
                        </div>

                        {/* Unit Price */}
                        <div className="sm:col-span-2">
                          <label className="block text-[10px] text-slate-400 sm:hidden mb-1 font-semibold">Unit Price ({currencyCode})</label>
                          <input type="number" min="0" step="0.01" placeholder="Unit Price" value={item.unit_price} onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:border-blue-500 focus:outline-none" />
                        </div>

                        {/* Item Discount */}
                        <div className="sm:col-span-1">
                          <label className="block text-[10px] text-slate-400 sm:hidden mb-1 font-semibold">Discount (-)</label>
                          <input type="number" min="0" placeholder="Disc" value={item.discount_amount} onChange={(e) => handleItemChange(index, 'discount_amount', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:border-blue-500 focus:outline-none" />
                        </div>

                        {/* Item Tax % */}
                        <div className="sm:col-span-1">
                          <label className="block text-[10px] text-slate-400 sm:hidden mb-1 font-semibold">VAT / Tax %</label>
                          <input type="number" min="0" max="100" placeholder="VAT %" value={item.tax_rate} onChange={(e) => handleItemChange(index, 'tax_rate', e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2 py-2 text-xs text-white focus:border-blue-500 focus:outline-none" />
                        </div>

                        {/* Total per Line */}
                        <div className="sm:col-span-1 text-right">
                          <label className="block text-[10px] text-slate-400 sm:hidden mb-1 font-semibold">Line Total</label>
                          <span className="font-bold text-xs text-blue-400 block truncate">
                            {currencyCode} {rowSubtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        {/* Action Delete */}
                        <div className="sm:col-span-1 text-right flex justify-end">
                          <button type="button" onClick={() => handleRemoveItem(index)} disabled={items.length === 1} className="text-rose-500 hover:text-rose-400 disabled:opacity-30 p-1.5 rounded-lg hover:bg-slate-800 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Notes, Terms, Documents & Landed Cost Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-800">
              
              {/* Left Column: Remarks, Notes & File Upload */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Remarks & Internal Instructions</label>
                  <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Internal notes, LC instructions..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Notes for Supplier (Visible on PO Print)</label>
                  <textarea rows={2} value={supplierNotes} onChange={(e) => setSupplierNotes(e.target.value)} placeholder="Special delivery instructions for vendor..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Contract Terms & Conditions</label>
                  <textarea rows={2} value={termsConditions} onChange={(e) => setTermsConditions(e.target.value)} placeholder="Legal terms, warranty agreement..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white focus:border-blue-500 focus:outline-none resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Attach Quotation / Document (PDF, IMG, ZIP)</label>
                  <input type="file" onChange={(e) => setAttachment(e.target.files?.[0] || null)} className="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700 cursor-pointer" />
                </div>
              </div>

              {/* Right Column: Complete Financial Ledger Panel */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Items Subtotal:</span>
                  <span className="font-semibold text-white">{currencyCode} {subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-400">Overall Order Discount (-):</span>
                  <input type="number" min="0" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className="w-32 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-right text-white font-medium focus:outline-none" />
                </div>

                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-400">Order Level VAT / Tax (+):</span>
                  <input type="number" min="0" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className="w-32 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-right text-white font-medium focus:outline-none" />
                </div>

                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-400">Shipping & Freight (+):</span>
                  <input type="number" min="0" value={shippingCost} onChange={(e) => setShippingCost(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className="w-32 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-right text-white font-medium focus:outline-none" />
                </div>

                <div className="flex justify-between items-center gap-4">
                  <span className="text-slate-400">Other / Customs Charges (+):</span>
                  <input type="number" min="0" value={otherCharges} onChange={(e) => setOtherCharges(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className="w-32 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-right text-white font-medium focus:outline-none" />
                </div>

                <div className="flex justify-between text-sm font-bold text-blue-400 border-t border-slate-800 pt-2">
                  <span>Grand Total ({currencyCode}):</span>
                  <span>{currencyCode} {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>

                <div className="flex justify-between items-center gap-4 pt-1">
                  <span className="text-emerald-400 font-bold">Advance / Paid Amount:</span>
                  <input type="number" min="0" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))} className="w-32 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-right text-emerald-400 font-extrabold focus:outline-none" />
                </div>

                <div className="flex justify-between text-rose-400 font-bold border-t border-slate-800/60 pt-2">
                  <span>Balance Due:</span>
                  <span>{currencyCode} {dueAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Form Footer Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
              <button type="button" onClick={handleClose} className="px-5 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={createPurchaseMutation.isPending} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-600/30 disabled:opacity-50 transition-all cursor-pointer">
                {createPurchaseMutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                Submit Purchase Order
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}