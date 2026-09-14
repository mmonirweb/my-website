'use client';

import React, { useState, useEffect } from 'react';
import { useSales } from '@/domains/sales/hooks/useSales';
import { useProducts } from '@/domains/catalog/hooks/useCatalog';
import { useCustomers } from '@/domains/customer/hooks/useCustomers';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, Printer, X, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

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

  // Hooks Integration
  const productsQuery = useProducts() as any;
  const customerHook = useCustomers() as any;

  // Extract Customer Query Object
  const customerQuery = customerHook?.customersQuery || customerHook;

  // Safe Data Extraction - Customer List
  const rawCustomers = customerQuery?.data?.data || customerQuery?.data || customerQuery;
  const customersList = Array.isArray(rawCustomers)
    ? rawCustomers
    : Array.isArray(rawCustomers?.data)
      ? rawCustomers.data
      : Array.isArray(rawCustomers?.customers)
        ? rawCustomers.customers
        : [];

  // Safe Data Extraction - Product List
  const rawProducts = productsQuery?.data?.data || productsQuery?.data || productsQuery;
  const productsList = Array.isArray(rawProducts)
    ? rawProducts
    : Array.isArray(rawProducts?.data)
      ? rawProducts.data
      : Array.isArray(rawProducts?.products)
        ? rawProducts.products
        : [];

  // Form States
  const [saleType, setSaleType] = useState<'RETAIL' | 'WHOLESALE' | 'COMMERCIAL'>('COMMERCIAL');
  const [customerId, setCustomerId] = useState<number | ''>('');
  const [warehouseId, setWarehouseId] = useState<number>(1);
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD' | 'MOBILE_BANKING' | 'BANK_TRANSFER' | 'CHEQUE' | 'DUE'>('BANK_TRANSFER');
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<SelectedProduct[]>([]);
  
  // Created Invoice Modal State
  const [createdInvoice, setCreatedInvoice] = useState<any | null>(null);

  // Auto trigger print when invoice modal opens
  useEffect(() => {
    if (createdInvoice) {
      const timer = setTimeout(() => {
        window.print();
      }, 500); // 500ms delay ensures UI renders properly before printing
      return () => clearTimeout(timer);
    }
  }, [createdInvoice]);

  const handleAddItem = (productId: number) => {
    const prod = productsList.find((p: any) => Number(p.id || p.product_id) === productId);
    if (!prod) return;

    const existingIndex = items.findIndex((i) => i.product_id === productId);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].subtotal = (updated[existingIndex].quantity * updated[existingIndex].unit_price) - updated[existingIndex].discount_amount + updated[existingIndex].tax_amount;
      setItems(updated);
    } else {
      const price = Number(prod.price || prod.selling_price || prod.unit_price || 0);
      setItems([
        ...items,
        {
          product_id: Number(prod.id || prod.product_id),
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
  };

  const handleItemChange = (index: number, field: keyof SelectedProduct, value: number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    updated[index].subtotal = (updated[index].quantity * updated[index].unit_price) - updated[index].discount_amount + updated[index].tax_amount;
    setItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateSubtotal = () => items.reduce((acc, item) => acc + (item.quantity * item.unit_price), 0);
  const calculateTotalTax = () => items.reduce((acc, item) => acc + item.tax_amount, 0);
  const calculateGrandTotal = () => (calculateSubtotal() - discountAmount) + calculateTotalTax() + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || items.length === 0) {
      alert('Please select a customer and add at least one product.');
      return;
    }

    try {
      const res: any = await createSale({
        sale_type: saleType,
        customer_id: Number(customerId),
        warehouse_id: warehouseId,
        sale_date: saleDate,
        discount_amount: discountAmount,
        shipping_cost: shippingCost,
        paid_amount: paidAmount,
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

      // Safely extract sale payload response
      const saleData = res?.data?.data || res?.data || res || {};
      const selectedCustomer = customersList.find((c: any) => Number(c.id || c.customer_id || c._id) === Number(customerId));

      // Construct and set Invoice to automatically open modal and trigger print
      const generatedInvoice = {
        invoice_no: saleData?.invoice_no || saleData?.invoice_number || saleData?.code || 'INV-' + Math.floor(100000 + Math.random() * 900000),
        sale_date: saleDate,
        customer_name: selectedCustomer?.name || selectedCustomer?.customer_name || 'Valued Customer',
        customer_phone: selectedCustomer?.phone || selectedCustomer?.mobile || 'N/A',
        created_by: saleData?.creator?.name || saleData?.created_by_name || 'System Operator / Admin',
        items: [...items],
        subtotal: calculateSubtotal(),
        tax_amount: calculateTotalTax(),
        discount_amount: discountAmount,
        shipping_cost: shippingCost,
        grand_total: calculateGrandTotal(),
        paid_amount: paidAmount,
        due_amount: calculateGrandTotal() - paidAmount,
        payment_method: paymentMethod,
      };

      setCreatedInvoice(generatedInvoice);

    } catch (err: any) {
      console.error('Sale Creation Error:', err);
      alert(err?.response?.data?.message || err?.message || 'Failed to create sale entry');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-6 space-y-6 bg-slate-950 text-slate-100 min-h-screen">
        <div className="flex justify-between items-center border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <Link href="/sales" className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Create Direct ERP / Commercial Sale</h1>
              <p className="text-xs text-slate-400">Issue Commercial, Wholesale & Corporate Invoices</p>
            </div>
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isCreating ? 'Processing Order...' : 'Complete & Issue Invoice'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Basic Configuration */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Order Meta Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Sale Classification</label>
                <select
                  value={saleType}
                  onChange={(e: any) => setSaleType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                >
                  <option value="COMMERCIAL">Commercial Sale</option>
                  <option value="WHOLESALE">Wholesale Bulk</option>
                  <option value="RETAIL">Direct Retail</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Target Customer</label>
                <select
                  value={customerId}
                  onChange={(e: any) => setCustomerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  required
                >
                  <option value="">
                    {customerQuery?.isLoading || customerQuery?.isPending
                      ? 'Loading Customers...'
                      : `-- Select Customer (${customersList.length} Found) --`}
                  </option>
                  {customersList.map((c: any, index: number) => {
                    const id = c.id || c.customer_id || c._id;
                    const name = c.name || c.customer_name || c.first_name || (c.last_name ? `${c.first_name || ''} ${c.last_name}` : '') || 'Unnamed Customer';
                    const phone = c.phone || c.mobile || c.phone_number || '';
                    return (
                      <option key={id || index} value={id}>
                        {name} {phone ? `(${phone})` : ''}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Issue Date</label>
                <input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                />
              </div>
            </div>

            {/* Item Selector & Table */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-semibold text-slate-400 uppercase">Line Items</h3>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleAddItem(Number(e.target.value));
                    e.target.value = '';
                  }}
                  className="bg-slate-950 border border-slate-800 text-xs px-3 py-1.5 rounded-lg text-blue-400 font-semibold focus:outline-none"
                >
                  <option value="">
                    {productsQuery?.isLoading || productsQuery?.isPending
                      ? 'Loading Products...'
                      : '+ Add Product to Invoice'}
                  </option>
                  {productsList.map((p: any, index: number) => (
                    <option key={p.id || p.product_id || index} value={p.id || p.product_id}>
                      {p.name || p.title} ({p.sku || 'N/A'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-500 uppercase">
                    <tr>
                      <th className="p-2.5">Product</th>
                      <th className="p-2.5 w-24">Qty</th>
                      <th className="p-2.5 w-28">Unit Price</th>
                      <th className="p-2.5 w-24">Tax</th>
                      <th className="p-2.5 w-28 text-right">Subtotal</th>
                      <th className="p-2.5 w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-slate-600">
                          No products added to this invoice.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={index}>
                          <td className="p-2.5 font-medium text-slate-200">{item.name}</td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => handleItemChange(index, 'unit_price', Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1"
                            />
                          </td>
                          <td className="p-2.5">
                            <input
                              type="number"
                              value={item.tax_amount}
                              onChange={(e) => handleItemChange(index, 'tax_amount', Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1"
                            />
                          </td>
                          <td className="p-2.5 text-right font-semibold text-slate-100">
                            ৳{item.subtotal.toFixed(2)}
                          </td>
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(index)}
                              className="text-rose-500 hover:text-rose-400"
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

          {/* Commercial Ledger & Summary */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 h-fit">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Payment & Settlement</h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Payment Channel</label>
                <select
                  value={paymentMethod}
                  onChange={(e: any) => setPaymentMethod(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
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
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-400 block mb-1">Freight/Shipping (৳)</label>
                  <input
                    type="number"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200"
                  />
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between"><span>Subtotal:</span><span>৳{calculateSubtotal().toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Total Tax:</span><span>৳{calculateTotalTax().toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-400"><span>Discount:</span><span>-৳{discountAmount.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-400"><span>Freight:</span><span>+৳{shippingCost.toFixed(2)}</span></div>
                <div className="flex justify-between text-base font-bold text-emerald-400 pt-2 border-t border-slate-800">
                  <span>Grand Total:</span>
                  <span>৳{calculateGrandTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-2">
                <label className="text-xs font-medium text-slate-400 block mb-1">Paid Amount (৳)</label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-400 block mb-1">Remarks & Notes</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Purchase Order Reference, Commercial details..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Invoice Created Modal & Direct Printable View */}
      {createdInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 print:hidden">
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <CheckCircle2 className="w-5 h-5" />
                <span>Sale Issued Successfully!</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Invoice
                </button>
                <button
                  onClick={() => {
                    setCreatedInvoice(null);
                    router.push('/sales');
                  }}
                  className="p-1.5 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Header */}
            <div className="border-b pb-4 flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-wider uppercase">COMMERCIAL INVOICE</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Invoice No: {createdInvoice.invoice_no}</p>
                <p className="text-xs text-slate-500 font-mono">Date: {createdInvoice.sale_date}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-semibold uppercase">Customer Details</p>
                <p className="text-sm font-bold text-slate-800">{createdInvoice.customer_name}</p>
                <p className="text-xs text-slate-600">{createdInvoice.customer_phone}</p>
              </div>
            </div>

            {/* Product Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-300 bg-slate-50 text-slate-700 font-bold uppercase">
                  <th className="py-2 px-2">Item</th>
                  <th className="py-2 px-2 text-center">Qty</th>
                  <th className="py-2 px-2 text-right">Unit Price</th>
                  <th className="py-2 px-2 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {createdInvoice.items.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="py-2 px-2 font-medium">{item.name}</td>
                    <td className="py-2 px-2 text-center">{item.quantity}</td>
                    <td className="py-2 px-2 text-right">৳{item.unit_price.toFixed(2)}</td>
                    <td className="py-2 px-2 text-right font-semibold">৳{item.subtotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Calculations & Summary */}
            <div className="border-t border-slate-300 pt-3 flex justify-between items-end">
              <div className="text-xs space-y-1">
                <p className="text-slate-600"><span className="font-semibold text-slate-800">Prepared & Issued By:</span> {createdInvoice.created_by}</p>
                <p className="text-slate-600"><span className="font-semibold text-slate-800">Payment Channel:</span> {createdInvoice.payment_method}</p>
              </div>
              <div className="w-48 text-xs space-y-1">
                <div className="flex justify-between text-slate-600"><span>Subtotal:</span><span>৳{createdInvoice.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Discount:</span><span>-৳{createdInvoice.discount_amount.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Freight:</span><span>+৳{createdInvoice.shipping_cost.toFixed(2)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Paid:</span><span>৳{createdInvoice.paid_amount.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm font-bold text-slate-900 border-t pt-1">
                  <span>Net Due:</span>
                  <span>৳{createdInvoice.due_amount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t flex justify-end gap-2 print:hidden">
              <button
                type="button"
                onClick={() => {
                  setCreatedInvoice(null);
                  router.push('/sales');
                }}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 cursor-pointer"
              >
                Done & View All Sales
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}