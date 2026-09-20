export type InvoiceType = 
  | 'SALE' 
  | 'SALE_RETURN' 
  | 'PURCHASE' 
  | 'PURCHASE_RETURN' 
  | 'CUSTOMER_PAYMENT' 
  | 'SUPPLIER_PAYMENT' 
  | 'EXPENSE_PAYMENT';

export interface InvoiceItemSnapshot {
  name: string;
  sku?: string;
  qty: number;
  unit_price: number;
  tax_amount?: number;
  discount_amount?: number;
  subtotal: number;
}

export interface MasterInvoiceData {
  id: number;
  invoice_no: string;
  type: InvoiceType;
  party_name: string;
  party_phone?: string;
  party_address?: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  shipping_cost: number;
  grand_total: number;
  paid_amount: number;
  due_amount: number;
  previous_due: number;
  current_balance: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  notes?: string;
  snapshot_data: {
    items?: InvoiceItemSnapshot[];
    return_items?: InvoiceItemSnapshot[];
    payment_reference?: string;
    expense_category?: string;
    bank_details?: string;
    action_type?: string;
    return_no?: string;
  };
}