'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useCustomerPayments } from '../hooks/useCustomerPayments';
import { 
  X, 
  Printer, 
  User, 
  ShieldCheck, 
  Receipt,
  RotateCcw,
  Search,
  ChevronDown,
  Check
} from 'lucide-react';

interface Customer {
  id: number;
  name: string;
  phone?: string;
  current_balance: string | number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  customer?: Customer | null;
}

type PaymentMethod = 'CASH' | 'CARD' | 'MOBILE_BANKING' | 'BANK_TRANSFER' | 'CHEQUE';

export default function ReceivePaymentModal({ isOpen, onClose, onSuccess, customer: initialCustomer }: Props) {
  const { collectPayment, isSubmitting, customers: customerList } = useCustomerPayments();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(initialCustomer || null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [referenceNo, setReferenceNo] = useState('');
  const [notes, setNotes] = useState('');

  const [payerType, setPayerType] = useState<'SELF' | 'THIRD_PARTY'>('SELF');
  const [payerName, setPayerName] = useState('');
  const [payerPhone, setPayerPhone] = useState('');

  const [isSuccess, setIsSuccess] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  useEffect(() => {
    if (initialCustomer) {
      setSelectedCustomer(initialCustomer);
    } else if (customerList.length > 0 && !selectedCustomer) {
      setSelectedCustomer(customerList[0]);
    }
  }, [initialCustomer, customerList]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCustomers = useMemo(() => {
    return customerList.filter((c: Customer) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.phone && c.phone.includes(customerSearch))
    );
  }, [customerList, customerSearch]);

  if (!isOpen) return null;

  const handleReset = () => {
    setAmount('');
    setReferenceNo('');
    setNotes('');
    setPayerType('SELF');
    setPayerName('');
    setPayerPhone('');
    setIsSuccess(false);
    setReceiptData(null);
    setCustomerSearch('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert('Please select a customer.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const formattedNotes = [
      payerType === 'THIRD_PARTY' ? `[Paid By: ${payerName}, Phone: ${payerPhone}]` : '[Paid By: Self]',
      notes
    ].filter(Boolean).join(' - ');

    const payload = {
      customer_id: selectedCustomer.id,
      payment_date: new Date().toISOString().split('T')[0],
      amount: numericAmount,
      payment_method: paymentMethod,
      reference_no: referenceNo,
      notes: formattedNotes,
    };

    try {
      const response = await collectPayment(payload);
      const paymentInfo = response?.data || response;
      
      const currentBal = parseFloat(String(selectedCustomer.current_balance || 0));

      setReceiptData({
        receiptNo: paymentInfo.payment_no || `MR-${Date.now().toString().slice(-6)}`,
        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone || 'N/A',
        amount: numericAmount,
        previousBalance: currentBal,
        remainingBalance: currentBal - numericAmount,
        method: paymentMethod,
        referenceNo: referenceNo || 'N/A',
        payerName: payerType === 'THIRD_PARTY' ? payerName : selectedCustomer.name,
      });

      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      alert('Failed to collect payment. Please check server logs.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 transition-all">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4 print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">
              {isSuccess ? 'Money Receipt' : 'Receive Customer Payment'}
            </h2>
          </div>
          <button 
            onClick={handleClose} 
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* View 1: Success Printable Receipt */}
        {isSuccess && receiptData ? (
          <div className="p-6 space-y-6">
            <div id="printable-receipt" className="space-y-4 rounded-xl border border-slate-200 bg-slate-50/50 p-5 text-sm">
              <div className="text-center border-b border-slate-200 pb-3">
                <h3 className="text-xl font-black text-indigo-950 uppercase tracking-wider">Money Receipt</h3>
                <p className="text-xs text-slate-500 mt-0.5">Receipt No: {receiptData.receiptNo} | Date: {receiptData.date}</p>
              </div>

              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Name:</span>
                  <span className="font-semibold text-slate-900">{receiptData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Paid By:</span>
                  <span className="font-semibold text-slate-900">{receiptData.payerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-semibold text-slate-900">{receiptData.method} ({receiptData.referenceNo})</span>
                </div>
              </div>

              <div className="rounded-lg bg-indigo-50/70 p-3 space-y-1.5 border border-indigo-100">
                <div className="flex justify-between text-xs text-indigo-900">
                  <span>Previous Due Balance:</span>
                  <span>৳ {Number(receiptData.previousBalance).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-indigo-950">
                  <span>Amount Collected:</span>
                  <span className="text-emerald-600">৳ {Number(receiptData.amount).toFixed(2)}</span>
                </div>
                <div className="border-t border-indigo-200/60 pt-1 flex justify-between text-xs font-semibold text-indigo-900">
                  <span>Remaining Due Balance:</span>
                  <span>৳ {Number(receiptData.remainingBalance).toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between text-[10px] text-slate-400">
                <span>Authorized Signature: _________________</span>
                <span>Office Copy / Customer Copy</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 print:hidden">
              <button
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                New Payment
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 transition-colors"
              >
                <Printer className="h-4 w-4" />
                Print Receipt
              </button>
            </div>
          </div>
        ) : (

        /* View 2: Payment Input Form */
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Searchable Customer Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Customer *</label>
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between rounded-lg border border-slate-300 p-2.5 bg-white cursor-pointer hover:border-indigo-500 transition-colors"
            >
              <div>
                {selectedCustomer ? (
                  <span className="text-sm font-bold text-slate-800">{selectedCustomer.name}</span>
                ) : (
                  <span className="text-sm text-slate-400">Choose a customer...</span>
                )}
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>

            {/* Dropdown Options Box */}
            {isDropdownOpen && (
              <div className="absolute z-20 mt-1 w-full rounded-xl bg-white border border-slate-200 shadow-xl overflow-hidden">
                <div className="p-2 border-b border-slate-100 bg-slate-50">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search customer name or phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 pl-8 pr-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-slate-50">
                  {filteredCustomers.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">No customers found</div>
                  ) : (
                    filteredCustomers.map((cust: Customer) => (
                      <div
                        key={cust.id}
                        onClick={() => {
                          setSelectedCustomer(cust);
                          setIsDropdownOpen(false);
                          setCustomerSearch('');
                        }}
                        className={`flex items-center justify-between px-3 py-2 text-xs cursor-pointer hover:bg-indigo-50/50 transition-colors ${
                          selectedCustomer?.id === cust.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-semibold text-slate-800">{cust.name}</p>
                          <p className="text-[10px] text-slate-400">{cust.phone || 'No phone'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-rose-600">
                            ৳ {parseFloat(String(cust.current_balance || 0)).toFixed(2)}
                          </span>
                          {selectedCustomer?.id === cust.id && <Check className="h-3.5 w-3.5 text-indigo-600" />}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Customer Due Banner */}
          {selectedCustomer && (
            <div className="rounded-xl bg-indigo-50/60 border border-indigo-100 p-3.5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-indigo-600">Customer Name</p>
                <p className="text-sm font-bold text-slate-800">{selectedCustomer.name}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-indigo-600">Current Due Balance</p>
                <p className="text-base font-black text-rose-600">
                  ৳ {parseFloat(String(selectedCustomer.current_balance || 0)).toFixed(2)}
                </p>
              </div>
            </div>
          )}

          {/* Payer Selection */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setPayerType('SELF')}
              className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border font-semibold transition-all ${
                payerType === 'SELF'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Customer (Self)
            </button>
            <button
              type="button"
              onClick={() => setPayerType('THIRD_PARTY')}
              className={`flex items-center justify-center gap-1.5 p-2.5 rounded-lg border font-semibold transition-all ${
                payerType === 'THIRD_PARTY'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="h-3.5 w-3.5" />
              Third Party
            </button>
          </div>

          {/* Third Party Extra Fields */}
          {payerType === 'THIRD_PARTY' && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Payer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter name"
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Payer Phone</label>
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  className="w-full rounded-md border border-slate-300 p-2 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Amount & Method */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Paid (৳) *</label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-bold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e: any) => setPaymentMethod(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm font-medium focus:border-indigo-500 focus:outline-none"
              >
                <option value="CASH">Cash</option>
                <option value="MOBILE_BANKING">Mobile Banking</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CARD">Card</option>
                <option value="CHEQUE">Cheque</option>
              </select>
            </div>
          </div>

          {/* Reference & Notes */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">TrxID / Reference</label>
              <input
                type="text"
                placeholder="e.g. TRX-8921"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
              <input
                type="text"
                placeholder="Enter comments..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? 'Processing...' : 'Collect Payment'}
            </button>
          </div>
        </form>
        )}

      </div>
    </div>
  );
}