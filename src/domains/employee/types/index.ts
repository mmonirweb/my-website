export interface User {
  id: number | string;
  first_name: string;
  last_name: string;
  name?: string; // name প্রপার্টি যুক্ত করা হয়েছে
  email: string;
}

export interface Employee {
  id: number | string;
  user_id?: number | string;
  company_id: number | string;
  branch_id: number | string;
  department_id: number | string;
  designation_id: number | string;
  employee_id: string;
  joining_date: string;
  employment_type: 'full_time' | 'part_time' | 'contractual' | 'intern';
  status: 'active' | 'probationary' | 'inactive' | 'terminated' | 'resigned'; // 'probationary' যুক্ত করা হয়েছে
  salary: number;

  // Flat properties for form inputs
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  personal_email?: string;
  gender?: string;
  date_of_birth?: string;
  nid_passport_number?: string;
  blood_group?: string;

  // Work & Management
  reporting_manager_id?: number | string | null;

  // Financial & Bank Info
  pay_frequency?: string;
  bank_name?: string;
  bank_branch_routing?: string;
  account_holder_name?: string;
  bank_account_number?: string;
  mobile_banking_number?: string;
  tin_number?: string;

  // Address
  present_address?: string;
  permanent_address?: string;

  // Emergency Contact
  emergency_contact_name?: string;
  emergency_contact_relation?: string;
  emergency_contact_phone?: string;

  // Documents / File Uploads
  profile_picture?: File | string | null;
  cv_resume?: File | string | null;
  nid_passport_copy?: File | string | null;
  educational_certificate?: File | string | null;

  // Relations
  user?: User;
  company?: { id: number; name: string };
  branch?: { id: number; name: string };
  department?: { id: number; name: string };
  designation?: { id: number; title: string; code: string };
}

export interface Designation {
  id: number | string;
  title: string;
  code: string;
  level?: number;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Pagination Meta Data Interface
export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page?: number;
  total: number;
  from?: number;
  to?: number;
}

// Paginated Response Interface for Employee List
export interface PaginatedEmployeeResponse {
  data: Employee[];
  meta?: PaginationMeta;
  links?: {
    first?: string;
    last?: string;
    prev?: string | null;
    next?: string | null;
  };
}