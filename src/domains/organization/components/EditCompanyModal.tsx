'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface Company {
  id: number;
  name?: string;
  title?: string;
  code?: string;
  email?: string;
  phone?: string;
  status?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  company: Company | null;
  onUpdate: (id: number, data: any) => Promise<void>;
  isLoading?: boolean;
}

export default function EditCompanyModal({ isOpen, onClose, company, onUpdate, isLoading }: Props) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<any>();

  useEffect(() => {
    if (company) {
      setValue('name', company.name || company.title || '');
      setValue('code', company.code || '');
      setValue('email', company.email || '');
      setValue('phone', company.phone || '');
    }
  }, [company, setValue]);

  if (!isOpen || !company) return null;

  const onSubmit = async (data: any) => {
    try {
      await onUpdate(company.id, data);
      reset();
      onClose();
    } catch (error) {
      console.error('Failed to update company:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
        <h2 className="text-xl font-bold text-slate-800 mb-4">Edit Company</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Company Name *</label>
            <input
              {...register('name', { required: 'Name is required' })}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-800"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{String(errors.name.message)}</p>}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Company Code</label>
            <input
              {...register('code')}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Email</label>
              <input
                type="email"
                {...register('email')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Phone</label>
              <input
                {...register('phone')}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-slate-800 text-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-white rounded-md transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Updating...' : 'Update Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}