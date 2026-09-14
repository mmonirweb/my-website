export interface ScopeItem {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  is_active: boolean;
  company_id?: number;
  branch_id?: number;
  department_id?: number;
  company?: ScopeItem;
  branch?: ScopeItem;
  department?: ScopeItem;
  companies?: ScopeItem[];
  branches?: ScopeItem[];
  departments?: ScopeItem[];
  roles?: string[];
  permissions?: string[];
  direct_permissions?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface UserFormData {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  is_active?: boolean;
  company_id?: number;
  branch_id?: number;
  department_id?: number;
  company_ids?: number[];
  branch_ids?: number[];
  department_ids?: number[];
  roles?: string[];
  permissions?: string[];
}

export interface UserFormDataOptions {
  roles: Array<{ id: number; name: string; label: string }>;
  permissions: Array<{ id: number; name: string; label: string }>;
  companies: Array<{ id: number; name: string }>;
  branches: Array<{ id: number; name: string }>;
  departments: Array<{ id: number; name: string }>;
  designations: Array<{ id: number; name: string }>;
  employees: Array<{ id: number; name: string; label: string }>;
}