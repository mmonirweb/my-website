'use client';

import { useState, useEffect } from 'react';
import { useUsers, useUserFormData } from '@/domains/user/hooks/useUsers';
import { UserFormData, User } from '@/domains/user/types';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  userToEdit,
}: CreateUserModalProps) {
  const { data: options, isLoading: isLoadingOptions } = useUserFormData(isOpen);
  const { createUserMutation, updateUserMutation } = useUsers();

  const isEditMode = !!userToEdit;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    company_id: '',
    branch_id: '',
    department_id: '',
    company_ids: [] as number[],
    branch_ids: [] as number[],
    department_ids: [] as number[],
    roles: [] as string[],
    is_active: 'true',
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        name: userToEdit.name || '',
        email: userToEdit.email || '',
        phone: userToEdit.phone || '',
        password: '',
        company_id: userToEdit.company_id ? String(userToEdit.company_id) : '',
        branch_id: userToEdit.branch_id ? String(userToEdit.branch_id) : '',
        department_id: userToEdit.department_id ? String(userToEdit.department_id) : '',
        company_ids: userToEdit.companies ? userToEdit.companies.map((c) => c.id) : [],
        branch_ids: userToEdit.branches ? userToEdit.branches.map((b) => b.id) : [],
        department_ids: userToEdit.departments ? userToEdit.departments.map((d) => d.id) : [],
        roles: userToEdit.roles || [],
        is_active: userToEdit.is_active !== undefined ? String(userToEdit.is_active) : 'true',
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        company_id: '',
        branch_id: '',
        department_id: '',
        company_ids: [],
        branch_ids: [],
        department_ids: [],
        roles: [],
        is_active: 'true',
      });
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Dynamic Dropdown-based Multi Select Helpers
  const handleAddMultiSelect = (field: 'company_ids' | 'branch_ids' | 'department_ids', value: string) => {
    if (!value) return;
    const numId = Number(value);
    if (!formData[field].includes(numId)) {
      setFormData({ ...formData, [field]: [...formData[field], numId] });
    }
  };

  const handleRemoveMultiSelect = (field: 'company_ids' | 'branch_ids' | 'department_ids', id: number) => {
    setFormData({ ...formData, [field]: formData[field].filter((item) => item !== id) });
  };

  const handleAddRole = (roleName: string) => {
    if (!roleName) return;
    if (!formData.roles.includes(roleName)) {
      setFormData({ ...formData, roles: [...formData.roles, roleName] });
    }
  };

  const handleRemoveRole = (roleName: string) => {
    setFormData({ ...formData, roles: formData.roles.filter((r) => r !== roleName) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload: UserFormData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      password: formData.password || undefined,
      is_active: formData.is_active === 'true',
      company_id: formData.company_id ? Number(formData.company_id) : undefined,
      branch_id: formData.branch_id ? Number(formData.branch_id) : undefined,
      department_id: formData.department_id ? Number(formData.department_id) : undefined,
      company_ids: formData.company_ids,
      branch_ids: formData.branch_ids,
      department_ids: formData.department_ids,
      roles: formData.roles,
    };

    if (isEditMode && userToEdit) {
      updateUserMutation.mutate(
        { id: userToEdit.id, data: payload },
        { onSuccess: () => onClose() }
      );
    } else {
      createUserMutation.mutate(payload, {
        onSuccess: () => onClose(),
      });
    }
  };

  const isPending = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col border border-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">
              {isEditMode ? 'Edit User Access' : 'Create New User Account'}
            </h2>
            <p className="text-xs text-slate-400">Configure credentials, roles and organizational scopes</p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-sm font-bold transition"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          
          {/* Section 1: Basic Information */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">1. Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. John Doe"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. john@domain.com"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+8801700000000"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password {isEditMode && <span className="text-slate-400 font-normal">(Leave blank to keep current)</span>}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!isEditMode}
                  placeholder="••••••••"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Status</label>
                <select
                  name="is_active"
                  value={formData.is_active}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white transition"
                >
                  <option value="true">Active Account</option>
                  <option value="false">Inactive Account</option>
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 2: Primary Scope */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">2. Primary Organizational Scope</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Company</label>
                <select
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="">Select Primary Company</option>
                  {options?.companies.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Branch</label>
                <select
                  name="branch_id"
                  value={formData.branch_id}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="">Select Primary Branch</option>
                  {options?.branches.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Department</label>
                <select
                  name="department_id"
                  value={formData.department_id}
                  onChange={handleInputChange}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none transition"
                >
                  <option value="">Select Primary Department</option>
                  {options?.departments.map((item) => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 3: Allowed Multi-Scope Access */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">3. Multi-Scope Access Management</h3>

            {/* Allowed Companies */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Allowed Companies</label>
              <select
                onChange={(e) => {
                  handleAddMultiSelect('company_ids', e.target.value);
                  e.target.value = '';
                }}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none mb-2"
              >
                <option value="">+ Add Company Access</option>
                {options?.companies.map((c) => (
                  <option key={c.id} value={c.id} disabled={formData.company_ids.includes(c.id)}>
                    {c.name} {formData.company_ids.includes(c.id) ? '(Added)' : ''}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg min-h-11">
                {formData.company_ids.length === 0 ? (
                  <span className="text-xs text-slate-400 self-center">No extra companies assigned</span>
                ) : (
                  formData.company_ids.map((id) => {
                    const comp = options?.companies.find((c) => c.id === id);
                    return (
                      <span key={id} className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-md font-medium">
                        {comp?.name || id}
                        <button type="button" onClick={() => handleRemoveMultiSelect('company_ids', id)} className="text-blue-600 hover:text-blue-900 font-bold">✕</button>
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Allowed Branches */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Allowed Branches</label>
              <select
                onChange={(e) => {
                  handleAddMultiSelect('branch_ids', e.target.value);
                  e.target.value = '';
                }}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none mb-2"
              >
                <option value="">+ Add Branch Access</option>
                {options?.branches.map((b) => (
                  <option key={b.id} value={b.id} disabled={formData.branch_ids.includes(b.id)}>
                    {b.name} {formData.branch_ids.includes(b.id) ? '(Added)' : ''}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg min-h-11">
                {formData.branch_ids.length === 0 ? (
                  <span className="text-xs text-slate-400 self-center">No extra branches assigned</span>
                ) : (
                  formData.branch_ids.map((id) => {
                    const branch = options?.branches.find((b) => b.id === id);
                    return (
                      <span key={id} className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-md font-medium">
                        {branch?.name || id}
                        <button type="button" onClick={() => handleRemoveMultiSelect('branch_ids', id)} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
                      </span>
                    );
                  })
                )}
              </div>
            </div>

            {/* Allowed Departments */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Allowed Departments</label>
              <select
                onChange={(e) => {
                  handleAddMultiSelect('department_ids', e.target.value);
                  e.target.value = '';
                }}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none mb-2"
              >
                <option value="">+ Add Department Access</option>
                {options?.departments.map((d) => (
                  <option key={d.id} value={d.id} disabled={formData.department_ids.includes(d.id)}>
                    {d.name} {formData.department_ids.includes(d.id) ? '(Added)' : ''}
                  </option>
                ))}
              </select>
              <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg min-h-11">
                {formData.department_ids.length === 0 ? (
                  <span className="text-xs text-slate-400 self-center">No extra departments assigned</span>
                ) : (
                  formData.department_ids.map((id) => {
                    const dept = options?.departments.find((d) => d.id === id);
                    return (
                      <span key={id} className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 text-xs px-2.5 py-1 rounded-md font-medium">
                        {dept?.name || id}
                        <button type="button" onClick={() => handleRemoveMultiSelect('department_ids', id)} className="text-purple-600 hover:text-purple-900 font-bold">✕</button>
                      </span>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Section 4: System Roles Selection */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">4. Roles & Authorization</h3>
            <select
              onChange={(e) => {
                handleAddRole(e.target.value);
                e.target.value = '';
              }}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none mb-2"
            >
              <option value="">+ Assign System Role</option>
              {options?.roles.map((r) => (
                <option key={r.id} value={r.name} disabled={formData.roles.includes(r.name)}>
                  {r.name} {formData.roles.includes(r.name) ? '(Assigned)' : ''}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-1.5 p-2.5 bg-slate-50 border border-slate-200 rounded-lg min-h-11">
              {formData.roles.length === 0 ? (
                <span className="text-xs text-slate-400 self-center">No system roles assigned</span>
              ) : (
                formData.roles.map((role) => (
                  <span key={role} className="inline-flex items-center gap-1.5 bg-indigo-100 text-indigo-800 text-xs px-3 py-1 rounded-full font-semibold">
                    {role}
                    <button type="button" onClick={() => handleRemoveRole(role)} className="text-indigo-600 hover:text-indigo-900 font-bold">✕</button>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || isLoadingOptions}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-sm transition disabled:opacity-50"
            >
              {isPending ? (isEditMode ? 'Updating...' : 'Creating...') : isEditMode ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}