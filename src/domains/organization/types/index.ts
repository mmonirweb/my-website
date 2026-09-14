export interface Company {
  id?: number | string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  website?: string;
  logo?: string;
  tax_id?: string;
  bin_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  country?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Branch {
  id: number | string;
  company_id: number | string;
  name: string;
  code: string;
  email?: string;
  phone?: string;
  manager_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  is_head_office?: boolean;
  is_active?: boolean;
  company?: Company;
  created_at?: string;
  updated_at?: string;
}

export interface Department {
  id?: number | string;
  company_id?: number | string;
  branch_id: number | string;
  name: string;
  code: string;
  department_head?: string;
  description?: string;
  is_active?: boolean;
  branch?: Branch;
  created_at?: string;
  updated_at?: string;
}
