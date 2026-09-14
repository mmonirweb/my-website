'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useEmployees } from '@/domains/employee/hooks/useEmployees';
import { Employee } from '@/domains/employee/types';

export default function PrintEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const employeeId = resolvedParams.id;

  const { employeesData, isLoadingEmployees } = useEmployees({
    page: 1,
    per_page: 100,
  });

  const rawData: any = employeesData;
  const list: Employee[] = Array.isArray(rawData)
    ? rawData
    : Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData?.data?.data)
    ? rawData.data.data
    : [];

  const employee = list.find((e) => String(e.id) === String(employeeId));

  useEffect(() => {
    if (employee) {
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [employee]);

  if (isLoadingEmployees) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-2">
        <div className="inline-block w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading Employee Profile for Printing...</p>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="p-12 text-center text-rose-500 font-medium">
        Employee record not found.
      </div>
    );
  }

  const userObj = employee.user as any;
  const fullName =
    userObj?.name ||
    `${employee.first_name || ''} ${employee.last_name || ''}`.trim() ||
    'N/A';

  return (
    <div className="min-h-screen bg-slate-50 p-8 print:p-0 print:bg-white">
      {/* Top Controls */}
      <div className="max-w-3xl mx-auto mb-6 flex justify-between items-center print:hidden">
        <button
          onClick={() => router.push('/employees')}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
        >
          ← Back to Employee List
        </button>
        <button
          onClick={() => window.print()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow transition-all"
        >
          Print Now
        </button>
      </div>

      {/* Printable Area */}
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-8 shadow-sm print:border-none print:shadow-none print:p-0">
        {/* Printable Header */}
        <div className="text-center border-b pb-6 mb-6">
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wide">
            Official Employee Profile Document
          </h1>
          <p className="text-xs text-slate-500 mt-1">Personnel Information Summary Record</p>
        </div>

        {/* Top Profile Header */}
        <div className="flex items-center gap-6 border-b pb-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-slate-900 text-white font-bold text-2xl flex items-center justify-center border-2 border-slate-700 shadow-sm flex-shrink-0">
            {fullName[0]?.toUpperCase() || 'E'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{fullName}</h2>
            <p className="text-sm text-slate-600 font-medium">
              {employee.designation?.title || 'No Designation Set'}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 capitalize">
                {employee.status || 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="space-y-6">
          {/* Section 1: Employment Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1.5 mb-3 bg-slate-100 p-2 rounded">
              1. Organization & Employment Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Employee ID:</span>
                <span className="text-slate-900 font-bold font-mono text-sm">{employee.employee_id}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Joining Date:</span>
                <span className="text-slate-800 font-medium">{employee.joining_date || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Department:</span>
                <span className="text-slate-800 font-medium">{employee.department?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Employment Type:</span>
                <span className="text-slate-800 font-medium capitalize">{employee.employment_type || 'Full Time'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Company:</span>
                <span className="text-slate-800 font-medium">{employee.company?.name || 'Main Office'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Branch:</span>
                <span className="text-slate-800 font-medium">{employee.branch?.name || 'Headquarters'}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Contact & Identity */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1.5 mb-3 bg-slate-100 p-2 rounded">
              2. Contact & Identity Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Email Address:</span>
                <span className="text-slate-800 font-medium">{userObj?.email || employee.email || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Phone Number:</span>
                <span className="text-slate-800 font-medium">{employee.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Gender:</span>
                <span className="text-slate-800 font-medium capitalize">{employee.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Blood Group:</span>
                <span className="text-slate-800 font-medium">{employee.blood_group || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">NID / Passport Number:</span>
                <span className="text-slate-800 font-medium font-mono">{employee.nid_passport_number || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Financial Details */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b pb-1.5 mb-3 bg-slate-100 p-2 rounded">
              3. Financial & Payroll Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block">Basic Salary:</span>
                <span className="text-slate-900 font-bold">{employee.salary ? `${employee.salary} BDT` : 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Bank Name:</span>
                <span className="text-slate-800 font-medium">{employee.bank_name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Bank Account Number:</span>
                <span className="text-slate-800 font-medium font-mono">{employee.bank_account_number || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block">Mobile Banking Number:</span>
                <span className="text-slate-800 font-medium font-mono">{employee.mobile_banking_number || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Signatures Area */}
        <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-t border-slate-400 w-32 mx-auto mb-1"></div>
            <p className="font-semibold text-slate-700">Employee Signature</p>
          </div>
          <div>
            <div className="border-t border-slate-400 w-32 mx-auto mb-1"></div>
            <p className="font-semibold text-slate-700">Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
}