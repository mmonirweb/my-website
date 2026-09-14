'use client';

import { useState } from 'react';
import { useEmployees } from '@/domains/employee/hooks/useEmployees';
import CreateDesignationModal from '@/domains/employee/components/CreateDesignationModal';
import TableSearchFilter from '@/components/common/TableSearchFilter';
import { Designation } from '@/domains/employee/types';

export default function DesignationsPage() {
  const { designations, isLoadingDesignations, isErrorDesignations, deleteDesignation } = useEmployees();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDesignation, setSelectedDesignation] = useState<Designation | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDesignations = (designations || []).filter((desig: Designation) => {
    const search = searchTerm.toLowerCase();
    return (
      (desig.title && desig.title.toLowerCase().includes(search)) ||
      (desig.code && desig.code.toLowerCase().includes(search)) ||
      (desig.description && desig.description.toLowerCase().includes(search))
    );
  });

  const handleOpenAdd = () => {
    setSelectedDesignation(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (designation: Designation) => {
    setSelectedDesignation(designation);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    if (confirm('Are you sure you want to delete this designation?')) {
      try {
        await deleteDesignation(id);
      } catch (err) {
        console.error('Failed to delete designation:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Designations</h1>
          <p className="text-sm text-slate-500 mt-1">Manage employee job titles and hierarchy levels</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Designation
        </button>
      </div>

      <TableSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by title, code, or description..."
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoadingDesignations ? (
            <div className="p-8 text-center text-slate-500">Loading Designations...</div>
          ) : isErrorDesignations ? (
            <div className="p-8 text-center text-red-500">Failed to fetch designation data.</div>
          ) : filteredDesignations.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No designations found.</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 min-w-[700px]">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Code</th>
                  <th className="px-6 py-3 font-semibold">Title</th>
                  <th className="px-6 py-3 font-semibold">Level / Grade</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredDesignations.map((desig: Designation, index: number) => (
                  <tr key={desig.id ?? index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-800">{desig.code}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div>{desig.title}</div>
                      {desig.description && (
                        <div className="text-xs text-slate-400 font-normal line-clamp-1">{desig.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-800">
                        Level {desig.level ?? 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        desig.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {desig.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(desig)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      {desig.id !== undefined && (
                        <button
                          onClick={() => handleDelete(desig.id!)}
                          className="text-xs font-semibold text-red-600 hover:text-red-800 px-2 py-1 rounded bg-red-50 hover:bg-red-100 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <CreateDesignationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedDesignation}
      />
    </div>
  );
}