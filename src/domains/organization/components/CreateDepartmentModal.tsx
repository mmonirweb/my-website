'use client';

import { useState, useEffect } from 'react';
import { useOrganizations } from '../hooks/useOrganizations';
import { Department } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Department | null;
}

export default function CreateDepartmentModal({ isOpen, onClose, initialData }: Props) {
  const { branches, createDepartment, updateDepartment } = useOrganizations();
  const [formData, setFormData] = useState<Partial<Department>>({
    branch_id: '',
    name: '',
    code: '',
    department_head: '',
    description: '',
    is_active: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        branch_id: initialData.branch_id || '',
        name: initialData.name || '',
        code: initialData.code || '',
        department_head: initialData.department_head || '',
        description: initialData.description || '',
        is_active: initialData.is_active ?? true,
      });
    } else {
      setFormData({
        branch_id: branches.length > 0 ? branches[0].id : '',
        name: '',
        code: '',
        department_head: '',
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
      if (initialData && initialData.id) {
        await updateDepartment({ id: initialData.id, data: formData });
      } else {
        await createDepartment(formData);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save department:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 my-8">
        <div className="flex justify-between items-center border-b pb-3">
          <h2 className="text-xl font-bold text-slate-800">
            {initialData ? 'Edit Department' : 'Add New Department'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Select Branch *</label>
            <select
              required
              value={formData.branch_id || ''}
              onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
              className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
            >
              <option value="" disabled>-- Select Branch --</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name} ({branch.company?.name || 'Branch'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase">Department Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
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
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Department Head</label>
            <input
              type="text"
              value={formData.department_head || ''}
              onChange={(e) => setFormData({ ...formData, department_head: e.target.value })}
              className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              placeholder="Manager or Leader Name"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Description</label>
            <textarea
              rows={2}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active_dept"
              checked={formData.is_active ?? true}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="is_active_dept" className="text-sm text-slate-700 font-medium">Active Status</label>
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
              {isSubmitting ? 'Saving...' : initialData ? 'Update Department' : 'Save Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}