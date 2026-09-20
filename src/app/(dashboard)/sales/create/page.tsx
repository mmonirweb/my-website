'use client';

import React, { useState, useMemo } from 'react';
import { useSales } from '@/domains/sales/hooks/useSales';
import { useProducts } from '@/domains/catalog/hooks/useCatalog';
import { useCustomers, useCreateCustomer } from '@/domains/customer/hooks/useCustomers';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Save,
  Trash2,
  UserPlus,
  Search,
  CreditCard,
  FileText,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import MasterInvoiceModal from '@/domains/invoice/components/MasterInvoiceModal';

interface SelectedProduct {
  product_id: number;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  subtotal: number;
}

export default function CreateDirectSalePage() {
  const router = useRouter();
  const { createSale, isCreating } = useSales();
  const createCustomerMutation = useCreateCustomer ? useCreateCustomer() : null;

  const productsQuery = useProducts() as any;
  const customerHook = useCustomers() as any;

  // কাস্টমার ও প্রোডাক্ট লিস্ট এক্সট্রাকশন
  const customerQuery = customerHook?.customersQuery || customerHook;
  const rawCustomers = customerQuery?.data?.data || customerQuery?.data || customerQuery;
  const customersList = useMemo(() => {
    if (Array.isArray(rawCustomers)) return rawCustomers;
    if (Array.isArray(rawCustomers?.data)) return rawCustomers.data;
    if (Array.isArray(rawCustomers?.customers)) return rawCustomers.customers;
    return [];
  }, [rawCustomers]);

  const rawProducts = productsQuery?.data?.data || productsQuery?.data || productsQuery;
  const productsList = useMemo(() => {
    if (Array.isArray(rawProducts)) return rawProducts;
    if (Array.isArray(rawProducts?.data)) return rawProducts.data;
    if (Array.isArray(rawProducts?.products)) return rawProducts.products;
    return [];
  }, [rawProducts]);

  // ফর্ম স্টেটসমুহ
  const [saleType, setSaleType] = useState<'RETAIL' | 'WHOLESALE' | 'COMMERCIAL'>('COMMERCIAL');
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [warehouseId, setWarehouseId] = useState<number>(1);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MOBILE_BANKING' | 'BANK_TRANSFER' | 'CHEQUE' | 'DUE'>('BANK_TRANSFER');
  const [paidAmount, setPaidAmount] = useState<number | ''>(0);
  const [discountAmount, setDiscountAmount] = useState<number | ''>(0);
  const [shippingCost, setShippingCost] = useState<number | ''>(0);
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<SelectedProduct[]>([]);
  const [createdInvoiceNo, setCreatedInvoiceNo] = useState<string | null>(null);

  // সার্চ ও ড্রপডাউন স্টেট
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // কুইক কাস্টমার ক্রিয়েশন মডেল
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    type: 'INDIVIDUAL',
    customer_group: 'RETAIL',
    source: 'POS',
    credit_limit: 0
  });
  const [isSavingCustomer, setIsSavingCustomer] = useState(false);

  // কাস্টমারের আগের বাকি (current_balance) রিড করা
  const selectedCustomer = useMemo(() => {
    if (!customerId) return null;
    return customersList.find((c: any) => Number(c.id || c.customer_id) === Number(customerId));
  }, [customerId, customersList]);

  const previousDue = useMemo(() => {
    if (!selectedCustomer) return 0;
    const val = selectedCustomer.current_balance ?? selectedCustomer.due ?? selectedCustomer.previous_due ?? selectedCustomer.balance ?? 0;
    return Math.max(0, Number(val));
  }, [selectedCustomer]);

  // ফিল্টার ড্রপডাউন
  const filteredCustomers = useMemo(() => {
    if (!customerSearch) return customersList;
    const q = customerSearch.toLowerCase();
    return customersList.filter((c: any) => {
      const name = (c.name || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      return name.includes(q) || phone.includes(q);
    });
  }, [customersList, customerSearch]);

  const filteredProducts = useMemo(() => {
    if (!productSearch) return productsList;
    const q = productSearch.toLowerCase();
    return productsList.filter((p: any) => {
      const name = (p.name || p.title || '').toLowerCase();
      const sku = (p.sku || '').toLowerCase();
      return name.includes(q) || sku.includes(q);
    });
  }, [productsList, productSearch]);

  // আইটেম যোগ/মুছে ফেলার ফাংশন
  const handleAddItem = (prod: any) => {
    const prodId = Number(prod.id || prod.product_id);
    const existingIndex = items.findIndex((i) => i.product_id === prodId);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal =
        updated[existingIndex].quantity * updated[existingIndex].unit_price -
        updated[existingIndex].discount_amount +
        updated[existingIndex].tax_amount;
      setItems(updated);
    } else {
      const price = Number(prod.price || prod.selling_price || prod.unit_price || 0);
      setItems([
        ...items,
        {
          product_id: prodId,
          name: prod.name || prod.title || 'Unknown Product',
          sku: prod.sku || 'N/A',
          quantity: 1,
          unit_price: price,
          discount_amount: 0,
          tax_amount: 0,
          subtotal: price,
        },
      ]);
    }
    setProductSearch('');
    setShowProductDropdown(false);
  };

  const handleItemChange = (index: number, field: keyof SelectedProduct, value: string) => {
    const updated = [...items];
    const numVal = value === '' ? 0 : Math.max(0, Number(value));
    updated[index] = { ...updated[index], [field]: numVal };
    updated[index].subtotal =
      updated[index].quantity * updated[index].unit_price -
      updated[index].discount_amount +
      updated[index].tax_amount;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // আর্থিক হিসাব গণনা
  const numDiscount = Number(discountAmount) || 0;
  const numShipping = Number(shippingCost) || 0;
  const numPaid = Number(paidAmount) || 0;

  const calculateSubtotal = () => items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0);
  const calculateTotalTax = () => items.reduce((acc, item) => acc + item.tax_amount, 0);
  
  const currentInvoiceTotal = Math.max(0, (calculateSubtotal() - numDiscount) + calculateTotalTax() + numShipping);
  const netPayable = currentInvoiceTotal + previousDue;
  const currentInvoiceDue = Math.max(0, currentInvoiceTotal - numPaid);
  const totalNetRemainingDue = Math.max(0, netPayable - numPaid);

  // নতুন কাস্টমার তৈরির প্রসেস
  const handleCreateCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerData.name) return alert('Customer name is required');
    setIsSavingCustomer(true);
    try {
      let created: any;
      const payload = {
        name: newCustomerData.name,
        phone: newCustomerData.phone,
        email: newCustomerData.email,
        address: newCustomerData.address,
        type: newCustomerData.type,
        customer_group: newCustomerData.customer_group,
        source: newCustomerData.source,
        credit_limit: Number(newCustomerData.credit_limit) || 0,
      };

      if (createCustomerMutation?.mutateAsync) {
        created = await createCustomerMutation.mutateAsync(payload as any);
      } else {
        created = { id: Date.now(), ...payload, current_balance: 0 };
      }
      
      const newId = created?.data?.id || created?.id;
      if (newId) {
        setCustomerId(newId);
        setCustomerSearch(newCustomerData.name);
      }
      setIsCustomerModalOpen(false);
      setNewCustomerData({
        name: '',
        phone: '',
        email: '',
        address: '',
        type: 'INDIVIDUAL',
        customer_group: 'RETAIL',
        source: 'POS',
        credit_limit: 0
      });
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to create customer');
    } finally {
      setIsSavingCustomer(false);
    }
  };

  // সাবমিট হ্যান্ডলার
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      alert('Please select a valid customer.');
      return;
    }
    if (items.length === 0) {
      alert('Cart is empty. Add at least one item.');
      return;
    }

    try {
      const res: any = await createSale({
        sale_type: saleType,
        customer_id: Number(customerId),
        warehouse_id: warehouseId,
        sale_date: saleDate,
        discount_amount: numDiscount,
        shipping_cost: numShipping,
        paid_amount: numPaid,
        payment_method: paymentMethod,
        notes,
        items: items.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price,
          discount_amount: i.discount_amount,
          tax_amount: i.tax_amount,
        })),
      });

      const saleData = res?.data?.data || res?.data || res || {};
      const invNo = saleData?.invoice_no || saleData?.invoice?.invoice_no || saleData?.invoice_number;

      if (invNo) {
        setCreatedInvoiceNo(invNo);
      } else {
        alert('Sale completed successfully!');
        router.push('/sales');
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Failed to submit sale');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6 bg-slate-950 text-slate-100 min-h-screen">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Link href="/sales" className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Enterprise Direct Sales Engine
              </h1>
              <p className="text-xs text-slate-400">Commercial Invoicing & Instant Ledger Billing System</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isCreating ? 'Processing Transaction...' : 'Complete & Issue Invoice'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-sm">
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-400" /> Customer & Order Setup
                </h2>
                <button
                  type="button"
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="text-xs px-3 py-1.5 bg-blue-600/10 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Quick Add Customer
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative md:col-span-2">
                  <label className="text-xs font-medium text-slate-400 block mb-1">Select Customer</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search Customer by Name / Phone..."
                      value={customerSearch || (selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.phone || 'N/A'})` : '')}
                      onChange={(e) => {
                        setCustomerSearch(e.target.value);
                        setCustomerId('');
                        setShowCustomerDropdown(true);
                      }}
                      onFocus={() => setShowCustomerDropdown(true)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 pr-8 focus:outline-none focus:border-blue-500"
                    />
                    <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
                  </div>

                  {showCustomerDropdown && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-800">
                      {filteredCustomers.length === 0 ? (
                        <div className="p-3 text-xs text-slate-500 text-center">No customer found</div>
                      ) : (
                        filteredCustomers.map((c: any) => {
                          const id = c.id || c.customer_id;
                          const name = c.name || 'Unnamed';
                          const phone = c.phone || '';
                          const due = Number(c.current_balance ?? c.due ?? 0);
                          return (
                            <div
                              key={id}
                              onClick={() => {
                                setCustomerId(id);
                                setCustomerSearch(`${name} ${phone ? `(${phone})` : ''}`);
                                setShowCustomerDropdown(false);
                              }}
                              className="p-2.5 hover:bg-slate-800 cursor-pointer flex justify-between items-center text-xs transition"
                            >
                              <div>
                                <p className="font-semibold text-slate-200">{name}</p>
                                <p className="text-slate-400 text-[11px]">{phone}</p>
                              </div>
                              {due > 0 && (
                                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[10px] font-bold">
                                  Previous Due: ৳{due.toFixed(2)}
                                </span>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Sale Type</label>
                  <select
                    value={saleType}
                    onChange={(e: any) => setSaleType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  >
                    <option value="COMMERCIAL">Commercial Sale</option>
                    <option value="WHOLESALE">Wholesale Bulk</option>
                    <option value="RETAIL">Direct Retail</option>
                  </select>
                </div>
              </div>

              {/* কাস্টমার প্রিভিউ ব্যানার */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Issue Date</label>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-400 block mb-1">Customer Credit Status</label>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center justify-between">
                    <span>Selected: <strong className="text-white">{selectedCustomer?.name || 'None'}</strong></span>
                    {previousDue > 0 ? (
                      <span className="text-rose-400 font-bold bg-rose-500/10 px-2.5 py-1 rounded-lg border border-rose-500/20 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Previous Outstanding Due: ৳{previousDue.toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        Clear Ledger (No Previous Due)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* প্রোডাক্ট অ্যাড ফিল্ড */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-800 pb-3">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Line Items & Cart</h3>

                <div className="relative w-full sm:w-72">
                  <input
                    type="text"
                    placeholder="+ Add Product by Name/SKU..."
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={() => setShowProductDropdown(true)}
                    className="w-full bg-slate-950 border border-slate-800 text-xs px-3 py-2 rounded-xl text-blue-400 focus:outline-none placeholder:text-slate-600"
                  />
                  {showProductDropdown && (
                    <div className="absolute z-20 top-full right-0 left-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl max-h-56 overflow-y-auto divide-y divide-slate-800">
                      {filteredProducts.length === 0 ? (
                        <div className="p-3 text-xs text-slate-500 text-center">No products found</div>
                      ) : (
                        filteredProducts.map((p: any) => (
                          <div
                            key={p.id || p.product_id}
                            onClick={() => handleAddItem(p)}
                            className="p-2.5 hover:bg-slate-800 cursor-pointer flex justify-between items-center text-xs transition"
                          >
                            <div>
                              <p className="font-semibold text-slate-200">{p.name || p.title}</p>
                              <p className="text-slate-400 text-[10px]">SKU: {p.sku || 'N/A'}</p>
                            </div>
                            <span className="text-blue-400 font-bold">
                              ৳{Number(p.price || p.unit_price || 0).toFixed(2)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* প্রোডাক্ট কার্ট টেবিল */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-500 uppercase">
                    <tr>
                      <th className="p-3 rounded-l-lg">Product</th>
                      <th className="p-3 w-24">Qty</th>
                      <th className="p-3 w-28">Unit Price</th>
                      <th className="p-3 w-24">Tax</th>
                      <th className="p-3 w-28 text-right">Subtotal</th>
                      <th className="p-3 w-10 rounded-r-lg"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-600">
                          Cart is empty. Search and add products above.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={index} className="hover:bg-slate-950/40 transition">
                          <td className="p-3 font-medium text-slate-200">
                            <p>{item.name}</p>
                            <span className="text-[10px] text-slate-500">SKU: {item.sku}</span>
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity === 0 ? '' : item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 focus:outline-none text-slate-100"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={item.unit_price === 0 ? '' : item.unit_price}
                              onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 focus:outline-none text-slate-100"
                            />
                          </td>
                          <td className="p-3">
                            <input
                              type="number"
                              value={item.tax_amount === 0 ? '' : item.tax_amount}
                              onChange={(e) => handleItemChange(index, 'tax_amount', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1 focus:outline-none text-slate-100"
                            />
                          </td>
                          <td className="p-3 text-right font-semibold text-slate-100">
                            ৳{item.subtotal.toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-rose-500 hover:text-rose-400 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* বিলে হিসাব ও সেটেলমেন্ট */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 h-fit shadow-sm">
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
              <CreditCard className="w-4 h-4 text-emerald-400" /> Commercial Billing Ledger
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                >
                  <option value="BANK_TRANSFER">Bank Wire / Transfer</option>
                  <option value="CHEQUE">Corporate Cheque</option>
                  <option value="CASH">Cash Settlement</option>
                  <option value="MOBILE_BANKING">bKash / Nagad</option>
                  <option value="DUE">Full Credit (Due)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Discount (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount === '' ? '' : discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Freight/Shipping (৳)</label>
                  <input
                    type="number"
                    min="0"
                    value={shippingCost === '' ? '' : shippingCost}
                    onChange={(e) => setShippingCost(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              {/* লাইভ বিল ক্যালকুলেশন প্যানেল */}
              <div className="border-t border-slate-800 pt-3 space-y-2 text-xs text-slate-300">
                <div className="flex justify-between"><span>Subtotal:</span><span>৳{calculateSubtotal().toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Tax Total:</span><span>৳{calculateTotalTax().toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-400"><span>Discount:</span><span>-৳{numDiscount.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-400"><span>Shipping:</span><span>+৳{numShipping.toFixed(2)}</span></div>

                <div className="flex justify-between text-sm font-semibold text-slate-200 border-t border-slate-800/80 pt-2">
                  <span>Current Invoice Amount:</span>
                  <span>৳{currentInvoiceTotal.toFixed(2)}</span>
                </div>

                {previousDue > 0 && (
                  <div className="flex justify-between text-rose-400 font-semibold bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
                    <span>Previous Outstanding Due:</span>
                    <span>+৳{previousDue.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-bold text-emerald-400 pt-2 border-t border-slate-800">
                  <span>Total Net Payable:</span>
                  <span>৳{netPayable.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="text-xs font-medium text-slate-400 block mb-1">Paid Amount (৳)</label>
                <input
                  type="number"
                  min="0"
                  value={paidAmount === '' ? '' : paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base font-bold text-emerald-400 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Current Invoice Due:</span>
                  <span className="font-semibold text-slate-200">৳{currentInvoiceDue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-200 font-bold border-t border-slate-800/60 pt-1.5">
                  <span>Net Total Remaining Due:</span>
                  <span className={totalNetRemainingDue > 0 ? 'text-rose-400' : 'text-emerald-400'}>
                    ৳{totalNetRemainingDue.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Remarks & Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="PO reference or notes..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Dynamic Master Invoice Modal Integration */}
      <MasterInvoiceModal
        isOpen={!!createdInvoiceNo}
        invoiceNo={createdInvoiceNo}
        onClose={() => {
          setCreatedInvoiceNo(null);
          router.push('/sales');
        }}
      />
    </>
  );
}