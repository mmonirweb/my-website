export interface Category {
  id: number;
  name: string;
}

export interface Brand {
  id: number;
  name: string;
}

export interface TaxRate {
  id: number;
  name: string;
  rate: number;
}

export interface Product {
  id: number;
  category_id: number;
  brand_id?: number | null;
  tax_rate_id?: number | null;
  name: string;
  slug: string;
  sku: string;
  barcode: string | null;
  barcode_symbology: 'CODE128' | 'CODE39' | 'EAN13' | 'UPCA';
  unit: string;
  weight: number;
  length?: number | null;
  width?: number | null;
  height?: number | null;
  alert_quantity: number;
  track_inventory: boolean;
  is_variant: boolean;
  cost_price: number;
  avg_cost_price?: number;
  mrp_price?: number;
  selling_price: number;
  special_price?: number | null;
  special_price_start?: string | null;
  special_price_end?: string | null;
  short_description?: string | null;
  description?: string | null;
  main_image?: string | null;
  gallery_images?: string[];
  meta_title?: string | null;
  meta_description?: string | null;
  meta_keywords?: string[] | string | null;
  is_featured: boolean;
  is_digital: boolean;
  status: 'active' | 'inactive' | 'draft';
  category?: Category;
  brand?: Brand;
  tax_rate?: TaxRate;
  created_at?: string;
  updated_at?: string;
}

export interface ProductFormData {
  category_id: number | string;
  brand_id: number | string | '';
  tax_rate_id: number | string | '';
  name: string;
  slug: string;
  sku: string;
  barcode: string;
  barcode_symbology: 'CODE128' | 'CODE39' | 'EAN13' | 'UPCA';
  unit: string;
  weight: number | string;
  length: number | string;
  width: number | string;
  height: number | string;
  alert_quantity: number | string;
  track_inventory: boolean;
  is_variant: boolean;
  cost_price: number | string;
  avg_cost_price: number | string;
  mrp_price: number | string;
  selling_price: number | string;
  special_price: number | string;
  special_price_start: string;
  special_price_end: string;
  short_description: string;
  description: string;
  main_image?: File | string | null;
  gallery_images?: (File | string)[];
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  is_featured: boolean;
  is_digital: boolean;
  status: 'active' | 'inactive' | 'draft';
}

export interface ProductResponse {
  status: string;
  data: Product[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}