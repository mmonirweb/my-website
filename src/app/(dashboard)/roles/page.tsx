'use client';

import { useState } from 'react';
import { useAcl } from '@/domains/acl/hooks/useAcl';
import { Pencil, Trash2, ShieldCheck, Plus, X } from 'lucide-react';

export default function RolesPage() {
  const {
    roles,
    isLoadingRoles,
    deleteRole,
    createRole,
    updateRole,
    permissions,
  } = useAcl();

  // Modal & Form States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null);
  const [roleName, setRoleName] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Grouped Permissions Normalized Object
  const groupedPermissions: Record<string, any[]> = 
    permissions && typeof permissions === 'object' && !Array.isArray(permissions)
      ? permissions
      : {};

  const handleOpenCreateModal = () => {
    setEditingRoleId(null);
    setRoleName('');
    setSelectedPermissions([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role: any) => {
    setEditingRoleId(role.id);
    setRoleName(role.name);
    const existingPerms = role.permissions?.map((p: any) => 
      typeof p === 'string' ? p : p.name
    ) || [];
    setSelectedPermissions(existingPerms);
    setIsModalOpen(true);
  };

  const handlePermissionToggle = (permName: string) => {
    if (!permName) return;
    setSelectedPermissions((prev) =>
      prev.includes(permName)
        ? prev.filter((p) => p !== permName)
        : [...prev, permName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    try {
      setIsSubmitting(true);
      const payload = {
        name: roleName,
        permissions: selectedPermissions,
      };

      if (editingRoleId) {
        await updateRole({ id: editingRoleId, payload });
      } else {
        await createRole(payload);
      }

      setIsModalOpen(false);
      setRoleName('');
      setSelectedPermissions([]);
      setEditingRoleId(null);
    } catch (error: any) {
      console.error('Failed to save role:', error);
      alert(error?.response?.data?.message || 'Role সেভ করতে সমস্যা হয়েছে!');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingRoles) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-500 font-medium">
        Loading roles & permissions...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      {/* Header Section */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Role & Permission Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage system roles, assign granular permissions, and control access levels.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-all shadow-sm cursor-pointer z-10"
        >
          <Plus size={18} />
          Create Role
        </button>
      </div>

      {/* Table Card Container */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <th className="py-4 px-6">Role Name</th>
              <th className="py-4 px-6">Assigned Permissions</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {roles?.map((role: any) => {
              const isSuperAdmin = role.name?.toLowerCase() === 'super admin';
              const permList = role.permissions || [];
              const visiblePermissions = permList.slice(0, 4);
              const hiddenCount = permList.length - visiblePermissions.length;

              return (
                <tr key={role.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {isSuperAdmin && <ShieldCheck size={18} className="text-indigo-600" />}
                      {role.name}
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    {isSuperAdmin ? (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Full Access (All Permissions)
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5 items-center">
                        {visiblePermissions.map((perm: any) => {
                          const pName = typeof perm === 'string' ? perm : perm.name;
                          return (
                            <span
                              key={perm.id || pName}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200"
                            >
                              {pName}
                            </span>
                          );
                        })}
                        {hiddenCount > 0 && (
                          <span
                            title={permList.slice(4).map((p: any) => typeof p === 'string' ? p : p.name).join(', ')}
                            className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-600 cursor-pointer border border-indigo-100"
                          >
                            +{hiddenCount} more
                          </span>
                        )}
                      </div>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(role)}
                        disabled={isSuperAdmin}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          isSuperAdmin
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'
                        }`}
                        title={isSuperAdmin ? 'Cannot edit Super Admin' : 'Edit Role'}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => !isSuperAdmin && deleteRole && deleteRole(role.id)}
                        disabled={isSuperAdmin}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          isSuperAdmin
                            ? 'text-slate-300 cursor-not-allowed'
                            : 'text-slate-500 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title={isSuperAdmin ? 'Cannot delete Super Admin' : 'Delete Role'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* --- CREATE / EDIT ROLE MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">
                {editingRoleId ? 'Edit Role' : 'Create New Role'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-1">
                  Role Name
                </label>
                <input
                  type="text"
                  required
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. HR Manager, Accountant"
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-600 mb-2">
                  Assign Permissions
                </label>
                <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-lg p-3 space-y-3 bg-slate-50/50">
                  {Object.keys(groupedPermissions).length > 0 ? (
                    Object.entries(groupedPermissions).map(([group, perms]: [string, any]) => (
                      <div key={group} className="space-y-1.5">
                        <div className="text-[11px] font-bold uppercase text-indigo-600 tracking-wider">
                          {group}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {Array.isArray(perms) &&
                            perms.map((perm: any) => {
                              const permName = typeof perm === 'string' ? perm : perm.name;
                              return (
                                <label
                                  key={perm.id || permName}
                                  className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-slate-900"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedPermissions.includes(permName)}
                                    onChange={() => handlePermissionToggle(permName)}
                                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                  />
                                  <span>{permName}</span>
                                </label>
                              );
                            })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No permissions available.</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : editingRoleId ? 'Update Role' : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}