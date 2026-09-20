'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  X, UserCheck, RefreshCw, Receipt, 
  Trash2, Package, Calculator, ArrowRightLeft, Building2, Calendar, Loader2, Plus, Wallet
} from 'lucide-react';
import { salesReturnService } from '../services/salesReturnService';
import { CreateSalesReturnPayload } from '../types/return';

interface Customer {
  id: number;
  name: string;
  phone: string;
  current_balance: number;
}

interface InvoiceItem {
  product_id: number;
  product_name: string;
  unit_price: number;
  max_returnable_qty: number;
}

interface Invoice {
  id: number;
  invoice_no: string;
  created_at: string;
  total_amount: number;
  items: InvoiceItem[];
}

interface Product {
  id: number;
  name: string;
  sku: string;
  unit_price: number;
}

interface Warehouse {
  id: number;
  name: string;
}

interface ProductItem {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  max_qty?: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (invoiceNo: string) => void;
}

export default function CreateSalesReturnModal({ isOpen, onClose, onSuccess }: ModalProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  // Async Customer Search States
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [customerOptions, setCustomerOptions] = useState<Customer[]>([]);
  const [isSearchingCustomers, setIsSearchingCustomers] = useState(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Customer's Invoices State
  const [customerInvoices, setCustomerInvoices] = useState<Invoice[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | ''>('');
  const [isLoadingInvoices, setIsLoadingInvoices] = useState(false);

  const [isLoadingInitial, setIsLoadingInitial] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<number | ''>('');
  const [actionType, setActionType] = useState<'REFUND' | 'DUE_ADJUSTMENT' | 'EXCHANGE'>('DUE_ADJUSTMENT');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  
  // Exchange Balance Settlement Option
  const [exchangeSettlementType, setExchangeSettlementType] = useState<'CASH' | 'DUE'>('CASH');
  
  const [returnDate, setReturnDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState<string>('');

  // Items State
  const [availableInvoiceItems, setAvailableInvoiceItems] = useState<InvoiceItem[]>([]);
  const [returnItems, setReturnItems] = useState<ProductItem[]>([]);
  const [exchangeItems, setExchangeItems] = useState<ProductItem[]>([]);

  // Product Selection Form Temp States
  const [selectedReturnProdId, setSelectedReturnProdId] = useState<string>('');
  const [tempReturnQty, setTempReturnQty] = useState<number | string>(1);
  const [tempReturnPrice, setTempReturnPrice] = useState<number | string>('');

  const [selectedExchangeProdId, setSelectedExchangeProdId] = useState<string>('');
  const [tempExchangeQty, setTempExchangeQty] = useState<number | string>(1);
  const [tempExchangePrice, setTempExchangePrice] = useState<number | string>('');

  const extractArray = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res?.data?.data)) return res.data.data;
    if (Array.isArray(res?.invoices)) return res.invoices;
    if (Array.isArray(res?.sales)) return res.sales;
    if (Array.isArray(res?.customers)) return res.customers;
    if (Array.isArray(res?.products)) return res.products;
    if (Array.isArray(res?.warehouses)) return res.warehouses;
    return [];
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      const fetchData = async () => {
        setIsLoadingInitial(true);
        try {
          const [prodRes, whRes] = await Promise.all([
            salesReturnService.getProducts(),
            salesReturnService.getWarehouses()
          ]);

          const prodData = extractArray(prodRes);
          const whData = extractArray(whRes);

          setProducts(prodData.map((p: any) => ({
            id: Number(p.id),
            name: p.name || p.title || 'Unknown Product',
            sku: p.sku || p.code || '',
            unit_price: Number(p.unit_price || p.price || p.selling_price || 0)
          })));

          const mappedWarehouses = whData.map((w: any) => ({
            id: Number(w.id),
            name: w.name || w.warehouse_name || 'Main Warehouse'
          }));
          setWarehouses(mappedWarehouses);

          if (mappedWarehouses.length > 0) {
            setSelectedWarehouseId(mappedWarehouses[0].id);
          }
        } catch (err) {
          console.error("Failed to load initial modal data", err);
        } finally {
          setIsLoadingInitial(false);
        }
      };
      fetchData();
      fetchCustomers('');
    } else {
      setSelectedCustomerId('');
      setSelectedCustomer(null);
      setCustomerSearchQuery('');
      setCustomerOptions([]);
      setIsCustomerDropdownOpen(false);
    }
  }, [isOpen]);

  const fetchCustomers = async (query: string) => {
    setIsSearchingCustomers(true);
    try {
      const res = await salesReturnService.getCustomers({ search: query });
      const custData = extractArray(res);

      setCustomerOptions(custData.map((c: any) => ({
        id: Number(c.id),
        name: c.name || c.customer_name || 'Unknown Customer',
        phone: c.phone || c.mobile || '',
        current_balance: Number(c.current_balance || c.balance || c.due || 0)
      })));
      setIsCustomerDropdownOpen(true);
    } catch (err) {
      console.error("Failed to search customers", err);
    } finally {
      setIsSearchingCustomers(false);
    }
  };

  useEffect(() => {
    if (selectedCustomer) return;

    const timer = setTimeout(() => {
      fetchCustomers(customerSearchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [customerSearchQuery, selectedCustomer]);

  const filteredCustomerOptions = useMemo(() => {
    if (!customerSearchQuery.trim() || selectedCustomer) return customerOptions;
    const q = customerSearchQuery.toLowerCase().trim();
    return customerOptions.filter(
      c => (c.name && c.name.toLowerCase().includes(q)) || (c.phone && c.phone.toLowerCase().includes(q))
    );
  }, [customerOptions, customerSearchQuery, selectedCustomer]);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSelectedCustomerId(customer.id);
    setCustomerSearchQuery(`${customer.name} ${customer.phone ? `(${customer.phone})` : ''}`);
    setIsCustomerDropdownOpen(false);
    loadCustomerInvoices(customer.id);
  };

  const handleClearCustomer = () => {
    setSelectedCustomer(null);
    setSelectedCustomerId('');
    setCustomerSearchQuery('');
    setCustomerOptions([]);
    setCustomerInvoices([]);
    setSelectedInvoiceId('');
    setAvailableInvoiceItems([]);
    setReturnItems([]);
    fetchCustomers('');
  };

  const loadCustomerInvoices = async (customerId: number) => {
    setSelectedInvoiceId('');
    setCustomerInvoices([]);
    setAvailableInvoiceItems([]);
    setReturnItems([]);

    setIsLoadingInvoices(true);
    try {
      const res = await salesReturnService.getCustomerInvoices(customerId);
      const invoicesArray = extractArray(res);

      const normalizedInvoices: Invoice[] = invoicesArray.map((inv: any) => {
        const rawItems = inv.items || inv.sales_items || inv.details || inv.sale_details || [];
        return {
          id: Number(inv.id),
          invoice_no: inv.invoice_no || inv.invoice_number || inv.sale_no || `INV-${inv.id}`,
          created_at: inv.created_at || inv.sale_date || new Date().toISOString(),
          total_amount: Number(inv.total_amount || inv.grand_total || inv.net_total || 0),
          items: rawItems.map((item: any) => ({
            product_id: Number(item.product_id || item.product?.id),
            product_name: item.product_name || item.product?.name || item.name || 'Unknown Item',
            unit_price: Number(item.unit_price || item.price || item.rate || 0),
            max_returnable_qty: Number(item.quantity || item.qty || item.max_qty || 1)
          }))
        };
      });

      normalizedInvoices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setCustomerInvoices(normalizedInvoices);
    } catch (err) {
      console.error("Failed to fetch customer invoices", err);
    } finally {
      setIsLoadingInvoices(false);
    }
  };

  const handleInvoiceChange = (invoiceId: number | '') => {
    setSelectedInvoiceId(invoiceId);
    setReturnItems([]);
    
    if (!invoiceId) {
      setAvailableInvoiceItems([]);
      return;
    }

    const selectedInv = customerInvoices.find(inv => inv.id === Number(invoiceId));
    if (selectedInv && selectedInv.items) {
      setAvailableInvoiceItems(selectedInv.items);
    } else {
      setAvailableInvoiceItems([]);
    }
  };

  const totalReturnAmount = useMemo(() => {
    return returnItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);
  }, [returnItems]);

  const totalExchangeAmount = useMemo(() => {
    return exchangeItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unit_price)), 0);
  }, [exchangeItems]);

  const netExchangeBalance = useMemo(() => {
    return totalExchangeAmount - totalReturnAmount;
  }, [totalExchangeAmount, totalReturnAmount]);

  const handleAddReturnItem = () => {
    if (!selectedReturnProdId) return;
    const invItem = availableInvoiceItems.find(p => p.product_id === Number(selectedReturnProdId));
    if (!invItem) return;

    const qty = Math.max(0.001, Number(tempReturnQty) || 1);
    const price = tempReturnPrice !== '' && tempReturnPrice !== undefined && !isNaN(Number(tempReturnPrice))
      ? Number(tempReturnPrice)
      : Number(invItem.unit_price);

    if (qty > invItem.max_returnable_qty) {
      alert(`Max returnable quantity for this item is ${invItem.max_returnable_qty}`);
      return;
    }

    setReturnItems(prev => {
      const exists = prev.find(i => i.product_id === invItem.product_id);
      if (exists) {
        const newQty = exists.quantity + qty;
        if (newQty > invItem.max_returnable_qty) {
          alert(`Total return quantity exceeds invoice limit (${invItem.max_returnable_qty})`);
          return prev;
        }
        return prev.map(i => i.product_id === invItem.product_id 
          ? { ...i, quantity: newQty, unit_price: price, subtotal: newQty * price } 
          : i
        );
      }
      return [...prev, { 
        product_id: invItem.product_id, 
        product_name: invItem.product_name, 
        quantity: qty, 
        unit_price: price, 
        subtotal: qty * price,
        max_qty: invItem.max_returnable_qty 
      }];
    });

    setSelectedReturnProdId('');
    setTempReturnPrice('');
    setTempReturnQty(1);
  };

  const handleAddExchangeItem = () => {
    if (!selectedExchangeProdId) return;
    const prod = products.find(p => p.id === Number(selectedExchangeProdId));
    if (!prod) return;

    const qty = Math.max(0.001, Number(tempExchangeQty) || 1);
    const price = tempExchangePrice !== '' && tempExchangePrice !== undefined && !isNaN(Number(tempExchangePrice))
      ? Number(tempExchangePrice)
      : Number(prod.unit_price);

    setExchangeItems(prev => {
      const exists = prev.find(i => i.product_id === prod.id);
      if (exists) {
        const newQty = exists.quantity + qty;
        return prev.map(i => i.product_id === prod.id 
          ? { ...i, quantity: newQty, unit_price: price, subtotal: newQty * price } 
          : i
        );
      }
      return [...prev, { 
        product_id: prod.id, 
        product_name: prod.name, 
        quantity: qty, 
        unit_price: price, 
        subtotal: qty * price 
      }];
    });

    setSelectedExchangeProdId('');
    setTempExchangePrice('');
    setTempExchangeQty(1);
  };

  const handleSubmit = async () => {
    if (!selectedCustomerId || !selectedWarehouseId) {
      alert('Please select both Customer and Warehouse.');
      return;
    }
    if (!selectedInvoiceId) {
      alert('Invoice selection is required.');
      return;
    }
    if (returnItems.length === 0) {
      alert('Select at least one product for return.');
      return;
    }
    if (actionType === 'EXCHANGE' && exchangeItems.length === 0) {
      alert('Select at least one new product for exchange.');
      return;
    }

    try {
      setIsSubmitting(true);

      const computedPaymentMethod = actionType === 'DUE_ADJUSTMENT' 
        ? 'DUE_ADJUST' 
        : actionType === 'EXCHANGE'
          ? exchangeSettlementType === 'CASH' ? paymentMethod : 'DUE_ADJUST'
          : paymentMethod;

      const payload: CreateSalesReturnPayload & { 
        invoice_id?: number; 
        exchange_settlement_type?: string; 
      } = {
        customer_id: Number(selectedCustomerId),
        warehouse_id: Number(selectedWarehouseId),
        invoice_id: Number(selectedInvoiceId),
        return_date: returnDate,
        action_type: actionType,
        payment_method: computedPaymentMethod,
        exchange_settlement_type: actionType === 'EXCHANGE' ? exchangeSettlementType : undefined,
        reason: reason,
        items: returnItems.map(i => ({
          product_id: i.product_id,
          product_name: i.product_name,
          quantity: i.quantity,
          unit_price: i.unit_price,
          subtotal: i.subtotal
        })),
        exchange_items: actionType === 'EXCHANGE' ? exchangeItems.map(i => ({
          product_id: i.product_id,
          product_name: i.product_name,
          quantity: i.quantity,
          unit_price: i.unit_price,
          subtotal: i.subtotal
        })) : []
      };

      const response: any = await salesReturnService.createReturn(payload);

      alert('Sales Return & Adjustment processed successfully!');

      const generatedMasterInvoiceNo = response?.master_invoice_no || response?.data?.master_invoice_no;

      if (onSuccess && generatedMasterInvoiceNo) {
        onSuccess(generatedMasterInvoiceNo);
      }
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to submit return request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md">
      <div className="relative flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 text-slate-100 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
              <RefreshCw className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Sales Return & Adjustment</h2>
              <p className="text-[11px] text-slate-400">Process sales return, due adjustments, and product exchanges</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-xl p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
          {isLoadingInitial ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="h-9 w-9 animate-spin text-indigo-500" />
              <p className="text-xs font-semibold text-slate-400">Loading data, please wait...</p>
            </div>
          ) : (
            <>
              {/* Top Bar: Return Date, Customer & Warehouse */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-indigo-400" /> Return Date *
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="relative" ref={dropdownRef}>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <UserCheck className="h-3.5 w-3.5 text-indigo-400" /> Select Customer *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name or phone..."
                      value={customerSearchQuery}
                      onChange={(e) => {
                        setCustomerSearchQuery(e.target.value);
                        if (selectedCustomer) setSelectedCustomer(null);
                      }}
                      onFocus={() => {
                        if (!selectedCustomer) {
                          if (customerOptions.length === 0) {
                            fetchCustomers(customerSearchQuery);
                          } else {
                            setIsCustomerDropdownOpen(true);
                          }
                        }
                      }}
                      className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
                    />
                    
                    {isSearchingCustomers ? (
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-400 absolute right-3 top-3" />
                    ) : selectedCustomer ? (
                      <button 
                        onClick={handleClearCustomer}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-800"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>

                  {isCustomerDropdownOpen && (
                    <div className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-slate-700 bg-slate-950 shadow-2xl">
                      {filteredCustomerOptions.length > 0 ? (
                        filteredCustomerOptions.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => handleSelectCustomer(c)}
                            className="flex items-center justify-between p-3 hover:bg-slate-800/80 cursor-pointer border-b border-slate-800/50 last:border-none transition-colors"
                          >
                            <div>
                              <p className="text-xs font-bold text-slate-200">{c.name}</p>
                              <p className="text-[11px] text-slate-400">{c.phone || 'No Phone'}</p>
                            </div>
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-amber-400 border border-slate-700">
                              Due: ৳{c.current_balance}
                            </span>
                          </div>
                        ))
                      ) : !isSearchingCustomers ? (
                        <div className="p-3 text-center text-xs text-slate-400 font-medium">
                          No customers found
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-indigo-400" /> Select Warehouse *
                  </label>
                  <input
                    list="warehouse-list"
                    type="text"
                    placeholder="-- Select Warehouse --"
                    value={
                      selectedWarehouseId 
                        ? warehouses.find(w => w.id === Number(selectedWarehouseId))?.name || ''
                        : ''
                    }
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase();
                      const matched = warehouses.find(w => w.name.toLowerCase() === val);
                      if (matched) {
                        setSelectedWarehouseId(matched.id);
                      } else if (val === '') {
                        setSelectedWarehouseId('');
                      }
                    }}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <datalist id="warehouse-list">
                    {warehouses.map(w => (
                      <option key={w.id} value={w.name} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Invoice & Action Type Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Receipt className="h-3.5 w-3.5 text-indigo-400" />
                    Select Invoice *
                    {isLoadingInvoices && (
                      <span className="text-[10px] text-indigo-400 font-medium flex items-center gap-1 ml-auto">
                        <Loader2 className="h-3 w-3 animate-spin" /> Loading...
                      </span>
                    )}
                  </label>
                  <input
                    list="invoice-list"
                    type="text"
                    disabled={!selectedCustomerId || isLoadingInvoices}
                    placeholder={
                      !selectedCustomerId 
                        ? '-- Select Customer First --' 
                        : '-- Search Invoice --'
                    }
                    value={
                      selectedInvoiceId 
                        ? (() => {
                            const found = customerInvoices.find(inv => inv.id === Number(selectedInvoiceId));
                            return found ? `#${found.invoice_no} | Date: ${found.created_at?.split('T')[0]} | Total: ৳${found.total_amount}` : '';
                          })()
                        : ''
                    }
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase();
                      const matched = customerInvoices.find(inv => {
                        const invStr = `#${inv.invoice_no} | Date: ${inv.created_at?.split('T')[0]} | Total: ৳${inv.total_amount}`;
                        return invStr.toLowerCase() === val || inv.invoice_no.toLowerCase() === val;
                      });
                      if (matched) {
                        handleInvoiceChange(matched.id);
                      } else if (val === '') {
                        handleInvoiceChange('');
                      }
                    }}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  />
                  <datalist id="invoice-list">
                    {customerInvoices.map(inv => (
                      <option 
                        key={inv.id} 
                        value={`#${inv.invoice_no} | Date: ${inv.created_at?.split('T')[0]} | Total: ৳${inv.total_amount}`} 
                      />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                    <ArrowRightLeft className="h-3.5 w-3.5 text-indigo-400" /> Action Type *
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs font-bold text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="DUE_ADJUSTMENT">1. Due Adjustment (Reduce Balance)</option>
                    <option value="REFUND">2. Cash Refund (Direct Refund)</option>
                    <option value="EXCHANGE">3. Product Exchange</option>
                  </select>
                </div>
              </div>

              {/* Add Return Items Section */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Select Return Products ({availableInvoiceItems.length} items available)
                </h3>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-12 md:col-span-4">
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Product</label>
                    <select
                      value={selectedReturnProdId}
                      onChange={(e) => {
                        setSelectedReturnProdId(e.target.value);
                        const invItem = availableInvoiceItems.find(p => p.product_id === Number(e.target.value));
                        if (invItem) setTempReturnPrice(invItem.unit_price);
                      }}
                      disabled={!selectedInvoiceId}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      <option value="">
                        {!selectedInvoiceId ? '-- Select Invoice First --' : '-- Choose Product --'}
                      </option>
                      {availableInvoiceItems.map(p => (
                        <option key={p.product_id} value={p.product_id}>
                          {p.product_name} (Purchased: {p.max_returnable_qty})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Qty</label>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={tempReturnQty}
                      onChange={(e) => setTempReturnQty(e.target.value)}
                      disabled={!selectedInvoiceId}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-center text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-2">
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Unit Price</label>
                    <input
                      type="number"
                      placeholder="Unit Price"
                      value={tempReturnPrice}
                      onChange={(e) => setTempReturnPrice(e.target.value)}
                      disabled={!selectedInvoiceId}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-right text-slate-200 font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                    />
                  </div>
                  <div className="col-span-4 md:col-span-3">
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">Subtotal</label>
                    <input
                      type="text"
                      readOnly
                      placeholder="Subtotal"
                      value={`৳ ${( (Number(tempReturnQty) || 0) * (Number(tempReturnPrice) || 0) ).toFixed(2)}`}
                      disabled={!selectedInvoiceId}
                      className="w-full rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-xs text-right font-bold text-indigo-400 disabled:opacity-50"
                    />
                  </div>
                  <div className="col-span-12 md:col-span-1 flex items-end">
                    <button 
                      onClick={handleAddReturnItem} 
                      disabled={!selectedInvoiceId}
                      className="w-full h-[34px] bg-indigo-600 text-white rounded-lg flex items-center justify-center hover:bg-indigo-500 disabled:opacity-50 transition-colors"
                      title="Add to Return Table"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {returnItems.length > 0 && (
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-xs bg-slate-900">
                      <thead className="bg-slate-800/60 font-semibold text-slate-300 border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">Product Description</th>
                          <th className="p-2.5 text-center">Qty</th>
                          <th className="p-2.5 text-right">Unit Price</th>
                          <th className="p-2.5 text-right">Subtotal</th>
                          <th className="p-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {returnItems.map(item => (
                          <tr key={item.product_id} className="hover:bg-slate-800/30">
                            <td className="p-2.5 font-medium text-slate-200">{item.product_name}</td>
                            <td className="p-2.5 text-center font-semibold text-slate-300">{item.quantity}</td>
                            <td className="p-2.5 text-right text-slate-300">৳{Number(item.unit_price).toFixed(2)}</td>
                            <td className="p-2.5 text-right font-bold text-indigo-300">৳{(item.quantity * item.unit_price).toFixed(2)}</td>
                            <td className="p-2.5 text-right">
                              <button onClick={() => setReturnItems(prev => prev.filter(i => i.product_id !== item.product_id))} className="text-rose-400 hover:text-rose-300 p-1 rounded">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Product Exchange Section */}
              {actionType === 'EXCHANGE' && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Select Exchange Items
                  </h3>
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-12 md:col-span-4">
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">New Product</label>
                      <select
                        value={selectedExchangeProdId}
                        onChange={(e) => {
                          setSelectedExchangeProdId(e.target.value);
                          const prod = products.find(p => p.id === Number(e.target.value));
                          if (prod) setTempExchangePrice(prod.unit_price);
                        }}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="">-- Choose New Product --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ''}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Qty</label>
                      <input
                        type="number"
                        placeholder="Qty"
                        value={tempExchangeQty}
                        onChange={(e) => setTempExchangeQty(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-center font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Unit Price</label>
                      <input
                        type="number"
                        placeholder="Unit Price"
                        value={tempExchangePrice}
                        onChange={(e) => setTempExchangePrice(e.target.value)}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900 p-2 text-xs text-right font-semibold text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-3">
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">Subtotal</label>
                      <input
                        type="text"
                        readOnly
                        placeholder="Subtotal"
                        value={`৳ ${( (Number(tempExchangeQty) || 0) * (Number(tempExchangePrice) || 0) ).toFixed(2)}`}
                        className="w-full rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-xs text-right font-bold text-emerald-400"
                      />
                    </div>
                    <div className="col-span-12 md:col-span-1 flex items-end">
                      <button onClick={handleAddExchangeItem} className="w-full h-[34px] bg-emerald-600 text-white rounded-lg flex items-center justify-center hover:bg-emerald-500 transition-colors">
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {exchangeItems.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-emerald-900/40">
                      <table className="w-full text-left text-xs bg-slate-900">
                        <thead className="bg-emerald-950/40 font-semibold text-emerald-300 border-b border-emerald-900/40">
                          <tr>
                            <th className="p-2.5">Product Description</th>
                            <th className="p-2.5 text-center">Qty</th>
                            <th className="p-2.5 text-right">Unit Price</th>
                            <th className="p-2.5 text-right">Subtotal</th>
                            <th className="p-2.5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                          {exchangeItems.map(item => (
                            <tr key={item.product_id} className="hover:bg-slate-800/30">
                              <td className="p-2.5 font-medium text-slate-200">{item.product_name}</td>
                              <td className="p-2.5 text-center font-semibold text-slate-300">{item.quantity}</td>
                              <td className="p-2.5 text-right text-slate-300">৳{Number(item.unit_price).toFixed(2)}</td>
                              <td className="p-2.5 text-right font-bold text-emerald-300">৳{(item.quantity * item.unit_price).toFixed(2)}</td>
                              <td className="p-2.5 text-right">
                                <button onClick={() => setExchangeItems(prev => prev.filter(i => i.product_id !== item.product_id))} className="text-rose-400 hover:text-rose-300 p-1 rounded">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Total Calculation & Adjustment Summary */}
              <div className="rounded-xl bg-slate-950 p-4 shadow-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-indigo-400" />
                    <span className="text-xs font-bold uppercase tracking-wide text-slate-200">Adjustment Summary</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {actionType === 'DUE_ADJUSTMENT' && 'Due Adjustment Mode'}
                    {actionType === 'REFUND' && 'Cash Refund Mode'}
                    {actionType === 'EXCHANGE' && 'Product Exchange Mode'}
                  </span>
                </div>

                {actionType === 'DUE_ADJUSTMENT' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[11px] mb-1">Previous Due Balance:</span>
                      <span className="text-sm font-bold text-amber-400">
                        ৳{selectedCustomer ? (selectedCustomer.current_balance || 0).toFixed(2) : '0.00'}
                      </span>
                    </div>
                    <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                      <span className="text-slate-400 block text-[11px] mb-1">Return Total:</span>
                      <span className="text-sm font-bold text-emerald-400">
                        (-) ৳{totalReturnAmount.toFixed(2)}
                      </span>
                    </div>
                    <div className="bg-indigo-950/60 p-3 rounded-lg border border-indigo-500/30">
                      <span className="text-indigo-200 block text-[11px] font-medium mb-1">Updated Due Balance:</span>
                      <span className="text-base font-black text-indigo-300">
                        ৳{selectedCustomer 
                            ? Math.max(0, (selectedCustomer.current_balance || 0) - totalReturnAmount).toFixed(2) 
                            : '0.00'}
                      </span>
                    </div>
                  </div>
                )}

                {actionType === 'REFUND' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[11px] mb-1">Previous Due Balance:</span>
                        <span className="text-sm font-bold text-amber-400">
                          ৳{selectedCustomer ? (selectedCustomer.current_balance || 0).toFixed(2) : '0.00'}
                        </span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[11px] mb-1">Return Total:</span>
                        <span className="text-sm font-bold text-emerald-400">
                          ৳{totalReturnAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="bg-emerald-950/60 p-3 rounded-lg border border-emerald-500/30">
                        <span className="text-emerald-200 block text-[11px] font-medium mb-1">Cash Refunded:</span>
                        <span className="text-base font-black text-emerald-400">
                          ৳{totalReturnAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800">
                      <label className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1.5">
                        <Wallet className="h-3.5 w-3.5 text-indigo-400" /> Payment Method / Medium *
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full md:w-1/2 rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="CASH">Cash Account</option>
                        <option value="CARD">Credit/Debit Card</option>
                        <option value="BANK_TRANSFER">Bank Account</option>
                        <option value="MOBILE_BANKING">Mobile Banking (bKash/Nagad)</option>
                      </select>
                    </div>
                  </div>
                )}

                {actionType === 'EXCHANGE' && (
                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[11px] mb-1">Return Items Value:</span>
                        <span className="text-sm font-bold text-emerald-400">৳{totalReturnAmount.toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[11px] mb-1">Exchange Items Value:</span>
                        <span className="text-sm font-bold text-indigo-400">৳{totalExchangeAmount.toFixed(2)}</span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                        <span className="text-slate-400 block text-[11px] mb-1">Net Balance Difference:</span>
                        <span className={`text-sm font-bold ${netExchangeBalance > 0 ? 'text-amber-400' : netExchangeBalance < 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                          ৳{Math.abs(netExchangeBalance).toFixed(2)} {netExchangeBalance > 0 ? '(Receivable)' : netExchangeBalance < 0 ? '(Refundable)' : ''}
                        </span>
                      </div>
                    </div>

                    {netExchangeBalance !== 0 && (
                      <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                        <label className="text-xs font-bold text-indigo-300 block">
                          Select Balance Settlement Method *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${exchangeSettlementType === 'CASH' ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                            <input 
                              type="radio" 
                              name="exchangeSettlement" 
                              checked={exchangeSettlementType === 'CASH'}
                              onChange={() => setExchangeSettlementType('CASH')}
                              className="accent-indigo-500"
                            />
                            <div>
                              <p className="font-bold text-xs">
                                {netExchangeBalance > 0 ? 'Customer Pays Cash Difference' : 'Refund Cash Difference to Customer'}
                              </p>
                              <p className="text-[10px] text-slate-400">Immediate cash transaction</p>
                            </div>
                          </label>

                          <label className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${exchangeSettlementType === 'DUE' ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200' : 'bg-slate-950 border-slate-800 text-slate-400'}`}>
                            <input 
                              type="radio" 
                              name="exchangeSettlement" 
                              checked={exchangeSettlementType === 'DUE'}
                              onChange={() => setExchangeSettlementType('DUE')}
                              className="accent-indigo-500"
                            />
                            <div>
                              <p className="font-bold text-xs">
                                {netExchangeBalance > 0 ? 'Add Difference to Due Balance' : 'Adjust Difference with Due Balance'}
                              </p>
                              <p className="text-[10px] text-slate-400">Adjusts with customer ledger account</p>
                            </div>
                          </label>
                        </div>

                        {exchangeSettlementType === 'CASH' && (
                          <div className="mt-2 pt-2 border-t border-slate-800">
                            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Payment Method</label>
                            <select
                              value={paymentMethod}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                              className="w-full md:w-1/2 rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="CASH">Cash</option>
                              <option value="CARD">Credit/Debit Card</option>
                              <option value="BANK_TRANSFER">Bank Transfer</option>
                              <option value="MOBILE_BANKING">Mobile Banking</option>
                            </select>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="bg-indigo-950/50 p-3 rounded-lg border border-indigo-500/30 flex items-center justify-between">
                      <div>
                        <span className="text-indigo-300 block text-[11px] font-semibold">Adjustment Summary:</span>
                        <p className="text-xs font-medium text-slate-200 mt-0.5">
                          {netExchangeBalance > 0 ? (
                            <span>Customer Payable: <strong className="text-amber-400">৳{netExchangeBalance.toFixed(2)}</strong> ({exchangeSettlementType === 'CASH' ? 'Cash' : 'Due'})</span>
                          ) : netExchangeBalance < 0 ? (
                            <span>Customer Receivable: <strong className="text-emerald-400">৳{Math.abs(netExchangeBalance).toFixed(2)}</strong> ({exchangeSettlementType === 'CASH' ? 'Cash' : 'Due Adjust'})</span>
                          ) : (
                            <span className="text-slate-300">Equal value exchange (No balance change)</span>
                          )}
                        </p>
                      </div>
                      {selectedCustomer && (
                        <div className="text-right border-l border-indigo-800/80 pl-4">
                          <span className="text-slate-400 block text-[10px]">Previous Due: ৳{selectedCustomer.current_balance.toFixed(2)}</span>
                          <span className="text-xs font-bold text-indigo-300">
                            Updated Due: ৳{
                              exchangeSettlementType === 'DUE' 
                                ? Math.max(0, selectedCustomer.current_balance + netExchangeBalance).toFixed(2)
                                : selectedCustomer.current_balance.toFixed(2)
                            }
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Return Reason / Notes</label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Specify details for return or exchange..."
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-800 bg-slate-900 px-6 py-4">
          <button 
            onClick={onClose} 
            className="rounded-xl border border-slate-700 px-5 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-indigo-500 disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Processing...' : 'Submit & Complete Return'}
          </button>
        </div>

      </div>
    </div>
  );
}