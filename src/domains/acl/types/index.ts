export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at?: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions: Permission[];
  created_at?: string;
}

export interface GroupedPermissions {
  [module: string]: Permission[];
}

export interface CreateRolePayload {
  name: string;
  permissions: string[];
}

export interface AssignUserRolesPayload {
  roles: string[];
  permissions?: string[];
}