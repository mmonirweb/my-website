'use client';

import { useState } from 'react';
import { useOrganizations } from '@/domains/organization/hooks/useOrganizations';
import CreateBranchModal from '@/domains/organization/components/CreateBranchModal';
import TableSearchFilter from '@/components/common/TableSearchFilter';
import { Branch } from '@/domains/organization/types';

export default function BranchesPage() {
  const { branches, isLoadingBranches, isErrorBranches, deleteBranch } = useOrganizations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBranches = branches.filter((branch: Branch) => {
    const search = searchTerm.toLowerCase();
    return (
      (branch.name && branch.name.toLowerCase().includes(search)) ||
      (branch.code && branch.code.toLowerCase().includes(search)) ||
      (branch.company?.name && branch.company.name.toLowerCase().includes(search)) ||
      (branch.city && branch.city.toLowerCase().includes(search))
    );
  });

  const handleOpenAdd = () => {
    setSelectedBranch(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    if (confirm('Are you sure you want to delete this branch?')) {
      try {
        await deleteBranch(id);
      } catch (err) {
        console.error('Failed to delete branch:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Branches</h1>
          <p className="text-sm text-slate-500 mt-1">Manage physical office locations and branch networks</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Branch
        </button>
      </div>

      <TableSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by branch name, code, company, or city..."
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoadingBranches ? (
            <div className="p-8 text-center text-slate-500">Loading Branches...</div>
          ) : isErrorBranches ? (
            <div className="p-8 text-center text-red-500">Failed to fetch branch data.</div>
          ) : filteredBranches.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No branches found.</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 min-w-[800px]">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Branch Code</th>
                  <th className="px-6 py-3 font-semibold">Branch Info</th>
                  <th className="px-6 py-3 font-semibold">Company</th>
                  <th className="px-6 py-3 font-semibold">Manager / Contact</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredBranches.map((branch: Branch, index: number) => (
                  <tr key={branch.id ?? index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-800">{branch.code}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div className="flex items-center gap-2">
                        <span>{branch.name}</span>
                        {branch.is_head_office && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-purple-50 text-purple-700 border border-purple-200 font-semibold rounded">
                            HQ
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-normal">{branch.city || branch.address || '-'}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {branch.company?.name ?? 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-xs space-y-0.5">
                      <div className="font-medium text-slate-800">{branch.manager_name || 'Unassigned'}</div>
                      <div className="text-slate-400">{branch.phone || branch.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        branch.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {branch.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(branch)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      {branch.id !== undefined && (
                        <button
                          onClick={() => handleDelete(branch.id!)}
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

      <CreateBranchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedBranch}
      />
    </div>
  );
}