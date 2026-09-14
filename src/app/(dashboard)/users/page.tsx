'use client';

import { useState, useMemo, useCallback } from 'react';
import { useUsers, useUserFormData } from '@/domains/user/hooks/useUsers';
import { User } from '@/domains/user/types';
import CreateUserModal from '@/domains/user/components/CreateUserModal';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Filters
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const { usersQuery, toggleStatusMutation, deleteUserMutation } = useUsers({ search });
  const { data: formDataOptions } = useUserFormData();

  // Parsing users list
  const users: User[] = useMemo(() => {
    if (!usersQuery.data) return [];
    const rawData = Array.isArray(usersQuery.data)
      ? usersQuery.data
      : usersQuery.data.data || [];

    return rawData.filter((user: User) => {
      if (selectedCompany && String(user.company_id || user.company?.id) !== selectedCompany) {
        return false;
      }
      if (selectedBranch && String(user.branch_id || user.branch?.id) !== selectedBranch) {
        return false;
      }
      if (selectedDepartment && String(user.department_id || user.department?.id) !== selectedDepartment) {
        return false;
      }
      if (selectedRole && !user.roles?.includes(selectedRole)) {
        return false;
      }
      if (selectedStatus !== '') {
        const isActive = selectedStatus === 'active';
        if (Boolean(user.is_active) !== isActive) return false;
      }
      return true;
    });
  }, [usersQuery.data, selectedCompany, selectedBranch, selectedDepartment, selectedRole, selectedStatus]);

  const handleDelete = useCallback((id: number) => {
    if (window.confirm('Are you sure you want to soft delete this user?')) {
      deleteUserMutation.mutate(id);
    }
  }, [deleteUserMutation]);

  const handleToggleStatus = useCallback((user: User) => {
    toggleStatusMutation.mutate({
      id: user.id,
      name: user.name,
      email: user.email,
      is_active: !user.is_active,
    });
  }, [toggleStatusMutation]);

  const handleEdit = useCallback((user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCompany('');
    setSelectedBranch('');
    setSelectedDepartment('');
    setSelectedRole('');
    setSelectedStatus('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">User Management</h1>
          <p className="text-sm text-gray-500">Manage system users, multi-scope access, and permissions</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition shadow-sm flex items-center justify-center gap-1.5"
        >
          <span>+</span> Add New User
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-2">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email, or phone..."
              className="w-full px-3 py-2 border rounded-lg text-sm text-gray-800 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white"
          >
            <option value="">All Companies</option>
            {formDataOptions?.companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white"
          >
            <option value="">All Branches</option>
            {formDataOptions?.branches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white"
          >
            <option value="">All Depts</option>
            {formDataOptions?.departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 bg-white"
          >
            <option value="">All Roles</option>
            {formDataOptions?.roles.map((r) => (
              <option key={r.id} value={r.name}>{r.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-gray-100">
          <div className="w-full sm:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-700 bg-white"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {(search || selectedCompany || selectedBranch || selectedDepartment || selectedRole || selectedStatus) && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-600 hover:text-red-800 font-medium transition flex items-center gap-1"
            >
              <span>✕</span> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {usersQuery.isLoading ? (
          <div className="p-8 text-center text-gray-500 font-medium">Loading Users...</div>
        ) : usersQuery.isError ? (
          <div className="p-8 text-center text-red-500 font-medium">
            Failed to load users. Please check backend connection.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Roles</th>
                  <th className="p-4">Primary Scope</th>
                  <th className="p-4">Allowed Multi-Scopes</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-gray-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50/80 transition">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">{user.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles && user.roles.length > 0 ? (
                            user.roles.map((r, i) => (
                              <span key={i} className="inline-flex items-center bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">
                                {r}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">No Role</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs space-y-0.5 text-gray-600">
                          <div><span className="font-semibold text-gray-700">Company:</span> {user.company?.name || 'N/A'}</div>
                          <div><span className="font-semibold text-gray-700">Branch:</span> {user.branch?.name || 'N/A'}</div>
                          <div><span className="font-semibold text-gray-700">Dept:</span> {user.department?.name || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs space-y-1 text-gray-600">
                          <div><span className="font-medium text-gray-700">Companies:</span> {user.companies?.map(c => c.name).join(', ') || 'None'}</div>
                          <div><span className="font-medium text-gray-700">Branches:</span> {user.branches?.map(b => b.name).join(', ') || 'None'}</div>
                          <div><span className="font-medium text-gray-700">Depts:</span> {user.departments?.map(d => d.name).join(', ') || 'None'}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          disabled={toggleStatusMutation.isPending}
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold transition ${
                            user.is_active
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(user)}
                            title="Edit User"
                            className="p-1.5 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            disabled={deleteUserMutation.isPending}
                            title="Delete User"
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateUserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        userToEdit={editingUser}
      />
    </div>
  );
}