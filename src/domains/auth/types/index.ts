export interface UserCompany {
  id: number;
  name: string;
}

export interface UserBranch {
  id: number;
  name: string;
}

export interface UserDepartment {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  is_active?: boolean;
  role?: string; // Single role (if any)
  roles?: string[]; // Array of role names for ACL & Can.tsx
  permissions?: string[]; // Array of permission strings for ACL & Can.tsx

  // Primary Scopes
  company_id?: number;
  branch_id?: number;
  department_id?: number;
  company?: UserCompany;
  branch?: UserBranch;
  department?: UserDepartment;

  // Allowed Multi-Scopes
  companies?: UserCompany[];
  branches?: UserBranch[];
  departments?: UserDepartment[];

  created_at?: string;
  updated_at?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}