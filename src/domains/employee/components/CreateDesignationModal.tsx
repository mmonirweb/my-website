'use client';

import { useState, useEffect } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { Designation } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Designation | null;
}

export default function CreateDesignationModal({ isOpen, onClose, initialData }: Props) {
  const { createDesignation, updateDesignation } = useEmployees();
  const [formData, setFormData] = useState<Partial<Designation>>({
    title: '',
    code: '',
    level: 1,
    description: '',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        title: initialData.title || '',
        code: initialData.code || '',
        level: initialData.level ?? 1,
        description: initialData.description || '',
        is_active: initialData.is_active ?? true,
      });
    } else {
      setFormData({
        title: '',
        code: '',
        level: 1,
        description: '',
        is_active: true,
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        level: Number(formData.level) || 1,
      };

      if (initialData && initialData.id) {
        await updateDesignation({ id: initialData.id, data: payload });
      } else {
        await createDesignation(payload);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save designation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 my-8">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Designation' : 'Add New Designation'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Title *</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                placeholder="e.g. Senior Software Engineer"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Code *</label>
              <input
                type="text"
                required
                value={formData.code || ''}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                placeholder="e.g. SSE"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Level / Grade Order</label>
            <input
              type="number"
              min="1"
              value={formData.level || 1}
              onChange={(e) => setFormData({ ...formData, level: Number(e.target.value) })}
              className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              placeholder="1 for highest rank"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Description</label>
            <textarea
              rows={3}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_desig"
              checked={formData.is_active ?? true}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="is_active_desig" className="text-sm text-slate-700 font-medium">Active Status</label>
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
              {isSubmitting ? 'Saving...' : initialData ? 'Update Designation' : 'Save Designation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}