'use client';

import { useState } from 'react';
import { useTaxRates } from '@/domains/catalog/hooks/useTaxAndUnits';
import { TaxRate, TaxRateInput } from '@/domains/catalog/types/catalog';
import TaxRateModal from '@/domains/catalog/components/TaxRateModal';

export default function TaxRatesPage() {
  const { data: taxRates, isLoading, createMutation, updateMutation, deleteMutation } = useTaxRates();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTax, setSelectedTax] = useState<TaxRate | null>(null);

  const handleOpenCreate = () => {
    setSelectedTax(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tax: TaxRate) => {
    setSelectedTax(tax);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: TaxRateInput) => {
    if (selectedTax) {
      await updateMutation.mutateAsync({ id: selectedTax.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this tax rate?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tax Rates</h1>
        <button
          onClick={handleOpenCreate}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Add Tax Rate
        </button>
      </div>

      {isLoading ? (
        <div className="py-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white dark:bg-gray-800">
          <table className="w-full text-left text-sm text-gray-500 dark:text-gray-400">
            <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Rate (%)</th>
                <th className="px-6 py-3">Code</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {taxRates?.map((tax) => (
                <tr key={tax.id} className="border-b bg-white dark:bg-gray-800">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{tax.name}</td>
                  <td className="px-6 py-4">{tax.rate}%</td>
                  <td className="px-6 py-4">{tax.code || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs ${tax.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {tax.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenEdit(tax)} className="mr-3 text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(tax.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TaxRateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedTax}
      />
    </div>
  );
}