import { apiClient } from '@/lib/axios';
import { Designation, Employee, PaginatedEmployeeResponse } from '../types';

// Utility Function to convert object to FormData for file uploads
const convertToFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (value !== undefined && value !== null) {
      if (value instanceof File || value instanceof Blob) {
        formData.append(key, value);
      } else if (typeof value === 'boolean') {
        formData.append(key, value ? '1' : '0');
      } else {
        formData.append(key, String(value));
      }
    }
  });
  return formData;
};

export const employeeService = {
  // Designations
  async getDesignations(): Promise<Designation[]> {
    const response = await apiClient.get<{ data: Designation[] }>('/employees/designations');
    return response.data.data;
  },

  async createDesignation(data: Partial<Designation>): Promise<Designation> {
    const response = await apiClient.post<{ data: Designation }>('/employees/designations', data);
    return response.data.data;
  },

  async updateDesignation(id: number | string, data: Partial<Designation>): Promise<Designation> {
    const response = await apiClient.put<{ data: Designation }>(`/employees/designations/${id}`, data);
    return response.data.data;
  },

  async deleteDesignation(id: number | string): Promise<void> {
    await apiClient.delete(`/employees/designations/${id}`);
  },

  // Employees
  async getEmployees(params?: { page?: number; per_page?: number; search?: string; status?: string; department_id?: string | number }): Promise<PaginatedEmployeeResponse> {
    const response = await apiClient.get<{ data: PaginatedEmployeeResponse }>('/employees', { params });
    return response.data.data;
  },

  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    const formData = convertToFormData(data);
    const response = await apiClient.post<{ data: Employee }>('/employees', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async updateEmployee(id: number | string, data: Partial<Employee>): Promise<Employee> {
    const formData = convertToFormData(data);
    // Method spoofing for Laravel multipart PUT requests
    formData.append('_method', 'PUT');
    
    const response = await apiClient.post<{ data: Employee }>(`/employees/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async deleteEmployee(id: number | string): Promise<void> {
    await apiClient.delete(`/employees/${id}`);
  },
};