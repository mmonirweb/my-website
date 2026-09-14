'use client';

import { useState } from 'react';
import { useUnits } from '@/domains/catalog/hooks/useTaxAndUnits';
import { Unit, UnitInput } from '@/domains/catalog/types/catalog';
import UnitModal from '@/domains/catalog/components/UnitModal';

export default function UnitsPage() {
  const { data: units, isLoading, createMutation, updateMutation, deleteMutation } = useUnits();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

  const handleOpenCreate = () => {
    setSelectedUnit(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (unit: Unit) => {
    setSelectedUnit(unit);
    setIsModalOpen(true);
  };

  const handleSubmit = async (data: UnitInput) => {
    if (selectedUnit) {
      await updateMutation.mutateAsync({ id: selectedUnit.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this unit?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Units</h1>
        <button
          onClick={handleOpenCreate}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
        >
          Add Unit
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
                <th className="px-6 py-3">Short Name</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {units?.map((unit) => (
                <tr key={unit.id} className="border-b bg-white dark:bg-gray-800">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{unit.name}</td>
                  <td className="px-6 py-4">{unit.short_name}</td>
                  <td className="px-6 py-4">
                    <span className={`rounded-full px-2 py-1 text-xs ${unit.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {unit.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenEdit(unit)} className="mr-3 text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(unit.id)} className="text-red-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <UnitModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={selectedUnit}
      />
    </div>
  );
}