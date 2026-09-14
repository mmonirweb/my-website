'use client';

import React, { useState, useEffect } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { Customer, CustomerPayload } from '../types';
import {
  X,
  UserCheck,
  Building2,
  Phone,
  Mail,
  ShieldAlert,
  CreditCard,
  MapPin,
  FileText,
  BadgePercent,
  Layers,
  Sparkles,
  Loader2,
  UserCog,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
}

export type CustomerFormData = CustomerPayload & {
  code?: string;
  secondary_phone?: string;
  tax_number?: string;
  company_name?: string;
  balance_type?: 'DEBIT' | 'CREDIT';
  payment_terms?: string;
  billing_address?: string;
  shipping_address?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  notes?: string;
};

const INITIAL_FORM_STATE: CustomerFormData = {
  name: '',
  code: '',
  phone: '',
  secondary_phone: '',
  email: '',
  tax_number: '',
  company_name: '',
  type: 'INDIVIDUAL',
  customer_group: 'RETAIL',
  source: 'POS',
  credit_limit: 0,
  opening_balance: 0,
  balance_type: 'DEBIT',
  payment_terms: 'NET_30',
  billing_address: '',
  shipping_address: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'Bangladesh',
  notes: '',
  is_active: true,
};

export const CreateCustomerModal: React.FC<Props> = ({ isOpen, onClose, customer }) => {
  const { createCustomerMutation, updateCustomerMutation } = useCustomers();
  const [formData, setFormData] = useState<CustomerFormData>(INITIAL_FORM_STATE);
  const [sameAsBilling, setSameAsBilling] = useState<boolean>(true);

  const isEditMode = Boolean(customer?.id);

  // Load customer details when editing or reset form when creating
  useEffect(() => {
    if (customer) {
      const extCustomer = customer as Record<string, any>;
      setFormData({
        name: customer.name || '',
        code: extCustomer.customer_code || extCustomer.code || '',
        phone: customer.phone || '',
        secondary_phone: extCustomer.secondary_phone || '',
        email: customer.email || '',
        tax_number: extCustomer.tax_number || '',
        company_name: extCustomer.company_name || '',
        type: extCustomer.type || 'INDIVIDUAL',
        customer_group: customer.customer_group || 'RETAIL',
        source: customer.source || 'POS',
        credit_limit: Number(customer.credit_limit) || 0,
        opening_balance: Number(extCustomer.opening_balance) || 0,
        balance_type: extCustomer.balance_type || 'DEBIT',
        payment_terms: extCustomer.payment_terms || 'NET_30',
        billing_address: extCustomer.billing_address || '',
        shipping_address: extCustomer.shipping_address || '',
        city: extCustomer.city || '',
        state: extCustomer.state || '',
        postal_code: extCustomer.postal_code || '',
        country: extCustomer.country || 'Bangladesh',
        notes: extCustomer.notes || '',
        is_active: customer.is_active ?? true,
      });
      setSameAsBilling(
        !extCustomer.shipping_address ||
          extCustomer.shipping_address === extCustomer.billing_address
      );
    } else {
      setFormData(INITIAL_FORM_STATE);
      setSameAsBilling(true);
    }
  }, [customer, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (field: keyof CustomerFormData, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'billing_address' && sameAsBilling) {
        updated.shipping_address = value as string;
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      shipping_address: sameAsBilling ? formData.billing_address : formData.shipping_address,
    };

    if (isEditMode && customer?.id) {
      (updateCustomerMutation as any).mutate(
        { id: customer.id, data: payload },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      (createCustomerMutation as any).mutate(payload, {
        onSuccess: () => {
          setFormData(INITIAL_FORM_STATE);
          setSameAsBilling(true);
          onClose();
        },
      });
    }
  };

  const isSubmitting =
    (createCustomerMutation as any)?.isPending ||
    (updateCustomerMutation && (updateCustomerMutation as any)?.isPending);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 text-slate-100 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 p-[2px] shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-blue-400">
                {isEditMode ? <UserCog className="w-5 h-5 text-amber-400" /> : <UserCheck className="w-5 h-5" />}
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                {isEditMode ? 'Edit Customer Profile' : 'Create New Customer'}
                <span className="text-[10px] font-extrabold bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  ERP & E-Commerce
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                {isEditMode
                  ? 'Update customer details, credit limits, and contact info.'
                  : 'Add a new customer profile with complete financial and shipping details.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Container */}
        <form id="create-customer-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          
          {/* Section 1: Basic & Identity Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Basic & Identity Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name / Business Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corporation or John Doe"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Customer Code / ID
                </label>
                <input
                  type="text"
                  placeholder="Auto-generated if empty"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
                  value={formData.code || ''}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Primary Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="+880 1XXXX-XXXXXX"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  Secondary Phone
                </label>
                <input
                  type="text"
                  placeholder="Alternative contact"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
                  value={formData.secondary_phone || ''}
                  onChange={(e) => handleInputChange('secondary_phone', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="customer@example.com"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Segments & Taxation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Classification & Tax Identification
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Customer Type
                </label>
                <select
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none transition-all cursor-pointer"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                >
                  <option value="INDIVIDUAL">Individual (Retail Client)</option>
                  <option value="CORPORATE">Corporate (Business Client)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Customer Group
                </label>
                <select
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none transition-all cursor-pointer"
                  value={formData.customer_group}
                  onChange={(e) => handleInputChange('customer_group', e.target.value)}
                >
                  <option value="RETAIL">Retail</option>
                  <option value="WHOLESALE">Wholesale</option>
                  <option value="VIP">VIP</option>
                  <option value="DISTRIBUTOR">Distributor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Acquisition Source
                </label>
                <select
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none transition-all cursor-pointer"
                  value={formData.source}
                  onChange={(e) => handleInputChange('source', e.target.value)}
                >
                  <option value="POS">POS Counter</option>
                  <option value="ERP">ERP Direct Entry</option>
                  <option value="ECOMMERCE">E-Commerce Web Store</option>
                  <option value="SOCIAL">Social Media Marketing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <BadgePercent className="w-3.5 h-3.5 text-slate-400" />
                  Tax / TIN / VAT No.
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1234567890"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
                  value={formData.tax_number || ''}
                  onChange={(e) => handleInputChange('tax_number', e.target.value)}
                />
              </div>

              {formData.type === 'CORPORATE' && (
                <div className="md:col-span-4 bg-slate-800/30 p-3.5 rounded-2xl border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-400" />
                    Company Registered Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter registered organization title"
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
                    value={formData.company_name || ''}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Financial & Credit Policy */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-800/80 pb-2">
              <CreditCard className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Financial Setup & Credit Control
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Credit Limit (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="0.00"
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none transition-all"
                  value={formData.credit_limit}
                  onChange={(e) => handleInputChange('credit_limit', Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Opening Balance (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={isEditMode}
                  placeholder="0.00"
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs text-white outline-none transition-all ${
                    isEditMode
                      ? 'bg-slate-900/50 border-slate-800/50 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-950/60 border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500'
                  }`}
                  value={formData.opening_balance}
                  onChange={(e) => handleInputChange('opening_balance', Number(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Balance Type
                </label>
                <select
                  disabled={isEditMode}
                  className={`w-full border rounded-xl px-3.5 py-2 text-xs text-white outline-none transition-all ${
                    isEditMode
                      ? 'bg-slate-900/50 border-slate-800/50 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-950/60 border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer'
                  }`}
                  value={formData.balance_type || 'DEBIT'}
                  onChange={(e) => handleInputChange('balance_type', e.target.value as 'DEBIT' | 'CREDIT')}
                >
                  <option value="DEBIT">Receivable (Customer Owes You)</option>
                  <option value="CREDIT">Payable (You Owe Customer)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Payment Terms
                </label>
                <select
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none transition-all cursor-pointer"
                  value={formData.payment_terms || 'NET_30'}
                  onChange={(e) => handleInputChange('payment_terms', e.target.value)}
                >
                  <option value="COD">Cash On Delivery (COD)</option>
                  <option value="NET_15">Net 15 Days</option>
                  <option value="NET_30">Net 30 Days</option>
                  <option value="NET_60">Net 60 Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 4: Address Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Address & Shipping Information
                </h3>
              </div>
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setSameAsBilling(isChecked);
                    if (isChecked) {
                      handleInputChange('shipping_address', formData.billing_address);
                    }
                  }}
                  className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                />
                Shipping same as billing
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Billing Address
                </label>
                <textarea
                  rows={2}
                  placeholder="Street address, house no, avenue..."
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none transition-all resize-none"
                  value={formData.billing_address || ''}
                  onChange={(e) => handleInputChange('billing_address', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Shipping Address
                </label>
                <textarea
                  rows={2}
                  disabled={sameAsBilling}
                  placeholder="Delivery location address..."
                  className={`w-full border rounded-xl p-3 text-xs text-white outline-none transition-all resize-none ${
                    sameAsBilling
                      ? 'bg-slate-900/50 border-slate-800/50 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-950/60 border-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-slate-500'
                  }`}
                  value={sameAsBilling ? formData.billing_address || '' : formData.shipping_address || ''}
                  onChange={(e) => handleInputChange('shipping_address', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 gap-3 md:col-span-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">City</label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka"
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
                    value={formData.city || ''}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">State / Division</label>
                  <input
                    type="text"
                    placeholder="e.g. Dhaka Division"
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
                    value={formData.state || ''}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Postal Code</label>
                  <input
                    type="text"
                    placeholder="e.g. 1212"
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
                    value={formData.postal_code || ''}
                    onChange={(e) => handleInputChange('postal_code', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Internal Notes & Account Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-800/80 pt-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Internal ERP Notes & Remarks
              </label>
              <input
                type="text"
                placeholder="Special instructions or credit warning notes..."
                className="w-full bg-slate-950/60 border border-slate-800 focus:border-blue-500 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none"
                value={formData.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Account Status
              </label>
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => handleInputChange('is_active', e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500"
                  />
                  Active Profile (Allowed to transacting)
                </label>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>Encrypted data transaction</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-300 bg-slate-800/80 hover:bg-slate-800 hover:text-white transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="create-customer-form"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isEditMode ? 'Updating Profile...' : 'Saving Profile...'}</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>{isEditMode ? 'Update Customer' : 'Save Customer'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};