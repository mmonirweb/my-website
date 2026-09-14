'use client';

import { useState, useEffect } from 'react';
import { Category, CategoryFormData } from '../types';

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CategoryFormData) => void;
  categoriesTree?: Category[];
  initialData?: Category | null;
  isLoading: boolean;
}

export default function CreateCategoryModal({
  isOpen,
  onClose,
  onSubmit,
  categoriesTree,
  initialData,
  isLoading,
}: CreateCategoryModalProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    parent_id: null,
    description: '',
    sort_order: 0,
    is_active: true,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        parent_id: initialData.parent_id || null,
        description: initialData.description || '',
        sort_order: initialData.sort_order || 0,
        is_active: initialData.is_active,
      });
    } else {
      setFormData({ name: '', parent_id: null, description: '', sort_order: 0, is_active: true });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">
          {initialData ? 'Edit Category' : 'Add New Category'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Parent Category</label>
            <select
              value={formData.parent_id || ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  parent_id: e.target.value ? Number(e.target.value) : null,
                })
              }
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              <option value="">None (Root Category)</option>
              {categoriesTree?.map((cat) => (
                <option key={cat.id} value={cat.id} disabled={initialData?.id === cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Sort Order</label>
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active_cat"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="is_active_cat" className="text-sm font-medium text-gray-700">
              Active Status
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}