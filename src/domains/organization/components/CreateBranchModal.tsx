'use client';

import { useState, useEffect } from 'react';
import { useOrganizations } from '../hooks/useOrganizations';
import { Branch } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Branch | null;
}

export default function CreateBranchModal({ isOpen, onClose, initialData }: Props) {
  const { companies, createBranch, updateBranch } = useOrganizations();
  const [formData, setFormData] = useState<Partial<Branch>>({
    company_id: '',
    name: '',
    code: '',
    email: '',
    phone: '',
    manager_name: '',
    city: '',
    state: '',
    zip_code: '',
    address: '',
    is_head_office: false,
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal ওপেন হওয়া বা initialData চেঞ্জ হওয়ার ভিত্তিতে Form Reset হবে
  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        company_id: initialData.company_id || '',
        name: initialData.name || '',
        code: initialData.code || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        manager_name: initialData.manager_name || '',
        city: initialData.city || '',
        state: initialData.state || '',
        zip_code: initialData.zip_code || '',
        address: initialData.address || '',
        is_head_office: initialData.is_head_office ?? false,
        is_active: initialData.is_active ?? true,
      });
    } else {
      setFormData({
        company_id: companies.length > 0 ? companies[0].id : '',
        name: '',
        code: '',
        email: '',
        phone: '',
        manager_name: '',
        city: '',
        state: '',
        zip_code: '',
        address: '',
        is_head_office: false,
        is_active: true,
      });
    }
  }, [isOpen, initialData]); // companies বাদ দেওয়া হয়েছে লুপ বন্ধ করতে

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData && initialData.id) {
        await updateBranch({ id: initialData.id, data: formData });
      } else {
        await createBranch(formData);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save branch:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 my-8">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Branch' : 'Add New Branch'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Select Company *</label>
              <select
                required
                value={formData.company_id || ''}
                onChange={(e) => setFormData({ ...formData, company_id: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              >
                <option value="" disabled>-- Select Company --</option>
                {companies.map((comp) => (
                  <option key={comp.id} value={comp.id}>
                    {comp.name} ({comp.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Branch Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Branch Code *</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Manager Name</label>
              <input
                type="text"
                value={formData.manager_name || ''}
                onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
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
              <label className="block text-xs font-semibold text-slate-700 uppercase">City</label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">State / Zip</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="State"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="mt-1 w-1/2 border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                />
                <input
                  type="text"
                  placeholder="Zip Code"
                  value={formData.zip_code || ''}
                  onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
                  className="mt-1 w-1/2 border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                />
              </div>
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

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_head_office ?? false}
                onChange={(e) => setFormData({ ...formData, is_head_office: e.target.checked })}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              Head Office
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-700 font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active ?? true}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              Active Status
            </label>
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
              {isSubmitting ? 'Saving...' : initialData ? 'Update Branch' : 'Save Branch'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}