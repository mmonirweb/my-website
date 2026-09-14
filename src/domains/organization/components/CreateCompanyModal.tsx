'use client';

import { useState, useEffect } from 'react';
import { useOrganizations } from '../hooks/useOrganizations';
import { Company } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Company | null;
}

export default function CreateCompanyModal({ isOpen, onClose, initialData }: Props) {
  const { createCompany, updateCompany } = useOrganizations();
  const [formData, setFormData] = useState<Partial<Company>>({
    name: '',
    code: '',
    email: '',
    phone: '',
    website: '',
    tax_id: '',
    bin_number: '',
    registration_number: '',
    currency: 'BDT',
    timezone: 'Asia/Dhaka',
    address: '',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        website: initialData.website || '',
        tax_id: initialData.tax_id || '',
        bin_number: initialData.bin_number || '',
        registration_number: initialData.registration_number || '',
        currency: initialData.currency || 'BDT',
        timezone: initialData.timezone || 'Asia/Dhaka',
        address: initialData.address || '',
        is_active: initialData.is_active ?? true,
      });
    } else {
      setFormData({
        name: '',
        code: '',
        email: '',
        phone: '',
        website: '',
        tax_id: '',
        bin_number: '',
        registration_number: '',
        currency: 'BDT',
        timezone: 'Asia/Dhaka',
        address: '',
        is_active: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData && initialData.id) {
        await updateCompany({ id: initialData.id, data: formData });
      } else {
        await createCompany(formData);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save company:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 my-8">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Company' : 'Add New Company'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Company Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Company Code *</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Phone</label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Website</label>
              <input
                type="url"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Reg Number</label>
              <input
                type="text"
                value={formData.registration_number || ''}
                onChange={(e) => setFormData({ ...formData, registration_number: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Tax ID (TIN)</label>
              <input
                type="text"
                value={formData.tax_id || ''}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">BIN / VAT Number</label>
              <input
                type="text"
                value={formData.bin_number || ''}
                onChange={(e) => setFormData({ ...formData, bin_number: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Currency</label>
              <input
                type="text"
                value={formData.currency || 'BDT'}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active ?? true}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              <label htmlFor="is_active" className="text-sm text-slate-700 font-medium">Active Status</label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Address</label>
            <textarea
              rows={2}
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800 font-medium disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : initialData ? 'Update Company' : 'Save Company'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}