'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useEmployees } from '@/domains/employee/hooks/useEmployees';
import { useOrganizations } from '@/domains/organization/hooks/useOrganizations';
import CreateEmployeeModal from '@/domains/employee/components/CreateEmployeeModal';
import { Employee, PaginationMeta } from '@/domains/employee/types';

export default function EmployeesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [branchFilter, setBranchFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const {
    employeesData,
    isLoadingEmployees,
    isErrorEmployees,
    deleteEmployee,
  } = useEmployees({
    page,
    per_page: perPage,
    search: searchTerm,
    company_id: companyFilter,
    branch_id: branchFilter,
    department_id: departmentFilter,
    employment_type: employmentTypeFilter,
    status: statusFilter,
  });

  const { 
    companies: rawCompanies,
    branches: rawBranches,
    departments: rawDepartments
  } = useOrganizations() as any;

  const companies = Array.isArray(rawCompanies) ? rawCompanies : rawCompanies?.data || [];
  const branches = Array.isArray(rawBranches) ? rawBranches : rawBranches?.data || [];
  const departments = Array.isArray(rawDepartments) ? rawDepartments : rawDepartments?.data || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [viewEmployee, setViewEmployee] = useState<Employee | null>(null);

  const rawData: any = employeesData;

  const employees: Employee[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData?.data?.data)
    ? rawData.data.data
    : [];

  const meta: PaginationMeta = rawData?.meta || rawData?.data?.meta || {
    current_page: page,
    last_page: 1,
    total: employees.length,
  };

  const handleOpenAdd = () => {
    setSelectedEmployee(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number | string) => {
    if (confirm('Are you sure you want to delete this employee record?')) {
      try {
        await deleteEmployee(id);
      } catch (err) {
        console.error('Failed to delete employee:', err);
      }
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setCompanyFilter('');
    setBranchFilter('');
    setDepartmentFilter('');
    setEmploymentTypeFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const isAnyFilterActive = 
    searchTerm || 
    companyFilter || 
    branchFilter || 
    departmentFilter || 
    employmentTypeFilter || 
    statusFilter;

  const handlePrintList = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Employees</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your organization's workforce, roles, and structural profiles
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Main Print Button */}
          <button
            onClick={handlePrintList}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-300 shadow-sm transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print List
          </button>

          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Employee
          </button>
        </div>
      </div>

      {/* Filter Navigation Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm print:hidden overflow-hidden">
        <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 font-semibold text-xs uppercase tracking-wider">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter & Search
          </div>

          {isAnyFilterActive && (
            <button
              onClick={clearFilters}
              className="text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded transition-colors"
            >
              Clear All Filters
            </button>
          )}
        </div>

        <div className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-2.5">
            <div className="lg:col-span-3 relative">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search name, ID..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>

            <div className="lg:col-span-2">
              <select
                value={companyFilter}
                onChange={(e) => {
                  setCompanyFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              >
                <option value="">All Companies</option>
                {companies.map((company: any) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                value={branchFilter}
                onChange={(e) => {
                  setBranchFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              >
                <option value="">All Branches</option>
                {branches.map((branch: any) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                value={departmentFilter}
                onChange={(e) => {
                  setDepartmentFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              >
                <option value="">All Departments</option>
                {departments.map((dept: any) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                value={employmentTypeFilter}
                onChange={(e) => {
                  setEmploymentTypeFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              >
                <option value="">All Types</option>
                <option value="full_time">Full Time</option>
                <option value="part_time">Part Time</option>
                <option value="contractual">Contractual</option>
                <option value="intern">Intern</option>
              </select>
            </div>

            <div className="lg:col-span-1">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="probationary">Probationary</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
                <option value="resigned">Resigned</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:block id-main-print-area">
        <div className="hidden print:block text-center border-b pb-4 mb-4 pt-4">
          <h1 className="text-2xl font-bold text-slate-900">EMPLOYEE DIRECTORY LIST</h1>
          <p className="text-xs text-slate-500">Official Workforce Summary Report</p>
        </div>

        <div className="overflow-x-auto">
          {isLoadingEmployees ? (
            <div className="p-12 text-center text-slate-500 space-y-2 print:hidden">
              <div className="inline-block w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium">Loading Employee Records...</p>
            </div>
          ) : isErrorEmployees ? (
            <div className="p-12 text-center text-rose-500 font-medium print:hidden">
              Failed to load employee records. Please check backend connection.
            </div>
          ) : employees.length === 0 ? (
            <div className="p-12 text-center space-y-1 print:hidden">
              <p className="text-slate-800 font-semibold text-base">No employees found</p>
              <p className="text-slate-500 text-xs">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm text-slate-600 min-w-[900px] print:min-w-full">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5 font-bold">Employee ID</th>
                  <th className="px-6 py-3.5 font-bold">Employee Name</th>
                  <th className="px-6 py-3.5 font-bold">Designation & Dept</th>
                  <th className="px-6 py-3.5 font-bold">Company & Branch</th>
                  <th className="px-6 py-3.5 font-bold">Status</th>
                  <th className="px-6 py-3.5 font-bold text-right print:hidden">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {employees.map((emp) => {
                  const userObj = emp.user as any;
                  const fullName =
                    userObj?.name ||
                    `${emp.first_name || ''} ${emp.last_name || ''}`.trim() ||
                    'N/A';
                  const initial = fullName?.[0]?.toUpperCase() || 'E';

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-semibold text-slate-900 text-xs">
                        {emp.employee_id}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-slate-700 shadow-sm flex-shrink-0 print:hidden">
                            {initial}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-sm">{fullName}</div>
                            <div className="text-xs text-slate-500">
                              {userObj?.email || emp.email || 'No email set'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{emp.designation?.title || '—'}</div>
                        <div className="text-xs text-slate-500">{emp.department?.name || '—'}</div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-800">{emp.company?.name || 'Main Office'}</div>
                        <div className="text-xs text-slate-500">{emp.branch?.name || 'Headquarters'}</div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            emp.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : emp.status === 'probationary'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : emp.status === 'inactive'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full print:hidden ${
                              emp.status === 'active'
                                ? 'bg-emerald-500'
                                : emp.status === 'probationary'
                                ? 'bg-blue-500'
                                : emp.status === 'inactive'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                          <span className="capitalize">{emp.status || 'Active'}</span>
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right print:hidden">
                        <div className="inline-flex items-center justify-end gap-1">
                          {/* Print Profile Link Page */}
                          <Link
                            href={`/employees/${emp.id}/print`}
                            className="p-1.5 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Print Employee Profile"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                          </Link>

                          {/* View Button */}
                          <button
                            onClick={() => setViewEmployee(emp)}
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="View Employee Details"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {/* Edit Page Link */}
                          <Link
                            href={`/employees/${emp.id}/edit`}
                            className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Record"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </Link>

                          {/* Delete Button */}
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Record"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Bar */}
        {!isLoadingEmployees && employees.length > 0 && (
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
            <div className="text-xs text-slate-500">
              Showing page <span className="font-bold text-slate-800">{meta.current_page}</span> of{' '}
              <span className="font-bold text-slate-800">{meta.last_page}</span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="py-1 px-2 border border-slate-200 bg-white rounded text-xs text-slate-700 outline-none"
              >
                <option value={10}>10 per page</option>
                <option value={25}>25 per page</option>
                <option value={50}>50 per page</option>
              </select>

              <div className="flex gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Previous
                </button>
                <button
                  disabled={page >= meta.last_page}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 rounded text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Employee Drawer/Panel */}
      {viewEmployee && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm print:static print:p-0 print:bg-white print:backdrop-none">
          <div 
            id="printable-employee-profile" 
            className="w-full max-w-lg bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between print:max-w-full print:shadow-none print:h-auto print:p-0"
          >
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 print:hidden">
                <h2 className="text-lg font-bold text-slate-900">Employee Details Profile</h2>
                <button
                  onClick={() => setViewEmployee(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 text-white font-bold text-xl flex items-center justify-center border-2 border-slate-700 shadow print:w-14 print:h-14">
                  {(viewEmployee.user as any)?.name?.[0] || viewEmployee.first_name?.[0] || 'E'}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {(viewEmployee.user as any)?.name || `${viewEmployee.first_name || ''} ${viewEmployee.last_name || ''}`}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{viewEmployee.designation?.title || 'Employee'}</p>
                  <span className="inline-block mt-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 capitalize">
                    {viewEmployee.status || 'Active'}
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 border-b pb-1 text-xs uppercase tracking-wide">
                    Organization Info
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-400 block font-semibold">Employee ID:</span>
                      <span className="font-mono text-slate-800 font-bold">{viewEmployee.employee_id}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Joining Date:</span>
                      <span className="text-slate-800">{viewEmployee.joining_date || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Department:</span>
                      <span className="text-slate-800">{viewEmployee.department?.name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Employment Type:</span>
                      <span className="text-slate-800 capitalize">{viewEmployee.employment_type || 'Full Time'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 block font-semibold">Company & Branch:</span>
                      <span className="text-slate-800">
                        {viewEmployee.company?.name || 'Main Office'} — {viewEmployee.branch?.name || 'Headquarters'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 border-b pb-1 text-xs uppercase tracking-wide">
                    Contact & Personal
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-400 block font-semibold">Official Email:</span>
                      <span className="text-slate-800 font-medium">
                        {(viewEmployee.user as any)?.email || viewEmployee.email || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Phone:</span>
                      <span className="text-slate-800">{viewEmployee.phone || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Gender / Blood:</span>
                      <span className="text-slate-800 capitalize">
                        {viewEmployee.gender || 'N/A'} / {viewEmployee.blood_group || 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">NID / Passport:</span>
                      <span className="text-slate-800">{viewEmployee.nid_passport_number || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
                  <div className="font-bold text-slate-900 border-b pb-1 text-xs uppercase tracking-wide">
                    Financial Details
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-slate-400 block font-semibold">Salary Amount:</span>
                      <span className="text-slate-900 font-bold">
                        {viewEmployee.salary ? `${viewEmployee.salary} BDT` : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Bank Name:</span>
                      <span className="text-slate-800">{viewEmployee.bank_name || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Account Number:</span>
                      <span className="text-slate-800 font-mono">{viewEmployee.bank_account_number || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-semibold">Mobile Banking:</span>
                      <span className="text-slate-800 font-mono">{viewEmployee.mobile_banking_number || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 mt-6 space-y-2 print:hidden">
              <Link
                href={`/employees/${viewEmployee.id}/print`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm transition-colors shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Go to Dedicated Print Page
              </Link>
              <button
                onClick={() => setViewEmployee(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-sm transition-colors"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Modal Form */}
      <CreateEmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedEmployee}
      />
    </div>
  );
}