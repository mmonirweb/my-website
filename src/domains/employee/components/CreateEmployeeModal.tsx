'use client';

import { useState, useEffect } from 'react';
import { useEmployees } from '../hooks/useEmployees';
import { useOrganizations } from '@/domains/organization/hooks/useOrganizations';
import { Employee } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Employee | null;
}

type TabType = 'basic' | 'job' | 'personal' | 'finance' | 'emergency' | 'documents';

export default function CreateEmployeeModal({ isOpen, onClose, initialData }: Props) {
  const { createEmployee, updateEmployee, designations: rawDesignations } = useEmployees();
  const { companies: rawCompanies, branches: rawBranches, departments: rawDepartments } = useOrganizations();

  const companies = Array.isArray(rawCompanies) ? rawCompanies : (rawCompanies as any)?.data || [];
  const branches = Array.isArray(rawBranches) ? rawBranches : (rawBranches as any)?.data || [];
  const departments = Array.isArray(rawDepartments) ? rawDepartments : (rawDepartments as any)?.data || [];
  const designations = Array.isArray(rawDesignations) ? rawDesignations : (rawDesignations as any)?.data || [];

  const [activeTab, setActiveTab] = useState<TabType>('basic');
  const [formData, setFormData] = useState<Partial<Employee>>({
    first_name: '',
    last_name: '',
    email: '',
    company_id: '',
    branch_id: '',
    department_id: '',
    designation_id: '',
    reporting_manager_id: '',
    employee_id: '',
    joining_date: '',
    employment_type: 'full_time',
    status: 'active',
    salary: 0,
    phone: '',
    personal_email: '',
    gender: 'male',
    date_of_birth: '',
    nid_passport_number: '',
    blood_group: '',
    pay_frequency: 'monthly',
    bank_name: '',
    bank_branch_routing: '',
    account_holder_name: '',
    bank_account_number: '',
    mobile_banking_number: '',
    tin_number: '',
    present_address: '',
    permanent_address: '',
    emergency_contact_name: '',
    emergency_contact_relation: '',
    emergency_contact_phone: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setFormData({
        first_name: initialData.first_name || initialData.user?.first_name || initialData.user?.name?.split(' ')[0] || '',
        last_name: initialData.last_name || initialData.user?.last_name || initialData.user?.name?.split(' ').slice(1).join(' ') || '',
        email: initialData.email || initialData.user?.email || '',
        company_id: initialData.company_id ? String(initialData.company_id) : '',
        branch_id: initialData.branch_id ? String(initialData.branch_id) : '',
        department_id: initialData.department_id ? String(initialData.department_id) : '',
        designation_id: initialData.designation_id ? String(initialData.designation_id) : '',
        reporting_manager_id: initialData.reporting_manager_id ? String(initialData.reporting_manager_id) : '',
        employee_id: initialData.employee_id || '',
        joining_date: initialData.joining_date ? initialData.joining_date.split('T')[0] : '',
        employment_type: initialData.employment_type || 'full_time',
        status: initialData.status || 'active',
        salary: initialData.salary || 0,
        phone: initialData.phone || '',
        personal_email: initialData.personal_email || '',
        gender: initialData.gender || 'male',
        date_of_birth: initialData.date_of_birth ? initialData.date_of_birth.split('T')[0] : '',
        nid_passport_number: initialData.nid_passport_number || '',
        blood_group: initialData.blood_group || '',
        pay_frequency: initialData.pay_frequency || 'monthly',
        bank_name: initialData.bank_name || '',
        bank_branch_routing: initialData.bank_branch_routing || '',
        account_holder_name: initialData.account_holder_name || '',
        bank_account_number: initialData.bank_account_number || '',
        mobile_banking_number: initialData.mobile_banking_number || '',
        tin_number: initialData.tin_number || '',
        present_address: initialData.present_address || '',
        permanent_address: initialData.permanent_address || '',
        emergency_contact_name: initialData.emergency_contact_name || '',
        emergency_contact_relation: initialData.emergency_contact_relation || '',
        emergency_contact_phone: initialData.emergency_contact_phone || '',
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        company_id: '',
        branch_id: '',
        department_id: '',
        designation_id: '',
        reporting_manager_id: '',
        employee_id: '',
        joining_date: new Date().toISOString().split('T')[0],
        employment_type: 'full_time',
        status: 'active',
        salary: 0,
      });
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof Employee) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [field]: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (initialData && initialData.id) {
        await updateEmployee({ id: initialData.id, data: formData });
      } else {
        await createEmployee(formData);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save employee:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBranches = formData.company_id
    ? branches.filter((b: any) => !b.company_id || String(b.company_id) === String(formData.company_id))
    : branches;

  const tabs: { id: TabType; label: string; step: string }[] = [
    { id: 'basic', label: 'Basic Info', step: '01' },
    { id: 'job', label: 'Job & Org', step: '02' },
    { id: 'personal', label: 'Personal', step: '03' },
    { id: 'finance', label: 'Payroll & Finance', step: '04' },
    { id: 'emergency', label: 'Emergency & Address', step: '05' },
    { id: 'documents', label: 'Documents', step: '06' },
  ];

  const inputStyle = "mt-1.5 w-full border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none transition-all placeholder:text-slate-400 text-slate-800 font-medium";
  const labelStyle = "block text-xs font-semibold text-slate-600 uppercase tracking-wider";

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl flex flex-col max-h-[90vh] border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {initialData ? 'Edit Employee Profile' : 'Add New Employee'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Fill in the information below to manage employee details.</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 font-semibold transition-all shadow-sm"
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-100 bg-slate-50/30 px-6 pt-3 pb-0 overflow-x-auto no-scrollbar">
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all rounded-t-lg ${
                    isActive
                      ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isActive ? 'bg-indigo-100 text-indigo-700 font-bold' : 'bg-slate-200/70 text-slate-600'
                  }`}>
                    {tab.step}
                  </span>
                  {tab.label}
                  {tab.id === 'basic' && <span className="text-rose-500 font-bold">*</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Container with Fixed Scroll Height */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="p-6 overflow-y-auto flex-1 h-[420px] scrollbar-thin scrollbar-thumb-slate-200">
            
            {/* TAB 1: BASIC INFO */}
            {activeTab === 'basic' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>First Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.first_name || ''}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className={inputStyle}
                      placeholder="e.g. John"
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Last Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.last_name || ''}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className={inputStyle}
                      placeholder="e.g. Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Official Email <span className="text-rose-500">*</span></label>
                    <input
                      type="email"
                      required
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={inputStyle}
                      placeholder="john.doe@company.com"
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Employee ID <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.employee_id || ''}
                      onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                      className={inputStyle}
                      placeholder="e.g. EMP-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Company <span className="text-rose-500">*</span></label>
                    <select
                      required
                      value={formData.company_id || ''}
                      onChange={(e) => setFormData({ ...formData, company_id: e.target.value, branch_id: '' })}
                      className={inputStyle}
                    >
                      <option value="">Select Company</option>
                      {companies.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Joining Date <span className="text-rose-500">*</span></label>
                    <input
                      type="date"
                      required
                      value={formData.joining_date || ''}
                      onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: JOB & ORG */}
            {activeTab === 'job' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Branch</label>
                    <select
                      value={formData.branch_id || ''}
                      onChange={(e) => setFormData({ ...formData, branch_id: e.target.value })}
                      className={inputStyle}
                    >
                      <option value="">Select Branch</option>
                      {filteredBranches.map((b: any) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Department</label>
                    <select
                      value={formData.department_id || ''}
                      onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                      className={inputStyle}
                    >
                      <option value="">Select Department</option>
                      {departments.map((d: any) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Designation</label>
                    <select
                      value={formData.designation_id || ''}
                      onChange={(e) => setFormData({ ...formData, designation_id: e.target.value })}
                      className={inputStyle}
                    >
                      <option value="">Select Designation</option>
                      {designations.map((desig: any) => (
                        <option key={desig.id} value={desig.id}>{desig.title || desig.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Employment Type</label>
                    <select
                      value={formData.employment_type || 'full_time'}
                      onChange={(e) => setFormData({ ...formData, employment_type: e.target.value as any })}
                      className={inputStyle}
                    >
                      <option value="full_time">Full Time</option>
                      <option value="part_time">Part Time</option>
                      <option value="contractual">Contractual</option>
                      <option value="intern">Intern</option>
                      <option value="commission">Commission</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Status</label>
                    <select
                      value={formData.status || 'active'}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className={inputStyle}
                    >
                      <option value="active">Active</option>
                      <option value="probationary">Probationary</option>
                      <option value="inactive">Inactive</option>
                      <option value="terminated">Terminated</option>
                      <option value="resigned">Resigned</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: PERSONAL */}
            {activeTab === 'personal' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={inputStyle}
                      placeholder="+880 1700-000000"
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Personal Email</label>
                    <input
                      type="email"
                      value={formData.personal_email || ''}
                      onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                      className={inputStyle}
                      placeholder="personal@gmail.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className={labelStyle}>Gender</label>
                    <select
                      value={formData.gender || 'male'}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                      className={inputStyle}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Date of Birth</label>
                    <input
                      type="date"
                      value={formData.date_of_birth || ''}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Blood Group</label>
                    <input
                      type="text"
                      placeholder="e.g. A+"
                      value={formData.blood_group || ''}
                      onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>NID / Passport Number</label>
                  <input
                    type="text"
                    value={formData.nid_passport_number || ''}
                    onChange={(e) => setFormData({ ...formData, nid_passport_number: e.target.value })}
                    className={inputStyle}
                    placeholder="Enter NID or Passport Number"
                  />
                </div>
              </div>
            )}

            {/* TAB 4: FINANCE */}
            {activeTab === 'finance' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Salary Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.salary ?? 0}
                      onChange={(e) => setFormData({ ...formData, salary: Number(e.target.value) })}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Pay Frequency</label>
                    <select
                      value={formData.pay_frequency || 'monthly'}
                      onChange={(e) => setFormData({ ...formData, pay_frequency: e.target.value as any })}
                      className={inputStyle}
                    >
                      <option value="monthly">Monthly</option>
                      <option value="bi_weekly">Bi-Weekly</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Bank Name</label>
                    <input
                      type="text"
                      value={formData.bank_name || ''}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      className={inputStyle}
                      placeholder="e.g. Dutch-Bangla Bank"
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Account Number</label>
                    <input
                      type="text"
                      value={formData.bank_account_number || ''}
                      onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
                      className={inputStyle}
                      placeholder="123.456.789"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className={labelStyle}>Mobile Banking (bKash/Nagad)</label>
                    <input
                      type="text"
                      value={formData.mobile_banking_number || ''}
                      onChange={(e) => setFormData({ ...formData, mobile_banking_number: e.target.value })}
                      className={inputStyle}
                      placeholder="01700000000"
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>TIN Number</label>
                    <input
                      type="text"
                      value={formData.tin_number || ''}
                      onChange={(e) => setFormData({ ...formData, tin_number: e.target.value })}
                      className={inputStyle}
                      placeholder="Taxpayer Identification Number"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: EMERGENCY & ADDRESS */}
            {activeTab === 'emergency' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label className={labelStyle}>Emergency Contact Name</label>
                    <input
                      type="text"
                      value={formData.emergency_contact_name || ''}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                      className={inputStyle}
                      placeholder="Full Name"
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Relation</label>
                    <input
                      type="text"
                      placeholder="e.g. Spouse / Father"
                      value={formData.emergency_contact_relation || ''}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_relation: e.target.value })}
                      className={inputStyle}
                    />
                  </div>
                  <div>
                    <label className={labelStyle}>Emergency Phone</label>
                    <input
                      type="text"
                      value={formData.emergency_contact_phone || ''}
                      onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                      className={inputStyle}
                      placeholder="+880 1700-000000"
                    />
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Present Address</label>
                  <textarea
                    rows={2}
                    value={formData.present_address || ''}
                    onChange={(e) => setFormData({ ...formData, present_address: e.target.value })}
                    className={`${inputStyle} resize-none`}
                    placeholder="Enter current residential address"
                  />
                </div>

                <div>
                  <label className={labelStyle}>Permanent Address</label>
                  <textarea
                    rows={2}
                    value={formData.permanent_address || ''}
                    onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })}
                    className={`${inputStyle} resize-none`}
                    placeholder="Enter permanent address"
                  />
                </div>
              </div>
            )}

            {/* TAB 6: DOCUMENTS */}
            {activeTab === 'documents' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="border border-dashed border-slate-200 p-4 rounded-xl bg-slate-50/50">
                    <label className={labelStyle}>Profile Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'profile_picture')}
                      className="mt-2 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                    />
                  </div>
                  <div className="border border-dashed border-slate-200 p-4 rounded-xl bg-slate-50/50">
                    <label className={labelStyle}>CV / Resume (PDF/Doc)</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileChange(e, 'cv_resume')}
                      className="mt-2 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="border border-dashed border-slate-200 p-4 rounded-xl bg-slate-50/50">
                    <label className={labelStyle}>NID / Passport Copy</label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, 'nid_passport_copy')}
                      className="mt-2 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                    />
                  </div>
                  <div className="border border-dashed border-slate-200 p-4 rounded-xl bg-slate-50/50">
                    <label className={labelStyle}>Educational Certificate</label>
                    <input
                      type="file"
                      onChange={(e) => handleFileChange(e, 'educational_certificate')}
                      className="mt-2 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons Footer */}
          <div className="flex justify-between items-center px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <span className="text-rose-500 font-bold">*</span> Mandatory fields must be filled
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 active:bg-slate-100 transition-all shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 transition-all shadow-md shadow-indigo-200 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  initialData ? 'Update Employee' : 'Save Employee'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}