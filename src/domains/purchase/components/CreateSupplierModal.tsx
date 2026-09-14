'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useCreateSupplier, useUpdateSupplier } from '../hooks/useSuppliers';
import { Supplier } from '../types';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierToEdit?: Supplier | null;
}

interface FormInput {
  name: string;
  company_name: string;
  phone: string;
  email: string;
  address: string;
  tax_number: string;
  opening_balance: number;
  is_active: boolean;
}

export default function SupplierModal({ isOpen, onClose, supplierToEdit }: SupplierModalProps) {
  const isEditMode = !!supplierToEdit;
  const createSupplier = useCreateSupplier();
  const updateSupplier = useUpdateSupplier();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInput>({
    defaultValues: {
      name: '',
      company_name: '',
      phone: '',
      email: '',
      address: '',
      tax_number: '',
      opening_balance: 0,
      is_active: true,
    },
  });

  useEffect(() => {
    if (supplierToEdit) {
      reset({
        name: supplierToEdit.name || '',
        company_name: supplierToEdit.company_name || '',
        phone: supplierToEdit.phone || '',
        email: supplierToEdit.email || '',
        address: supplierToEdit.address || '',
        tax_number: supplierToEdit.tax_number || '',
        opening_balance: supplierToEdit.opening_balance || 0,
        is_active: supplierToEdit.is_active,
      });
    } else {
      reset({
        name: '',
        company_name: '',
        phone: '',
        email: '',
        address: '',
        tax_number: '',
        opening_balance: 0,
        is_active: true,
      });
    }
  }, [supplierToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data: FormInput) => {
    if (isEditMode && supplierToEdit) {
      updateSupplier.mutate(
        { id: supplierToEdit.id, data },
        {
          onSuccess: () => {
            onClose();
          },
        }
      );
    } else {
      createSupplier.mutate(data, {
        onSuccess: () => {
          onClose();
        },
      });
    }
  };

  const isLoading = createSupplier.isPending || updateSupplier.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
            </h2>
            <p className="text-xs font-medium text-slate-500">
              {isEditMode ? 'Update vendor parameters and status.' : 'Register a new vendor for purchase orders.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supplier Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Supplier Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Supplier name is required' })}
                placeholder="e.g. Acme Tech Solutions"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.name ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.name && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.name.message}</p>}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                {...register('company_name')}
                placeholder="e.g. Acme Inc."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Phone Number *
              </label>
              <input
                type="text"
                {...register('phone', { required: 'Phone number is required' })}
                placeholder="+880 1700-000000"
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
                }`}
              />
              {errors.phone && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.phone.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="supplier@company.com"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Tax / BIN Number */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Tax / VAT / BIN Number
              </label>
              <input
                type="text"
                {...register('tax_number')}
                placeholder="TAX-99881122"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
            </div>

            {/* Opening Balance */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Opening Balance (৳)
              </label>
              <input
                type="number"
                disabled={isEditMode}
                step="0.01"
                {...register('opening_balance', { valueAsNumber: true })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              {isEditMode && <span className="text-[10px] text-slate-400">Opening balance cannot be updated directly.</span>}
            </div>
          </div>

          {/* Full Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Address
            </label>
            <textarea
              rows={2}
              {...register('address')}
              placeholder="Full office or warehouse address..."
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 text-xs font-medium bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
            />
          </div>

          {/* Status Checkbox */}
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 dark:bg-slate-800 border-slate-300 dark:border-slate-700"
            />
            <label htmlFor="is_active" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
              Active Vendor (Enabled for PO creation)
            </label>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-extrabold text-slate-600 hover:text-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update Supplier' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}