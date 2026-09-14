'use client';

import { useState } from 'react';
import { useOrganizations } from '@/domains/organization/hooks/useOrganizations';
import CreateDepartmentModal from '@/domains/organization/components/CreateDepartmentModal';
import TableSearchFilter from '@/components/common/TableSearchFilter';
import { Department } from '@/domains/organization/types';

export default function DepartmentsPage() {
  const { departments, isLoadingDepartments, isErrorDepartments, deleteDepartment } = useOrganizations();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDepartments = departments.filter((dept: Department) => {
    const search = searchTerm.toLowerCase();
    return (
      (dept.name && dept.name.toLowerCase().includes(search)) ||
      (dept.code && dept.code.toLowerCase().includes(search)) ||
      (dept.branch?.name && dept.branch.name.toLowerCase().includes(search)) ||
      (dept.department_head && dept.department_head.toLowerCase().includes(search))
    );
  });

  const handleOpenAdd = () => {
    setSelectedDepartment(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (department: Department) => {
    setSelectedDepartment(department);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      try {
        await deleteDepartment(id);
      } catch (err) {
        console.error('Failed to delete department:', err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Departments</h1>
          <p className="text-sm text-slate-500 mt-1">Manage functional teams and departmental structures</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Department
        </button>
      </div>

      <TableSearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        placeholder="Search by department, code, branch, or head..."
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {isLoadingDepartments ? (
            <div className="p-8 text-center text-slate-500">Loading Departments...</div>
          ) : isErrorDepartments ? (
            <div className="p-8 text-center text-red-500">Failed to fetch department data.</div>
          ) : filteredDepartments.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No departments found.</div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 min-w-[750px]">
              <thead className="bg-slate-50 text-slate-700 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Code</th>
                  <th className="px-6 py-3 font-semibold">Department Name</th>
                  <th className="px-6 py-3 font-semibold">Branch / Location</th>
                  <th className="px-6 py-3 font-semibold">Department Head</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredDepartments.map((dept: Department, index: number) => (
                  <tr key={dept.id ?? index} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-slate-800">{dept.code}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div>{dept.name}</div>
                      {dept.description && (
                        <div className="text-xs text-slate-400 font-normal line-clamp-1">{dept.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-700">
                      {dept.branch?.name ?? 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-slate-800 font-medium text-xs">
                      {dept.department_head || 'Unassigned'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${
                        dept.is_active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {dept.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(dept)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 transition-colors"
                      >
                        Edit
                      </button>
                      {dept.id !== undefined && (
                        <button
                          onClick={() => handleDelete(dept.id!)}
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

      <CreateDepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedDepartment}
      />
    </div>
  );
}