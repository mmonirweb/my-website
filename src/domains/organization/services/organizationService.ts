import { apiClient } from '@/lib/axios';
import { Company, Branch, Department } from '../types';

export const organizationService = {
  // Companies
  async getCompanies(): Promise<Company[]> {
    const response = await apiClient.get<{ data: Company[] }>('/organization/companies');
    return response.data.data;
  },

  async createCompany(data: Partial<Company>): Promise<Company> {
    const response = await apiClient.post<{ data: Company }>('/organization/companies', data);
    return response.data.data;
  },

  async updateCompany(id: string | number, data: Partial<Company>): Promise<Company> {
    const response = await apiClient.put<{ data: Company }>(`/organization/companies/${id}`, data);
    return response.data.data;
  },

  async deleteCompany(id: string | number): Promise<void> {
    await apiClient.delete(`/organization/companies/${id}`);
  },

  // Branches
  async getBranches(): Promise<Branch[]> {
    const response = await apiClient.get<{ data: Branch[] }>('/organization/branches');
    return response.data.data;
  },

  async createBranch(data: Partial<Branch>): Promise<Branch> {
    const response = await apiClient.post<{ data: Branch }>('/organization/branches', data);
    return response.data.data;
  },

  async updateBranch(id: string | number, data: Partial<Branch>): Promise<Branch> {
    const response = await apiClient.put<{ data: Branch }>(`/organization/branches/${id}`, data);
    return response.data.data;
  },

  async deleteBranch(id: string | number): Promise<void> {
    await apiClient.delete(`/organization/branches/${id}`);
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    const response = await apiClient.get<{ data: Department[] }>('/organization/departments');
    return response.data.data;
  },

  async createDepartment(data: Partial<Department>): Promise<Department> {
    const response = await apiClient.post<{ data: Department }>('/organization/departments', data);
    return response.data.data;
  },

  async updateDepartment(id: string | number, data: Partial<Department>): Promise<Department> {
    const response = await apiClient.put<{ data: Department }>(`/organization/departments/${id}`, data);
    return response.data.data;
  },

  async deleteDepartment(id: string | number): Promise<void> {
    await apiClient.delete(`/organization/departments/${id}`);
  },
};