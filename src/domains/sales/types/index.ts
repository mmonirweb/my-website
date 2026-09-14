export interface SaleItemPayload {
  product_id: number;
  quantity: number;
  unit_price: number;
  discount_amount?: number;
  tax_amount?: number;
}

export interface StoreSalePayload {
  sale_type: 'POS' | 'DIRECT' | 'RETAIL' | 'WHOLESALE' | 'COMMERCIAL' | 'ECOMMERCE';
  customer_id: number;
  warehouse_id: number;
  branch_id?: number | null;
  sale_date: string;
  discount_type?: 'FIXED' | 'PERCENTAGE';
  discount_rate?: number;
  discount_amount?: number;
  shipping_cost?: number;
  paid_amount: number;
  payment_method: 'CASH' | 'CARD' | 'MOBILE_BANKING' | 'BANK_TRANSFER' | 'CHEQUE' | 'MULTIPLE' | 'DUE';
  shipping_status?: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  notes?: string;
  items: SaleItemPayload[];
}

export interface SaleAudit {
  id: number;
  event: string;
  user: string;
  old_values?: any;
  new_values?: any;
  ip_address?: string;
  created_at: string;
}

export interface SaleItem {
  id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  tax_amount: number;
  subtotal: number;
}

export interface Sale {
  id: number;
  invoice_no: string;
  sale_type: 'POS' | 'DIRECT' | 'RETAIL' | 'WHOLESALE' | 'COMMERCIAL' | 'ECOMMERCE';
  sale_date: string;
  customer: {
    id: number;
    name: string;
    phone: string;
    email?: string;
    company_name?: string;
  };
  warehouse: {
    id: number;
    name: string;
  };
  branch?: {
    id: number;
    name: string;
  };
  subtotal: number;
  tax_amount: number;
  discount_type: 'FIXED' | 'PERCENTAGE';
  discount_rate: number;
  discount_amount: number;
  shipping_cost: number;
  grand_total: number;
  paid_amount: number;
  due_amount: number;
  payment_status: 'PAID' | 'PARTIAL' | 'DUE';
  payment_method: string;
  shipping_status: string;
  notes?: string;
  created_by: string;
  items: SaleItem[];
  audits?: SaleAudit[];
  created_at: string;
}