export interface SupplierLedgerItem {
  id: number;
  supplier_id: number;
  date: string;
  voucher_no: string | null;
  type: 'opening_balance' | 'purchase' | 'payment' | 'purchase_return' | 'adjustment' | string;
  description: string | null;
  debit: number;
  credit: number;
  balance: number;
  running_balance?: number;
  created_at: string;
}

export interface SupplierLedgerSummary {
  total_debit: number;
  total_credit: number;
  net_balance: number;
  previous_page_balance?: number; // 👈 রেড মার্ক ফিক্স করার জন্য প্রপার্টি যোগ করা হয়েছে
  calculated_opening_balance?: number;
}

export interface SupplierLedgerQueryParams {
  search?: string;
  start_date?: string;
  end_date?: string;
  type?: string;
  page?: number;
  per_page?: number;
}

export interface SupplierInfo {
  id: number;
  name: string;
  code: string;
  company_name: string | null;
  phone: string;
  email: string | null;
  opening_balance?: number | string;
  current_balance: number | string;
  created_at?: string;
}

export interface SupplierLedgerResponse {
  success: boolean;
  message: string;
  supplier: SupplierInfo;
  summary: SupplierLedgerSummary;
  data: SupplierLedgerItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}