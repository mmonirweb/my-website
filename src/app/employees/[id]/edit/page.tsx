'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEmployees } from '@/domains/employee/hooks/useEmployees';
import CreateEmployeeModal from '@/domains/employee/components/CreateEmployeeModal';
import { Employee } from '@/domains/employee/types';

export default function EditEmployeePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const employeeId = resolvedParams.id;

  const { employeesData, isLoadingEmployees } = useEmployees({
    page: 1,
    per_page: 100,
  });

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    if (employeesData) {
      const rawData: any = employeesData;
      const list: Employee[] = Array.isArray(rawData)
        ? rawData
        : Array.isArray(rawData?.data)
        ? rawData.data
        : Array.isArray(rawData?.data?.data)
        ? rawData.data.data
        : [];

      const emp = list.find((e) => String(e.id) === String(employeeId));
      if (emp) {
        setSelectedEmployee(emp);
      }
    }
  }, [employeesData, employeeId]);

  const handleClose = () => {
    router.push('/employees');
  };

  if (isLoadingEmployees) {
    return (
      <div className="p-12 text-center text-slate-500 space-y-2">
        <div className="inline-block w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium">Loading Employee Data for Edit...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <button
          onClick={handleClose}
          className="text-xs font-semibold text-slate-600 hover:text-slate-900 inline-flex items-center gap-1"
        >
          ← Back to Employees List
        </button>
      </div>

      <CreateEmployeeModal
        isOpen={true}
        onClose={handleClose}
        initialData={selectedEmployee}
      />
    </div>
  );
}