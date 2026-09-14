'use client';

import { useState } from 'react';
import { useBrands } from '@/domains/catalog/hooks/useCatalog';
import { Brand, BrandFormData } from '@/domains/catalog/types';
import CreateBrandModal from '@/domains/catalog/components/CreateBrandModal';

export default function BrandsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);

  const { brandsQuery, createBrandMutation, updateBrandMutation, deleteBrandMutation } = useBrands(
    page,
    search
  );

  const handleCreateOrUpdate = (data: BrandFormData) => {
    if (selectedBrand) {
      updateBrandMutation.mutate(
        { id: selectedBrand.id, data },
        {
          onSuccess: () => {
            setIsModalOpen(false);
            setSelectedBrand(null);
          },
        }
      );
    } else {
      createBrandMutation.mutate(data, {
        onSuccess: () => {
          setIsModalOpen(false);
        },
      });
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      deleteBrandMutation.mutate(id);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Brand Management</h1>
        <button
          onClick={() => {
            setSelectedBrand(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          + Add Brand
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search brands..."
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
                Slug
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
            {brandsQuery.isLoading ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : brandsQuery.data?.data.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-4 text-sm text-gray-500">
                  No brands found.
                </td>
              </tr>
            ) : (
              brandsQuery.data?.data.map((brand) => (
                <tr key={brand.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {brand.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {brand.slug}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        brand.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {brand.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedBrand(brand);
                        setIsModalOpen(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(brand.id)}
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

      <CreateBrandModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        initialData={selectedBrand}
        isLoading={createBrandMutation.isPending || updateBrandMutation.isPending}
      />
    </div>
  );
}