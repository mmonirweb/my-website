export interface Supplier {
  id: number;
  code: string;
  name: string;
  company_name: string | null;
  email: string | null;
  phone: string;
  address: string | null;
  tax_number: string | null;
  opening_balance: number;
  current_balance: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SupplierStats {
  total_suppliers: number;
  active_suppliers: number;
  total_payable: number;
}

export interface SupplierLedgerItem {
  id: number;
  supplier_id: number;
  date: string;
  voucher_no: string;
  type: 'opening_balance' | 'purchase' | 'payment' | 'purchase_return' | 'adjustment';
  description: string | null;
  debit: number;
  credit: number;
  balance: number;
  created_by?: number | null;
}

export interface SupplierLedgerResponse {
  success: boolean;
  message: string;
  supplier: Supplier;
  summary: {
    total_debit: number;
    total_credit: number;
    net_balance: number;
    calculated_opening_balance: number;
  };
  data: SupplierLedgerItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}