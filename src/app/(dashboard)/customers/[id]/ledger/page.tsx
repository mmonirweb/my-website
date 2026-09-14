'use client';

import React, { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { useCustomers } from '@/domains/customer/hooks/useCustomers';
import { CustomerLedgerItem } from '@/domains/customer/types';
import { 
  ArrowLeft, 
  FileSpreadsheet, 
  Printer, 
  User, 
  Phone, 
  Hash, 
  X, 
  FileText,
  TrendingUp,
  TrendingDown,
  Wallet,
  Search,
  Download,
  Calendar,
  RotateCcw,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function CustomerLedgerPage() {
  const params = useParams();
  const customerId = Number(params?.id);

  // States
  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState<string | null>(null);
  const [invoiceDetails, setInvoiceDetails] = useState<any | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Get Customer Details & Ledger Hook
  const { customerLedgerQuery, customerQuery } = useCustomers({ id: customerId });

  const rawLedgerData = customerLedgerQuery?.data || [];
  const ledgerData: CustomerLedgerItem[] = Array.isArray(rawLedgerData)
    ? rawLedgerData
    : rawLedgerData?.data || [];
    
  const customer = customerQuery?.data;

  // Helper function to format currency securely
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
    }).format(amount).replace('BDT', '৳');
  };

  // Helper function to format dates
  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Dynamic Fetching of Invoice Breakdown on Click
  const handleOpenInvoiceModal = async (transactionNo: string, ledgerItem: CustomerLedgerItem) => {
    setSelectedInvoiceNo(transactionNo);
    setLoadingInvoice(true);

    try {
      // Backend sale/invoice endpoint call
      const response = await fetch(`/api/v1/sales/invoice/${transactionNo}`).catch(() => null);
      if (response && response.ok) {
        const data = await response.json();
        setInvoiceDetails(data?.data || data);
      } else {
        // Safe Fallback using Ledger Row Data
        setInvoiceDetails({
          invoice_no: transactionNo,
          created_at: ledgerItem.created_at,
          created_by: (ledgerItem as any).creator?.name || (ledgerItem as any).created_by_name || 'System Administrator',
          description: ledgerItem.description,
          amount: ledgerItem.amount,
          type: ledgerItem.type,
          customer_name: customer?.name || 'Customer',
          customer_phone: customer?.phone || '—',
        });
      }
    } catch (err) {
      setInvoiceDetails({
        invoice_no: transactionNo,
        created_at: ledgerItem.created_at,
        created_by: 'System Administrator',
        description: ledgerItem.description,
        amount: ledgerItem.amount,
        type: ledgerItem.type,
        customer_name: customer?.name || 'Customer',
        customer_phone: customer?.phone || '—',
      });
    } finally {
      setLoadingInvoice(false);
    }
  };

  // Filtered Ledger Data
  const filteredLedgerData = useMemo(() => {
    return ledgerData.filter((item) => {
      // Search term filter
      const matchesSearch = 
        item.transaction_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase());

      // Date range filter
      let matchesDate = true;
      if (item.created_at) {
        const itemDate = new Date(item.created_at).setHours(0, 0, 0, 0);
        if (startDate) {
          const start = new Date(startDate).setHours(0, 0, 0, 0);
          matchesDate = matchesDate && itemDate >= start;
        }
        if (endDate) {
          const end = new Date(endDate).setHours(23, 59, 59, 999);
          matchesDate = matchesDate && itemDate <= end;
        }
      }

      return matchesSearch && matchesDate;
    });
  }, [ledgerData, searchTerm, startDate, endDate]);

  // Calculate Ledger Summaries based on filtered data
  const totalDebit = useMemo(() => {
    return filteredLedgerData.reduce((acc, item) => acc + (item.type === 'DEBIT' ? Number(item.amount || 0) : 0), 0);
  }, [filteredLedgerData]);

  const totalCredit = useMemo(() => {
    return filteredLedgerData.reduce((acc, item) => acc + (item.type === 'CREDIT' ? Number(item.amount || 0) : 0), 0);
  }, [filteredLedgerData]);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (!filteredLedgerData.length) return;

    const headers = ['Date,Transaction No,Description,Debit (DR),Credit (CR),Running Balance,Type'];
    const rows = filteredLedgerData.map((item) => {
      const date = item.created_at ? new Date(item.created_at).toLocaleDateString('en-GB') : '';
      const txNo = `"${item.transaction_no || ''}"`;
      const desc = `"${(item.description || '').replace(/"/g, '""')}"`;
      const debit = item.type === 'DEBIT' ? Number(item.amount || 0).toFixed(2) : '0.00';
      const credit = item.type === 'CREDIT' ? Number(item.amount || 0).toFixed(2) : '0.00';
      const balance = Number(item.running_balance || 0).toFixed(2);
      const balanceType = Number(item.running_balance || 0) >= 0 ? 'DR' : 'CR';

      return `${date},${txNo},${desc},${debit},${credit},${balance},${balanceType}`;
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Customer_Ledger_${customer?.customer_code || customerId}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 space-y-6 print:bg-white print:text-black print:p-0">
      
      {/* Top Header - Hidden in Print */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-4 gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/customers"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
            aria-label="Back to Customers"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-blue-400" />
              Customer Financial Ledger
            </h1>
            <p className="text-xs text-slate-400">
              Official Statement of Account & Audit Records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            disabled={filteredLedgerData.length === 0}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Download CSV
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-400" /> Print Statement
          </button>
        </div>
      </div>

      {/* Printable Header Title (Visible only when printed) */}
      <div className="hidden print:block text-center border-b pb-4 mb-4">
        <h1 className="text-2xl font-bold text-black">CUSTOMER STATEMENT OF ACCOUNT</h1>
        <p className="text-xs text-gray-600">Generated on {new Date().toLocaleDateString('en-GB')}</p>
      </div>

      {/* Customer Information Card */}
      {customer && (
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:border-gray-300 print:bg-gray-50 print:text-black">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 print:hidden">
              <User className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-500 print:text-gray-600">Customer Name</div>
              <div className="text-sm font-bold text-white print:text-black">{customer.name}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 print:hidden">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-500 print:text-gray-600">Code & Group</div>
              <div className="text-sm font-bold text-white print:text-black">
                {customer.customer_code} <span className="text-xs font-normal text-slate-400 print:text-gray-600">({customer.customer_group})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 print:hidden">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-500 print:text-gray-600">Contact</div>
              <div className="text-sm font-bold text-white print:text-black">{customer.phone || '—'}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 print:hidden">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-semibold text-slate-500 print:text-gray-600">Net Receivable Balance</div>
              <div className={`text-sm font-bold ${Number(customer.current_balance || 0) >= 0 ? 'text-amber-400 print:text-black' : 'text-emerald-400 print:text-black'}`}>
                {formatCurrency(Number(customer.current_balance || 0))}
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded border bg-amber-500/10 text-amber-400 border-amber-500/20 print:border-gray-400 print:text-black">
                  {Number(customer.current_balance || 0) >= 0 ? 'DR' : 'CR'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar - Hidden in Print */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row gap-3 items-center justify-between print:hidden">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by TRX No, Description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
          />
        </div>

        {/* Date Filter & Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none [color-scheme:dark]"
            />
            <span className="text-slate-600 text-xs">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none [color-scheme:dark]"
            />
          </div>

          {(searchTerm || startDate || endDate) && (
            <button
              onClick={handleResetFilters}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Cards - Hidden in Print */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:hidden">
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Billed (Debit)</p>
            <p className="text-lg font-bold text-amber-400 font-mono mt-1">{formatCurrency(totalDebit)}</p>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Total Paid (Credit)</p>
            <p className="text-lg font-bold text-emerald-400 font-mono mt-1">{formatCurrency(totalCredit)}</p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">Closing Balance</p>
            <p className="text-lg font-bold text-white font-mono mt-1">
              {formatCurrency(Math.abs(totalDebit - totalCredit))}
              <span className="text-xs font-sans ml-1 text-slate-400 font-normal">
                ({(totalDebit - totalCredit) >= 0 ? 'DR' : 'CR'})
              </span>
            </p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Ledger Table Section */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 shadow-2xl print:border-none print:p-0 print:bg-transparent">
        {customerLedgerQuery?.isLoading ? (
          <div className="text-center py-12 text-slate-400">Loading Ledger Statements...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 print:text-black">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold print:bg-gray-100 print:text-black print:border-gray-300">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Transaction No</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Debit (DR)</th>
                  <th className="p-3 text-right">Credit (CR)</th>
                  <th className="p-3 text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 print:divide-gray-300">
                {filteredLedgerData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">
                      No matching transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredLedgerData.map((item: CustomerLedgerItem) => {
                    const isDebit = item.type === 'DEBIT';
                    const isCredit = item.type === 'CREDIT';
                    const balance = Number(item.running_balance || 0);

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition-colors print:hover:bg-transparent">
                        {/* Date */}
                        <td className="p-3 text-slate-400 font-medium whitespace-nowrap print:text-black">
                          {formatDate(item.created_at)}
                        </td>

                        {/* Interactive Transaction / Invoice Link */}
                        <td className="p-3 font-mono font-bold">
                          {item.transaction_no ? (
                            <button
                              type="button"
                              onClick={() => handleOpenInvoiceModal(item.transaction_no, item)}
                              className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer flex items-center gap-1.5 focus:outline-none print:text-black print:no-underline"
                            >
                              <FileText className="w-3.5 h-3.5 opacity-70 print:hidden" />
                              {item.transaction_no}
                            </button>
                          ) : (
                            <span className="text-slate-500 font-mono">৳ 0.00</span>
                          )}
                        </td>

                        {/* Description */}
                        <td className="p-3 text-slate-300 font-medium max-w-xs truncate print:text-black">
                          {item.description || '—'}
                        </td>

                        {/* Debit (Receivable Increase) */}
                        <td className="p-3 text-right font-mono text-amber-400 whitespace-nowrap print:text-black">
                          {isDebit ? formatCurrency(Number(item.amount)) : <span className="text-slate-500 font-normal">৳ 0.00</span>}
                        </td>

                        {/* Credit (Payment Received) */}
                        <td className="p-3 text-right font-mono text-emerald-400 whitespace-nowrap print:text-black">
                          {isCredit ? formatCurrency(Number(item.amount)) : <span className="text-slate-500 font-normal">৳ 0.00</span>}
                        </td>

                        {/* Running Balance + DR/CR Tag */}
                        <td className="p-3 text-right font-mono font-bold text-white whitespace-nowrap print:text-black">
                          <span className="mr-1.5">{formatCurrency(Math.abs(balance))}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans border ${
                            balance >= 0 
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 print:border-gray-400 print:text-black' 
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 print:border-gray-400 print:text-black'
                          }`}>
                            {balance >= 0 ? 'DR' : 'CR'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Printable Invoice Modal with Creator Info */}
      {selectedInvoiceNo && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => {
                setSelectedInvoiceNo(null);
                setInvoiceDetails(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {loadingInvoice ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                <span className="text-xs">Fetching Invoice Breakdown...</span>
              </div>
            ) : (
              <>
                <div className="border-b pb-3 flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-wider">SALES INVOICE</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">Ref No: {invoiceDetails?.invoice_no || selectedInvoiceNo}</p>
                    <p className="text-xs text-slate-500 font-mono">Date: {formatDate(invoiceDetails?.created_at)}</p>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-700"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <div>
                      <span className="text-slate-500 block">Customer:</span>
                      <span className="font-bold text-slate-800 text-sm">{invoiceDetails?.customer_name || customer?.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Issued / Created By:</span>
                      <span className="font-bold text-blue-700 text-sm">{invoiceDetails?.created_by || 'System User'}</span>
                    </div>
                  </div>

                  {/* Line Items List if Array exists */}
                  {Array.isArray(invoiceDetails?.items) && invoiceDetails.items.length > 0 ? (
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b bg-slate-100 text-slate-700">
                          <th className="py-2 px-2">Item</th>
                          <th className="py-2 px-2 text-center">Qty</th>
                          <th className="py-2 px-2 text-right">Unit Price</th>
                          <th className="py-2 px-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {invoiceDetails.items.map((item: any, idx: number) => (
                          <tr key={idx}>
                            <td className="py-2 px-2">{item.product_name || item.name}</td>
                            <td className="py-2 px-2 text-center">{item.quantity}</td>
                            <td className="py-2 px-2 text-right">৳{Number(item.unit_price || 0).toFixed(2)}</td>
                            <td className="py-2 px-2 text-right font-semibold">৳{Number(item.subtotal || 0).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="flex justify-between text-slate-600">
                        <span>Transaction Note:</span>
                        <span className="font-medium">{invoiceDetails?.description || 'Sales Transaction Entry'}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Transaction Type:</span>
                        <span className="font-semibold">{invoiceDetails?.type || 'DEBIT'}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-sm font-bold border-t pt-2 text-slate-900">
                    <span>Total Amount:</span>
                    <span className="text-base text-emerald-600">{formatCurrency(Number(invoiceDetails?.amount || invoiceDetails?.grand_total || 0))}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedInvoiceNo(null);
                      setInvoiceDetails(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-300"
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}