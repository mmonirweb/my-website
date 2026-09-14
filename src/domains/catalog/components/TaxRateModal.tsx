'use client';

import { useState, useEffect } from 'react';
import { TaxRate, TaxRateInput } from '../types/catalog';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaxRateInput) => Promise<void>;
  initialData?: TaxRate | null;
}

export default function TaxRateModal({ isOpen, onClose, onSubmit, initialData }: Props) {
  const [formData, setFormData] = useState<TaxRateInput>({
    name: '',
    rate: 0,
    code: '',
    is_active: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        rate: initialData.rate,
        code: initialData.code || '',
        is_active: initialData.is_active,
      });
    } else {
      setFormData({ name: '', rate: 0, code: '', is_active: true });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
          {initialData ? 'Edit Tax Rate' : 'Create Tax Rate'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 w-full rounded-md border p-2 text-sm text-gray-900 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rate (%)</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.rate}
              onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) || 0 })}
              className="mt-1 w-full rounded-md border p-2 text-sm text-gray-900 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Code</label>
            <input
              type="text"
              value={formData.code || ''}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="mt-1 w-full rounded-md border p-2 text-sm text-gray-900 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_tax"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="is_active_tax" className="text-sm text-gray-700 dark:text-gray-300">Active</label>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}