import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '../services/employeeService';
import { Designation, Employee } from '../types';

export interface UseEmployeesParams {
  page?: number;
  per_page?: number;
  search?: string;
  company_id?: string | number;
  branch_id?: string | number;
  department_id?: string | number;
  designation_id?: string | number;
  employment_type?: string;
  status?: string;
}

export function useEmployees(params?: UseEmployeesParams) {
  const queryClient = useQueryClient();

  // Fetch Designations
  const designationsQuery = useQuery<Designation[]>({
    queryKey: ['designations'],
    queryFn: employeeService.getDesignations,
  });

  // Fetch Employees
  const employeesQuery = useQuery({
    queryKey: ['employees', params],
    queryFn: () => employeeService.getEmployees(params),
  });

  // Designation Mutations
  const createDesignationMutation = useMutation({
    mutationFn: (data: Partial<Designation>) => employeeService.createDesignation(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['designations'] }),
  });

  const updateDesignationMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<Designation> }) =>
      employeeService.updateDesignation(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['designations'] }),
  });

  const deleteDesignationMutation = useMutation({
    mutationFn: (id: number | string) => employeeService.deleteDesignation(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['designations'] }),
  });

  // Employee Mutations
  const createEmployeeMutation = useMutation({
    mutationFn: (data: Partial<Employee>) => employeeService.createEmployee(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({ id, data }: { id: number | string; data: Partial<Employee> }) =>
      employeeService.updateEmployee(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: (id: number | string) => employeeService.deleteEmployee(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });

  return {
    // Designations
    designations: designationsQuery.data || [],
    isLoadingDesignations: designationsQuery.isLoading,
    isErrorDesignations: designationsQuery.isError,
    createDesignation: createDesignationMutation.mutateAsync,
    updateDesignation: updateDesignationMutation.mutateAsync,
    deleteDesignation: deleteDesignationMutation.mutateAsync,

    // Employees
    employeesData: employeesQuery.data,
    isLoadingEmployees: employeesQuery.isLoading,
    isErrorEmployees: employeesQuery.isError,
    createEmployee: createEmployeeMutation.mutateAsync,
    updateEmployee: updateEmployeeMutation.mutateAsync,
    deleteEmployee: deleteEmployeeMutation.mutateAsync,
  };
}