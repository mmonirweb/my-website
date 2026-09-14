'use client';

import { useState } from 'react';
import { useCategories } from '@/domains/catalog/hooks/useCatalog';
import { Category, CategoryFormData } from '@/domains/catalog/types';
import CreateCategoryModal from '@/domains/catalog/components/CreateCategoryModal';

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const {
    categoriesQuery,
    categoryTreeQuery,
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  } = useCategories(page, search);

  const handleCreateOrUpdate = (data: CategoryFormData) => {
    if (selectedCategory) {
      updateCategoryMutation.mutate(
        { id: selectedCategory.id, data },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setSelectedCategory(null);
          },
        }
      );
    } else {
      createCategoryMutation.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Category Management</h1>
        <button
          onClick={() => {
            setSelectedCategory(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          + Add Category
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-64 text-sm focus:outline-none focus:border-blue-500"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Parent Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Sort Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categoriesQuery.isLoading ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : categoriesQuery.data?.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-sm text-gray-500">
                  No categories found.
                </td>
              </tr>
            ) : (
              categoriesQuery.data?.data.map((cat) => (
                <tr key={cat.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {cat.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cat.parent?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {cat.sort_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cat.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {cat.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedCategory(cat);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <CreateCategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        categoriesTree={categoryTreeQuery.data}
        initialData={selectedCategory}
        isLoading={createCategoryMutation.isPending || updateCategoryMutation.isPending}
      />
    </div>
  );
}