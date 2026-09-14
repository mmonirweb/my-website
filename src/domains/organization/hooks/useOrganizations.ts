import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationService } from '../services/organizationService';
import { Company, Branch, Department } from '../types';

export function useOrganizations() {
  const queryClient = useQueryClient();

  // Queries
  const companiesQuery = useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: organizationService.getCompanies,
  });

  const branchesQuery = useQuery<Branch[]>({
    queryKey: ['branches'],
    queryFn: organizationService.getBranches,
  });

  const departmentsQuery = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: organizationService.getDepartments,
  });

  // Mutations - Create
  const createCompanyMutation = useMutation<Company, Error, Partial<Company>>({
    mutationFn: (data: Partial<Company>) => organizationService.createCompany(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });

  const createBranchMutation = useMutation<Branch, Error, Partial<Branch>>({
    mutationFn: (data: Partial<Branch>) => organizationService.createBranch(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
  });

  const createDepartmentMutation = useMutation<Department, Error, Partial<Department>>({
    mutationFn: (data: Partial<Department>) => organizationService.createDepartment(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });

  // Mutations - Update
  const updateCompanyMutation = useMutation<Company, Error, { id: string | number; data: Partial<Company> }>({
    mutationFn: ({ id, data }) => organizationService.updateCompany(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });

  const updateBranchMutation = useMutation<Branch, Error, { id: string | number; data: Partial<Branch> }>({
    mutationFn: ({ id, data }) => organizationService.updateBranch(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
  });

  const updateDepartmentMutation = useMutation<Department, Error, { id: string | number; data: Partial<Department> }>({
    mutationFn: ({ id, data }) => organizationService.updateDepartment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });

  // Mutations - Delete
  const deleteCompanyMutation = useMutation<void, Error, string | number>({
    mutationFn: (id: string | number) => organizationService.deleteCompany(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  });

  const deleteBranchMutation = useMutation<void, Error, string | number>({
    mutationFn: (id: string | number) => organizationService.deleteBranch(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['branches'] }),
  });

  const deleteDepartmentMutation = useMutation<void, Error, string | number>({
    mutationFn: (id: string | number) => organizationService.deleteDepartment(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['departments'] }),
  });

  return {
    // Companies
    companies: companiesQuery.data || [],
    isLoadingCompanies: companiesQuery.isLoading,
    isErrorCompanies: companiesQuery.isError,
    createCompany: createCompanyMutation.mutateAsync,
    updateCompany: updateCompanyMutation.mutateAsync,
    deleteCompany: deleteCompanyMutation.mutateAsync,

    // Branches
    branches: branchesQuery.data || [],
    isLoadingBranches: branchesQuery.isLoading,
    isErrorBranches: branchesQuery.isError,
    createBranch: createBranchMutation.mutateAsync,
    updateBranch: updateBranchMutation.mutateAsync,
    deleteBranch: deleteBranchMutation.mutateAsync,

    // Departments
    departments: departmentsQuery.data || [],
    isLoadingDepartments: departmentsQuery.isLoading,
    isErrorDepartments: departmentsQuery.isError,
    createDepartment: createDepartmentMutation.mutateAsync,
    updateDepartment: updateDepartmentMutation.mutateAsync,
    deleteDepartment: deleteDepartmentMutation.mutateAsync,
  };
}