'use client';

import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { useInvoice } from '../hooks/useInvoice';

interface MasterInvoiceModalProps {
  invoiceNo: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MasterInvoiceModal({ invoiceNo, isOpen, onClose }: MasterInvoiceModalProps) {
  const { data: invoice, isLoading, isError } = useInvoice(isOpen ? invoiceNo : null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const isReceipt = invoice?.type?.includes('PAYMENT');

  const items = 
    invoice?.snapshot_data?.items || 
    invoice?.snapshot_data?.return_items || 
    [];

  // User / Sales Rep resolution
  const inv = invoice as any;
  const createdBy = 
    inv?.user?.name || 
    inv?.created_by_user?.name || 
    inv?.creator?.name || 
    inv?.created_by || 
    'N/A';

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col my-8 max-h-[90vh] print:max-h-none print:m-0 print:shadow-none print:w-full print:max-w-none">
        
        {/* Header Actions */}
        <div className="flex justify-between items-center p-4 bg-slate-100 border-b border-slate-200 shrink-0 print:hidden">
          <h3 className="font-bold text-slate-700 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            {isReceipt ? 'Money Receipt Preview' : 'Commercial Invoice Preview'}
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="p-12 text-center text-slate-500">Loading invoice document...</div>
          ) : isError || !invoice ? (
            <div className="p-12 text-center text-rose-500 font-semibold">Failed to load invoice details. Please check invoice number.</div>
          ) : (
            <div className="p-8 space-y-6 text-sm print:p-0">
              
              {/* Header / Company Info */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
                    {invoice.type ? String(invoice.type).replace(/_/g, ' ') : 'INVOICE'}
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Document No: <span className="font-bold text-slate-800">{invoice.invoice_no}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Date: {invoice.created_at ? new Date(invoice.created_at).toLocaleString() : ''}
                  </p>
                  <p className="text-xs text-slate-500">
                    Prepared By: <span className="font-semibold text-slate-700">{createdBy}</span>
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-extrabold text-blue-600">ENTERPRISE ERP</h2>
                  <p className="text-xs text-slate-500">Official System Invoice</p>
                </div>
              </div>

              {/* Party Information */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">BILL TO / PARTY DETAILS:</p>
                  <p className="font-bold text-slate-800 text-base">{invoice.party_name || 'N/A'}</p>
                  {invoice.party_phone && (
                    <p className="text-xs text-slate-600">Phone: {invoice.party_phone}</p>
                  )}
                  {invoice.party_address && (
                    <p className="text-xs text-slate-500">Address: {invoice.party_address}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-semibold uppercase">PAYMENT MODE & STATUS:</p>
                  <p className="font-bold text-slate-700">{invoice.payment_method || 'N/A'}</p>
                  <span className={`inline-block mt-1 px-3 py-0.5 text-xs font-extrabold rounded-full ${
                    invoice.payment_status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {invoice.payment_status || 'PROCESSED'}
                  </span>
                </div>
              </div>

              {/* Itemized Table */}
              {!isReceipt && items.length > 0 && (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-xs text-slate-500 uppercase">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {items.map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2.5 font-medium text-slate-800">
                          {item.name || item.product?.name || 'Product Item'}
                          {(item.sku || item.product?.sku) && (
                            <span className="block text-[10px] text-slate-400">SKU: {item.sku || item.product?.sku}</span>
                          )}
                        </td>
                        <td className="py-2.5 text-center">{item.quantity ?? item.qty ?? 0}</td>
                        <td className="py-2.5 text-right">৳{Number(item.unit_price || 0).toFixed(2)}</td>
                        <td className="py-2.5 text-right font-semibold text-slate-800">
                          ৳{Number(item.subtotal || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* Financial Summary */}
              <div className="border-t border-slate-200 pt-4 flex justify-end">
                <div className="w-full max-w-xs space-y-2 text-xs">
                  {!isReceipt && (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>Subtotal:</span>
                        <span>৳{Number(invoice.subtotal || 0).toFixed(2)}</span>
                      </div>
                      {Number(invoice.tax_amount) > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Tax:</span>
                          <span>+৳{Number(invoice.tax_amount || 0).toFixed(2)}</span>
                        </div>
                      )}
                      {Number(invoice.discount_amount) > 0 && (
                        <div className="flex justify-between text-slate-600">
                          <span>Discount:</span>
                          <span>-৳{Number(invoice.discount_amount || 0).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-slate-800 border-t border-slate-200 pt-1">
                        <span>Grand Total:</span>
                        <span>৳{Number(invoice.grand_total || 0).toFixed(2)}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-slate-500">
                    <span>Previous Due Balance:</span>
                    <span>৳{Number(invoice.previous_due || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                    <span>Paid / Adjusted Amount:</span>
                    <span>৳{Number(invoice.paid_amount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-slate-900 border-t-2 border-slate-800 pt-1">
                    <span>Updated Current Due:</span>
                    <span className={Number(invoice.current_balance) > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      ৳{Number(invoice.current_balance || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {invoice.notes && (
                <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700">Notes / Reason: </span>
                  {invoice.notes}
                </div>
              )}

              {/* Footer */}
              <div className="text-center border-t border-slate-200 pt-6 text-[11px] text-slate-400">
                This is a computer-generated official document. No signature is required.
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}