export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: number;
  parent_id?: number | null;
  name: string;
  slug: string;
  icon?: string | null;
  description?: string | null;
  sort_order: number;
  is_active: boolean;
  parent?: Category | null;
  children?: Category[];
  created_at?: string;
  updated_at?: string;
}

export interface BrandFormData {
  name: string;
  slug?: string;
  logo?: string;
  description?: string;
  is_active?: boolean;
}

export interface CategoryFormData {
  parent_id?: number | null;
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}